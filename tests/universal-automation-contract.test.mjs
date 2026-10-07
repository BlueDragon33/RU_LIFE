import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("RU_LIFE publishes Universal auto-approval without inventing auto-block", () => {
  const contract = source("app/api/application-management/contract/route.ts");
  assert.match(contract, /schema: "application-management\.contract\/v1"/);
  assert.match(contract, /deviceAutoApproval: true/);
  assert.match(contract, /deviceAutoBlockPending: false/);
  assert.match(contract, /automationIdempotentCommands: true/);
  assert.match(contract, /automationOptimisticConcurrency: true/);
  assert.match(contract, /automation: "\/api\/control\/automation"/);
});

test("RU_LIFE Universal automation checks replay before optimistic concurrency", () => {
  const automation = source("lib/device-automation.server.ts");
  const priorIndex = automation.indexOf("const prior = await commandRow(database, commandId)");
  const currentIndex = automation.indexOf("const current = await readRuLifeAutomation()", priorIndex);
  assert.ok(priorIndex >= 0 && currentIndex > priorIndex);
  assert.match(automation.slice(priorIndex, currentIndex), /replayed: true/);
  assert.match(automation, /WHERE id=1 AND revision=\?/);
  assert.match(automation, /AUTOMATION_STATE_CONFLICT/);
  assert.match(automation, /AUTOMATION_READBACK_MISMATCH/);
  assert.match(automation, /COMMAND_ID_PAYLOAD_MISMATCH/);
});

test("RU_LIFE legacy automation POST remains compatible", () => {
  const route = source("app/api/control/automation/route.ts");
  assert.match(route, /payload\.operation === "set-device-automation"/);
  assert.match(route, /executeRuLifeAutomationCommand/);
  assert.match(route, /updateRuLifeAutomation/);
});
