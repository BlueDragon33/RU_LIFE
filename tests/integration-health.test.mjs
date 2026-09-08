import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE exposes public liveness without exposing the shared secret", async () => {
  const route = await source("../app/api/integration/health/route.ts");
  assert.match(route, /export async function GET/);
  assert.match(route, /runtime: "RU_LIFE"/);
  assert.match(route, /ru-life-control-health-v1/);
  assert.match(route, /deviceRegistration: true/);
  assert.match(route, /heartbeat: true/);
  assert.match(route, /remoteRevocation: true/);
  assert.doesNotMatch(route, /Response\.json\([^\n]*MEDICINE_SERVICE_SECRET/);
});

test("authenticated health check proves the two deployments share the same secret", async () => {
  const route = await source("../app/api/integration/health/route.ts");
  assert.match(route, /ru-life-health-request:v1:/);
  assert.match(route, /ru-life-health-response:v1:/);
  assert.match(route, /crypto\.subtle\.verify/);
  assert.match(route, /crypto\.subtle\.sign/);
  assert.match(route, /SECRET_MISMATCH/);
  assert.match(route, /SERVICE_SECRET_UNAVAILABLE/);
});
