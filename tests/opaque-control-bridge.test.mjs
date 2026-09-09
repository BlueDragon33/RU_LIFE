import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE accepts short-lived opaque bridge tickets by introspecting Application Management", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  assert.match(auth, /ru-life-control-opaque-v1/);
  assert.match(auth, /\^v1\\\.rulb_/);
  assert.match(auth, /\/api\/apps\/hoa-nhap-nga\/bridge\/introspect/);
  assert.match(auth, /CONTROL_INTROSPECTION_UNAVAILABLE/);
  assert.match(auth, /PRIMARY_CONTROL_CENTER_ORIGIN/);
  assert.match(auth, /quan-ly-hoc-tap\.dinhnam3391\.chatgpt\.site/);
});

test("opaque bridge auth remains app-admin only and does not move HN state into the control plane", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  const registry = await source("../lib/device-registry.server.ts");
  assert.doesNotMatch(auth, /managed_app_devices|managed_app_sessions|ru_life_devices\s+FROM\s+application/i);
  assert.match(registry, /workers\.env\.DB/);
  assert.match(registry, /ru_life_devices/);
  assert.match(registry, /ru_life_sessions/);
});

test("browser CORS allows the current Application Management ChatGPT Site while control endpoints still require a bearer ticket", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  const devices = await source("../app/api/control/devices/route.ts");
  assert.match(auth, /trustedControlOrigin/);
  assert.match(auth, /\.dinhnam3391\\\.chatgpt\\\.site/);
  assert.match(auth, /authorization\.startsWith\("Bearer "\)/);
  assert.match(devices, /requireControlService/);
});
