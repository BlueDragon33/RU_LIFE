import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("protected workspace handles browsers that reject the localStorage getter", async () => {
  const runtime = await readFile(new URL("../components/local-state-runtime.tsx", import.meta.url), "utf8");
  assert.match(runtime, /try\s*\{[\s\S]*migrateLocalPersonalState\(localStorage\)/);
  assert.match(runtime, /catch\s*\{[\s\S]*setStorageError/);
  assert.match(runtime, /Không thể truy cập bộ nhớ/i);
});

test("preflight migration failure cannot write or change the version marker", async () => {
  const source = await readFile(new URL("../lib/local-state-migration.ts", import.meta.url), "utf8");
  assert.match(source, /snapshotLocalPersonalEntries/);
  assert.match(source, /rolledBack:\s*true/);
  assert.match(source, /Không thể đọc dữ liệu cục bộ trước khi nâng cấp/i);
});
