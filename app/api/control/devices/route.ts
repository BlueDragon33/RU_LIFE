import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { listRuLifeDevices, listRuLifeSessions, manageRuLifeDevice, ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return controlPreflight(request);
}

export async function GET(request: Request) {
  try {
    await requireControlService(request);
    return controlResponse({ ok: true, application: "ru-life", devices: await listRuLifeDevices() }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireControlService(request);
    const payload = await request.json() as Record<string, unknown>;
    const device = await manageRuLifeDevice(identity.actor, identity.role, payload);
    return controlResponse({
      ok: true,
      application: "ru-life",
      device,
      devices: await listRuLifeDevices(),
      sessions: await listRuLifeSessions(),
    }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
