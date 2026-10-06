import migrationRegistrationJson from "../../content/knowledge/study-procedures/migration-registration.json";
import migrationRegistrationSourcesJson from "../../content/sources/study-procedures/migration-registration.sources.json";
import type { KnowledgeSourceV1, KnowledgeUnitV1 } from "./types";

const migrationRegistration = migrationRegistrationJson as KnowledgeUnitV1;
const migrationRegistrationSources = migrationRegistrationSourcesJson as KnowledgeSourceV1[];

const knowledgeMap = new Map<string, KnowledgeUnitV1>([
  [`${migrationRegistration.moduleSlug}:${migrationRegistration.topicSlug}`, migrationRegistration],
]);

export const sourceMap = new Map<string, KnowledgeSourceV1>(
  migrationRegistrationSources.map((source) => [source.id, source]),
);

export function getKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null {
  return knowledgeMap.get(`${moduleSlug}:${topicSlug}`) || null;
}

export function getKnowledgeSources(unit: KnowledgeUnitV1): KnowledgeSourceV1[] {
  return unit.provenance.sourceIds.map((sourceId) => {
    const source = sourceMap.get(sourceId);
    if (!source) {
      throw new Error(`Missing content-intelligence source: ${sourceId}`);
    }
    return source;
  });
}
