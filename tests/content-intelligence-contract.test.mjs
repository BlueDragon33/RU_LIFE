import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("content intelligence v1 declares stable knowledge source risk and view contracts", async () => {
  const sourceText = await source("../lib/content-intelligence/types.ts");
  assert.match(sourceText, /KnowledgeUnitV1/);
  assert.match(sourceText, /KnowledgeSourceV1/);
  assert.match(sourceText, /KnowledgeViewMode = "action" \| "learn" \| "full"/);
  assert.match(sourceText, /schemaVersion: 1/);
  assert.match(sourceText, /sourceIds: string\[\]/);
  assert.match(sourceText, /mustRemember: EvidenceText\[\]/);
  assert.match(sourceText, /decisions: KnowledgeDecision\[\]/);
  assert.match(sourceText, /nodes: KnowledgeMapNode\[\]/);
  assert.match(sourceText, /edges: KnowledgeMapEdge\[\]/);
});

test("content intelligence validation is repository-owned and adds no dependency", async () => {
  const pkg = JSON.parse(await source("../package.json"));
  assert.equal(pkg.scripts["validate:content-intelligence"], "node scripts/validate-content-intelligence.mjs");

  const allowedRuntime = new Set(["next", "react", "react-dom"]);
  assert.deepEqual(new Set(Object.keys(pkg.dependencies)), allowedRuntime);
});


function runValidator(sourcePath, unitPath) {
  return spawnSync(process.execPath, ["scripts/validate-content-intelligence.mjs", sourcePath, unitPath], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  });
}

async function withFixture(sourceValue, unitValue, assertion) {
  const dir = await mkdtemp(join(tmpdir(), "ru-life-ci-"));
  try {
    const sourcePath = join(dir, "sources.json");
    const unitPath = join(dir, "unit.json");
    await writeFile(sourcePath, JSON.stringify(sourceValue));
    await writeFile(unitPath, JSON.stringify(unitValue));
    await assertion(sourcePath, unitPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const minimalSource = [{
  id: "source:ru:test",
  schemaVersion: 1,
  title: "Test",
  publisher: "Test",
  authority: "official-government",
  url: "https://example.com",
  checkedAt: "2026-10-07",
  note: "test",
}];

function minimalUnit() {
  const evidence = { id: "e1", text: "Evidence", sourceIds: ["source:ru:test"] };
  return {
    id: "ru-life:test:unit",
    schemaVersion: 1,
    moduleSlug: "test",
    topicSlug: "unit",
    title: "Test",
    summary: "Test",
    provenance: { sourceIds: ["source:ru:test"], verifiedAt: "2026-10-07", freshness: "verified" },
    semantics: {
      mainIdea: evidence, purpose: evidence, rationale: [], logic: [], preconditions: [], scope: [],
      actions: [{ ...evidence, id: "a1" }], outcomes: [], exceptions: [],
    },
    memory: { mustRemember: [evidence], keyTerms: [], contrasts: [], myths: [], commonMistakes: [], examples: [], recallPrompts: [] },
    journey: {
      stages: [], triggers: [], nextAction: { ...evidence, id: "a1" }, checklist: [], timeline: [], dependencies: [],
      decisions: [], requiredMaterials: [], completionEvidence: [], followUps: [],
      map: { nodes: [{ id: "n1", label: "Start", kind: "stage" }], edges: [] },
    },
    risk: {
      categories: ["legal"], severity: "high", doNot: [], critical: [{ ...evidence, id: "w1" }],
      cautions: [], recommended: [], goodToKnow: [], consequences: [], escalations: [], uncertaintyNotes: [],
    },
    language: { ruTerms: [], enTerms: [], usefulPhrases: [], cultureNotes: [] },
    relations: [], searchTerms: [],
  };
}

test("validator accepts a valid minimal content intelligence fixture", async () => {
  await withFixture(minimalSource, minimalUnit(), async (sourcePath, unitPath) => {
    const result = runValidator(sourcePath, unitPath);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
});

test("validator rejects high-risk evidence without a source", async () => {
  const unit = minimalUnit();
  unit.risk.critical[0].sourceIds = [];
  await withFixture(minimalSource, unit, async (sourcePath, unitPath) => {
    const result = runValidator(sourcePath, unitPath);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /critical|source/i);
  });
});

test("validator rejects map edges that point to missing nodes", async () => {
  const unit = minimalUnit();
  unit.journey.map.edges.push({ from: "n1", to: "missing" });
  await withFixture(minimalSource, unit, async (sourcePath, unitPath) => {
    const result = runValidator(sourcePath, unitPath);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /map|node|missing/i);
  });
});
