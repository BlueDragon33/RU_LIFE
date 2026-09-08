import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE exposes neutral v2 control liveness and explicit ownership without exposing its secret", async () => {
  const route = await source("../app/api/integration/control/route.ts");
  assert.match(route, /export async function GET/);
  assert.match(route, /runtime: "RU_LIFE"/);
  assert.match(route, /ru-life-control-v2/);
  assert.match(route, /databaseOwnership: "RU_LIFE"/);
  assert.match(route, /deviceRegistryOwnership: "RU_LIFE"/);
  assert.match(route, /sessionOwnership: "RU_LIFE"/);
  assert.match(route, /deviceRegistration: true/);
  assert.match(route, /remoteRevocation: true/);
  assert.match(route, /directLogin: false/);
  assert.match(route, /import\("cloudflare:workers"\)/);
  assert.match(route, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.doesNotMatch(route, /MEDICINE_SERVICE_SECRET|HEALTH_CONTROL_SERVICE_SECRET|health-request|health-response|control-health/);
});

test("authenticated control probe proves RU_LIFE and Application Management share only the RU secret", async () => {
  const route = await source("../app/api/integration/control/route.ts");
  assert.match(route, /ru-life-control-request:v1:/);
  assert.match(route, /ru-life-control-response:v1:/);
  assert.match(route, /crypto\.subtle\.verify/);
  assert.match(route, /crypto\.subtle\.sign/);
  assert.match(route, /SECRET_MISMATCH/);
  assert.match(route, /SERVICE_SECRET_UNAVAILABLE/);
  assert.doesNotMatch(route, /process\.env\.RU_LIFE_CONTROL_SERVICE_SECRET/);
});

test("the legacy health-named integration endpoint stays deleted", async () => {
  await assert.rejects(() => source("../app/api/integration/health/route.ts"));
});
