import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function workflow(name) {
  return readFile(new URL("../.github/workflows/" + name, import.meta.url), "utf8");
}

test("live deploy never reports success when required credentials are absent", async () => {
  const source = await workflow("live-development-deploy.yml");
  assert.match(source, /missing=\(\)/);
  assert.match(source, /::error::Live development deployment blocked/);
  assert.match(source, /exit 1/);
  assert.doesNotMatch(source, /Live development publish skipped; missing/);
  assert.match(source, /Deployment was executed successfully/);
});

test("public Site probe must validate every pack route, not only old shell markup", async () => {
  const source = await workflow("ci.yml");
  assert.match(source, /\/app\/packs/);
  for (const slug of ["russia-starter", "first-seven-days", "international-student", "language-survival"]) {
    assert.ok(source.includes(slug), "Missing published Site pack probe: " + slug);
  }
  assert.match(source, /pack-topic-list/);
  assert.match(source, /Published Site.*missing current Content Packs/);
  assert.match(source, /local.*stylesheet.*published|published.*stylesheet.*local/i);
});
