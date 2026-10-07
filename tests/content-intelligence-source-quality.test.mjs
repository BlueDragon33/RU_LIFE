import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function baseUnit(severity = "high") {
  const evidence = { id: "e1", text: "Evidence", sourceIds: ["source:test"] };
  return {
    id: "ru-life:test:source-quality",
    schemaVersion: 1,
    moduleSlug: "test",
    topicSlug: "source-quality",
    title: "Test",
    summary: "Test",
    provenance: { sourceIds: ["source:test"], verifiedAt: "2026-10-07", freshness: "verified" },
    semantics: {
      mainIdea: evidence, purpose: evidence, rationale: [], logic: [], preconditions: [], scope: [],
      actions: [], outcomes: [], exceptions: []
    },
    memory: { mustRemember: [evidence], keyTerms: [], contrasts: [], myths: [], commonMistakes: [], examples: [], recallPrompts: [] },
    journey: { stages: [], triggers: [], checklist: [], timeline: [], dependencies: [], decisions: [], requiredMaterials: [], completionEvidence: [], followUps: [], map: { nodes: [], edges: [] } },
    risk: { categories: ["safety"], severity, doNot: [], critical: [], cautions: [], recommended: [], goodToKnow: [], consequences: [], escalations: [], uncertaintyNotes: [] },
    language: { ruTerms: [], enTerms: [], usefulPhrases: [], cultureNotes: [] },
    relations: [],
    searchTerms: []
  };
}

async function run(authority, severity) {
  const dir = await mkdtemp(join(tmpdir(), "ru-life-source-quality-"));
  try {
    const sources = join(dir, "sources.json");
    const unit = join(dir, "unit.json");
    await writeFile(sources, JSON.stringify([{
      id: "source:test",
      schemaVersion: 1,
      title: "Test source",
      publisher: "Test",
      authority,
      url: "https://example.com",
      checkedAt: "2026-10-07",
      note: "fixture"
    }]));
    await writeFile(unit, JSON.stringify(baseUnit(severity)));
    return spawnSync(process.execPath, ["scripts/validate-content-intelligence.mjs", sources, unit], { encoding: "utf8" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("high and critical units require at least one authoritative provenance source", async () => {
  for (const severity of ["high", "critical"]) {
    const result = await run("community", severity);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /authoritative|authority|high-risk/i);
  }
});

test("official-government provenance satisfies high-risk authority gate", async () => {
  const result = await run("official-government", "high");
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
