import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("V1.2 deadlines have an independent multi-item local storage namespace", async () => {
  const storage = await source("../lib/deadline-storage.ts");
  assert.match(storage, /ru-life-deadlines:v1:topic:/);
  assert.match(storage, /items:\s*StoredDeadline\[\]/);
  assert.match(storage, /urgency:\s*DeadlineUrgency/);
  assert.match(storage, /completed:\s*boolean/);
  assert.match(storage, /"normal" \| "important" \| "critical"/);
  assert.match(storage, /RU_LIFE_DEADLINE_EVENT/);
  assert.doesNotMatch(storage, /api\/apps\/hoa-nhap-nga|medical-control|system-control/);
});

test("one topic can manage multiple deadlines without replacing progress or V1.1 tools", async () => {
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  const deadlines = await source("../components/topic-deadlines.tsx");

  assert.match(page, /TopicProgress/);
  assert.match(page, /TopicTools/);
  assert.match(page, /TopicDeadlines/);
  assert.match(page, /<TopicDeadlines/);
  assert.match(deadlines, /items:\s*\[\.\.\.data\.items, deadline\]/);
  assert.match(deadlines, /type="datetime-local"/);
  assert.match(deadlines, /Mức khẩn cấp/);
  assert.match(deadlines, /Đánh dấu hoàn thành/);
  assert.match(deadlines, /safeSetLocalStorage/);
  assert.doesNotMatch(deadlines, /fetch\(|api\/apps\/hoa-nhap-nga|medical-control|system-control/);
});

test("dashboard aggregates daily weekly overdue and urgent deadline states", async () => {
  const page = await source("../app/app/page.tsx");
  const board = await source("../components/workspace-deadline-board.tsx");
  const css = await source("../app/deadlines.css");

  assert.match(page, /WorkspaceDeadlineBoard/);
  assert.match(page, /deadlineTopics/);
  assert.match(board, /QUÁ HẠN/);
  assert.match(board, /HÔM NAY/);
  assert.match(board, /7 NGÀY TỚI/);
  assert.match(board, /MỨC KHẨN/);
  assert.match(board, /Array\.from\(\{ length: 7 \}/);
  assert.match(css, /\.week-board/);
  assert.match(css, /\.deadline-summary/);
  assert.match(css, /\.urgency-critical/);
});

test("V1.2 exports open deadlines as a standard iCalendar file without external calendar APIs", async () => {
  const storage = await source("../lib/deadline-storage.ts");
  const board = await source("../components/workspace-deadline-board.tsx");

  assert.match(storage, /BEGIN:VCALENDAR/);
  assert.match(storage, /BEGIN:VEVENT/);
  assert.match(storage, /PRODID:-\/\/RU_LIFE\/\/Deadlines V1\.2\/\/VI/);
  assert.match(storage, /DTSTART:/);
  assert.match(storage, /SUMMARY:/);
  assert.match(board, /buildDeadlineCalendar/);
  assert.match(board, /new Blob/);
  assert.match(board, /ru-life-deadlines\.ics/);
  assert.match(board, /Tải lịch \.ics/);
  assert.doesNotMatch(board, /googleapis|calendar\.google|api\/apps\/hoa-nhap-nga/);
});

test("source review alerts use explicit internal windows and never claim legal expiry", async () => {
  const review = await source("../lib/source-review.ts");
  const page = await source("../app/app/[module]/[topic]/page.tsx");
  const board = await source("../components/workspace-deadline-board.tsx");

  assert.match(review, /"review-soon": 30/);
  assert.match(review, /verified: 90/);
  assert.match(review, /"stable-guidance": 365/);
  assert.match(review, /"current" \| "due-soon" \| "overdue" \| "unknown"/);
  assert.match(page, /getSourceReviewMeta/);
  assert.match(page, /không phải ngày hết hiệu lực pháp lý/i);
  assert.match(board, /NGUỒN QUÁ MỐC RÀ SOÁT/);
  assert.match(board, /không chứng minh quy định còn hiệu lực đến ngày đó/i);
});

test("deadline styles are loaded only inside the protected RU_LIFE workspace", async () => {
  const rootLayout = await source("../app/layout.tsx");
  const protectedLayout = await source("../app/app/layout.tsx");
  const css = await source("../app/deadlines.css");

  assert.doesNotMatch(rootLayout, /deadlines\.css/);
  assert.match(protectedLayout, /import "\.\.\/deadlines\.css"/);
  assert.match(protectedLayout, /readDeviceSession\(\)/);
  assert.match(css, /\.topic-deadlines-panel/);
  assert.match(css, /\.source-review-inline/);
  assert.match(css, /@media \(max-width: 520px\)/);
});
