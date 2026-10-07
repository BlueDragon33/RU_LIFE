import enrollmentJson from "../../content/knowledge/study-procedures/enrollment.json";
import importantContactsJson from "../../content/knowledge/study-procedures/important-contacts.json";
import migrationRegistrationJson from "../../content/knowledge/study-procedures/migration-registration.json";
import studyPlanJson from "../../content/knowledge/study-procedures/study-plan.json";
import enrollmentSourcesJson from "../../content/sources/study-procedures/enrollment.sources.json";
import importantContactsSourcesJson from "../../content/sources/study-procedures/important-contacts.sources.json";
import migrationRegistrationSourcesJson from "../../content/sources/study-procedures/migration-registration.sources.json";
import studyPlanSourcesJson from "../../content/sources/study-procedures/study-plan.sources.json";
import type { KnowledgeSourceV1, KnowledgeUnitV1 } from "./types";

const enrollment = enrollmentJson as KnowledgeUnitV1;
const enrollmentSources = enrollmentSourcesJson as KnowledgeSourceV1[];
const importantContacts = importantContactsJson as KnowledgeUnitV1;
const importantContactsSources = importantContactsSourcesJson as KnowledgeSourceV1[];
const migrationRegistration = migrationRegistrationJson as KnowledgeUnitV1;
const migrationRegistrationSources = migrationRegistrationSourcesJson as KnowledgeSourceV1[];
const studyPlan = studyPlanJson as KnowledgeUnitV1;
const studyPlanSources = studyPlanSourcesJson as KnowledgeSourceV1[];

type KnowledgeRegistryEntry = {
  topicKey: string;
  unit: KnowledgeUnitV1;
  sources: KnowledgeSourceV1[];
};

function sameSource(left: KnowledgeSourceV1, right: KnowledgeSourceV1) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function createKnowledgeRegistry(entries: KnowledgeRegistryEntry[]) {
  const knowledgeByTopic = new Map<string, KnowledgeUnitV1>();
  const unitIdToTopic = new Map<string, string>();
  const sourceById = new Map<string, KnowledgeSourceV1>();

  for (const entry of entries) {
    if (knowledgeByTopic.has(entry.topicKey)) {
      throw new Error(`Duplicate KnowledgeUnitV1 topic key: ${entry.topicKey}`);
    }
    const priorTopic = unitIdToTopic.get(entry.unit.id);
    if (priorTopic) {
      throw new Error(`Duplicate KnowledgeUnitV1 id: ${entry.unit.id} (${priorTopic}, ${entry.topicKey})`);
    }

    knowledgeByTopic.set(entry.topicKey, entry.unit);
    unitIdToTopic.set(entry.unit.id, entry.topicKey);

    for (const source of entry.sources) {
      const existing = sourceById.get(source.id);
      if (existing && !sameSource(existing, source)) {
        throw new Error(`Conflicting KnowledgeSourceV1 id: ${source.id}`);
      }
      if (!existing) sourceById.set(source.id, source);
    }
  }

  return { knowledgeByTopic, sourceById };
}

const registryEntries: KnowledgeRegistryEntry[] = [
  {
    topicKey: "study-procedures:enrollment",
    unit: enrollment,
    sources: enrollmentSources,
  },
  {
    topicKey: "study-procedures:important-contacts",
    unit: importantContacts,
    sources: importantContactsSources,
  },
  {
    topicKey: "study-procedures:migration-registration",
    unit: migrationRegistration,
    sources: migrationRegistrationSources,
  },
  {
    topicKey: "study-procedures:study-plan",
    unit: studyPlan,
    sources: studyPlanSources,
  },
];

const { knowledgeByTopic, sourceById } = createKnowledgeRegistry(registryEntries);

export function getKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null {
  return knowledgeByTopic.get(`${moduleSlug}:${topicSlug}`) || null;
}

export function getKnowledgeSources(unit: KnowledgeUnitV1): KnowledgeSourceV1[] {
  return unit.provenance.sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId);
    if (!source) throw new Error(`Missing KnowledgeSourceV1 for ${sourceId}`);
    return source;
  });
}
