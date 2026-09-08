import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("study procedures module has four real structured content entries", async () => {
  const content = await source("../lib/study-procedures-content.ts");
  assert.match(content, /enrollment:\s*\{/);
  assert.match(content, /"migration-registration":\s*\{/);
  assert.match(content, /"study-plan":\s*\{/);
  assert.match(content, /"important-contacts":\s*\{/);
  assert.match(content, /updatedAt:\s*checkedAt/);
  assert.match(content, /freshness:/);
});

test("2026 foreign-student migration content separates residence registration fingerprinting and medical examination", async () => {
  const content = await source("../lib/study-procedures-content.ts");
  assert.match(content, /Đăng ký tại nơi lưu trú \(migration registration\)/);
  assert.match(content, /Vân tay bắt buộc và chụp ảnh/);
  assert.match(content, /Khám y tế – quy định mới từ 01\/09\/2026/);
  assert.match(content, /trong vòng 90 ngày kể từ ngày nhập cảnh/);
  assert.match(content, /trong vòng 30 ngày kể từ ngày nhập cảnh/);
  assert.match(content, /Hoàn thành khám y tế không tự động chứng minh đã đăng ký vân tay/);
});

test("time-sensitive Russian migration rules have current legal sources", async () => {
  const content = await source("../lib/study-procedures-content.ts");
  assert.match(content, /consultant\.ru\/document\/cons_doc_LAW_37868/);
  assert.match(content, /publication\.pravo\.gov\.ru\/Document\/View\/0001202107010039/);
  assert.match(content, /epp\.genproc\.gov\.ru\/ru\/proc_50/);
  assert.match(content, /checkedAt = "2026-09-08"/);
});

test("quota enrollment is not treated as automatic completion of university enrollment", async () => {
  const content = await source("../lib/study-procedures-content.ts");
  assert.match(content, /Phân biệt giấy xác nhận trúng tuyển\/quota với thủ tục nhập học nội bộ tại trường/);
  assert.match(content, /được phân bổ quota không có nghĩa là mọi bước hành chính của trường đã tự hoàn tất/);
  assert.match(content, /https:\/\/studyinrussia\.ru\/en\/online-admission/);
});

test("content resolver exposes study-procedures without mixing it into the catalog", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  const catalog = await source("../lib/content-catalog.ts");
  assert.match(resolver, /studyProceduresContent/);
  assert.match(resolver, /moduleSlug === "study-procedures"/);
  assert.doesNotMatch(catalog, /162-FZ|274-FZ|consultant\.ru|genproc\.gov\.ru/);
});
