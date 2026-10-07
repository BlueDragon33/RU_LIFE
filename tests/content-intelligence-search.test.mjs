import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge search terms include situations actions warnings and Russian terms", async () => {
  const search = await source("../lib/content-intelligence/search.ts");
  assert.match(search, /buildKnowledgeSearchTerms/);
  assert.match(search, /unit\.searchTerms/);
  assert.match(search, /unit\.semantics\.actions/);
  assert.match(search, /unit\.journey\.triggers/);
  assert.match(search, /unit\.journey\.requiredMaterials/);
  assert.match(search, /unit\.risk\.critical/);
  assert.match(search, /unit\.risk\.cautions/);
  assert.match(search, /unit\.language\.ruTerms/);
});

test("dashboard enriches migrated topics locally without changing catalog navigation", async () => {
  const page = await source("../app/app/page.tsx");
  const dashboard = await source("../components/workspace-dashboard.tsx");
  const catalog = await source("../lib/content-catalog.ts");

  assert.match(page, /getResolvedKnowledgeUnit/);
  assert.match(page, /buildKnowledgeSearchTerms/);
  assert.match(page, /searchTerms:/);
  assert.match(dashboard, /\.\.\.topic\.searchTerms/);
  assert.doesNotMatch(dashboard, /fetch\(|\/api\//);

  const topicSlugs = [...catalog.matchAll(/slug:\s*"[^"]+"/g)];
  assert.equal(topicSlugs.length, 25, "5 module slugs + 20 topic slugs must remain unchanged");
});
