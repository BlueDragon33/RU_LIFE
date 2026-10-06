import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
