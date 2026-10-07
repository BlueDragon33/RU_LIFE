import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("health and safety Wave 2 topics resolve as evidence-aware Knowledge Units", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  for (const key of [
    "health:insurance",
    "health:care-navigation",
    "health:medicine-reference",
    "health:emergency",
    "daily-life:safety",
  ]) {
    assert.ok(registry.includes(key), key + " must be registered");
  }
});

test("high-risk health and safety units preserve evidence and safety boundaries", async () => {
  const paths = [
    "../content/knowledge/health/insurance.json",
    "../content/knowledge/health/care-navigation.json",
    "../content/knowledge/health/medicine-reference.json",
    "../content/knowledge/health/emergency.json",
    "../content/knowledge/daily-life/safety.json",
  ];

  const units = [];
  for (const path of paths) units.push(JSON.parse(await source(path)));

  for (const unit of units) {
    assert.equal(unit.schemaVersion, 1);
    assert.ok(unit.provenance.sourceIds.length > 0, unit.id);
    assert.ok(unit.provenance.verifiedAt, unit.id);
    assert.ok(unit.memory.mustRemember.length <= 3, unit.id);
    assert.ok(unit.journey.map.nodes.length > 0, unit.id);
    for (const item of [...unit.risk.doNot, ...unit.risk.critical]) {
      assert.ok(item.sourceIds.length > 0, unit.id + " high-risk item needs evidence");
    }
  }

  const emergency = units.find((unit) => unit.topicSlug === "emergency");
  assert.equal(emergency.journey.nextAction.id, "emergency:next:call");
  assert.match(emergency.journey.nextAction.text, /112|103/);
  assert.match(JSON.stringify(emergency.risk), /không trì hoãn|Không trì hoãn/i);

  const care = units.find((unit) => unit.topicSlug === "care-navigation");
  assert.match(JSON.stringify(care.risk), /không.*chẩn đoán|không.*tự.*chẩn đoán/i);

  const medicine = units.find((unit) => unit.topicSlug === "medicine-reference");
  assert.match(JSON.stringify(medicine.risk), /không.*liều|không.*tự.*thay|không.*ngừng/i);

  const insurance = units.find((unit) => unit.topicSlug === "insurance");
  assert.match(JSON.stringify(insurance.risk), /cấp cứu/i);

  const safety = units.find((unit) => unit.id === "ru-life:daily-life:safety");
  assert.match(JSON.stringify(safety.semantics.actions), /112/);
  assert.match(JSON.stringify(safety.semantics.actions), /101|102|103|104/);
});
