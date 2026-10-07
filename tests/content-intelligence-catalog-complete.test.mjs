import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expected = {
  prepare: ["documents","luggage","money-connectivity","arrival-plan"],
  "daily-life": ["housing","transport","shopping-services","safety"],
  "study-procedures": ["enrollment","migration-registration","study-plan","important-contacts"],
  health: ["insurance","care-navigation","medicine-reference","emergency"],
  integration: ["daily-russian","school-russian","culture-etiquette","personal-notes"],
};

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

test("catalog remains exactly five modules and twenty stable topic routes", async () => {
  const catalog = await readFile(new URL("../lib/content-catalog.ts", import.meta.url), "utf8");
  assert.equal((catalog.match(/priority:\s*"(?:essential|recommended|reference)"/g) || []).length, 20);
  for (const [moduleSlug, topics] of Object.entries(expected)) {
    assert.ok(catalog.includes(`slug: "${moduleSlug}"`), moduleSlug);
    for (const topic of topics) assert.ok(catalog.includes(`slug: "${topic}"`), `${moduleSlug}:${topic}`);
  }
});

test("all twenty catalog topics have unique canonical units and resolvable topic source registries", async () => {
  const ids = new Set();
  let count = 0;
  for (const [moduleSlug, topics] of Object.entries(expected)) {
    for (const topicSlug of topics) {
      const unit = await json(`../content/knowledge/${moduleSlug}/${topicSlug}.json`);
      const sources = await json(`../content/sources/${moduleSlug}/${topicSlug}.sources.json`);
      const sourceIds = new Set(sources.map((source) => source.id));

      assert.equal(unit.id, `ru-life:${moduleSlug}:${topicSlug}`);
      assert.equal(unit.moduleSlug, moduleSlug);
      assert.equal(unit.topicSlug, topicSlug);
      assert.ok(!ids.has(unit.id), `duplicate unit id ${unit.id}`);
      ids.add(unit.id);
      for (const sourceId of unit.provenance.sourceIds) {
        assert.ok(sourceIds.has(sourceId), `${unit.id} missing source ${sourceId}`);
      }
      count += 1;
    }
  }
  assert.equal(count, 20);
  assert.equal(ids.size, 20);
});

test("explicit registry contains every catalog topic key", async () => {
  const registry = await readFile(new URL("../lib/content-intelligence/registry.ts", import.meta.url), "utf8");
  let count = 0;
  for (const [moduleSlug, topics] of Object.entries(expected)) {
    for (const topicSlug of topics) {
      assert.ok(registry.includes(`topicKey: "${moduleSlug}:${topicSlug}"`), `${moduleSlug}:${topicSlug}`);
      count += 1;
    }
  }
  assert.equal(count, 20);
});
