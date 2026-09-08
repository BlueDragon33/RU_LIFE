export const dynamic = "force-dynamic";

const REQUEST_PREFIX = "ru-life-control-request:v1:";
const RESPONSE_PREFIX = "ru-life-control-response:v1:";

function noStoreHeaders() {
  return {
    "cache-control": "no-store, private",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
  };
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]{20,160}$/.test(value)) throw new Error("INVALID_PROOF");
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function secretKey(usages: KeyUsage[]) {
  const workers = await import("cloudflare:workers");
  const values = workers.env as unknown as Record<string, unknown>;
  const secret = typeof values.RU_LIFE_CONTROL_SERVICE_SECRET === "string" ? values.RU_LIFE_CONTROL_SERVICE_SECRET : "";
  if (secret.length < 32) throw new Error("SERVICE_SECRET_UNAVAILABLE");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

async function verifyRequestProof(nonce: string, signature: string) {
  const key = await secretKey(["verify"]);
  return crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signature),
    new TextEncoder().encode(`${REQUEST_PREFIX}${nonce}`),
  );
}

async function responseProof(nonce: string, checkedAt: number) {
  const key = await secretKey(["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${RESPONSE_PREFIX}${nonce}:${checkedAt}`),
  );
  return base64Url(new Uint8Array(signature));
}

function capabilities() {
  return {
    independentRuntime: true,
    databaseOwnership: "RU_LIFE",
    deviceRegistryOwnership: "RU_LIFE",
    sessionOwnership: "RU_LIFE",
    deviceRegistration: true,
    p256Challenge: true,
    serverSession: true,
    heartbeat: true,
    remoteRevocation: true,
    deviceClassificationSignals: true,
    pwaBoundary: true,
    directLogin: false,
  };
}

export async function GET() {
  return Response.json({
    ok: true,
    app: { id: "hoa-nhap-nga", runtime: "RU_LIFE" },
    protocol: "ru-life-control-v2",
    capabilities: capabilities(),
    checkedAt: Date.now(),
  }, { headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { nonce?: unknown; signature?: unknown };
    const nonce = typeof body.nonce === "string" ? body.nonce : "";
    const signature = typeof body.signature === "string" ? body.signature : "";
    if (!/^[A-Za-z0-9_-]{24,128}$/.test(nonce) || !signature) {
      return Response.json({ ok: false, code: "INVALID_CONTROL_PROOF" }, { status: 400, headers: noStoreHeaders() });
    }

    const valid = await verifyRequestProof(nonce, signature);
    if (!valid) {
      return Response.json({ ok: false, code: "SECRET_MISMATCH" }, { status: 403, headers: noStoreHeaders() });
    }

    const checkedAt = Date.now();
    return Response.json({
      ok: true,
      app: { id: "hoa-nhap-nga", runtime: "RU_LIFE" },
      protocol: "ru-life-control-v2",
      checkedAt,
      proof: await responseProof(nonce, checkedAt),
      capabilities: capabilities(),
    }, { headers: noStoreHeaders() });
  } catch (error) {
    const code = error instanceof Error && error.message === "SERVICE_SECRET_UNAVAILABLE"
      ? "SERVICE_SECRET_UNAVAILABLE"
      : "CONTROL_CHECK_FAILED";
    return Response.json({ ok: false, code }, { status: code === "SERVICE_SECRET_UNAVAILABLE" ? 503 : 500, headers: noStoreHeaders() });
  }
}
