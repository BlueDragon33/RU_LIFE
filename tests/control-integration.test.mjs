import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE owns the browser device gateway instead of sending HN registration to Application Management", async () => {
  const readme = await source("../README.md");
  const client = await source("../lib/device-access.client.ts");
  const gateway = await source("../app/api/device/access/route.ts");
  assert.match(readme, /mã nguồn độc lập/i);
  assert.match(client, /GATEWAY_URL = "\/api\/device\/access"/);
  assert.match(client, /credentials: "same-origin"/);
  assert.match(gateway, /registerRuLifeDevice/);
  assert.match(gateway, /createRuLifeChallenge/);
  assert.match(gateway, /authorizeRuLifeDevice/);
  assert.doesNotMatch(client, /\/api\/apps\/hoa-nhap-nga\/device|NEXT_PUBLIC_APPLICATION_MANAGEMENT_BASE_URL|NEXT_PUBLIC_CONTROL_CENTER_BASE_URL/);
});

test("device private key is non-exportable and stored locally in IndexedDB", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /indexedDB\.open/);
  assert.match(client, /namedCurve: "P-256"/);
  assert.match(client, /false,\s*\["sign", "verify"\]/);
  assert.match(client, /privateKey: pair\.privateKey/);
  assert.doesNotMatch(client, /exportKey\([^\n]*privateKey/);
});

test("RU_LIFE sends enough independent signals and reclassifies them on its own server", async () => {
  const client = await source("../lib/device-access.client.ts");
  const registry = await source("../lib/device-registry.server.ts");
  assert.match(client, /getHighEntropyValues/);
  assert.match(client, /navigator\.maxTouchPoints/);
  assert.match(client, /pointer: coarse/);
  assert.match(client, /window\.screen\.width/);
  assert.match(client, /window\.innerWidth/);
  assert.match(client, /userAgent: ua\.slice/);
  assert.match(client, /classifierVersion: 3/);
  assert.match(registry, /function classifyProfile/);
  assert.match(registry, /deviceClass: "computer"/);
  assert.match(registry, /deviceClass: "phone"/);
  assert.match(registry, /deviceClass: "tablet"/);
  assert.match(registry, /insufficient-signals/);
});

test("challenge signature exactly matches the HN managed-app contract", async () => {
  const client = await source("../lib/device-access.client.ts");
  const registry = await source("../lib/device-registry.server.ts");
  for (const text of [client, registry]) assert.match(text, /managed-app:hoa-nhap-nga:\$\{deviceId\}:\$\{challenge\}/);
  assert.match(registry, /ru_life_challenges/);
  assert.match(registry, /ECDSA/);
  assert.match(registry, /SHA-256/);
});

test("RU_LIFE owns D1 device registry session ledger and audit tables", async () => {
  const registry = await source("../lib/device-registry.server.ts");
  const migration = await source("../drizzle/0000_ru_life_device_gateway.sql");
  assert.match(registry, /import\("cloudflare:workers"\)/);
  assert.match(registry, /workers\.env\.DB/);
  for (const table of ["ru_life_devices", "ru_life_challenges", "ru_life_sessions", "ru_life_audit_log"]) {
    assert.match(migration, new RegExp(table));
    assert.match(registry, new RegExp(table));
  }
  assert.match(registry, /displayCodeFor/);
  assert.match(registry, /`HN-/);
});

test("RU_LIFE issues and validates its own 15-minute token and local HttpOnly session", async () => {
  const registry = await source("../lib/device-registry.server.ts");
  const session = await source("../lib/device-session.server.ts");
  const route = await source("../app/api/device/session/route.ts");
  assert.match(registry, /iss: "ru-life"/);
  assert.match(registry, /aud: "hoa-nhap-nga-device"/);
  assert.match(registry, /Date\.now\(\) \+ 15 \* 60 \* 1000/);
  assert.match(registry, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.match(registry, /status !== "active"/);
  assert.match(registry, /device_status !== "approved"/);
  assert.match(session, /verifyRuLifeAccessToken/);
  assert.doesNotMatch(session, /ApplicationManagement|applicationManagementBaseUrl|introspectWithApplicationManagement|\/api\/apps\/hoa-nhap-nga\/session/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "strict"/);
});

test("Application Management can only administer RU through signed RU control APIs", async () => {
  const auth = await source("../lib/control-auth.server.ts");
  const devices = await source("../app/api/control/devices/route.ts");
  const sessions = await source("../app/api/control/sessions/route.ts");
  const audit = await source("../app/api/control/audit/route.ts");
  const status = await source("../app/api/control/status/route.ts");
  assert.match(auth, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.match(auth, /TOKEN_ISSUER = "application-management"/);
  assert.match(auth, /TOKEN_AUDIENCE = "ru-life-control"/);
  assert.match(auth, /TOKEN_APP = "hoa-nhap-nga"/);
  assert.match(devices, /requireControlService/);
  assert.match(sessions, /requireControlService/);
  assert.match(audit, /requireControlService/);
  assert.match(status, /deviceRegistry: "RU_LIFE"/);
  assert.match(status, /centralRole: "policy-and-remote-admin-only"/);
});

test("access and edit rights remain separate and blocking a device revokes active sessions", async () => {
  const registry = await source("../lib/device-registry.server.ts");
  assert.match(registry, /edit_enabled/);
  assert.match(registry, /enable-edit/);
  assert.match(registry, /disable-edit/);
  assert.match(registry, /status='blocked'/);
  assert.match(registry, /status='revoked'/);
  assert.match(registry, /USER_BINDING_REQUIRED/);
});

test("all protected workspace routes reject browsers without a valid RU-owned device session", async () => {
  const layout = await source("../app/app/layout.tsx");
  assert.match(layout, /readDeviceSession\(\)/);
  assert.match(layout, /if \(!session\) redirect\("\/"\)/);
  assert.match(layout, /<DeviceHeartbeat \/>/);
  assert.match(layout, /<WorkspaceNavigation \/>/);
});

test("RU_LIFE has no direct login form and pending devices are rechecked every 60 seconds", async () => {
  const gate = await source("../components/device-access-gate.tsx");
  const home = await source("../app/page.tsx");
  assert.match(gate, /60_000/);
  assert.match(gate, /document\.visibilityState === "visible"/);
  assert.match(home, /không có màn hình đăng nhập riêng/i);
  assert.doesNotMatch(`${gate}\n${home}`, /type="password"|Sign in with ChatGPT|Đăng nhập bằng/);
});

test("service worker never caches protected app or API traffic", async () => {
  const sw = await source("../public/sw.js");
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(sw, /url\.pathname\.startsWith\("\/app"\)/);
});

test("RU contract never reuses health medicine Boi Ech or central registry names", async () => {
  const env = await source("../.env.example");
  const registry = await source("../lib/device-registry.server.ts");
  const auth = await source("../lib/control-auth.server.ts");
  assert.match(env, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.doesNotMatch(`${env}\n${registry}\n${auth}`, /MEDICINE_SERVICE_SECRET|HEALTH_CONTROL_SERVICE_SECRET|BE-[A-F0-9]|QT-[A-F0-9]/);
});
