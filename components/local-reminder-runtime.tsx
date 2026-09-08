"use client";

import { useEffect } from "react";
import {
  parseStoredTopicTools,
  reminderIsDue,
  RU_LIFE_TOOLS_EVENT,
  RU_LIFE_TOOLS_PREFIX,
  type StoredTopicTools,
} from "@/lib/personal-tools-storage";

const REMINDER_CHECK_MS = 60_000;

function persistNotified(key: string, value: StoredTopicTools) {
  const next = { ...value, notifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(RU_LIFE_TOOLS_EVENT, { detail: { key } }));
}

function checkDueReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const due: Array<{ key: string; value: StoredTopicTools }> = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(RU_LIFE_TOOLS_PREFIX)) continue;
    const value = parseStoredTopicTools(localStorage.getItem(key));
    if (!value.reminderAt || value.notifiedAt || !reminderIsDue(value)) continue;
    due.push({ key, value });
  }

  for (const entry of due) {
    try {
      new Notification(entry.value.topicTitle ? `Hòa nhập Nga · ${entry.value.topicTitle}` : "Hòa nhập Nga · việc đến hạn", {
        body: entry.value.reminderNote || "Mở RU_LIFE để xem việc đã đặt nhắc.",
        tag: entry.key,
      });
      persistNotified(entry.key, entry.value);
    } catch {
      // Dashboard still exposes overdue reminders if browser notification delivery fails.
    }
  }
}

export default function LocalReminderRuntime() {
  useEffect(() => {
    let interval = 0;
    const run = () => {
      if (document.visibilityState === "visible") checkDueReminders();
    };

    run();
    interval = window.setInterval(run, REMINDER_CHECK_MS);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("online", run);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("online", run);
    };
  }, []);

  return null;
}
