import housingJson from "../../content/knowledge/daily-life/housing.json";
import shoppingServicesJson from "../../content/knowledge/daily-life/shopping-services.json";
import transportJson from "../../content/knowledge/daily-life/transport.json";
import housingSourcesJson from "../../content/sources/daily-life/housing.sources.json";
import shoppingServicesSourcesJson from "../../content/sources/daily-life/shopping-services.sources.json";
import transportSourcesJson from "../../content/sources/daily-life/transport.sources.json";
import arrivalPlanJson from "../../content/knowledge/prepare/arrival-plan.json";
import documentsJson from "../../content/knowledge/prepare/documents.json";
import luggageJson from "../../content/knowledge/prepare/luggage.json";
import moneyConnectivityJson from "../../content/knowledge/prepare/money-connectivity.json";
import arrivalPlanSourcesJson from "../../content/sources/prepare/arrival-plan.sources.json";
import documentsSourcesJson from "../../content/sources/prepare/documents.sources.json";
import luggageSourcesJson from "../../content/sources/prepare/luggage.sources.json";
import moneyConnectivitySourcesJson from "../../content/sources/prepare/money-connectivity.sources.json";
import safetyJson from "../../content/knowledge/daily-life/safety.json";
import careNavigationJson from "../../content/knowledge/health/care-navigation.json";
import emergencyJson from "../../content/knowledge/health/emergency.json";
import insuranceJson from "../../content/knowledge/health/insurance.json";
import medicineReferenceJson from "../../content/knowledge/health/medicine-reference.json";
import safetySourcesJson from "../../content/sources/daily-life/safety.sources.json";
import careNavigationSourcesJson from "../../content/sources/health/care-navigation.sources.json";
import emergencySourcesJson from "../../content/sources/health/emergency.sources.json";
import insuranceSourcesJson from "../../content/sources/health/insurance.sources.json";
import medicineReferenceSourcesJson from "../../content/sources/health/medicine-reference.sources.json";
import enrollmentJson from "../../content/knowledge/study-procedures/enrollment.json";
import importantContactsJson from "../../content/knowledge/study-procedures/important-contacts.json";
import migrationRegistrationJson from "../../content/knowledge/study-procedures/migration-registration.json";
import studyPlanJson from "../../content/knowledge/study-procedures/study-plan.json";
import enrollmentSourcesJson from "../../content/sources/study-procedures/enrollment.sources.json";
import importantContactsSourcesJson from "../../content/sources/study-procedures/important-contacts.sources.json";
import migrationRegistrationSourcesJson from "../../content/sources/study-procedures/migration-registration.sources.json";
import studyPlanSourcesJson from "../../content/sources/study-procedures/study-plan.sources.json";
import type { KnowledgeSourceV1, KnowledgeUnitV1 } from "./types";

const arrivalPlan = arrivalPlanJson as KnowledgeUnitV1;
const arrivalPlanSources = arrivalPlanSourcesJson as KnowledgeSourceV1[];
const documents = documentsJson as KnowledgeUnitV1;
const documentsSources = documentsSourcesJson as KnowledgeSourceV1[];
const luggage = luggageJson as KnowledgeUnitV1;
const luggageSources = luggageSourcesJson as KnowledgeSourceV1[];
const moneyConnectivity = moneyConnectivityJson as KnowledgeUnitV1;
const moneyConnectivitySources = moneyConnectivitySourcesJson as KnowledgeSourceV1[];
const housing = housingJson as KnowledgeUnitV1;
const housingSources = housingSourcesJson as KnowledgeSourceV1[];
const shoppingServices = shoppingServicesJson as KnowledgeUnitV1;
const shoppingServicesSources = shoppingServicesSourcesJson as KnowledgeSourceV1[];
const transport = transportJson as KnowledgeUnitV1;
const transportSources = transportSourcesJson as KnowledgeSourceV1[];
const safety = safetyJson as KnowledgeUnitV1;
const safetySources = safetySourcesJson as KnowledgeSourceV1[];
const careNavigation = careNavigationJson as KnowledgeUnitV1;
const careNavigationSources = careNavigationSourcesJson as KnowledgeSourceV1[];
const emergency = emergencyJson as KnowledgeUnitV1;
const emergencySources = emergencySourcesJson as KnowledgeSourceV1[];
const insurance = insuranceJson as KnowledgeUnitV1;
const insuranceSources = insuranceSourcesJson as KnowledgeSourceV1[];
const medicineReference = medicineReferenceJson as KnowledgeUnitV1;
const medicineReferenceSources = medicineReferenceSourcesJson as KnowledgeSourceV1[];
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
    topicKey: "prepare:arrival-plan",
    unit: arrivalPlan,
    sources: arrivalPlanSources,
  },
  {
    topicKey: "prepare:documents",
    unit: documents,
    sources: documentsSources,
  },
  {
    topicKey: "prepare:luggage",
    unit: luggage,
    sources: luggageSources,
  },
  {
    topicKey: "prepare:money-connectivity",
    unit: moneyConnectivity,
    sources: moneyConnectivitySources,
  },
  {
    topicKey: "daily-life:housing",
    unit: housing,
    sources: housingSources,
  },
  {
    topicKey: "daily-life:shopping-services",
    unit: shoppingServices,
    sources: shoppingServicesSources,
  },
  {
    topicKey: "daily-life:transport",
    unit: transport,
    sources: transportSources,
  },
  {
    topicKey: "daily-life:safety",
    unit: safety,
    sources: safetySources,
  },
  {
    topicKey: "health:care-navigation",
    unit: careNavigation,
    sources: careNavigationSources,
  },
  {
    topicKey: "health:emergency",
    unit: emergency,
    sources: emergencySources,
  },
  {
    topicKey: "health:insurance",
    unit: insurance,
    sources: insuranceSources,
  },
  {
    topicKey: "health:medicine-reference",
    unit: medicineReference,
    sources: medicineReferenceSources,
  },
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
