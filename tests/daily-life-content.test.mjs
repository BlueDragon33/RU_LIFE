import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("daily life module has four structured topic content entries", async () => {
  const content = await source("../lib/daily-life-content.ts");
  const resolver = await source("../lib/content-resolver.ts");

  assert.match(content, /housing:\s*\{/);
  assert.match(content, /transport:\s*\{/);
  assert.match(content, /"shopping-services":\s*\{/);
  assert.match(content, /safety:\s*\{/);
  assert.match(resolver, /moduleSlug === "daily-life"/);
  assert.match(resolver, /dailyLifeContent\[topicSlug\]/);
});

test("housing guidance separates dormitory procedure from migration procedure", async () => {
  const content = await source("../lib/daily-life-content.ts");

  assert.match(content, /Việc được nhận phòng không đồng nghĩa mọi thủ tục cư trú đã hoàn tất/);
  assert.match(content, /https:\/\/studyinrussia\.ru\/en\/education/);
  assert.match(content, /sinh viên quota/);
});

test("safety topic exposes current official Russian emergency numbers with MChS sources", async () => {
  const content = await source("../lib/daily-life-content.ts");

  assert.match(content, /112 là số thống nhất/);
  assert.match(content, /101 cứu hỏa\/cứu nạn/);
  assert.match(content, /102 cảnh sát/);
  assert.match(content, /103 cấp cứu y tế/);
  assert.match(content, /104 sự cố khí gas/);
  assert.match(content, /mchs\.gov\.ru/);
});

test("transport and shopping content avoid freezing volatile provider prices and app names", async () => {
  const content = await source("../lib/daily-life-content.ts");

  assert.match(content, /không khóa tên ứng dụng, giá vé hoặc biểu giá/i);
  assert.match(content, /Không khóa ngân sách bằng mức giá mẫu cũ/);
  assert.doesNotMatch(content, /Yandex Go|Metro Moscow|₽\/tháng/);
});
