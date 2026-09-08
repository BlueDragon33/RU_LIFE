import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

const coverage = [
  ["../lib/topic-content.ts", ["documents", "luggage", "money-connectivity", "arrival-plan"]],
  ["../lib/daily-life-content.ts", ["housing", "transport", "shopping-services", "safety"]],
  ["../lib/study-procedures-content.ts", ["enrollment", "migration-registration", "study-plan", "important-contacts"]],
  ["../lib/health-content.ts", ["insurance", "care-navigation", "medicine-reference", "emergency"]],
  ["../lib/integration-content.ts", ["daily-russian", "school-russian", "culture-etiquette", "personal-notes"]],
];

test("all 20 catalog topics have a real content-layer entry", async () => {
  let total = 0;
  for (const [path, slugs] of coverage) {
    const content = await source(path);
    for (const slug of slugs) {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(content, new RegExp(`(?:\\"${escaped}\\"|${escaped}):\\s*\\{`), `${slug} must have a content entry`);
      total += 1;
    }
  }
  assert.equal(total, 20);
});

test("resolver covers all five RU_LIFE modules", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  for (const moduleSlug of ["prepare", "daily-life", "study-procedures", "health", "integration"]) {
    assert.match(resolver, new RegExp(`moduleSlug === \\\"${moduleSlug}\\\"`));
  }
});

test("current catalog still contains five modules and twenty topic slugs", async () => {
  const catalog = await source("../lib/content-catalog.ts");
  for (const moduleSlug of ["prepare", "daily-life", "study-procedures", "health", "integration"]) {
    assert.match(catalog, new RegExp(`slug: \\\"${moduleSlug}\\\"`));
  }
  const expectedTopics = coverage.flatMap(([, slugs]) => slugs);
  for (const topicSlug of expectedTopics) {
    assert.match(catalog, new RegExp(`slug: \\\"${topicSlug}\\\"`));
  }
  assert.equal(expectedTopics.length, 20);
});
