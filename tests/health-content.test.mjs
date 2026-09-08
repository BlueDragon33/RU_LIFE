import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("health module has four structured content entries", async () => {
  const content = await source("../lib/health-content.ts");
  assert.match(content, /insurance:\s*\{/);
  assert.match(content, /"care-navigation":\s*\{/);
  assert.match(content, /"medicine-reference":\s*\{/);
  assert.match(content, /emergency:\s*\{/);
  assert.match(content, /checkedAt = "2026-09-08"/);
});

test("health content distinguishes emergency care from planned care for foreign citizens", async () => {
  const content = await source("../lib/health-content.ts");
  assert.match(content, /Government Resolution No\. 631 of 8 May 2025/);
  assert.match(content, /https:\/\/government\.ru\/docs\/all\/158874\//);
  assert.match(content, /chăm sóc y tế ở dạng cấp cứu.*người nước ngoài miễn phí/s);
  assert.match(content, /Cấp cứu và chăm sóc theo kế hoạch là hai luồng khác nhau/);
});

test("foreign-student insurance guidance is linked to Study in Russia and does not assume every facility is covered", async () => {
  const content = await source("../lib/health-content.ts");
  assert.match(content, /https:\/\/studyinrussia\.ru\/en\/why-russia/);
  assert.match(content, /cơ sở y tế nằm trong chương trình bảo hiểm/);
  assert.match(content, /không dựa vào kinh nghiệm của người khác có policy khác/);
});

test("medicine reference uses active ingredient and official register without prescribing or substituting doses", async () => {
  const content = await source("../lib/health-content.ts");
  assert.match(content, /hoạt chất quốc tế\/INN \(МНН\)/);
  assert.match(content, /State Register of Medicines/);
  assert.match(content, /minzdrav\.gov\.ru\/opendata\/7707778246-grls/);
  assert.match(content, /không đề xuất liều dùng hoặc tự thay thế thuốc/);
  assert.match(content, /Không tự đổi sang sản phẩm khác nếu khác hàm lượng/);
  assert.doesNotMatch(content, /\b\d+\s*mg\b/i);
});

test("emergency topic keeps 112 and 103 prominent and does not require insurance before calling", async () => {
  const content = await source("../lib/health-content.ts");
  assert.match(content, /112 — số thống nhất/);
  assert.match(content, /103 — cấp cứu y tế/);
  assert.match(content, /Không trì hoãn cuộc gọi để tìm policy/);
  assert.match(content, /Мне нужна скорая помощь/);
});

test("content resolver exposes health without mixing medical content into the catalog", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  const catalog = await source("../lib/content-catalog.ts");
  assert.match(resolver, /healthContent/);
  assert.match(resolver, /moduleSlug === "health"/);
  assert.doesNotMatch(catalog, /Government Resolution No\. 631|State Register of Medicines|Мне нужна скорая помощь/);
});
