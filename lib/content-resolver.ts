import { dailyLifeContent } from "./daily-life-content";
import { getTopicContent as getPreparationTopicContent, type TopicContent } from "./topic-content";

export function getResolvedTopicContent(moduleSlug: string, topicSlug: string): TopicContent | null {
  if (moduleSlug === "prepare") return getPreparationTopicContent(moduleSlug, topicSlug);
  if (moduleSlug === "daily-life") return dailyLifeContent[topicSlug] || null;
  return null;
}
