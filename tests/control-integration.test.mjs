import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE is an independent runtime that talks to Application Management only through HN gateways", async () => {
  const readme = await source("../README.md");
  const client = await source("../lib/device-access.client.ts");
  assert.match(readme, /mã nguồn độc lập/i);
  assert.match(readme, /HN-\.\.\./);
  assert.match(client, /\/api\/apps\/hoa-nhap-nga\/device/);
  assert.match(client, /NEXT_PUBLIC_APPLICATION_MANAGEMENT_BASE_URL/);
  assert.doesNotMatch(client, /NEXT_PUBLIC_CONTROL_CENTER_BASE_URL|\/medical-control|\/system-control|verifyControlProof/);
});

test("device private key is non-exportable and stored locally in IndexedDB", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /indexedDB\.open/);
  assert.match(client, /namedCurve: "P-256"/);
  assert.match(client, /false,\s*\["sign", "verify"\]/);
  assert.match(client, /privateKey: pair\.privateKey/);
  assert.doesNotMatch(client, /exportKey\([^\n]*privateKey/);
});

test("RU_LIFE sends enough independent signals for server-side computer phone and tablet classification", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /getHighEntropyValues/);
  assert.match(client, /navigator\.maxTouchPoints/);
  assert.match(client, /pointer: coarse/);
  assert.match(client, /window\.screen\.width/);
  assert.match(client, /window\.innerWidth/);
  assert.match(client, /userAgent: ua\.slice/);
  assert.match(client, /deviceClass: "computer"/);
  assert.match(client, /deviceClass: "phone"/);
  assert.match(client, /deviceClass: "tablet"/);
  assert.match(client, /classificationConfidence/);
  assert.match(client, /classifierVersion: 2/);
  assert.match(client, /profile = await browserProfile\(\)/);
});

test("challenge signature exactly matches the HN managed-app contract", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /managed-app:hoa-nhap-nga:\$\{deviceId\}:\$\{challenge\}/);
  assert.match(client, /action: "challenge"/);
  assert.match(client, /action: "authorize"/);
  assert.match(client, /ECDSA/);
  assert.match(client, /SHA-256/);
});

test("RU_LIFE creates an HttpOnly local session only after verifying the dedicated central HMAC token", async () => {
  const session = await source("../lib/device-session.server.ts");
  const route = await source("../app/api/device/session/route.ts");
  assert.match(session, /aud !== "hoa-nhap-nga-device"/);
  assert.match(session, /iss !== "application-management"/);
  assert.match(session, /appId !== "hoa-nhap-nga"/);
  assert.match(session, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.match(session, /crypto\.subtle\.verify\("HMAC"/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "strict"/);
  assert.doesNotMatch(`${session}\n${route}`, /MEDICINE_SERVICE_SECRET|HEALTH_CONTROL_SERVICE_SECRET/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_.*SECRET/);
});

test("RU_LIFE server introspects the exact token against the Application Management revocation ledger", async () => {
  const session = await source("../lib/device-session.server.ts");
  const route = await source("../app/api/device/session/route.ts");
  const heartbeat = await source("../components/device-heartbeat.tsx");

  assert.match(session, /\/api\/apps\/hoa-nhap-nga\/session/);
  assert.match(session, /introspectWithApplicationManagement/);
  assert.match(session, /state: "invalid"/);
  assert.match(session, /allowControlUnavailable/);
  assert.match(route, /verifyManagedAppSession\(body\.accessToken\)/);
  assert.match(route, /store\.delete\(DEVICE_SESSION_COOKIE\)/);
  assert.match(heartbeat, /SESSION_CHECK_MS = 15_000/);
  assert.match(heartbeat, /localSessionStillActive/);
  assert.match(heartbeat, /window\.location\.replace\("\/"\)/);
});

test("all protected workspace routes reject browsers without a valid device session", async () => {
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

test("RU control contract never reuses health or medicine naming", async () => {
  const env = await source("../.env.example");
  const docs = await source("../CONTROL_INTEGRATION.md");
  const session = await source("../lib/device-session.server.ts");
  assert.match(env, /RU_LIFE_CONTROL_SERVICE_SECRET/);
  assert.match(env, /NEXT_PUBLIC_APPLICATION_MANAGEMENT_BASE_URL/);
  assert.match(docs, /application-management/);
  assert.doesNotMatch(`${env}\n${session}`, /MEDICINE_SERVICE_SECRET|NEXT_PUBLIC_CONTROL_CENTER_BASE_URL/);
  assert.doesNotMatch(docs, /\/api\/integration\/health|ru-life-control-health-v1|MEDICINE_SERVICE_SECRET/);
});
