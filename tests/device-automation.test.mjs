import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("RU_LIFE owns a default-off automation policy and exposes an owner-only Control API", () => {
  const migration = source("drizzle/0002_device_automation.sql");
  const endpoint = source("app/api/control/automation/route.ts");
  const status = source("app/api/control/status/route.ts");
  assert.match(migration, /ru_life_automation/);
  assert.match(endpoint, /requireControlService/);
  assert.match(endpoint, /role !== "owner"/);
  assert.match(status, /deviceAutoApproval: true/);
  assert.match(status, /automation: "\/api\/control\/automation"/);
});

test("automatic approval applies only to newly registered HN devices with an audit trail", () => {
  const registry = source("lib/device-registry.server.ts");
  assert.match(registry, /readRuLifeAutomation/);
  assert.match(registry, /!existing && automation\.autoApproveDevices/);
  assert.match(registry, /device_auto_approved/);
  assert.match(registry, /approved_by.*automatic-rule|automatic-rule.*approved_by/s);
  assert.match(registry, /ru_life_devices/);
});
