"use client";

import { useMemo, useState } from "react";
import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function evidenceIndex(unit: KnowledgeUnitV1) {
  const values: Array<EvidenceText | undefined> = [
    unit.semantics.mainIdea,
    unit.semantics.purpose,
    ...unit.semantics.rationale,
    ...unit.semantics.logic,
    ...unit.semantics.preconditions,
    ...unit.semantics.scope,
    ...unit.semantics.actions,
    ...unit.semantics.outcomes,
    ...unit.semantics.exceptions,
    ...unit.memory.mustRemember,
    unit.memory.memoryAnchor,
    ...unit.memory.keyTerms,
    ...unit.memory.contrasts,
    ...unit.memory.myths,
    ...unit.memory.commonMistakes,
    ...unit.memory.examples,
    ...unit.journey.triggers,
    unit.journey.nextAction,
    ...unit.journey.checklist,
    ...unit.journey.timeline,
    ...unit.journey.requiredMaterials,
    ...unit.journey.completionEvidence,
    ...unit.journey.followUps,
    ...unit.risk.doNot,
    ...unit.risk.critical,
    ...unit.risk.cautions,
    ...unit.risk.recommended,
    ...unit.risk.goodToKnow,
    ...unit.risk.consequences,
    ...unit.risk.escalations,
    ...unit.risk.uncertaintyNotes,
  ];
  return new Map(values.filter(Boolean).map((item) => [item!.id, item!]));
}

export default function KnowledgeMap({ unit }: { unit: KnowledgeUnitV1 }) {
  const nodes = unit.journey.map.nodes;
  const [selectedId, setSelectedId] = useState(nodes[0]?.id || "");
  const evidence = useMemo(() => evidenceIndex(unit), [unit]);
  const selected = nodes.find((node) => node.id === selectedId) || null;
  const detail = selected?.evidenceId ? evidence.get(selected.evidenceId) : null;

  if (!nodes.length) return <div className="knowledge-map-empty">Không có sơ đồ cho chủ đề này.</div>;

  return <section className="knowledge-map" aria-labelledby="knowledge-map-title">
    <header><span>SƠ ĐỒ</span><h3 id="knowledge-map-title">Đi theo mạch xử lý</h3></header>
    <div className="knowledge-map-nodes">
      {nodes.map((node) => <button
        type="button"
        key={node.id}
        aria-pressed={selectedId === node.id}
        className={selectedId === node.id ? "active" : ""}
        onClick={() => setSelectedId(node.id)}
      >
        <small>{node.kind}</small>
        <strong>{node.label}</strong>
      </button>)}
    </div>
    {selected ? <div className="knowledge-map-detail" aria-live="polite">
      <span>ĐANG XEM</span>
      <strong>{selected.label}</strong>
      {detail ? <p>{detail.text}</p> : <p>Chọn các nút liên quan để xem mạch tổng thể của chủ đề.</p>}
      {detail?.scope ? <small>{detail.scope}</small> : null}
      <button type="button" onClick={() => setSelectedId(nodes[0]?.id || "")}>Về điểm bắt đầu</button>
    </div> : null}
  </section>;
}
