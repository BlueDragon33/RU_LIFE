export type ContentFreshness = "verified" | "review-soon" | "stable-guidance";
export type SourceReviewState = "current" | "due-soon" | "overdue" | "unknown";

export const SOURCE_REVIEW_WINDOW_DAYS: Record<ContentFreshness, number> = {
  "review-soon": 30,
  verified: 90,
  "stable-guidance": 365,
};

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function dateOnly(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function getSourceReviewMeta(updatedAt: string, freshness: ContentFreshness, now = Date.now()) {
  const checkedAt = parseDateOnly(updatedAt);
  if (checkedAt === null) return { state: "unknown" as SourceReviewState, reviewBy: "", daysRemaining: null as number | null };

  const reviewByTimestamp = checkedAt + SOURCE_REVIEW_WINDOW_DAYS[freshness] * 24 * 60 * 60 * 1000;
  const today = Date.parse(`${new Date(now).toISOString().slice(0, 10)}T00:00:00Z`);
  const remainingMs = reviewByTimestamp - today;
  const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const state: SourceReviewState = daysRemaining < 0 ? "overdue" : daysRemaining <= 7 ? "due-soon" : "current";

  return {
    state,
    reviewBy: dateOnly(reviewByTimestamp),
    daysRemaining,
  };
}
