import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge registry is built from explicit entries with duplicate guards", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");

  assert.match(registry, /type KnowledgeRegistryEntry/);
  assert.match(registry, /function createKnowledgeRegistry/);
  assert.match(registry, /const registryEntries:/);
  assert.match(registry, /Duplicate KnowledgeUnitV1 topic key/);
  assert.match(registry, /Duplicate KnowledgeUnitV1 id/);
  assert.match(registry, /Conflicting KnowledgeSourceV1 id/);
  assert.match(registry, /knowledgeByTopic/);
  assert.match(registry, /sourceById/);
});

test("registry remains explicit and local-first", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");

  assert.doesNotMatch(registry, /fetch\s*\(/);
  assert.doesNotMatch(registry, /import\.meta\.glob/);
  assert.doesNotMatch(registry, /readdir|readFile|fs\/promises/);
  assert.match(registry, /study-procedures:migration-registration/);
  assert.match(registry, /return knowledgeByTopic\.get\(/);
  assert.match(registry, /\|\| null/);
});
