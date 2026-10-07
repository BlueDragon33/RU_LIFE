import type { KnowledgeViewMode } from "./types";

export type KnowledgeAccommodationLens = "dormitory" | "rental" | "temporary";
export type KnowledgeReadingLens = "simplified" | "standard" | "deep";

export type KnowledgeLensContext = {
  accommodation?: KnowledgeAccommodationLens;
  journeyStage?: string;
  reading?: KnowledgeReadingLens;
};

export type KnowledgeLensResult = {
  readonly decisionSelections: Readonly<Record<string, string>>;
  readonly emphasizedEvidenceIds: readonly string[];
  readonly initialMode?: KnowledgeViewMode;
};

export type AccommodationLensRule = {
  readonly decisionId: string;
  readonly options: Readonly<Record<KnowledgeAccommodationLens, string>>;
};

const accommodationRules: Readonly<Record<string, AccommodationLensRule>> = Object.freeze({
  "ru-life:study-procedures:migration-registration": Object.freeze({
    decisionId: "decision:accommodation",
    options: Object.freeze({
      dormitory: "option:dorm",
      rental: "option:rental",
      temporary: "option:hotel",
    }),
  }),
});

const readingModes: Readonly<Record<KnowledgeReadingLens, KnowledgeViewMode>> = Object.freeze({
  simplified: "action",
  standard: "learn",
  deep: "full",
});

export const EMPTY_LENS_RESULT: KnowledgeLensResult = Object.freeze({
  decisionSelections: Object.freeze({}),
  emphasizedEvidenceIds: Object.freeze([]),
});

export function getAccommodationLensRule(unitId: string): AccommodationLensRule | null {
  return accommodationRules[unitId] || null;
}

export function resolveKnowledgeLens(unitId: string, context: KnowledgeLensContext): KnowledgeLensResult {
  const accommodationRule = getAccommodationLensRule(unitId);
  const accommodationOption = context.accommodation && accommodationRule
    ? accommodationRule.options[context.accommodation]
    : undefined;
  const initialMode = context.reading ? readingModes[context.reading] : undefined;

  if (!accommodationOption && !initialMode) return EMPTY_LENS_RESULT;

  return Object.freeze({
    decisionSelections: accommodationOption && accommodationRule
      ? Object.freeze({ [accommodationRule.decisionId]: accommodationOption })
      : EMPTY_LENS_RESULT.decisionSelections,
    emphasizedEvidenceIds: EMPTY_LENS_RESULT.emphasizedEvidenceIds,
    ...(initialMode ? { initialMode } : {}),
  });
}
