import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE is an independent runtime that talks to the control center only through the device gateway", async () => {
  const readme = await source("../README.md");
  const client = await source("../lib/device-access.client.ts");
  assert.match(readme, /mã nguồn độc lập/);
  assert.match(client, /\/api\/apps\/hoa-nhap-nga\/device/);
  assert.match(client, /NEXT_PUBLIC_CONTROL_CENTER_BASE_URL/);
  assert.doesNotMatch(client, /\/medical-control|\/system-control|verifyControlProof/);
});

test("device private key is non-exportable and stored locally in IndexedDB", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /indexedDB\.open/);
  assert.match(client, /namedCurve: "P-256"/);
  assert.match(client, /false,\n\s*\["sign", "verify"\]/);
  assert.match(client, /privateKey: pair\.privateKey/);
  assert.doesNotMatch(client, /exportKey\([^\n]*privateKey/);
});

test("RU_LIFE automatically collects independent signals for computer phone and tablet classification", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /getHighEntropyValues/);
  assert.match(client, /navigator\.maxTouchPoints/);
  assert.match(client, /pointer: coarse/);
  assert.match(client, /window\.screen\.width/);
  assert.match(client, /window\.innerWidth/);
  assert.match(client, /deviceClass: "computer"/);
  assert.match(client, /deviceClass: "phone"/);
  assert.match(client, /deviceClass: "tablet"/);
  assert.match(client, /classificationConfidence/);
  assert.match(client, /classifierVersion: 2/);
  assert.match(client, /profile = await browserProfile\(\)/);
});

test("challenge signature exactly matches the central managed-app contract", async () => {
  const client = await source("../lib/device-access.client.ts");
  assert.match(client, /managed-app:hoa-nhap-nga:\$\{deviceId\}:\$\{challenge\}/);
  assert.match(client, /action: "challenge"/);
  assert.match(client, /action: "authorize"/);
  assert.match(client, /ECDSA/);
  assert.match(client, /SHA-256/);
});

test("RU_LIFE creates an HttpOnly local session only after verifying the central HMAC token", async () => {
  const session = await source("../lib/device-session.server.ts");
  const route = await source("../app/api/device/session/route.ts");
  assert.match(session, /aud !== "hoa-nhap-nga-device"/);
  assert.match(session, /iss !== "quan-ly-hoc-tap"/);
  assert.match(session, /appId !== "hoa-nhap-nga"/);
  assert.match(session, /crypto\.subtle\.verify\("HMAC"/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "strict"/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_.*SECRET/);
});

test("protected workspace rejects browsers without a valid device session", async () => {
  const page = await source("../app/app/page.tsx");
  assert.match(page, /readDeviceSession\(\)/);
  assert.match(page, /if \(!session\) redirect\("\/"\)/);
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
