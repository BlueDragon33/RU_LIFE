import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { readRuLifeAutomation, updateRuLifeAutomation } from "@/lib/device-automation.server";
import { ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) { return controlPreflight(request); }

export async function GET(request: Request) {
  try {
    await requireControlService(request);
    return controlResponse({ application: "ru-life", automation: await readRuLifeAutomation() }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireControlService(request);
    if (identity.role !== "owner") return controlResponse({ error: "Chỉ Chủ hệ thống được đổi quy tắc duyệt tự động.", code: "OWNER_REQUIRED" }, 403, request);
    const payload = await request.json() as Record<string, unknown>;
    if (typeof payload.autoApproveDevices !== "boolean") return controlResponse({ error: "Quy tắc duyệt tự động không hợp lệ.", code: "INVALID_AUTOMATION" }, 400, request);
    return controlResponse({ application: "ru-life", automation: await updateRuLifeAutomation(identity.actor, identity.role, payload.autoApproveDevices) }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
