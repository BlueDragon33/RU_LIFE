import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { executeRuLifeDeviceCommand } from "@/lib/control-device-command.server";
import { ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return controlPreflight(request);
}

export async function POST(request: Request) {
  try {
    const identity = await requireControlService(request);
    const payload = await request.json() as Record<string, unknown>;
    return controlResponse(await executeRuLifeDeviceCommand(identity, payload), 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
