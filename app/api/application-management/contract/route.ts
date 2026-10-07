const RU_LIFE_UNIVERSAL_CONTRACT = {
  schema: "application-management.contract/v1",
  protocol: "ru-life-control-v2",
  application: {
    id: "ru-life",
    name: "Hòa nhập Nga",
    category: "Nga",
    version: "0.2.0",
  },
  capabilities: {
    deviceRegistry: true,
    deviceApproval: true,
    deviceBlock: true,
    deviceUnblock: false,
    deviceEditPermission: true,
    deviceIdempotentCommands: true,
    optimisticConcurrency: true,
    deviceAutoApproval: true,
    deviceAutoBlockPending: false,
    automationIdempotentCommands: true,
    automationOptimisticConcurrency: true,
    sessions: true,
    audit: true,
    contentReview: false,
    payments: false,
    reports: false,
    webLaunch: true,
  },
  policy: {
    remoteAdminReady: true,
    credentialRequired: true,
    credentialEnv: "RU_LIFE_CONTROL_SERVICE_SECRET",
    localFirst: false,
    productionRuntimeReady: true,
  },
  endpoints: {
    status: "/api/control/status",
    devices: "/api/control/devices",
    deviceCommands: "/api/control/device-commands",
    automation: "/api/control/automation",
  },
} as const;

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(RU_LIFE_UNIVERSAL_CONTRACT, {
    headers: {
      "cache-control": "public, max-age=300, must-revalidate",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}
