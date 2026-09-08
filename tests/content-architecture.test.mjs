import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE content is data-driven and separated into independent modules and topics", async () => {
  const catalog = await source("../lib/content-catalog.ts");
  const dashboard = await source("../app/app/page.tsx");
  const modulePage = await source("../app/app/[module]/page.tsx");
  const topicPage = await source("../app/app/[module]/[topic]/page.tsx");

  assert.match(catalog, /export const ruLifeModules/);
  assert.match(catalog, /slug: "prepare"/);
  assert.match(catalog, /slug: "daily-life"/);
  assert.match(catalog, /slug: "study-procedures"/);
  assert.match(catalog, /slug: "health"/);
  assert.match(catalog, /slug: "integration"/);
  assert.match(dashboard, /ruLifeModules\.map/);
  assert.match(modulePage, /getRuLifeModule/);
  assert.match(topicPage, /getRuLifeTopic/);
});

test("all module and topic routes remain inside the protected RU_LIFE workspace boundary", async () => {
  const layout = await source("../app/app/layout.tsx");
  const sw = await source("../public/sw.js");

  assert.match(layout, /readDeviceSession\(\)/);
  assert.match(layout, /redirect\("\/"\)/);
  assert.match(layout, /WorkspaceNavigation/);
  assert.match(sw, /url\.pathname\.startsWith\("\/app"\)/);
});

test("topic progress is device-local and does not call management APIs", async () => {
  const progress = await source("../components/topic-progress.tsx");
  assert.match(progress, /localStorage\.getItem/);
  assert.match(progress, /localStorage\.setItem/);
  assert.match(progress, /ru-life-progress:v1:/);
  assert.doesNotMatch(progress, /medical-control|system-control|api\/apps\/hoa-nhap-nga\/control/);
});

test("change-sensitive Russia content is explicitly prepared for source freshness instead of hardcoded rules", async () => {
  const modulePage = await source("../app/app/[module]/page.tsx");
  const topicPage = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(modulePage, /nguồn và mốc cập nhật riêng/i);
  assert.match(topicPage, /NGUỒN & ĐỘ MỚI/);
  assert.match(topicPage, /Chưa bổ sung dữ liệu chuyên sâu/);
});
