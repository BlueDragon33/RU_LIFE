import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("personal tools use a dedicated local namespace and never become management data", async () => {
  const storage = await source("../lib/personal-tools-storage.ts");
  const topicTools = await source("../components/topic-tools.tsx");
  const dashboardTools = await source("../components/workspace-personal-tools.tsx");

  assert.match(storage, /ru-life-tools:v1:topic:/);
  assert.match(storage, /favorite:\s*boolean/);
  assert.match(storage, /reminderAt:\s*string/);
  assert.match(storage, /reminderNote:\s*string/);
  assert.match(storage, /notifiedAt:\s*string/);
  assert.match(topicTools, /safeSetLocalStorage/);
  assert.match(dashboardTools, /safeSetLocalStorage/);
  assert.doesNotMatch(topicTools, /api\/apps\/hoa-nhap-nga|medical-control|system-control/);
  assert.doesNotMatch(dashboardTools, /api\/apps\/hoa-nhap-nga|medical-control|system-control/);
});

test("topic tools support favorites local reminders and browser notification opt-in", async () => {
  const topicTools = await source("../components/topic-tools.tsx");
  assert.match(topicTools, /aria-pressed=\{tools\.favorite\}/);
  assert.match(topicTools, /type="datetime-local"/);
  assert.match(topicTools, /Notification\.requestPermission\(\)/);
  assert.match(topicTools, /best-effort khi ứng dụng có cơ hội chạy/);
  assert.match(topicTools, /RU_LIFE_TOOLS_EVENT/);
});

test("local reminder runtime checks due reminders only inside the protected workspace", async () => {
  const runtime = await source("../components/local-reminder-runtime.tsx");
  const layout = await source("../app/app/layout.tsx");

  assert.match(runtime, /REMINDER_CHECK_MS = 60_000/);
  assert.match(runtime, /Notification\.permission !== "granted"/);
  assert.match(runtime, /new Notification/);
  assert.match(runtime, /document\.visibilityState === "visible"/);
  assert.match(runtime, /visibilitychange/);
  assert.match(runtime, /safeSetLocalStorage/);
  assert.match(layout, /LocalReminderRuntime/);
  assert.match(layout, /import "\.\.\/tools\.css"/);
  assert.match(layout, /readDeviceSession\(\)/);
});

test("V1.1 situation classification covers all twenty catalog topics", async () => {
  const situations = await source("../lib/topic-situations.ts");
  const expected = [
    "prepare:documents", "prepare:luggage", "prepare:money-connectivity", "prepare:arrival-plan",
    "daily-life:housing", "daily-life:transport", "daily-life:shopping-services", "daily-life:safety",
    "study-procedures:enrollment", "study-procedures:migration-registration", "study-procedures:study-plan", "study-procedures:important-contacts",
    "health:insurance", "health:care-navigation", "health:medicine-reference", "health:emergency",
    "integration:daily-russian", "integration:school-russian", "integration:culture-etiquette", "integration:personal-notes",
  ];
  for (const key of expected) assert.match(situations, new RegExp(`\\"${key}\\"`));
  assert.equal(expected.length, 20);
  for (const id of ["before-departure", "first-days", "daily-life", "administration", "study", "health", "emergency", "communication"]) {
    assert.match(situations, new RegExp(`id: \\\"${id}\\\"`));
  }
});

test("dashboard exposes priority situation favorite filters and upcoming reminders", async () => {
  const page = await source("../app/app/page.tsx");
  const tools = await source("../components/workspace-personal-tools.tsx");
  const css = await source("../app/tools.css");

  assert.match(page, /WorkspacePersonalTools/);
  assert.match(page, /getTopicSituations/);
  assert.match(tools, /priorityFilter/);
  assert.match(tools, /situationFilter/);
  assert.match(tools, /favoritesOnly/);
  assert.match(tools, /VIỆC SẮP TỚI/);
  assert.match(tools, /reminderTimestamp/);
  assert.match(css, /\.personal-filter-controls/);
  assert.match(css, /\.reminders-panel/);
  assert.match(css, /\.topic-tools-panel/);
});

test("topic pages expose personal tools without replacing the existing local progress panel", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  assert.match(page, /TopicProgress/);
  assert.match(page, /TopicTools/);
  assert.match(page, /<TopicProgress/);
  assert.match(page, /<TopicTools/);
});
