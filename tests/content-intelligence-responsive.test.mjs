import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge experience has dedicated premium responsive styling", async () => {
  const css = await source("../app/knowledge.css");
  for (const selector of [
    ".knowledge-mode-selector",
    ".knowledge-memory-grid",
    ".knowledge-risk-group",
    ".knowledge-action-view",
    ".knowledge-map",
    ".knowledge-outline",
    ".knowledge-decision-options",
    ".knowledge-source-list",
  ]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.")));
  }
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: (?:560|620)px\)/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
