import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge map uses semantic controls and has a non-visual outline fallback", async () => {
  const map = await source("../components/knowledge/knowledge-map.tsx");
  const outline = await source("../components/knowledge/knowledge-outline.tsx");
  assert.match(map, /<button/);
  assert.match(map, /aria-pressed/);
  assert.match(map, /Không có sơ đồ/);
  assert.doesNotMatch(map, /reactflow|d3|vis-network|cytoscape/i);
  assert.match(outline, /unit\.journey\.map\.nodes/);
  assert.match(outline, /unit\.journey\.map\.edges/);
});

test("decision tree is iterative and resolves linked actions and warnings by id", async () => {
  const tree = await source("../components/knowledge/knowledge-decision-tree.tsx");
  assert.match(tree, /<button/);
  assert.match(tree, /actionIds/);
  assert.match(tree, /warningIds/);
  assert.match(tree, /nextUnitIds/);
  assert.doesNotMatch(tree, /KnowledgeDecisionTree[^\n]*KnowledgeDecisionTree/);
  assert.match(tree, /Không có nhánh quyết định/);
});

test("action view exposes map outline and decision tree from the same knowledge unit", async () => {
  const action = await source("../components/knowledge/knowledge-action-view.tsx");
  assert.match(action, /KnowledgeMap/);
  assert.match(action, /KnowledgeOutline/);
  assert.match(action, /KnowledgeDecisionTree/);
  assert.match(action, /unit\.journey\.decisions/);
});
