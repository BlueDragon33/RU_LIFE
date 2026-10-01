import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { getRuLifeDatabase, ruLifeErrorResponse } from "@/lib/device-registry.server";
import { deletePendingRegistration, PendingDeviceDeletionError } from "@/lib/pending-device-deletion.server";

export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) { return controlPreflight(request); }
export async function POST(request: Request) {
  try {
    const identity = await requireControlService(request);
    if (identity.role !== "owner") throw new PendingDeviceDeletionError("Chỉ Chủ hệ thống được xóa hồ sơ đăng ký.", 403, "OWNER_REQUIRED");
    const database = await getRuLifeDatabase();
    const result = await deletePendingRegistration(database, "ru_life_devices", await request.json() as Record<string, unknown>);
    if (!result.alreadyAbsent) { await database.prepare("INSERT INTO ru_life_audit_log (actor, action, target, detail_json) VALUES (?, ?, ?, ?)").bind(identity.actor, "pending_device_deleted", result.deviceId, JSON.stringify({ deviceCode: result.deviceCode })).run(); }
    return controlResponse(result, 200, request);
  } catch (error) {
    if (error instanceof PendingDeviceDeletionError) return controlResponse({ error: error.message, code: error.code }, error.status, request);
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
