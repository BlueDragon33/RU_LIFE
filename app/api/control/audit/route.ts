import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { listRuLifeAudit, ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return controlPreflight(request);
}

export async function GET(request: Request) {
  try {
    const identity = await requireControlService(request);
    if (!["reviewer", "publisher", "owner"].includes(identity.role)) {
      return controlResponse({ ok: false, error: "Không có quyền đọc audit Hòa nhập Nga.", code: "REVIEWER_REQUIRED" }, 403, request);
    }
    return controlResponse({ ok: true, application: "ru-life", audit: await listRuLifeAudit() }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
