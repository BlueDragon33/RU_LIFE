import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("protected RU_LIFE workspace keeps device last-seen alive every 60 seconds", async () => {
  const heartbeat = await source("../components/device-heartbeat.tsx");
  const page = await source("../app/app/page.tsx");

  assert.match(heartbeat, /HEARTBEAT_MS = 60_000/);
  assert.match(heartbeat, /registerDevice\(\)/);
  assert.match(heartbeat, /document\.visibilityState !== "visible"/);
  assert.match(heartbeat, /window\.addEventListener\("online"/);
  assert.match(page, /<DeviceHeartbeat \/>/);
});

test("remote pending or blocked state clears local session and returns to access gate", async () => {
  const heartbeat = await source("../components/device-heartbeat.tsx");

  assert.match(heartbeat, /registration\.device\.status !== "approved"/);
  assert.match(heartbeat, /\/api\/device\/session/);
  assert.match(heartbeat, /method: "DELETE"/);
  assert.match(heartbeat, /window\.location\.replace\("\/"\)/);
});

test("long-lived RU_LIFE sessions are renewed with fresh signed device authorization", async () => {
  const heartbeat = await source("../components/device-heartbeat.tsx");

  assert.match(heartbeat, /SESSION_RENEW_MS = 8 \* 60_000/);
  assert.match(heartbeat, /authorizeDevice\(registration\.keys, registration\.device\)/);
  assert.match(heartbeat, /establishLocalSession\(authorization\.accessToken\)/);
  assert.match(heartbeat, /transient network\/control-center failure must not destroy/i);
});
