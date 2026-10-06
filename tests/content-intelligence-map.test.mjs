import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge map uses real controls and selected-node semantics without a graph dependency", async () => {
  const map = await source("../components/knowledge/knowledge-map.tsx");
  assert.match(map, /<button/);
  assert.match(map, /aria-pressed=/);
  assert.match(map, /Không có sơ đồ cho chủ đề này/);
  assert.doesNotMatch(map, /reactflow|d3|cytoscape|vis-network|graphology/i);
  assert.doesNotMatch(map, /function\s+renderNode[^{]*\{[^}]*renderNode/s);
});

test("knowledge outline renders the same journey map as a non-visual fallback", async () => {
  const outline = await source("../components/knowledge/knowledge-outline.tsx");
  assert.match(outline, /unit\.journey\.map\.nodes/);
  assert.match(outline, /unit\.journey\.map\.edges/);
  assert.match(outline, /Dạng danh sách/);
});

test("decision tree uses buttons and resolves action warning references without recursion", async () => {
  const decision = await source("../components/knowledge/knowledge-decision-tree.tsx");
  assert.match(decision, /<button/);
  assert.match(decision, /actionIds/);
  assert.match(decision, /warningIds/);
  assert.match(decision, /nextUnitIds/);
  assert.doesNotMatch(decision, /KnowledgeDecisionTree[^\n]*KnowledgeDecisionTree/);
});

test("action view exposes map outline and decision tree from one canonical unit", async () => {
  const action = await source("../components/knowledge/knowledge-action-view.tsx");
  assert.match(action, /KnowledgeMap/);
  assert.match(action, /KnowledgeOutline/);
  assert.match(action, /KnowledgeDecisionTree/);
  assert.match(action, /Xem dạng danh sách/);
});
