import { cookies } from "next/headers";
import { verifyRuLifeAccessToken, type RuLifeTokenClaims } from "./device-registry.server";

export const DEVICE_SESSION_COOKIE = "ru_life_device_session";
export type DeviceSessionClaims = RuLifeTokenClaims;

/**
 * Access tokens are issued and verified by RU_LIFE itself. Application Management
 * may approve/block/revoke through the signed Control API, but it is not the
 * session issuer and is never required in the request path of a normal RU_LIFE page.
 */
export async function verifyManagedAppAccessToken(token: string): Promise<DeviceSessionClaims> {
  return verifyRuLifeAccessToken(token, false);
}

export async function verifyManagedAppSession(token: string) {
  return verifyRuLifeAccessToken(token, true);
}

export async function readDeviceSession() {
  const store = await cookies();
  const token = store.get(DEVICE_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyManagedAppSession(token);
  } catch {
    return null;
  }
}
