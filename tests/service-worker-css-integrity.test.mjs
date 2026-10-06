import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("service worker never substitutes HTML for CSS or JavaScript assets", async () => {
  const sw = await source("../public/sw.js");
  assert.match(sw, /ru-life-shell-v2/);
  assert.match(sw, /url\.pathname\.startsWith\("\/_next\/"\)/);
  assert.match(sw, /url\.pathname\.startsWith\("\/assets\/"\)/);
  assert.match(sw, /"style", "script", "worker", "font"/);
  assert.doesNotMatch(sw, /caches\.match\("\/"\)/);
  assert.doesNotMatch(sw, /cache\.put\(request/);
});

test("RU_LIFE forces the corrected service worker to refresh without cached script bytes", async () => {
  const register = await source("../components/service-worker-register.tsx");
  assert.match(register, /updateViaCache: "none"/);
  assert.match(register, /registration\.update\(\)/);
  assert.match(register, /controllerchange/);
  assert.match(register, /window\.location\.reload\(\)/);
});

test("root and protected layouts keep their stylesheet entry points", async () => {
  const root = await source("../app/layout.tsx");
  const protectedLayout = await source("../app/app/layout.tsx");
  assert.match(root, /import "\.\/globals\.css"/);
  assert.match(root, /import "\.\/public-premium\.css"/);
  for (const stylesheet of [
    "workspace.css",
    "content.css",
    "tools.css",
    "deadlines.css",
    "backup.css",
    "premium-theme.css",
    "premium-deep.css",
  ]) {
    assert.match(protectedLayout, new RegExp(stylesheet.replace(".", "\\.")));
  }
});
