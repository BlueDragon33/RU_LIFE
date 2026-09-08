export const RU_LIFE_PROGRESS_PREFIX = "ru-life-progress:v1:";
export const RU_LIFE_PROGRESS_EVENT = "ru-life-progress-changed";

export type StoredTopicProgress = {
  checked: number[];
  note: string;
  updatedAt: string;
};

export function topicProgressKey(moduleSlug: string, topicSlug: string) {
  return `${RU_LIFE_PROGRESS_PREFIX}${moduleSlug}:${topicSlug}`;
}

export function parseStoredTopicProgress(raw: string | null): StoredTopicProgress {
  if (!raw) return { checked: [], note: "", updatedAt: "" };
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTopicProgress>;
    return {
      checked: Array.isArray(parsed.checked) ? parsed.checked.filter((value): value is number => Number.isInteger(value) && value >= 0) : [],
      note: typeof parsed.note === "string" ? parsed.note : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return { checked: [], note: "", updatedAt: "" };
  }
}

export function validCheckedCount(progress: StoredTopicProgress, checklistLength: number) {
  return new Set(progress.checked.filter((index) => index < checklistLength)).size;
}

export function progressPercent(progress: StoredTopicProgress, checklistLength: number) {
  if (!checklistLength) return 0;
  return Math.round((validCheckedCount(progress, checklistLength) / checklistLength) * 100);
}
