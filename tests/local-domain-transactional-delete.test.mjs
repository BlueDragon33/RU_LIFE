import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("personal-domain deletion restores exact original bytes when removal fails midway", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ru-life-rollback-"));
  try {
    const names = [
      "deadline-storage", "personal-tools-storage", "progress-storage",
      "local-storage-safe", "local-data-backup",
    ];
    for (const name of names) {
      const original = await readFile(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
      const rewritten = original.replace(/from "\.\/([\w-]+)";/g, 'from "./$1.ts";');
      await writeFile(join(dir, name + ".ts"), rewritten);
    }

    const moduleUrl = new URL("file://" + join(dir, "local-data-backup.ts").replaceAll("\\", "/")).href;
    const snippet = `
import assert from "node:assert/strict";
import { clearLocalDataDomain } from ${JSON.stringify(moduleUrl)};

class FakeStorage {
  constructor(entries, failRemove, failRestore) {
    this.data = new Map(entries);
    this.failRemove = failRemove;
    this.failRestore = failRestore;
  }
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) {
    if (key === this.failRestore) throw new Error("restore quota exceeded");
    this.data.set(key, value);
  }
  removeItem(key) {
    if (key === this.failRemove) throw new Error("delete blocked");
    this.data.delete(key);
  }
}

const first = "ru-life-progress:v1:prepare:documents";
const second = "ru-life-progress:v1:prepare:luggage";
const unrelated = "ru-life-tools:v1:topic:prepare:documents";
const entries = [
  [first, '{"checked":[2,2,0],"note":"keep exact original bytes"}'],
  [second, '{"checked":[3],"note":"another personal entry"}'],
  [unrelated, '{"favorite":true}'],
  ["ru-life-local-state-version", "2"],
];

// Success only deletes selected namespace.
const success = new FakeStorage(entries);
assert.equal(clearLocalDataDomain(success, "progress"), 2);
assert.equal(success.getItem(first), null);
assert.equal(success.getItem(second), null);
assert.equal(success.getItem(unrelated), '{"favorite":true}');

// Mid-delete failure must leave EVERY entry untouched, byte-for-byte.
const failed = new FakeStorage(entries, second);
assert.throws(() => clearLocalDataDomain(failed, "progress"), /rollback|phục hồi/i);
assert.deepEqual([...failed.data.entries()].sort(), [...entries].sort());

// If rollback itself fails, never claim all data survived.
const broken = new FakeStorage(entries, second, first);
assert.throws(() => clearLocalDataDomain(broken, "progress"), /rollback.*(không|failed|thất bại)|phục hồi.*không/i);

// Snapshot read failure must happen before the first remove.
const readFail = new FakeStorage(entries);
readFail.getItem = () => { throw new Error("storage unavailable"); };
assert.throws(() => clearLocalDataDomain(readFail, "progress"));
assert.deepEqual([...readFail.data.entries()], entries);
`;

    const result = spawnSync(process.execPath, [
      "--experimental-strip-types", "--input-type=module", "-e", snippet,
    ], { encoding: "utf8", cwd: dir });
    assert.equal(result.status, 0, `Exit ${result.status}: ${result.stderr}\n${result.stdout}`);
  } finally {
    await rm(dir, { force: true, recursive: true });
  }
});
