export const RU_LIFE_DEADLINE_PREFIX = "ru-life-deadlines:v1:topic:";
export const RU_LIFE_DEADLINE_EVENT = "ru-life-deadlines-changed";

export type DeadlineUrgency = "normal" | "important" | "critical";

export type StoredDeadline = {
  id: string;
  title: string;
  dueAt: string;
  urgency: DeadlineUrgency;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredTopicDeadlines = {
  items: StoredDeadline[];
  updatedAt: string;
};

export type CalendarDeadline = {
  moduleTitle: string;
  topicTitle: string;
  deadline: StoredDeadline;
};

export const EMPTY_TOPIC_DEADLINES: StoredTopicDeadlines = { items: [], updatedAt: "" };

export function topicDeadlinesKey(moduleSlug: string, topicSlug: string) {
  return `${RU_LIFE_DEADLINE_PREFIX}${moduleSlug}:${topicSlug}`;
}

function isUrgency(value: unknown): value is DeadlineUrgency {
  return value === "normal" || value === "important" || value === "critical";
}

export function parseStoredTopicDeadlines(raw: string | null): StoredTopicDeadlines {
  if (!raw) return { ...EMPTY_TOPIC_DEADLINES, items: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTopicDeadlines>;
    const items = Array.isArray(parsed.items) ? parsed.items.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const value = entry as Partial<StoredDeadline>;
      if (typeof value.id !== "string" || !value.id || typeof value.title !== "string" || !value.title.trim() || typeof value.dueAt !== "string") return [];
      if (!Number.isFinite(Date.parse(value.dueAt))) return [];
      return [{
        id: value.id,
        title: value.title.slice(0, 160),
        dueAt: value.dueAt,
        urgency: isUrgency(value.urgency) ? value.urgency : "normal" as DeadlineUrgency,
        completed: value.completed === true,
        createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
      }];
    }) : [];
    return { items, updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "" };
  } catch {
    return { ...EMPTY_TOPIC_DEADLINES, items: [] };
  }
}

export function deadlineTimestamp(deadline: StoredDeadline) {
  const timestamp = Date.parse(deadline.dueAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export type DeadlineBucket = "completed" | "overdue" | "today" | "next-7-days" | "later";

export function deadlineBucket(deadline: StoredDeadline, now = Date.now()): DeadlineBucket {
  if (deadline.completed) return "completed";
  const timestamp = deadlineTimestamp(deadline);
  if (timestamp === null) return "later";
  if (timestamp < now) return "overdue";

  const current = new Date(now);
  const endOfToday = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime() - 1;
  if (timestamp <= endOfToday) return "today";
  if (timestamp <= endOfToday + 7 * 24 * 60 * 60 * 1000) return "next-7-days";
  return "later";
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function icsTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildDeadlineCalendar(entries: CalendarDeadline[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RU_LIFE//Deadlines V1.2//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const entry of entries) {
    if (entry.deadline.completed) continue;
    const dtstart = icsTimestamp(entry.deadline.dueAt);
    if (!dtstart) continue;
    const uid = `${entry.deadline.id}@ru-life.local`;
    const summary = `${entry.deadline.urgency === "critical" ? "[KHẨN] " : entry.deadline.urgency === "important" ? "[QUAN TRỌNG] " : ""}${entry.deadline.title}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(uid)}`,
      `DTSTAMP:${icsTimestamp(new Date().toISOString())}`,
      `DTSTART:${dtstart}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(`RU_LIFE · ${entry.moduleTitle} · ${entry.topicTitle}`)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
