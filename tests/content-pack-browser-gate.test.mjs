import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Chromium covers all four open pack journeys", async () => {
  const s = await readFile(new URL("../scripts/verify-content-intelligence-browser.mjs", import.meta.url), "utf8");
  for (const slug of ["russia-starter","first-seven-days","international-student","language-survival"]) {
    assert.ok(s.includes(slug), `missing browser journey ${slug}`);
  }
  assert.match(s, /pack-topic-link/);
  assert.match(s, /pack-grid/);
  assert.match(s, /\/app\/packs/);
  assert.match(s, /390/);
});
test("browser workflow responds to pack routes, styles and validation changes", async () => {
  const s = await readFile(new URL("../.github/workflows/content-intelligence-browser.yml", import.meta.url), "utf8");
  for (const p of ["app/app/packs/**","app/packs.css","scripts/validate-content-packs.mjs"]) assert.ok(s.includes(p),p);
  assert.match(s,/validate:content-packs/);
});
