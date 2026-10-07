import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

const topics = ["enrollment", "migration-registration", "study-plan", "important-contacts"];

test("all study-procedures topics have canonical KnowledgeUnitV1 files", async () => {
  for (const topic of topics) {
    const unit = await json(`../content/knowledge/study-procedures/${topic}.json`);
    assert.equal(unit.id, `ru-life:study-procedures:${topic}`);
    assert.equal(unit.schemaVersion, 1);
    assert.equal(unit.moduleSlug, "study-procedures");
    assert.equal(unit.topicSlug, topic);
    assert.ok(unit.semantics.mainIdea.text.length > 0);
    assert.ok(unit.semantics.purpose.text.length > 0);
    assert.ok(unit.memory.mustRemember.length >= 1 && unit.memory.mustRemember.length <= 3);
    assert.ok(unit.journey.nextAction?.text.length > 0);
    assert.ok(unit.journey.map.nodes.length >= 3);
  }
});

test("study-procedures canonical units pass the repository validator", () => {
  for (const topic of topics) {
    const result = spawnSync(process.execPath, [
      "scripts/validate-content-intelligence.mjs",
      `content/sources/study-procedures/${topic}.sources.json`,
      `content/knowledge/study-procedures/${topic}.json`,
    ], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${topic}: ${result.stderr || result.stdout}`);
  }
});

test("enrollment keeps institution-specific requirements qualified and sourced", async () => {
  const unit = await json("../content/knowledge/study-procedures/enrollment.json");
  const sources = await json("../content/sources/study-procedures/enrollment.sources.json");
  const sourceIds = new Set(sources.map((source) => source.id));

  assert.ok(unit.provenance.sourceIds.length >= 1);
  assert.match(unit.summary, /trường|chương trình/i);
  assert.ok(unit.semantics.scope.some((item) => /trường|chương trình/i.test(item.text)));
  assert.ok(unit.risk.cautions.some((item) => /không.*áp|không.*mặc định|xác nhận/i.test(item.text)));
  for (const sourceId of unit.provenance.sourceIds) assert.ok(sourceIds.has(sourceId));
});

test("study plan and contacts stay guidance, not invented official rules", async () => {
  for (const topic of ["study-plan", "important-contacts"]) {
    const unit = await json(`../content/knowledge/study-procedures/${topic}.json`);
    assert.equal(unit.provenance.freshness, "stable-guidance");
    assert.ok(["low", "moderate"].includes(unit.risk.severity));
    assert.equal(unit.risk.critical.length, 0);
    assert.equal(unit.risk.doNot.length, 0);
  }
});

test("study-procedures registry lists all four stable topic keys", async () => {
  const registry = await readFile(new URL("../lib/content-intelligence/registry.ts", import.meta.url), "utf8");
  for (const topic of topics) {
    assert.match(registry, new RegExp(`study-procedures:${topic}`));
  }
});
