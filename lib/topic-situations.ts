export const situationOptions = [
  { id: "before-departure", label: "Trước khi đi" },
  { id: "first-days", label: "Những ngày đầu" },
  { id: "daily-life", label: "Sinh hoạt hằng ngày" },
  { id: "administration", label: "Giấy tờ · hành chính" },
  { id: "study", label: "Học tập" },
  { id: "health", label: "Sức khỏe" },
  { id: "emergency", label: "Khẩn cấp" },
  { id: "communication", label: "Giao tiếp · hòa nhập" },
] as const;

export type SituationId = (typeof situationOptions)[number]["id"];

const topicSituations: Record<string, SituationId[]> = {
  "prepare:documents": ["before-departure", "administration"],
  "prepare:luggage": ["before-departure"],
  "prepare:money-connectivity": ["before-departure", "first-days"],
  "prepare:arrival-plan": ["before-departure", "first-days"],
  "daily-life:housing": ["first-days", "daily-life"],
  "daily-life:transport": ["first-days", "daily-life"],
  "daily-life:shopping-services": ["first-days", "daily-life"],
  "daily-life:safety": ["daily-life", "emergency"],
  "study-procedures:enrollment": ["first-days", "administration", "study"],
  "study-procedures:migration-registration": ["first-days", "administration"],
  "study-procedures:study-plan": ["study"],
  "study-procedures:important-contacts": ["administration", "study"],
  "health:insurance": ["first-days", "health"],
  "health:care-navigation": ["health"],
  "health:medicine-reference": ["health"],
  "health:emergency": ["health", "emergency"],
  "integration:daily-russian": ["daily-life", "communication"],
  "integration:school-russian": ["study", "communication"],
  "integration:culture-etiquette": ["daily-life", "communication"],
  "integration:personal-notes": ["daily-life", "communication"],
};

export function getTopicSituations(moduleSlug: string, topicSlug: string): SituationId[] {
  return topicSituations[`${moduleSlug}:${topicSlug}`] || [];
}

export function situationLabel(id: SituationId) {
  return situationOptions.find((entry) => entry.id === id)?.label || id;
}
