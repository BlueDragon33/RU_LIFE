import packJson from "../../content/packs/v1.json";
import { getRuLifeTopic } from "../content-catalog";
import { getKnowledgeUnit } from "./registry";
import type { KnowledgeFreshness, KnowledgeUnitV1 } from "./types";

export type ContentPackV1 = {
  readonly schemaVersion: 1;
  readonly version: 1;
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly focus: string;
  readonly access: "open";
  readonly featuredUnitId: string;
  readonly unitIds: readonly string[];
};

export type ContentPackTopic = {
  readonly id: string;
  readonly moduleSlug: string;
  readonly topicSlug: string;
  readonly moduleTitle: string;
  readonly title: string;
  readonly summary: string;
  readonly priority: "essential" | "recommended" | "reference";
  readonly freshness: KnowledgeFreshness;
  readonly riskSeverity: KnowledgeUnitV1["risk"]["severity"];
};

const packs: readonly ContentPackV1[] = Object.freeze(
  (packJson as ContentPackV1[]).map((pack) => Object.freeze({
    ...pack,
    unitIds: Object.freeze([...pack.unitIds]),
  })),
);

export function getContentPacks(): readonly ContentPackV1[] {
  return packs;
}

export function getContentPack(slug: string): ContentPackV1 | null {
  return packs.find((pack) => pack.slug === slug) || null;
}

export function resolveContentPackTopics(pack: ContentPackV1): readonly ContentPackTopic[] {
  return pack.unitIds.map((id) => {
    const match = /^ru-life:([^:]+):([^:]+)$/.exec(id);
    if (!match) throw new Error(`Invalid content pack knowledge ID: ${id}`);
    const [, moduleSlug, topicSlug] = match;
    const unit = getKnowledgeUnit(moduleSlug, topicSlug);
    const catalog = getRuLifeTopic(moduleSlug, topicSlug);
    if (!unit || !catalog || unit.id !== id) {
      throw new Error(`Content pack references an unknown Knowledge Unit: ${id}`);
    }
    return {
      id,
      moduleSlug,
      topicSlug,
      moduleTitle: catalog.moduleData.title,
      title: unit.title,
      summary: unit.summary,
      priority: catalog.topic.priority,
      freshness: unit.provenance.freshness,
      riskSeverity: unit.risk.severity,
    };
  });
}
