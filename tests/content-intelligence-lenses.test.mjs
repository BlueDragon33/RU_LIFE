import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("context lenses are repository-owned presentation hints over stable IDs", async () => {
  const lenses = await source("../lib/content-intelligence/lenses.ts");

  assert.match(lenses, /KnowledgeLensContext/);
  assert.match(lenses, /KnowledgeLensResult/);
  assert.match(lenses, /accommodation\?:/);
  assert.match(lenses, /journeyStage\?:/);
  assert.match(lenses, /reading\?:/);
  assert.match(lenses, /decisionSelections:/);
  assert.match(lenses, /emphasizedEvidenceIds:/);
  assert.match(lenses, /resolveKnowledgeLens/);
  assert.doesNotMatch(lenses, /fetch\s*\(|\/api\//);
  assert.doesNotMatch(lenses, /localStorage|sessionStorage|cookie/i);
});

test("lens resolver fails safe and never defines risk suppression", async () => {
  const lenses = await source("../lib/content-intelligence/lenses.ts");

  assert.match(lenses, /return EMPTY_LENS_RESULT/);
  assert.doesNotMatch(lenses, /hiddenRisk|suppressedRisk|hideWarnings|omitCritical/i);
});

test("migration registration accommodation lens references existing decision option IDs", async () => {
  const lenses = await source("../lib/content-intelligence/lenses.ts");
  const unit = JSON.parse(await source("../content/knowledge/study-procedures/migration-registration.json"));

  const decision = unit.journey.decisions.find((item) => item.id === "decision:accommodation");
  assert.ok(decision);

  for (const optionId of ["option:dorm", "option:rental", "option:hotel"]) {
    assert.ok(decision.options.some((option) => option.id === optionId), `${optionId} must exist in canonical decision data`);
    assert.match(lenses, new RegExp(optionId.replace(":", "\\:")));
  }

  assert.match(lenses, /ru-life:study-procedures:migration-registration/);
  assert.doesNotMatch(lenses, /Liên hệ ngay bộ phận|Xác định bên tiếp nhận|Cơ sở lưu trú thuộc nhóm/);
});
