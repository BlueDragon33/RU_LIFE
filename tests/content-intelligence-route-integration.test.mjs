import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("topic route selects intelligence when available and preserves legacy content", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /getResolvedKnowledgeUnit/);
  assert.match(page, /getResolvedKnowledgeSources/);
  assert.match(page, /getResolvedTopicContent/);
  assert.match(page, /KnowledgeExperience/);
  assert.match(page, /intelligenceSources/);
  assert.match(page, /content\.blocks\.map/);
});

test("topic route keeps existing personal-state component identifiers unchanged", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /<TopicProgress moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} checklist=\{topic\.checklist\}/);
  assert.match(page, /<TopicTools moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} title=\{topic\.title\}/);
  assert.match(page, /<TopicDeadlines moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} title=\{topic\.title\} checklist=\{topic\.checklist\}/);
  assert.doesNotMatch(page, /managed_app_devices|control_devices|api\/apps\/hoa-nhap-nga\/control/);
});
