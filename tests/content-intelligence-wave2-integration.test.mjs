import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

const integrationTopics = [
  "daily-russian",
  "school-russian",
  "culture-etiquette",
  "personal-notes",
];

test("Wave 2 batch A migrates all integration topics to canonical Knowledge Unit v1 files", async () => {
  for (const topic of integrationTopics) {
    const unit = JSON.parse(await source(`../content/knowledge/integration/${topic}.json`));
    assert.equal(unit.id, `ru-life:integration:${topic}`);
    assert.equal(unit.schemaVersion, 1);
    assert.equal(unit.moduleSlug, "integration");
    assert.equal(unit.topicSlug, topic);
    assert.ok(unit.semantics.mainIdea.text.length > 20);
    assert.ok(unit.memory.mustRemember.length >= 1 && unit.memory.mustRemember.length <= 3);
    assert.ok(unit.journey.map.nodes.length >= 3);
    assert.ok(unit.searchTerms.length >= 3);
    assert.equal(unit.provenance.freshness, "stable-guidance");
  }
});

test("integration migration remains source-safe without inventing authorities", async () => {
  for (const topic of integrationTopics) {
    const unit = JSON.parse(await source(`../content/knowledge/integration/${topic}.json`));
    assert.deepEqual(unit.provenance.sourceIds, []);
    assert.deepEqual(unit.risk.doNot, []);
    assert.deepEqual(unit.risk.critical, []);
  }
});

test("registry resolves all four migrated integration topics while retaining the original vertical slice", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  for (const topic of integrationTopics) {
    assert.match(registry, new RegExp(`integration:${topic.replaceAll("-", "\\-")}`));
  }
  assert.match(registry, /study-procedures:migration-registration/);
});
