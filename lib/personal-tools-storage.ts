export const RU_LIFE_TOOLS_PREFIX = "ru-life-tools:v1:topic:";
export const RU_LIFE_TOOLS_EVENT = "ru-life-tools-changed";

export type StoredTopicTools = {
  favorite: boolean;
  reminderAt: string;
  reminderNote: string;
  notifiedAt: string;
  updatedAt: string;
  topicTitle: string;
};

export const EMPTY_TOPIC_TOOLS: StoredTopicTools = {
  favorite: false,
  reminderAt: "",
  reminderNote: "",
  notifiedAt: "",
  updatedAt: "",
  topicTitle: "",
};

export function topicToolsKey(moduleSlug: string, topicSlug: string) {
  return `${RU_LIFE_TOOLS_PREFIX}${moduleSlug}:${topicSlug}`;
}

export function parseStoredTopicTools(raw: string | null): StoredTopicTools {
  if (!raw) return { ...EMPTY_TOPIC_TOOLS };
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTopicTools>;
    return {
      favorite: parsed.favorite === true,
      reminderAt: typeof parsed.reminderAt === "string" ? parsed.reminderAt : "",
      reminderNote: typeof parsed.reminderNote === "string" ? parsed.reminderNote : "",
      notifiedAt: typeof parsed.notifiedAt === "string" ? parsed.notifiedAt : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      topicTitle: typeof parsed.topicTitle === "string" ? parsed.topicTitle : "",
    };
  } catch {
    return { ...EMPTY_TOPIC_TOOLS };
  }
}

export function reminderTimestamp(value: StoredTopicTools) {
  if (!value.reminderAt) return null;
  const timestamp = Date.parse(value.reminderAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function reminderIsDue(value: StoredTopicTools, now = Date.now()) {
  const timestamp = reminderTimestamp(value);
  return timestamp !== null && timestamp <= now;
}
