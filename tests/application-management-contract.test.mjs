import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const contract = JSON.parse(fs.readFileSync(new URL("../public/control/application-management.contract.json", import.meta.url), "utf8"));

test("RU_LIFE publishes a fail-closed Universal Contract bootstrap", () => {
  assert.equal(contract.schema, "application-management.contract/v1");
  assert.equal(contract.application.id, "ru-life");
  assert.equal(contract.application.category, "Nga");
  assert.equal(contract.application.repository, "BlueDragon33/RU_LIFE");
  assert.equal(contract.protocol, "ru-life-control-v2");
  assert.equal(contract.policy.remoteAdminReady, false);
  assert.equal(contract.policy.credentialRequired, true);
  assert.equal(contract.boundary.deviceRegistryOwner, "RU_LIFE");
  assert.equal(contract.boundary.sessionOwner, "RU_LIFE");
  assert.equal(contract.boundary.sharedDatabaseWithApplicationManagement, false);
  assert.equal(contract.capabilities.deviceIdempotentCommands, true);
  assert.equal(contract.capabilities.optimisticConcurrency, true);
});
