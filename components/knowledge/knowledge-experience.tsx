"use client";

import { useMemo, useState } from "react";
import { resolveKnowledgeLens, type KnowledgeAccommodationLens } from "@/lib/content-intelligence/lenses";
import type { KnowledgeSourceV1, KnowledgeUnitV1, KnowledgeViewMode } from "@/lib/content-intelligence/types";
import KnowledgeActionView from "./knowledge-action-view";
import KnowledgeContextLens from "./knowledge-context-lens";
import KnowledgeFullView from "./knowledge-full-view";
import KnowledgeLearningView from "./knowledge-learning-view";
import KnowledgeQuickView from "./knowledge-quick-view";

const modes: Array<{ id: KnowledgeViewMode; label: string }> = [
  { id: "action", label: "Tôi cần làm gì?" },
  { id: "learn", label: "Tôi muốn hiểu" },
  { id: "full", label: "Cho tôi xem toàn bộ" },
];

export default function KnowledgeExperience({ unit, sources }: { unit: KnowledgeUnitV1; sources: KnowledgeSourceV1[] }) {
  const [mode, setMode] = useState<KnowledgeViewMode>("action");
  const [accommodation, setAccommodation] = useState<KnowledgeAccommodationLens | "">("");
  const lens = useMemo(() => resolveKnowledgeLens(unit.id, accommodation ? { accommodation } : {}), [unit.id, accommodation]);

  return <div className="knowledge-experience">
    <KnowledgeQuickView unit={unit} />
    <KnowledgeContextLens unit={unit} accommodation={accommodation} onAccommodationChange={setAccommodation} />

    <nav className="knowledge-mode-selector" aria-label="Cách xem nội dung">
      {modes.map((item) => <button
        type="button"
        key={item.id}
        className={mode === item.id ? "active" : ""}
        aria-pressed={mode === item.id}
        onClick={() => setMode(item.id)}
      >{item.label}</button>)}
    </nav>

    {mode === "action" ? <KnowledgeActionView unit={unit} decisionSelections={lens.decisionSelections} /> : null}
    {mode === "learn" ? <KnowledgeLearningView unit={unit} /> : null}
    {mode === "full" ? <KnowledgeFullView unit={unit} sources={sources} /> : null}
  </div>;
}
