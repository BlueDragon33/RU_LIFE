"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildDeadlineCalendar,
  deadlineBucket,
  deadlineTimestamp,
  EMPTY_TOPIC_DEADLINES,
  parseStoredTopicDeadlines,
  RU_LIFE_DEADLINE_EVENT,
  topicDeadlinesKey,
  type CalendarDeadline,
  type DeadlineUrgency,
  type StoredDeadline,
  type StoredTopicDeadlines,
} from "@/lib/deadline-storage";
import { getSourceReviewMeta, type ContentFreshness } from "@/lib/source-review";

export type DeadlineBoardTopic = {
  moduleSlug: string;
  moduleCode: string;
  moduleTitle: string;
  topicSlug: string;
  topicTitle: string;
  freshness: ContentFreshness;
  updatedAt: string;
};

type Snapshot = Record<string, StoredTopicDeadlines>;
type BoardEntry = { topic: DeadlineBoardTopic; deadline: StoredDeadline; timestamp: number };

const urgencyLabel: Record<DeadlineUrgency, string> = {
  normal: "Bình thường",
  important: "Quan trọng",
  critical: "Khẩn",
};

function keyFor(topic: DeadlineBoardTopic) {
  return topicDeadlinesKey(topic.moduleSlug, topic.topicSlug);
}

function readSnapshot(topics: DeadlineBoardTopic[]) {
  const next: Snapshot = {};
  for (const topic of topics) {
    const key = keyFor(topic);
    next[key] = parseStoredTopicDeadlines(localStorage.getItem(key));
  }
  return next;
}

function localDateKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời điểm";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatDay(timestamp: number, index: number) {
  const date = new Date(timestamp);
  const weekday = index === 0 ? "Hôm nay" : new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date);
  const day = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
  return { weekday, day };
}

