import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("RU_LIFE dashboard searches all catalog topics locally and exposes keyboard focus", async () => {
  const dashboard = await source("../components/workspace-dashboard.tsx");
  const page = await source("../app/app/page.tsx");

  assert.match(page, /WorkspaceDashboard/);
  assert.match(page, /ruLifeModules\.flatMap/);
  assert.match(page, /getResolvedTopicContent/);
  assert.match(dashboard, /type="search"/);
  assert.match(dashboard, /normalizeSearch/);
  assert.match(dashboard, /\.\.\.topic\.checklist/);
  assert.match(dashboard, /event\.key !== "\/"/);
  assert.match(dashboard, /searchRef\.current\?\.focus/);
  assert.doesNotMatch(dashboard, /fetch\(|\/api\//);
});

test("dashboard aggregates the same local progress namespace used by topic pages", async () => {
  const dashboard = await source("../components/workspace-dashboard.tsx");
  const topicProgress = await source("../components/topic-progress.tsx");
  const storage = await source("../lib/progress-storage.ts");

  assert.match(storage, /ru-life-progress:v1:/);
  assert.match(storage, /topicProgressKey/);
  assert.match(storage, /parseStoredTopicProgress/);
  assert.match(storage, /validCheckedCount/);
  assert.match(dashboard, /localStorage\.getItem/);
  assert.match(dashboard, /validCheckedCount/);
  assert.match(dashboard, /completedTopics/);
  assert.match(dashboard, /checkedItems/);
  assert.match(dashboard, /notes/);
  assert.match(topicProgress, /RU_LIFE_PROGRESS_EVENT/);
  assert.match(topicProgress, /localStorage\.setItem/);
});

test("next action prioritizes incomplete essential topics before recommended and reference", async () => {
  const dashboard = await source("../components/workspace-dashboard.tsx");
  assert.match(dashboard, /\["essential", "recommended", "reference"\]/);
  assert.match(dashboard, /validCheckedCount\(stored, topic\.checklist\.length\) < topic\.checklist\.length/);
  assert.match(dashboard, /VIỆC NÊN LÀM TIẾP/);
});

test("freshness is surfaced on the dashboard without replacing per-topic source dates", async () => {
  const dashboard = await source("../components/workspace-dashboard.tsx");
  const page = await source("../app/app/page.tsx");
  const topicPage = await source("../app/app/[module]/[topic]/page.tsx");

  assert.match(page, /freshness: content\?\.freshness/);
  assert.match(page, /updatedAt: content\?\.updatedAt/);
  assert.match(dashboard, /freshness === "review-soon"/);
  assert.match(dashboard, /CẦN RÀ SOÁT NGUỒN/);
  assert.match(topicPage, /Kiểm tra: \{content\.updatedAt\}/);
  assert.match(topicPage, /source\.checkedAt/);
});

test("protected workspace has keyboard skip navigation and accessible checklist progress", async () => {
  const layout = await source("../app/app/layout.tsx");
  const topicProgress = await source("../components/topic-progress.tsx");
  const workspaceCss = await source("../app/workspace.css");
  const contentCss = await source("../app/content.css");

  assert.match(layout, /className="skip-link"/);
  assert.match(layout, /href="#workspace-content"/);
  assert.match(layout, /id="workspace-content"/);
  assert.match(topicProgress, /role="progressbar"/);
  assert.match(topicProgress, /aria-valuenow=\{done\}/);
  assert.match(topicProgress, /type="checkbox"/);
  assert.match(contentCss, /input:focus-visible \+ span/);
  assert.match(contentCss, /prefers-reduced-motion: reduce/);
  assert.match(workspaceCss, /\.skip-link:focus/);
});

test("workspace shell and content styles have distinct responsibilities", async () => {
  const workspaceCss = await source("../app/workspace.css");
  const contentCss = await source("../app/content.css");

  assert.match(workspaceCss, /\.workspace-shell/);
  assert.match(workspaceCss, /\.workspace-side/);
  assert.match(workspaceCss, /\.workspace-nav/);
  assert.doesNotMatch(workspaceCss, /\.topic-layout|\.module-grid|\.dashboard-command/);
  assert.match(contentCss, /\.topic-layout/);
  assert.match(contentCss, /\.module-grid/);
  assert.match(contentCss, /\.dashboard-command/);
  assert.doesNotMatch(contentCss, /\.workspace-shell|\.workspace-side/);
});
