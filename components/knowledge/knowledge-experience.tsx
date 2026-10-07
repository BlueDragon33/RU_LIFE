"use client";

import { useState } from "react";
import type { KnowledgeSourceV1, KnowledgeUnitV1, KnowledgeViewMode } from "@/lib/content-intelligence/types";
import KnowledgeActionView from "./knowledge-action-view";
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

  return <div className="knowledge-experience">
    <KnowledgeQuickView unit={unit} />

    <nav className="knowledge-mode-selector" aria-label="Cách xem nội dung">
      {modes.map((item) => <button
        type="button"
        key={item.id}
        className={mode === item.id ? "active" : ""}
        aria-pressed={mode === item.id}
        onClick={() => setMode(item.id)}
      >{item.label}</button>)}
    </nav>

    {mode === "action" ? <KnowledgeActionView unit={unit} /> : null}
    {mode === "learn" ? <KnowledgeLearningView unit={unit} /> : null}
    {mode === "full" ? <KnowledgeFullView unit={unit} sources={sources} /> : null}
  </div>;
}
