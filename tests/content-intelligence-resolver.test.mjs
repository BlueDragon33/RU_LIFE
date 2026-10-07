import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge registry resolves only the Wave 1 migration-registration unit", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  assert.match(registry, /migration-registration\.json/);
  assert.match(registry, /migration-registration\.sources\.json/);
  assert.match(registry, /getKnowledgeUnit/);
  assert.match(registry, /getKnowledgeSources/);
  assert.match(registry, /study-procedures:migration-registration/);
  assert.doesNotMatch(registry, /daily-life:housing.*KnowledgeUnitV1/);
});

test("content resolver exposes intelligence APIs without removing legacy module branches", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  assert.match(resolver, /getResolvedKnowledgeUnit/);
  assert.match(resolver, /getResolvedKnowledgeSources/);
  assert.match(resolver, /getKnowledgeUnit/);
  assert.match(resolver, /getKnowledgeSources/);

  for (const moduleSlug of ["prepare", "daily-life", "study-procedures", "health", "integration"]) {
    assert.match(resolver, new RegExp(`moduleSlug === "${moduleSlug}"`));
  }
});
