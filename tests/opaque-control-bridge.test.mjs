import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE accepts short-lived opaque bridge tickets by introspecting only the configured Application Management origin", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  assert.match(auth, /ru-life-control-opaque-v1/);
  assert.match(auth, /\^v1\\\.rulb_/);
  assert.match(auth, /\/api\/apps\/hoa-nhap-nga\/bridge\/introspect/);
  assert.match(auth, /CONTROL_INTROSPECTION_UNAVAILABLE/);
  assert.match(auth, /CONTROL_CENTER_ORIGIN_UNCONFIGURED/);
  assert.match(auth, /APPLICATION_MANAGEMENT_ORIGIN/);
  assert.match(auth, /normalizedControlOrigin/);
  assert.doesNotMatch(auth, /PRIMARY_CONTROL_CENTER_ORIGIN|LEGACY_CONTROL_CENTER_ORIGIN|\.chatgpt\.site|learning-management\.boiech-ai\.workers\.dev/);
});

test("opaque bridge auth remains app-admin only and does not move HN state into the control plane", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  const registry = await source("../lib/device-registry.server.ts");
  assert.doesNotMatch(auth, /managed_app_devices|managed_app_sessions|ru_life_devices\s+FROM\s+application/i);
  assert.match(registry, /workers\.env\.DB/);
  assert.match(registry, /ru_life_devices/);
  assert.match(registry, /ru_life_sessions/);
});

test("browser CORS is fail-closed and only allows the exact configured Application Management origin", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  const devices = await source("../app/api/control/devices/route.ts");
  assert.match(auth, /trustedControlOrigin/);
  assert.match(auth, /Boolean\(configuredOrigin\)/);
  assert.match(auth, /value\.replace\(\/\\\/$\/, ""\) === configuredOrigin/);
  assert.match(auth, /CONTROL_ORIGIN_FORBIDDEN/);
  assert.match(auth, /authorization\.startsWith\("Bearer "\)/);
  assert.match(devices, /requireControlService/);
});

test("local HTTP control origin is accepted only when LOCAL_CONTROL_PLANE is explicitly enabled", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  assert.match(auth, /LOCAL_CONTROL_PLANE/);
  assert.match(auth, /allowLocalHttp/);
  assert.match(auth, /localhost/);
  assert.match(auth, /127\.0\.0\.1/);
  assert.match(auth, /url\.protocol === "http:" && loopback/);
});
