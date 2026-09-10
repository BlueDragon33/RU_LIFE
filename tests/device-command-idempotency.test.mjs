import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU LIFE owns a durable idempotent command ledger", async () => {
  const migration = await source("../drizzle/0001_control_command_ledger.sql");
  assert.match(migration, /ru_life_control_commands/);
  assert.match(migration, /command_id TEXT PRIMARY KEY NOT NULL/);
  assert.match(migration, /expected_status TEXT NOT NULL/);
  assert.match(migration, /user_name TEXT/);
  assert.match(migration, /user_code TEXT/);
  assert.match(migration, /state TEXT DEFAULT 'processing' NOT NULL/);
  assert.match(migration, /execution_nonce TEXT NOT NULL/);
});

test("RU LIFE command endpoint is signed and delegates to the client-owned executor", async () => {
  const route = await source("../app/api/control/device-commands/route.ts");
  assert.match(route, /requireControlService/);
  assert.match(route, /executeRuLifeDeviceCommand/);
  assert.match(route, /controlResponse/);
  assert.match(route, /withControlCors/);
});

test("RU LIFE command executor rejects replay conflicts and stale snapshots", async () => {
  const service = await source("../lib/control-device-command.server.ts");
  assert.match(service, /INSERT OR IGNORE INTO ru_life_control_commands/);
  assert.match(service, /COMMAND_ID_CONFLICT/);
  assert.match(service, /COMMAND_IN_PROGRESS/);
  assert.match(service, /COMMAND_PREVIOUSLY_FAILED/);
  assert.match(service, /COMMAND_RECONCILIATION_REQUIRED/);
  assert.match(service, /replayed: true/);
  assert.match(service, /current\.status !== expectedStatus/);
  assert.match(service, /DEVICE_STATE_CONFLICT/);
  assert.match(service, /WHERE device_id=\? AND status=\?/);
  assert.match(service, /DEVICE_STATE_RACE/);
});

test("RU approve command binds user identity into the immutable command payload", async () => {
  const service = await source("../lib/control-device-command.server.ts");
  assert.match(service, /row\.user_name/);
  assert.match(service, /row\.user_code/);
  assert.match(service, /USER_BINDING_REQUIRED/);
  assert.match(service, /user_name=\?, user_code=\?/);
  assert.match(service, /approved_by=\?/);
});

test("RU block command revokes sessions keeps registry and audits command identity", async () => {
  const service = await source("../lib/control-device-command.server.ts");
  assert.match(service, /status='blocked'/);
  assert.match(service, /edit_enabled=0/);
  assert.match(service, /ru_life_sessions/);
  assert.match(service, /status='revoked'/);
  assert.match(service, /device_approved_command/);
  assert.match(service, /device_blocked_command/);
  assert.match(service, /commandId/);
  assert.doesNotMatch(service, /DELETE FROM ru_life_devices/);
});

test("RU live status and integration probes advertise idempotent commands", async () => {
  const status = await source("../app/api/control/status/route.ts");
  const integration = await source("../app/api/integration/control/route.ts");
  for (const content of [status, integration]) {
    assert.match(content, /deviceIdempotentCommands: true/);
    assert.match(content, /optimisticConcurrency: true/);
    assert.match(content, /\/api\/control\/device-commands/);
  }
  assert.match(status, /commandLedger: "RU_LIFE"/);
  assert.match(integration, /commandLedgerOwnership: "RU_LIFE"/);
});
