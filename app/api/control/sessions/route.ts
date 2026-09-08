import { controlPreflight, controlResponse, requireControlService, withControlCors } from "@/lib/control-auth.server";
import { listRuLifeSessions, revokeRuLifeSession, ruLifeErrorResponse } from "@/lib/device-registry.server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return controlPreflight(request);
}

export async function GET(request: Request) {
  try {
    await requireControlService(request);
    return controlResponse({ ok: true, application: "ru-life", sessions: await listRuLifeSessions() }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireControlService(request);
    const payload = await request.json() as Record<string, unknown>;
    await revokeRuLifeSession(identity.actor, identity.role, payload.sessionId);
    return controlResponse({ ok: true, application: "ru-life", sessions: await listRuLifeSessions() }, 200, request);
  } catch (error) {
    return withControlCors(request, ruLifeErrorResponse(error));
  }
}
