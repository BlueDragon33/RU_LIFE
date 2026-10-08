import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const packPath = new URL("../content/packs/v1.json", import.meta.url);
const canonicalRoot = new URL("../content/knowledge/", import.meta.url);
const validatorPath = new URL("../scripts/validate-content-packs.mjs", import.meta.url);

async function readPacks() {
  return JSON.parse(await readFile(packPath, "utf8"));
}

test("four open packs reference existing canonical Knowledge Unit IDs only", async () => {
  const packs = await readPacks();
  assert.equal(packs.length, 4);
  assert.deepEqual(packs.map((p) => p.slug), [
    "russia-starter", "first-seven-days", "international-student", "language-survival",
  ]);
  const uniqueIds = new Set();
  for (const pack of packs) {
    assert.equal(pack.schemaVersion, 1);
    assert.equal(pack.version, 1);
    assert.equal(pack.id, `ru-life:pack:${pack.slug}`);
    assert.equal(pack.access, "open");
    assert.ok(pack.title && pack.description && pack.focus);
    assert.ok(pack.unitIds.length >= 3);
    assert.equal(new Set(pack.unitIds).size, pack.unitIds.length);
    assert.ok(pack.unitIds.includes(pack.featuredUnitId));
    assert.ok(!uniqueIds.has(pack.id));
    uniqueIds.add(pack.id);
    for (const id of pack.unitIds) {
      const [, moduleSlug, topicSlug] = /^ru-life:([^:]+):([^:]+)$/.exec(id) || [];
      assert.ok(moduleSlug && topicSlug, `invalid knowledge ID: ${id}`);
      const unit = JSON.parse(await readFile(new URL(`${moduleSlug}/${topicSlug}.json`, canonicalRoot), "utf8"));
      assert.equal(unit.id, id);
    }
  }
});

test("pack composition is a typed, offline lookup and never an entitlement gate", async () => {
  const source = await readFile(new URL("../lib/content-intelligence/packs.ts", import.meta.url), "utf8");
  assert.match(source, /ContentPackV1/);
  assert.match(source, /getContentPacks/);
  assert.match(source, /getContentPack/);
  assert.match(source, /resolveContentPackTopics/);
  assert.match(source, /getKnowledgeUnit/);
  assert.match(source, /getRuLifeTopic/);
  assert.doesNotMatch(source, /fetch\s*\(|localStorage|sessionStorage|stripe|billing|checkout|device-session|entitlement/i);
});

test("offline validator passes known packs and rejects duplicate, orphan, fake-paywall and bad featured IDs", async () => {
  const original = await readPacks();
  const dir = await mkdtemp(join(tmpdir(), "ru-life-packs-"));
  try {
    const tmpFile = join(dir, "packs.json");
    const run = (payload) => {
      const outcome = spawnSync(process.execPath, [validatorPath.pathname, tmpFile, canonicalRoot.pathname], {
        encoding: "utf8", timeout: 15000,
      });
      return outcome;
    };
    await writeFile(tmpFile, JSON.stringify(original));
    assert.equal(run(original).status, 0, "valid packs must pass");
    const failures = [
      original.map((p, i) => i === 0 ? { ...p, unitIds: [...p.unitIds, p.unitIds[0]] } : p),
      original.map((p, i) => i === 0 ? { ...p, unitIds: [...p.unitIds, "ru-life:prepare:missing-topic"] } : p),
      original.map((p, i) => i === 0 ? { ...p, featuredUnitId: "ru-life:health:care-navigation" } : p),
      original.map((p, i) => i === 0 ? { ...p, access: "premium" } : p),
      original.map((p, i) => i === 1 ? { ...p, slug: original[0].slug } : p),
    ];
    for (const [index, invalid] of failures.entries()) {
      await writeFile(tmpFile, JSON.stringify(invalid));
      assert.notEqual(run(invalid).status, 0, `invalid fixture ${index} must fail`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
