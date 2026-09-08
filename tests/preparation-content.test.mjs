import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("preparation module has four real structured topic content entries", async () => {
  const content = await source("../lib/topic-content.ts");

  assert.match(content, /documents:\s*\{/);
  assert.match(content, /luggage:\s*\{/);
  assert.match(content, /"money-connectivity":\s*\{/);
  assert.match(content, /"arrival-plan":\s*\{/);
  assert.match(content, /blocks:\s*\[/);
  assert.match(content, /sources:\s*\[/);
  assert.match(content, /updatedAt:/);
  assert.match(content, /freshness:/);
});

test("dynamic Russian entry guidance is source-linked and does not treat e-visa as a study visa", async () => {
  const content = await source("../lib/topic-content.ts");

  assert.match(content, /https:\/\/studyinrussia\.ru\/en\/education/);
  assert.match(content, /https:\/\/studyinrussia\.ru\/en\/online-admission/);
  assert.match(content, /https:\/\/evisa\.kdmid\.ru\/Home\/Instruction/);
  assert.match(content, /Không dùng e-visa như một phương án thay thế mặc định cho visa học tập/);
  assert.match(content, /Danh mục cuối cùng luôn phải đối chiếu với trường, loại visa và diện nhập học/);
});

test("topic page renders freshness, structured blocks and official source links with a safe fallback", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  const resolver = await source("../lib/content-resolver.ts");

  assert.match(page, /getResolvedTopicContent/);
  assert.match(resolver, /getPreparationTopicContent/);
  assert.match(page, /freshnessLabel/);
  assert.match(page, /content\.blocks\.map/);
  assert.match(page, /content\.sources\.map/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /rel="noreferrer"/);
  assert.match(page, /Chưa bổ sung dữ liệu chuyên sâu/);
});

test("RU_LIFE modular content styles are isolated from the access-gate stylesheet", async () => {
  const layout = await source("../app/layout.tsx");
  const contentCss = await source("../app/content.css");

  assert.match(layout, /import "\.\/globals\.css"/);
  assert.match(layout, /import "\.\/content\.css"/);
  assert.match(contentCss, /\.module-grid/);
  assert.match(contentCss, /\.topic-layout/);
  assert.match(contentCss, /\.source-list/);
  assert.match(contentCss, /\.topic-progress-panel/);
  assert.match(contentCss, /@media \(max-width: 760px\)/);
});
