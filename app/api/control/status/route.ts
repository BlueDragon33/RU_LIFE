import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { getRuLifeDatabase, ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return controlPreflight(request);
}

export async function GET(request: Request) {
  try {
    await requireControlService(request);
    const database = await getRuLifeDatabase();
    await database.prepare("SELECT 1 AS ok").first();
    return controlResponse({
      ok: true,
      application: "ru-life",
      appId: "hoa-nhap-nga",
      protocol: "ru-life-control-v2",
      ownership: {
        runtime: "RU_LIFE",
        database: "RU_LIFE",
        deviceRegistry: "RU_LIFE",
        sessions: "RU_LIFE",
        centralRole: "policy-and-remote-admin-only",
      },
      capabilities: {
        deviceRegistration: true,
        p256Challenge: true,
        deviceApproval: true,
        accessAndEditSeparated: true,
        sessionRevocation: true,
        deviceClassification: true,
        audit: true,
      },
      checkedAt: Date.now(),
    }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
