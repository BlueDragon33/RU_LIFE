import { getKnowledgeSources, getKnowledgeUnit } from "./content-intelligence/registry";
import type { KnowledgeSourceV1, KnowledgeUnitV1 } from "./content-intelligence/types";
import { dailyLifeContent } from "./daily-life-content";
import { healthContent } from "./health-content";
import { integrationContent } from "./integration-content";
import { studyProceduresContent } from "./study-procedures-content";
import { getTopicContent as getPreparationTopicContent, type TopicContent } from "./topic-content";

export function getResolvedTopicContent(moduleSlug: string, topicSlug: string): TopicContent | null {
  if (moduleSlug === "prepare") return getPreparationTopicContent(moduleSlug, topicSlug);
  if (moduleSlug === "daily-life") return dailyLifeContent[topicSlug] || null;
  if (moduleSlug === "study-procedures") return studyProceduresContent[topicSlug] || null;
  if (moduleSlug === "health") return healthContent[topicSlug] || null;
  if (moduleSlug === "integration") return integrationContent[topicSlug] || null;
  return null;
}

export function getResolvedKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null {
  return getKnowledgeUnit(moduleSlug, topicSlug);
}

export function getResolvedKnowledgeSources(unit: KnowledgeUnitV1): KnowledgeSourceV1[] {
  return getKnowledgeSources(unit);
}
