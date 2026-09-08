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

export async function readDeviceSession() {
  const store = await cookies();
  const token = store.get(DEVICE_SESSION_COOKIE)?.value;
  if (!token) return null;
  try { return await verifyManagedAppAccessToken(token); }
  catch { return null; }
}
