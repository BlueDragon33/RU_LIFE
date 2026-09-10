import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { getRuLifeDatabase, ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

async function deploymentMetadata() {
  const workers = await import("cloudflare:workers");
  const values = workers.env as unknown as Record<string, unknown>;
  return {
    channel: typeof values.RU_LIFE_DEPLOYMENT_CHANNEL === "string" ? values.RU_LIFE_DEPLOYMENT_CHANNEL : "unknown",
    revision: typeof values.RU_LIFE_BUILD_REVISION === "string" ? values.RU_LIFE_BUILD_REVISION : "unknown",
    source: typeof values.RU_LIFE_BUILD_SOURCE === "string" ? values.RU_LIFE_BUILD_SOURCE : "BlueDragon33/RU_LIFE",
  };
}

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
      deployment: await deploymentMetadata(),
      ownership: {
        runtime: "RU_LIFE",
        database: "RU_LIFE",
        deviceRegistry: "RU_LIFE",
        sessions: "RU_LIFE",
        commandLedger: "RU_LIFE",
        centralRole: "policy-and-remote-admin-only",
      },
      endpoints: {
        devices: "/api/control/devices",
        deviceCommands: "/api/control/device-commands",
        sessions: "/api/control/sessions",
        audit: "/api/control/audit",
      },
      capabilities: {
        deviceRegistration: true,
        p256Challenge: true,
        deviceApproval: true,
        deviceIdempotentCommands: true,
        optimisticConcurrency: true,
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
