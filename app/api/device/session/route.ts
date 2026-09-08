import { cookies } from "next/headers";
import { DEVICE_SESSION_COOKIE, readDeviceSession, verifyManagedAppAccessToken } from "@/lib/device-session.server";

export const dynamic = "force-dynamic";

function responseHeaders() {
  return { "cache-control": "no-store, private", "x-content-type-options": "nosniff" };
}

export async function GET() {
  const session = await readDeviceSession();
  if (!session) return Response.json({ ok: false }, { status: 401, headers: responseHeaders() });
  return Response.json({ ok: true, session }, { headers: responseHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { accessToken?: unknown };
    if (typeof body.accessToken !== "string" || body.accessToken.length > 4096) {
      return Response.json({ ok: false, error: "Phiên thiết bị không hợp lệ." }, { status: 400, headers: responseHeaders() });
    }
    const session = await verifyManagedAppAccessToken(body.accessToken);
    const store = await cookies();
    store.set(DEVICE_SESSION_COOKIE, body.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.max(1, Math.floor((session.exp - Date.now()) / 1000)),
    });
    return Response.json({ ok: true, session }, { headers: responseHeaders() });
  } catch {
    return Response.json({ ok: false, error: "Trung tâm quản trị chưa cấp được phiên hợp lệ cho thiết bị này." }, { status: 403, headers: responseHeaders() });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(DEVICE_SESSION_COOKIE);
  return Response.json({ ok: true }, { headers: responseHeaders() });
}
