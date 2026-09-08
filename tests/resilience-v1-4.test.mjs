import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("V1.4 exports schema v2 while explicitly migrating V1.3 backup schema v1", async () => {
  const backup = await source("../lib/local-data-backup.ts");
  assert.match(backup, /ru-life-local-backup-v2/);
  assert.match(backup, /ru-life-local-backup-v1/);
  assert.match(backup, /migratedFromLegacy/);
  assert.match(backup, /normalizeEntry/);
  assert.match(backup, /parseStoredTopicProgress/);
  assert.match(backup, /parseStoredTopicTools/);
  assert.match(backup, /parseStoredTopicDeadlines/);
});

test("personal data replacement is transactional and attempts in-memory rollback", async () => {
  const backup = await source("../lib/local-data-backup.ts");
  const manager = await source("../components/local-data-manager.tsx");
  assert.match(backup, /const snapshot = collectLocalBackup\(storage\)/);
  assert.match(backup, /clearAllPersonalData\(storage\)/);
  assert.match(backup, /safeSetLocalStorage/);
  assert.match(backup, /rolledBack:\s*true/);
  assert.match(backup, /rolledBack:\s*false/);
  assert.match(manager, /rollback tự động/);
  assert.match(manager, /ru-life-before-restore/);
});

test("local state migration normalizes old personal entries and only marks version after success", async () => {
  const migration = await source("../lib/local-state-migration.ts");
  const runtime = await source("../components/local-state-runtime.tsx");
  const layout = await source("../app/app/layout.tsx");

  assert.match(migration, /RU_LIFE_LOCAL_STATE_VERSION = 2/);
  assert.match(migration, /snapshot\.map\(normalizeEntry\)/);
  assert.match(migration, /new Set\(progress\.checked\)/);
  assert.match(migration, /safeSetLocalStorage\(storage, RU_LIFE_LOCAL_STATE_VERSION_KEY/);
  assert.match(migration, /restoreSnapshot/);
  assert.match(runtime, /migrateLocalPersonalState\(localStorage\)/);
  assert.match(layout, /LocalStateRuntime/);
  assert.match(layout, /readDeviceSession\(\)/);
});

test("quota and local storage failures are surfaced instead of silently swallowed", async () => {
  const safe = await source("../lib/local-storage-safe.ts");
  const runtime = await source("../components/local-state-runtime.tsx");
  const progress = await source("../components/topic-progress.tsx");
  const tools = await source("../components/topic-tools.tsx");
  const dashboardTools = await source("../components/workspace-personal-tools.tsx");
  const deadlines = await source("../components/topic-deadlines.tsx");
  const reminder = await source("../components/local-reminder-runtime.tsx");

  assert.match(safe, /QuotaExceededError/);
  assert.match(safe, /ru-life-storage-error/);
  assert.match(safe, /navigator\.storage\.estimate/);
  assert.match(runtime, /RU_LIFE_STORAGE_ERROR_EVENT/);
  for (const file of [progress, tools, dashboardTools, deadlines, reminder]) assert.match(file, /safeSetLocalStorage/);
});

test("V1.4 data manager exposes origin storage estimate and legacy migration state", async () => {
  const manager = await source("../components/local-data-manager.tsx");
  assert.match(manager, /estimateBrowserStorage/);
  assert.match(manager, /quota origin đang dùng/);
  assert.match(manager, /MIGRATED V1\.3 → V1\.4/);
  assert.match(manager, /KHÔI PHỤC TRANSACTIONAL/);
  assert.doesNotMatch(manager, /localStorage\.clear\(/);
  assert.doesNotMatch(manager, /fetch\(|api\/apps\/hoa-nhap-nga|managed_app_devices|control_devices/);
});

test("desktop tablet phone layout contracts remain explicit for V1.4 panels", async () => {
  const backupCss = await source("../app/backup.css");
  const toolsCss = await source("../app/tools.css");
  const deadlinesCss = await source("../app/deadlines.css");
  const contentCss = await source("../app/content.css");

  assert.match(backupCss, /@media \(max-width: 900px\)/);
  assert.match(backupCss, /@media \(max-width: 620px\)/);
  assert.match(backupCss, /Tablet contract/);
  assert.match(backupCss, /Phone contract/);
  assert.match(toolsCss, /@media \(max-width: 900px\)/);
  assert.match(toolsCss, /@media \(max-width: 620px\)/);
  assert.match(deadlinesCss, /@media/);
  assert.match(contentCss, /@media/);
});
