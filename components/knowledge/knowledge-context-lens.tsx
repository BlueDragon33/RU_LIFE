"use client";

import type { KnowledgeAccommodationLens } from "@/lib/content-intelligence/lenses";
import { getAccommodationLensRule } from "@/lib/content-intelligence/lenses";
import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

const accommodationValues: KnowledgeAccommodationLens[] = ["dormitory", "rental", "temporary"];

export default function KnowledgeContextLens({
  unit,
  accommodation,
  onAccommodationChange,
}: {
  unit: KnowledgeUnitV1;
  accommodation: KnowledgeAccommodationLens | "";
  onAccommodationChange: (value: KnowledgeAccommodationLens | "") => void;
}) {
  const rule = getAccommodationLensRule(unit.id);
  if (!rule) return null;

  const decision = unit.journey.decisions.find((item) => item.id === rule.decisionId);
  if (!decision) return null;

  const options = accommodationValues.map((value) => {
    const optionId = rule.options[value];
    const option = decision.options.find((item) => item.id === optionId);
    return option ? { value, label: option.label } : null;
  }).filter((item): item is { value: KnowledgeAccommodationLens; label: string } => Boolean(item));

  if (!options.length) return null;

  return <section className="knowledge-context-lens" aria-labelledby="knowledge-context-lens-title">
    <div>
      <span>BỐI CẢNH</span>
      <strong id="knowledge-context-lens-title">Chỗ ở hiện tại của bạn</strong>
      <small>Chọn để RU_LIFE mở sẵn nhánh phù hợp. Nội dung gốc và cảnh báo không bị thay đổi.</small>
    </div>
    <label>
      <span className="sr-only">Bối cảnh chỗ ở</span>
      <select
        value={accommodation}
        onChange={(event) => onAccommodationChange(event.target.value as KnowledgeAccommodationLens | "")}
      >
        <option value="">Tự chọn trong cây quyết định</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  </section>;
}
