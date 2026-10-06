import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("topic route selects intelligence rendering without removing the legacy content path", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /getResolvedKnowledgeUnit/);
  assert.match(page, /getResolvedKnowledgeSources/);
  assert.match(page, /KnowledgeExperience/);
  assert.match(page, /unit=\{intelligence\}/);
  assert.match(page, /sources=\{intelligenceSources\}/);
  assert.match(page, /getResolvedTopicContent/);
  assert.match(page, /content\.blocks\.map/);
});

test("topic route preserves existing personal-state tool identities", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /<TopicProgress moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} checklist=\{topic\.checklist\}/);
  assert.match(page, /<TopicTools moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} title=\{topic\.title\}/);
  assert.match(page, /<TopicDeadlines moduleSlug=\{moduleData\.slug\} topicSlug=\{topic\.slug\} title=\{topic\.title\} checklist=\{topic\.checklist\}/);
  assert.doesNotMatch(page, /managed_app_devices|control_devices|medical-control|api\/apps\/hoa-nhap-nga\/control/);
});

test("intelligence route surfaces its own verified date and freshness", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /intelligence\.provenance\.verifiedAt/);
  assert.match(page, /intelligence\.provenance\.freshness/);
});
