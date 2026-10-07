import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("browser verifier covers all twenty canonical topic routes", async () => {
  const script = await source("../scripts/verify-content-intelligence-browser.mjs");
  const routeMatches = [...script.matchAll(/"\/app\/[^"]+\/[^"]+"/g)];
  const uniqueRoutes = new Set(routeMatches.map((match) => match[0]));
  assert.equal(uniqueRoutes.size, 20);
  assert.match(script, /for \(const route of routes\)/);
  assert.match(script, /knowledge-experience/);
  assert.match(script, /Tôi cần làm gì\?/);
  assert.match(script, /Tôi muốn hiểu/);
  assert.match(script, /Cho tôi xem toàn bộ/);
});
