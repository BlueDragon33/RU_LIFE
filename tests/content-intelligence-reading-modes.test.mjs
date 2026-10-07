import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge experience exposes the three primary reading intents", async () => {
  const experience = await source("../components/knowledge/knowledge-experience.tsx");
  assert.match(experience, /Tôi cần làm gì\?/);
  assert.match(experience, /Tôi muốn hiểu/);
  assert.match(experience, /Cho tôi xem toàn bộ/);
  assert.match(experience, /<button/);
  assert.match(experience, /aria-pressed/);
  assert.doesNotMatch(experience, /fetch\(|\/api\//);
});

test("quick and risk views keep essential guidance before deep prose", async () => {
  const quick = await source("../components/knowledge/knowledge-quick-view.tsx");
  const risk = await source("../components/knowledge/knowledge-risk-panel.tsx");
  assert.match(quick, /Ba điều phải nhớ/);
  assert.match(quick, /mustRemember/);
  assert.match(quick, /Việc nên làm ngay/i);
  assert.match(risk, /CẤM \/ KHÔNG ĐƯỢC LÀM/);
  assert.match(risk, /RẤT QUAN TRỌNG/);
  assert.match(risk, /CẦN LƯU Ý/);
  assert.match(risk, /NÊN LÀM/);
  assert.match(risk, /BIẾT THÊM/);
  assert.match(risk, /scope/);
});

test("full mode renders source provenance instead of hiding it", async () => {
  const full = await source("../components/knowledge/knowledge-full-view.tsx");
  const sources = await source("../components/knowledge/knowledge-source-list.tsx");
  assert.match(full, /KnowledgeSourceList/);
  assert.match(sources, /checkedAt/);
  assert.match(sources, /authority/);
  assert.match(sources, /target="_blank"/);
  assert.match(sources, /rel="noreferrer"/);
});