export default function WorkspaceDeadlineBoard({ topics }: { topics: DeadlineBoardTopic[] }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setSnapshot(readSnapshot(topics));
        setNow(Date.now());
        setLoaded(true);
      });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(RU_LIFE_DEADLINE_EVENT, refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(RU_LIFE_DEADLINE_EVENT, refresh);
    };
  }, [topics]);

  const entries = useMemo(() => topics.flatMap((topic) => {
    const stored = snapshot[keyFor(topic)] || EMPTY_TOPIC_DEADLINES;
    return stored.items.flatMap((deadline) => {
      const timestamp = deadlineTimestamp(deadline);
      return timestamp === null ? [] : [{ topic, deadline, timestamp }];
    });
  }).sort((a, b) => {
    if (a.deadline.completed !== b.deadline.completed) return a.deadline.completed ? 1 : -1;
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    const rank = { critical: 0, important: 1, normal: 2 } as const;
    return rank[a.deadline.urgency] - rank[b.deadline.urgency];
  }), [snapshot, topics]);

  const openEntries = useMemo(() => entries.filter((entry) => !entry.deadline.completed), [entries]);

  const stats = useMemo(() => {
    if (!now) return { overdue: 0, today: 0, nextWeek: 0, critical: 0 };
    let overdue = 0;
    let today = 0;
    let nextWeek = 0;
    let critical = 0;
    for (const entry of openEntries) {
      const bucket = deadlineBucket(entry.deadline, now);
      if (bucket === "overdue") overdue += 1;
      if (bucket === "today") today += 1;
      if (bucket === "next-7-days") nextWeek += 1;
      if (entry.deadline.urgency === "critical") critical += 1;
    }
    return { overdue, today, nextWeek, critical };
  }, [now, openEntries]);

  const sourceReview = useMemo(() => {
    if (!now) return { overdue: [], dueSoon: [] } as { overdue: DeadlineBoardTopic[]; dueSoon: DeadlineBoardTopic[] };
    const overdue: DeadlineBoardTopic[] = [];
    const dueSoon: DeadlineBoardTopic[] = [];
    for (const topic of topics) {
      const review = getSourceReviewMeta(topic.updatedAt, topic.freshness, now);
      if (review.state === "overdue") overdue.push(topic);
      if (review.state === "due-soon") dueSoon.push(topic);
    }
    return { overdue, dueSoon };
  }, [now, topics]);

  const weekDays = useMemo(() => {
    if (!now) return [];
    const current = new Date(now);
    const start = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
    return Array.from({ length: 7 }, (_, index) => {
      const timestamp = start + index * 24 * 60 * 60 * 1000;
      const key = localDateKey(timestamp);
      const items = openEntries.filter((entry) => localDateKey(entry.timestamp) === key && entry.timestamp >= start);
      return { timestamp, items };
    });
  }, [now, openEntries]);

  function exportIcs() {
    const calendarEntries: CalendarDeadline[] = openEntries.map((entry) => ({
      moduleTitle: entry.topic.moduleTitle,
      topicTitle: entry.topic.topicTitle,
      deadline: entry.deadline,
    }));
    const content = buildDeadlineCalendar(calendarEntries);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ru-life-deadlines.ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return <section className="deadline-board" aria-labelledby="deadline-board-title">
    <div className="section-heading deadline-board-heading"><div><span>RU_LIFE V1.2 · THỜI HẠN</span><h2 id="deadline-board-title">Lịch công việc · giấy tờ · nguồn cần rà soát</h2></div><p>Mốc cá nhân nằm trên thiết bị. Mốc rà soát nguồn là quy tắc kiểm soát chất lượng nội bộ của RU_LIFE, không phải ngày hết hiệu lực pháp lý của văn bản.</p></div>

    <div className="deadline-summary">
      <article className={stats.overdue ? "alert" : ""}><span>QUÁ HẠN</span><strong>{loaded ? stats.overdue : "—"}</strong><p>Thời hạn cá nhân đã qua và chưa đánh dấu hoàn thành.</p></article>
      <article><span>HÔM NAY</span><strong>{loaded ? stats.today : "—"}</strong><p>Việc còn hạn trong ngày hiện tại.</p></article>
      <article><span>7 NGÀY TỚI</span><strong>{loaded ? stats.nextWeek : "—"}</strong><p>Không tính việc hôm nay và việc đã quá hạn.</p></article>
      <article className={stats.critical ? "critical" : ""}><span>MỨC KHẨN</span><strong>{loaded ? stats.critical : "—"}</strong><p>Việc chưa xong đang được gắn mức “Khẩn”.</p></article>
      <article className={sourceReview.overdue.length ? "alert" : ""}><span>NGUỒN QUÁ MỐC RÀ SOÁT</span><strong>{loaded ? sourceReview.overdue.length : "—"}</strong><p>{sourceReview.dueSoon.length} chủ đề khác sẽ tới mốc rà soát trong 7 ngày.</p></article>
    </div>

    <div className="deadline-board-actions"><div><strong>{openEntries.length} thời hạn chưa hoàn thành</strong><span>Xuất lịch chỉ gồm deadline cá nhân đang mở.</span></div><button type="button" onClick={exportIcs} disabled={!openEntries.length}>Tải lịch .ics</button></div>

    <div className="week-board" aria-label="Lịch bảy ngày tới">
      {weekDays.map((day, index) => {
        const label = formatDay(day.timestamp, index);
        return <article key={localDateKey(day.timestamp)} className={day.items.length ? "has-items" : ""}><header><span>{label.weekday}</span><strong>{label.day}</strong></header>{day.items.length ? <div>{day.items.slice(0, 4).map((entry) => <Link href={`/app/${entry.topic.moduleSlug}/${entry.topic.topicSlug}`} key={entry.deadline.id} className={`urgency-${entry.deadline.urgency}`}><span>{urgencyLabel[entry.deadline.urgency]}</span><strong>{entry.deadline.title}</strong><small>{new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(entry.deadline.dueAt))}</small></Link>)}</div> : <p>Không có hạn.</p>}</article>;
      })}
    </div>

    <div className="deadline-detail-grid">
      <section className="deadline-upcoming" aria-labelledby="deadline-upcoming-title"><header><span>THỜI HẠN ĐANG MỞ</span><h3 id="deadline-upcoming-title">Theo thứ tự thời gian</h3></header>{openEntries.length ? <div>{openEntries.slice(0, 10).map((entry) => <Link href={`/app/${entry.topic.moduleSlug}/${entry.topic.topicSlug}`} key={entry.deadline.id} className={`urgency-${entry.deadline.urgency}`}><div><span>{entry.topic.moduleCode} · {entry.topic.moduleTitle}</span><strong>{entry.deadline.title}</strong><small>{urgencyLabel[entry.deadline.urgency]}</small></div><time dateTime={entry.deadline.dueAt}>{formatDateTime(entry.deadline.dueAt)}</time></Link>)}</div> : <p>Chưa có deadline cá nhân. Mở một chủ đề để thêm thời hạn.</p>}</section>

      <section className="source-review-board" aria-labelledby="source-review-title"><header><span>KIỂM SOÁT ĐỘ MỚI</span><h3 id="source-review-title">Nguồn cần kiểm tra lại</h3></header>{sourceReview.overdue.length || sourceReview.dueSoon.length ? <div>{[...sourceReview.overdue, ...sourceReview.dueSoon].slice(0, 10).map((topic) => {
        const review = getSourceReviewMeta(topic.updatedAt, topic.freshness, now);
        return <Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`} key={keyFor(topic)} className={review.state}><span>{review.state === "overdue" ? "QUÁ MỐC RÀ SOÁT" : "SẮP TỚI MỐC"}</span><strong>{topic.topicTitle}</strong><small>Kiểm tra nội bộ trước: {review.reviewBy}</small></Link>;
      })}</div> : <p>Chưa có chủ đề nào quá hoặc sát mốc rà soát nội bộ.</p>}<small className="source-review-disclaimer">Mốc này chỉ nhắc đội nội dung kiểm tra lại nguồn; không chứng minh quy định còn hiệu lực đến ngày đó.</small></section>
    </div>
  </section>;
}
