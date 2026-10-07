import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge experience exposes an ephemeral context lens without persisting profile state", async () => {
  const experience = await source("../components/knowledge/knowledge-experience.tsx");
  const lens = await source("../components/knowledge/knowledge-context-lens.tsx");

  assert.match(experience, /KnowledgeContextLens/);
  assert.match(experience, /resolveKnowledgeLens/);
  assert.match(experience, /accommodation/);
  assert.match(experience, /decisionSelections/);

  assert.match(lens, /getAccommodationLensRule/);
  assert.match(lens, /Bối cảnh/);
  assert.match(lens, /<select/);
  assert.doesNotMatch(lens, /localStorage|sessionStorage|document\.cookie|fetch\s*\(/);
});

test("decision tree accepts lens defaults while preserving manual override controls", async () => {
  const action = await source("../components/knowledge/knowledge-action-view.tsx");
  const decision = await source("../components/knowledge/knowledge-decision-tree.tsx");

  assert.match(action, /decisionSelections/);
  assert.match(action, /initialSelections=\{decisionSelections\}/);
  assert.match(decision, /initialSelections/);
  assert.match(decision, /useState.*initialSelections/);
  assert.match(decision, /onClick=.*setSelected/s);
  assert.match(decision, /aria-pressed/);
});

test("lens UI has explicit responsive and keyboard-visible styling", async () => {
  const css = await source("../app/knowledge.css");

  assert.match(css, /\.knowledge-context-lens/);
  assert.match(css, /\.knowledge-context-lens select/);
  assert.match(css, /\.knowledge-context-lens select:focus-visible/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.knowledge-context-lens/);
});
