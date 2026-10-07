import type { KnowledgeUnitV1 } from "./types";

function pushEvidenceText(target: string[], items: Array<{ text: string }>) {
  for (const item of items) {
    if (item.text?.trim()) target.push(item.text.trim());
  }
}

export function buildKnowledgeSearchTerms(unit: KnowledgeUnitV1): string[] {
  const terms: string[] = [
    unit.title,
    unit.summary,
    ...unit.searchTerms,
    unit.semantics.mainIdea.text,
  ];

  pushEvidenceText(terms, unit.semantics.actions);
  pushEvidenceText(terms, unit.journey.triggers);
  pushEvidenceText(terms, unit.journey.requiredMaterials);
  pushEvidenceText(terms, unit.risk.critical);
  pushEvidenceText(terms, unit.risk.cautions);

  for (const term of unit.language.ruTerms) {
    if (term.term.trim()) terms.push(term.term.trim());
    if (term.meaningVi.trim()) terms.push(term.meaningVi.trim());
  }

  return [...new Set(terms.filter(Boolean))];
}
