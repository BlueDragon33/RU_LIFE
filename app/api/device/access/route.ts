import {
  authorizeRuLifeDevice,
  createRuLifeChallenge,
  registerRuLifeDevice,
  ruLifeErrorResponse,
} from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store, private",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const action = typeof payload.action === "string" ? payload.action : "";

    if (action === "register") {
      return response({ device: await registerRuLifeDevice(payload.publicKey, payload.profile) });
    }
    if (action === "challenge") {
      return response(await createRuLifeChallenge(payload.deviceId));
    }
    if (action === "authorize") {
      return response(await authorizeRuLifeDevice(payload));
    }

    return response({ error: "Thao tác thiết bị Hòa nhập Nga không hợp lệ.", code: "INVALID_DEVICE_ACTION" }, 400);
  } catch (error) {
    return ruLifeErrorResponse(error);
  }
}
