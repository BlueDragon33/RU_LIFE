import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("content intelligence registry exposes migration registration beside legacy content", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  assert.match(registry, /migration-registration\.json/);
  assert.match(registry, /migration-registration\.sources\.json/);
  assert.match(registry, /getKnowledgeUnit/);
  assert.match(registry, /getKnowledgeSources/);
  assert.match(registry, /sourceMap/);
});

test("resolver exposes knowledge unit and sources without replacing the legacy resolver", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  for (const moduleSlug of ["prepare", "daily-life", "study-procedures", "health", "integration"]) {
    assert.match(resolver, new RegExp('moduleSlug === "' + moduleSlug + '"'));
  }
  assert.match(resolver, /getResolvedKnowledgeUnit/);
  assert.match(resolver, /getResolvedKnowledgeSources/);
  assert.match(resolver, /getKnowledgeUnit/);
  assert.match(resolver, /getKnowledgeSources/);
});
