import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

test("migration registration has one canonical content intelligence unit", async () => {
  const unit = await json("../content/knowledge/study-procedures/migration-registration.json");
  assert.equal(unit.id, "ru-life:study-procedures:migration-registration");
  assert.equal(unit.schemaVersion, 1);
  assert.equal(unit.moduleSlug, "study-procedures");
  assert.equal(unit.topicSlug, "migration-registration");
  assert.ok(unit.memory.mustRemember.length >= 1 && unit.memory.mustRemember.length <= 3);
  assert.ok(unit.semantics.mainIdea.text.length > 0);
  assert.ok(unit.semantics.purpose.text.length > 0);
  assert.ok(unit.journey.nextAction?.text.length > 0);
  assert.ok(unit.journey.decisions.length >= 1);
  assert.ok(unit.journey.map.nodes.length >= 3);
  assert.ok(unit.risk.severity === "high" || unit.risk.severity === "critical");
  assert.ok(unit.risk.critical.length >= 1);
  assert.ok(unit.provenance.sourceIds.length >= 1);
});

test("migration registration sources are versioned and reviewed on the current migration refresh", async () => {
  const sources = await json("../content/sources/study-procedures/migration-registration.sources.json");
  assert.ok(Array.isArray(sources));
  assert.ok(sources.length >= 4);
  for (const source of sources) {
    assert.equal(source.schemaVersion, 1);
    assert.match(source.id, /^source:ru:/);
    assert.match(source.checkedAt, /^2026-10-06$/);
    assert.ok(source.url.startsWith("https://") || source.url.startsWith("http://"));
  }
  assert.ok(sources.some((source) => /115-fz/.test(source.id)));
  assert.ok(sources.some((source) => /109-fz/.test(source.id)));
  assert.ok(sources.some((source) => /162-fz/.test(source.id)));
  assert.ok(sources.some((source) => /study-in-russia/.test(source.id)));
});

test("canonical migration registration data passes the offline validator", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-content-intelligence.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /PASS:/);
});
