"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_TOPIC_TOOLS,
  parseStoredTopicTools,
  RU_LIFE_TOOLS_EVENT,
  topicToolsKey,
  type StoredTopicTools,
} from "@/lib/personal-tools-storage";

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

export default function TopicTools({ moduleSlug, topicSlug, title }: { moduleSlug: string; topicSlug: string; title: string }) {
  const key = useMemo(() => topicToolsKey(moduleSlug, topicSlug), [moduleSlug, topicSlug]);
  const [tools, setTools] = useState<StoredTopicTools>({ ...EMPTY_TOPIC_TOOLS });
  const [reminderInput, setReminderInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = parseStoredTopicTools(localStorage.getItem(key));
      setTools(stored);
      setReminderInput(isoToLocalInput(stored.reminderAt));
      setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [key]);

  function persist(value: StoredTopicTools) {
    setTools(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(RU_LIFE_TOOLS_EVENT, { detail: { key } }));
    } catch {
      // Personal tools remain usable in memory when browser storage is unavailable.
    }
  }

  function toggleFavorite() {
    persist({ ...tools, favorite: !tools.favorite, topicTitle: title, updatedAt: new Date().toISOString() });
  }

  function saveReminder() {
    const reminderAt = localInputToIso(reminderInput);
    persist({
      ...tools,
      reminderAt,
      reminderNote: tools.reminderNote.trim(),
      notifiedAt: "",
      topicTitle: title,
      updatedAt: new Date().toISOString(),
    });
  }

  function clearReminder() {
    setReminderInput("");
    persist({ ...tools, reminderAt: "", reminderNote: "", notifiedAt: "", topicTitle: title, updatedAt: new Date().toISOString() });
  }

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  const hasReminder = Boolean(tools.reminderAt);
  const formattedReminder = hasReminder ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(tools.reminderAt)) : "";

  return <section className="topic-tools-panel" aria-labelledby="topic-tools-title">
    <header><div><span>CÔNG CỤ CÁ NHÂN V1.1</span><h2 id="topic-tools-title">Yêu thích · nhắc việc</h2></div></header>

    <button type="button" className={`favorite-toggle ${tools.favorite ? "active" : ""}`} aria-pressed={tools.favorite} onClick={toggleFavorite} disabled={!loaded}>
      <span aria-hidden="true">{tools.favorite ? "★" : "☆"}</span>
      <strong>{tools.favorite ? "Đã thêm vào yêu thích" : "Thêm vào yêu thích"}</strong>
    </button>

    <div className="topic-reminder-form">
      <label><span>Thời điểm nhắc</span><input type="datetime-local" value={reminderInput} onChange={(event) => setReminderInput(event.target.value)} /></label>
      <label><span>Nội dung nhắc</span><input type="text" value={tools.reminderNote} onChange={(event) => setTools({ ...tools, reminderNote: event.target.value })} placeholder="Ví dụ: kiểm tra lại hạn giấy tờ" maxLength={160} /></label>
      <div className="topic-reminder-actions"><button type="button" onClick={saveReminder}>Lưu nhắc việc</button>{hasReminder ? <button type="button" className="secondary" onClick={clearReminder}>Xóa</button> : null}</div>
      {hasReminder ? <p className="reminder-saved">Đã đặt: <strong>{formattedReminder}</strong></p> : null}
    </div>

    <div className="notification-setting">
      <div><span>THÔNG BÁO TRÌNH DUYỆT</span><p>Nhắc việc được lưu trên thiết bị. RU_LIFE sẽ kiểm tra khi ứng dụng đang mở hoặc khi bạn mở lại; trình duyệt không bảo đảm chạy lịch nền khi ứng dụng đã đóng.</p></div>
      {notificationPermission === "default" ? <button type="button" onClick={requestNotifications}>Cho phép thông báo</button> : <span className={`notification-state ${notificationPermission}`}>{notificationPermission === "granted" ? "Đã cho phép" : notificationPermission === "denied" ? "Đã chặn" : "Không hỗ trợ"}</span>}
    </div>
  </section>;
}
