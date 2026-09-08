import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("V1.3 backup only accepts the three personal RU_LIFE namespaces", async () => {
  const backup = await source("../lib/local-data-backup.ts");
  assert.match(backup, /RU_LIFE_PROGRESS_PREFIX/);
  assert.match(backup, /RU_LIFE_TOOLS_PREFIX/);
  assert.match(backup, /RU_LIFE_DEADLINE_PREFIX/);
  assert.match(backup, /ru-life-local-backup-v1/);
  assert.match(backup, /RU_LIFE_BACKUP_MAX_BYTES = 2_000_000/);
  assert.doesNotMatch(backup, /device-session|deviceCode|P-256|managed_app_devices|control_devices/);
});

test("backup validation finishes before replacement writes and restore stays local", async () => {
  const backup = await source("../lib/local-data-backup.ts");
  const manager = await source("../components/local-data-manager.tsx");
  assert.match(backup, /validateLocalBackupText/);
  assert.match(backup, /validateLocalBackupEntry/);
  assert.match(backup, /replaceLocalPersonalData/);
  assert.match(manager, /Tệp hợp lệ\. Chưa có dữ liệu nào được ghi/);
  assert.match(manager, /ru-life-before-restore/);
  assert.match(manager, /ru-life-before-clear/);
  assert.match(manager, /KHÔI PHỤC/);
  assert.match(manager, /XÓA/);
  assert.match(manager, /localStorage/);
  assert.doesNotMatch(manager, /fetch\(|api\/apps\/hoa-nhap-nga|medical-control|system-control/);
});

test("V1.3 deadline schema supports optional checklist linkage without breaking old data", async () => {
  const storage = await source("../lib/deadline-storage.ts");
  assert.match(storage, /checklistIndex:\s*number \| null/);
  assert.match(storage, /value\.checklistIndex/);
  assert.match(storage, /:\s*null,/);
});

test("completing a linked deadline completes its checklist item one-way", async () => {
  const component = await source("../components/topic-deadlines.tsx");
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(component, /Liên kết checklist/);
  assert.match(component, /completeLinkedChecklist/);
  assert.match(component, /RU_LIFE_PROGRESS_EVENT/);
  assert.match(component, /completed && deadline\.checklistIndex !== null/);
  assert.match(component, /bỏ hoàn thành deadline không tự bỏ checklist/i);
  assert.match(page, /checklist=\{topic\.checklist\}/);
});

test("dashboard exposes backup manager only inside protected workspace CSS boundary", async () => {
  const page = await source("../app/app/page.tsx");
  const layout = await source("../app/app/layout.tsx");
  const css = await source("../app/backup.css");
  assert.match(page, /LocalDataManager/);
  assert.match(layout, /import "\.\.\/backup\.css"/);
  assert.match(layout, /readDeviceSession\(\)/);
  assert.match(css, /\.local-data-manager/);
  assert.match(css, /\.backup-card/);
});
