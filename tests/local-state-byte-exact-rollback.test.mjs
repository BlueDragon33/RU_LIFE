import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("failed restore and migration preserve raw personal bytes and original version marker", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ru-life-exact-rollback-"));
  try {
    for (const name of [
      "deadline-storage", "personal-tools-storage", "progress-storage",
      "local-storage-safe", "local-data-backup", "local-state-migration",
    ]) {
      const original = await readFile(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
      const rewritten = original.replace(/from "\.\/([\w-]+)";/g, 'from "./$1.ts";');
      await writeFile(join(dir, name + ".ts"), rewritten);
    }
    const backupUrl = new URL("file://" + join(dir, "local-data-backup.ts").replaceAll("\\", "/")).href;
    const migrationUrl = new URL("file://" + join(dir, "local-state-migration.ts").replaceAll("\\", "/")).href;
    const snippet = `
import assert from "node:assert/strict";
import { replaceLocalPersonalData } from ${JSON.stringify(backupUrl)};
import { migrateLocalPersonalState } from ${JSON.stringify(migrationUrl)};

class StorageWithFault {
  constructor(entries, failedKey) {
    this.data = new Map(entries);
    this.failedKey = failedKey;
    this.failed = false;
  }
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) {
    if (key === this.failedKey && !this.failed) {
      this.failed = true;
      throw new Error("injected write failure");
    }
    this.data.set(key, value);
  }
  removeItem(key) { this.data.delete(key); }
}

const first = "ru-life-progress:v1:prepare:documents";
const second = "ru-life-progress:v1:prepare:luggage";
const originalRaw = ' { "checked":[2,2,0],"note":"precious note","updatedAt":"","legacyUnknown":"preserve" } ';
const secondRaw = '{"checked":[3,3],"note":"second note","updatedAt":""}';
const unrelated = ["ru-life-session:device:private", "do-not-touch"];
const before = [[first, originalRaw], [second, secondRaw], unrelated];

// Replacing valid entries fails on second new write. Rollback must preserve
// EXACT original bytes, including duplicates, whitespace and unknown fields.
const restore = new StorageWithFault(before, second);
const backup = {
  schema: "ru-life-local-backup-v2", app: "RU_LIFE", exportedAt: "2026-10-08T00:00:00.000Z",
  entries: [
    {key: first, value: '{"checked":[7],"note":"new","updatedAt":""}'},
    {key: second, value: '{"checked":[8],"note":"new","updatedAt":""}'}
  ]
};
const restored = replaceLocalPersonalData(restore, backup);
assert.equal(restored.ok, false);
assert.equal(restored.rolledBack, true);
assert.deepEqual([...restore.data.entries()].sort(), [...before].sort());

// A failed migration must restore the original raw values AND the exact
// pre-migration version marker (including an initially absent marker).
const migration = new StorageWithFault(before, "ru-life-local-state-version");
const outcome = migrateLocalPersonalState(migration);
assert.equal(outcome.ok, false);
assert.equal(outcome.rolledBack, true);
assert.deepEqual([...migration.data.entries()].sort(), [...before].sort());
`;
    const result = spawnSync(process.execPath, [
      "--experimental-strip-types", "--input-type=module", "-e", snippet,
    ], { encoding: "utf8", cwd: dir });
    assert.equal(result.status, 0, `Exit ${result.status}: ${result.stderr}\n${result.stdout}`);
  } finally {
    await rm(dir, { force: true, recursive: true });
  }
});
