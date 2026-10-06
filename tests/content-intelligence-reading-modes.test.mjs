import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("knowledge experience exposes the three approved reading intents", async () => {
  const experience = await source("../components/knowledge/knowledge-experience.tsx");
  assert.match(experience, /Tôi cần làm gì\?/);
  assert.match(experience, /Tôi muốn hiểu/);
  assert.match(experience, /Cho tôi xem toàn bộ/);
  assert.match(experience, /<button/);
  assert.match(experience, /aria-pressed=/);
  assert.match(experience, /useState<KnowledgeViewMode>\("action"\)/);
  assert.doesNotMatch(experience, /fetch\(|\/api\//);
});

test("quick view puts must-remember and next action before deep reading", async () => {
  const quick = await source("../components/knowledge/knowledge-quick-view.tsx");
  assert.match(quick, /Ba điều phải nhớ/);
  assert.match(quick, /mustRemember/);
  assert.match(quick, /Việc nên làm ngay/);
  assert.match(quick, /nextAction/);
});

test("risk panel uses textual labels, not color-only meaning", async () => {
  const risk = await source("../components/knowledge/knowledge-risk-panel.tsx");
  for (const label of [
    "CẤM / KHÔNG ĐƯỢC LÀM",
    "RẤT QUAN TRỌNG",
    "CẦN LƯU Ý",
    "NÊN LÀM",
    "BIẾT THÊM",
  ]) {
    assert.ok(risk.includes(label), label);
  }
});

test("full reading mode keeps provenance and source access", async () => {
  const full = await source("../components/knowledge/knowledge-full-view.tsx");
  const sources = await source("../components/knowledge/knowledge-source-list.tsx");
  assert.match(full, /KnowledgeSourceList/);
  assert.match(full, /Toàn bộ nội dung/);
  assert.match(sources, /checkedAt/);
  assert.match(sources, /authority/);
  assert.match(sources, /target="_blank"/);
  assert.match(sources, /rel="noreferrer"/);
});
