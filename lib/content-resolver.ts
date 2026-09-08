import { dailyLifeContent } from "./daily-life-content";
import { healthContent } from "./health-content";
import { studyProceduresContent } from "./study-procedures-content";
import { getTopicContent as getPreparationTopicContent, type TopicContent } from "./topic-content";

export function getResolvedTopicContent(moduleSlug: string, topicSlug: string): TopicContent | null {
  if (moduleSlug === "prepare") return getPreparationTopicContent(moduleSlug, topicSlug);
  if (moduleSlug === "daily-life") return dailyLifeContent[topicSlug] || null;
  if (moduleSlug === "study-procedures") return studyProceduresContent[topicSlug] || null;
  if (moduleSlug === "health") return healthContent[topicSlug] || null;
  return null;
}
