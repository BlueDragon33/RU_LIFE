import { cookies } from "next/headers";

export const DEVICE_SESSION_COOKIE = "ru_life_device_session";

type DeviceSessionClaims = {
  v: 1;
  iss: "quan-ly-hoc-tap";
  aud: "hoa-nhap-nga-device";
  appId: "hoa-nhap-nga";
  deviceId: string;
  deviceCode: string;
  exp: number;
};

type IntrospectionState = "valid" | "invalid" | "unavailable";

type IntrospectionResult = {
  state: IntrospectionState;
  code: string;
};

const DEFAULT_CONTROL_CENTER = "https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site";

function controlCenterBaseUrl() {
  return (process.env.NEXT_PUBLIC_CONTROL_CENTER_BASE_URL || DEFAULT_CONTROL_CENTER).replace(/\/$/, "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("INVALID_BASE64URL");
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function hmacKey() {
  const secret = process.env.MEDICINE_SERVICE_SECRET;
  if (!secret || secret.length < 32) throw new Error("RU_LIFE_SERVICE_SECRET_UNAVAILABLE");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

export async function verifyManagedAppAccessToken(token: string): Promise<DeviceSessionClaims> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("INVALID_ACCESS_TOKEN");
  const signedInput = `${parts[0]}.${parts[1]}`;
  const key = await hmacKey();
  const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(parts[2]), new TextEncoder().encode(signedInput));
  if (!valid) throw new Error("INVALID_ACCESS_SIGNATURE");

  const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1]))) as Partial<DeviceSessionClaims>;
  if (
    claims.v !== 1
    || claims.iss !== "quan-ly-hoc-tap"
    || claims.aud !== "hoa-nhap-nga-device"
    || claims.appId !== "hoa-nhap-nga"
    || typeof claims.deviceId !== "string"
    || !/^[a-f0-9]{64}$/.test(claims.deviceId)
    || typeof claims.deviceCode !== "string"
    || !/^HN-[A-F0-9-]+$/.test(claims.deviceCode)
    || typeof claims.exp !== "number"
  ) throw new Error("INVALID_ACCESS_CLAIMS");

  if (claims.exp <= Date.now() || claims.exp > Date.now() + 20 * 60 * 1000) throw new Error("ACCESS_TOKEN_EXPIRED");
  return claims as DeviceSessionClaims;
}

async function introspectWithControlCenter(token: string): Promise<IntrospectionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${controlCenterBaseUrl()}/api/apps/hoa-nhap-nga/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({})) as { ok?: boolean; code?: string };
    if (response.ok && body.ok) return { state: "valid", code: "SESSION_ACTIVE" };
    if (response.status === 403 || response.status === 401 || response.status === 400) {
      return { state: "invalid", code: body.code || "SESSION_REVOKED" };
    }
    return { state: "unavailable", code: body.code || `CONTROL_HTTP_${response.status}` };
  } catch {
    return { state: "unavailable", code: "CONTROL_CENTER_UNREACHABLE" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyManagedAppSession(token: string, options: { allowControlUnavailable?: boolean } = {}) {
  const claims = await verifyManagedAppAccessToken(token);
  const introspection = await introspectWithControlCenter(token);
  if (introspection.state === "invalid") throw new Error(introspection.code);
  if (introspection.state === "unavailable" && !options.allowControlUnavailable) throw new Error(introspection.code);
  return claims;
}

export async function readDeviceSession() {
  const store = await cookies();
  const token = store.get(DEVICE_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyManagedAppSession(token, { allowControlUnavailable: true });
  } catch {
    return null;
  }
}
