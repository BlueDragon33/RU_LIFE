import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("content intelligence v1 declares stable knowledge/source/risk/view contracts", async () => {
  const types = await source("../lib/content-intelligence/types.ts");
  assert.match(types, /KnowledgeUnitV1/);
  assert.match(types, /KnowledgeSourceV1/);
  assert.match(types, /KnowledgeViewMode = "action" \| "learn" \| "full"/);
  assert.match(types, /schemaVersion: 1/);
  assert.match(types, /sourceIds: string\[\]/);
  assert.match(types, /mustRemember: EvidenceText\[\]/);
  assert.match(types, /decisions: KnowledgeDecision\[\]/);
  assert.match(types, /nodes: KnowledgeMapNode\[\]/);
  assert.match(types, /edges: KnowledgeMapEdge\[\]/);
});

test("content intelligence validator is wired without adding a runtime dependency", async () => {
  const packageJson = JSON.parse(await source("../package.json"));
  assert.equal(
    packageJson.scripts["validate:content-intelligence"],
    "node scripts/validate-content-intelligence.mjs"
  );
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), ["next", "react", "react-dom"]);
});

function baseSource() {
  return {
    id: "source:ru:test",
    schemaVersion: 1,
    title: "Test source",
    publisher: "Test authority",
    authority: "official-government",
    url: "https://example.test/source",
    checkedAt: "2026-10-06",
    note: "Test fixture"
  };
}

function baseUnit() {
  const empty = [];
  return {
    id: "ru-life:test:unit",
    schemaVersion: 1,
    moduleSlug: "test",
    topicSlug: "unit",
    title: "Test",
    summary: "Test unit",
    provenance: { sourceIds: ["source:ru:test"], verifiedAt: "2026-10-06", freshness: "verified" },
    semantics: {
      mainIdea: { id: "idea:main", text: "Main", sourceIds: ["source:ru:test"] },
      purpose: { id: "idea:purpose", text: "Purpose", sourceIds: ["source:ru:test"] },
      rationale: empty, logic: empty, preconditions: empty, scope: empty,
      actions: [{ id: "action:one", text: "Do one", sourceIds: ["source:ru:test"] }],
      outcomes: empty, exceptions: empty
    },
    memory: {
      mustRemember: [{ id: "memory:one", text: "Remember", sourceIds: ["source:ru:test"] }],
      keyTerms: empty, contrasts: empty, myths: empty, commonMistakes: empty, examples: empty, recallPrompts: empty
    },
    journey: {
      stages: ["test"], triggers: empty,
      nextAction: { id: "action:one", text: "Do one", sourceIds: ["source:ru:test"] },
      checklist: [{ id: "action:one", text: "Do one", sourceIds: ["source:ru:test"] }],
      timeline: empty, dependencies: empty, decisions: empty, requiredMaterials: empty,
      completionEvidence: empty, followUps: empty,
      map: { nodes: [{ id: "node:one", label: "One", kind: "action", evidenceId: "action:one" }], edges: [] }
    },
    risk: {
      categories: ["legal"], severity: "high", doNot: empty,
      critical: [{ id: "warning:critical", text: "Critical", sourceIds: ["source:ru:test"] }],
      cautions: empty, recommended: empty, goodToKnow: empty, consequences: empty, escalations: empty, uncertaintyNotes: empty
    },
    language: { ruTerms: empty, enTerms: empty, usefulPhrases: empty, cultureNotes: empty },
    relations: empty,
    searchTerms: ["test"]
  };
}

async function runValidator(sources, units) {
  const dir = await mkdtemp(join(tmpdir(), "ru-life-ci-"));
  const sourcePath = join(dir, "sources.json");
  const unitPath = join(dir, "units.json");
  await writeFile(sourcePath, JSON.stringify(sources));
  await writeFile(unitPath, JSON.stringify(units));
  return spawnSync(process.execPath, ["scripts/validate-content-intelligence.mjs", sourcePath, unitPath], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
}

test("validator rejects high-risk guidance without evidence", async () => {
  const unit = baseUnit();
  unit.risk.critical[0].sourceIds = [];
  const result = await runValidator([baseSource()], [unit]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /high-risk|source/i);
});

test("validator rejects map edges that reference a missing node", async () => {
  const unit = baseUnit();
  unit.journey.map.edges.push({ from: "node:one", to: "node:missing" });
  const result = await runValidator([baseSource()], [unit]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /map edge|node:missing/i);
});

test("validator accepts a valid minimal knowledge fixture", async () => {
  const result = await runValidator([baseSource()], [baseUnit()]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
});
