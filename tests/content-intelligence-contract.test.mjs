import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
