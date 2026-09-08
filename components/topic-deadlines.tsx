"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deadlineBucket,
  deadlineTimestamp,
  EMPTY_TOPIC_DEADLINES,
  parseStoredTopicDeadlines,
  RU_LIFE_DEADLINE_EVENT,
  topicDeadlinesKey,
  type DeadlineUrgency,
  type StoredDeadline,
  type StoredTopicDeadlines,
} from "@/lib/deadline-storage";

function isoToLocalInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function localInputToIso(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function newDeadlineId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `deadline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDeadline(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời điểm";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const urgencyLabel: Record<DeadlineUrgency, string> = {
  normal: "Bình thường",
  important: "Quan trọng",
  critical: "Khẩn",
};

const bucketLabel = {
  completed: "Đã xong",
  overdue: "Quá hạn",
  today: "Hôm nay",
  "next-7-days": "7 ngày tới",
  later: "Sau 7 ngày",
} as const;

export default function TopicDeadlines({ moduleSlug, topicSlug, title }: { moduleSlug: string; topicSlug: string; title: string }) {
  const key = useMemo(() => topicDeadlinesKey(moduleSlug, topicSlug), [moduleSlug, topicSlug]);
  const [data, setData] = useState<StoredTopicDeadlines>({ ...EMPTY_TOPIC_DEADLINES, items: [] });
  const [taskTitle, setTaskTitle] = useState("");
  const [dueInput, setDueInput] = useState("");
  const [urgency, setUrgency] = useState<DeadlineUrgency>("normal");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setData(parseStoredTopicDeadlines(localStorage.getItem(key)));
      setLoaded(true);
      setNow(Date.now());
    });
    return () => window.cancelAnimationFrame(frame);
  }, [key]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function persist(next: StoredTopicDeadlines) {
    setData(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(RU_LIFE_DEADLINE_EVENT, { detail: { key } }));
    } catch {
      // Deadlines remain usable in memory when browser storage is unavailable.
    }
  }

  function addDeadline() {
    const normalizedTitle = taskTitle.trim();
    const dueAt = localInputToIso(dueInput);
    if (!normalizedTitle) {
      setError("Nhập tên việc hoặc giấy tờ cần theo dõi.");
      return;
    }
    if (!dueAt) {
      setError("Chọn ngày và giờ cần hoàn thành.");
      return;
    }

    const timestamp = new Date().toISOString();
    const deadline: StoredDeadline = {
      id: newDeadlineId(),
      title: normalizedTitle.slice(0, 160),
      dueAt,
      urgency,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    persist({ items: [...data.items, deadline], updatedAt: timestamp });
    setTaskTitle("");
    setDueInput("");
    setUrgency("normal");
    setError("");
  }

  function updateDeadline(id: string, updater: (deadline: StoredDeadline) => StoredDeadline) {
    const timestamp = new Date().toISOString();
    persist({
      items: data.items.map((deadline) => deadline.id === id ? updater({ ...deadline, updatedAt: timestamp }) : deadline),
      updatedAt: timestamp,
    });
  }

  function removeDeadline(id: string) {
    persist({ items: data.items.filter((deadline) => deadline.id !== id), updatedAt: new Date().toISOString() });
  }

  const sorted = useMemo(() => [...data.items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aTime = deadlineTimestamp(a) ?? Number.MAX_SAFE_INTEGER;
    const bTime = deadlineTimestamp(b) ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  }), [data.items]);

  return <section className="topic-deadlines-panel" aria-labelledby="topic-deadlines-title">
    <header><div><span>QUẢN LÝ THỜI HẠN V1.2</span><h2 id="topic-deadlines-title">Deadline · giấy tờ · công việc</h2></div><strong>{loaded ? data.items.filter((item) => !item.completed).length : "—"}</strong></header>
    <p className="deadline-panel-note">Một chủ đề có thể có nhiều mốc riêng. Dữ liệu chỉ lưu trên thiết bị này và không phải dữ liệu quản trị.</p>

    <div className="deadline-form">
      <label><span>Tên việc</span><input type="text" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder={`Ví dụ: rà lại ${title}`} maxLength={160} /></label>
      <label><span>Hạn hoàn thành</span><input type="datetime-local" value={dueInput} onChange={(event) => setDueInput(event.target.value)} /></label>
      <label><span>Mức khẩn cấp</span><select value={urgency} onChange={(event) => setUrgency(event.target.value as DeadlineUrgency)}><option value="normal">Bình thường</option><option value="important">Quan trọng</option><option value="critical">Khẩn</option></select></label>
      <button type="button" onClick={addDeadline}>Thêm thời hạn</button>
      {error ? <p className="deadline-error" role="alert">{error}</p> : null}
    </div>

    <div className="deadline-list">
      {sorted.length ? sorted.map((deadline) => {
        const bucket = deadlineBucket(deadline, now || Date.now());
        return <article className={`deadline-item ${bucket} urgency-${deadline.urgency}`} key={deadline.id}>
          <div className="deadline-item-head"><div><span>{bucketLabel[bucket]} · {urgencyLabel[deadline.urgency]}</span><strong>{deadline.title}</strong><time dateTime={deadline.dueAt}>{formatDeadline(deadline.dueAt)}</time></div><button type="button" className="deadline-delete" aria-label={`Xóa thời hạn ${deadline.title}`} onClick={() => removeDeadline(deadline.id)}>×</button></div>
          <div className="deadline-item-actions"><label><input type="checkbox" checked={deadline.completed} onChange={() => updateDeadline(deadline.id, (value) => ({ ...value, completed: !value.completed }))} /><span>{deadline.completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</span></label>{!deadline.completed ? <select aria-label={`Mức khẩn cấp của ${deadline.title}`} value={deadline.urgency} onChange={(event) => updateDeadline(deadline.id, (value) => ({ ...value, urgency: event.target.value as DeadlineUrgency }))}><option value="normal">Bình thường</option><option value="important">Quan trọng</option><option value="critical">Khẩn</option></select> : null}</div>
        </article>;
      }) : <p className="deadline-empty">Chưa có thời hạn riêng cho chủ đề này.</p>}
    </div>
  </section>;
}
