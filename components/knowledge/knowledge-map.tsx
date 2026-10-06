"use client";

import { useState } from "react";
import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function findEvidence(unit: KnowledgeUnitV1, id?: string): EvidenceText | null {
  if (!id) return null;
  const singles: Array<EvidenceText | undefined> = [
    unit.semantics.mainIdea,
    unit.semantics.purpose,
    unit.memory.memoryAnchor,
    unit.journey.nextAction,
  ];
  const buckets: EvidenceText[][] = [
    unit.semantics.rationale,
    unit.semantics.logic,
    unit.semantics.preconditions,
    unit.semantics.scope,
    unit.semantics.actions,
    unit.semantics.outcomes,
    unit.semantics.exceptions,
    unit.memory.mustRemember,
    unit.memory.keyTerms,
    unit.memory.contrasts,
    unit.memory.myths,
    unit.memory.commonMistakes,
    unit.memory.examples,
    unit.journey.triggers,
    unit.journey.checklist,
    unit.journey.timeline,
    unit.journey.requiredMaterials,
    unit.journey.completionEvidence,
    unit.journey.followUps,
    unit.risk.doNot,
    unit.risk.critical,
    unit.risk.cautions,
    unit.risk.recommended,
    unit.risk.goodToKnow,
    unit.risk.consequences,
    unit.risk.escalations,
    unit.risk.uncertaintyNotes,
  ];
  return singles.find((item) => item?.id === id) || buckets.flat().find((item) => item.id === id) || null;
}

export default function KnowledgeMap({ unit }: { unit: KnowledgeUnitV1 }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { nodes, edges } = unit.journey.map;
  if (!nodes.length) return <p className="knowledge-empty-map">Không có sơ đồ cho chủ đề này.</p>;

  const selected = selectedId ? nodes.find((node) => node.id === selectedId) || null : null;
  const evidence = selected ? findEvidence(unit, selected.evidenceId) : null;
  const connected = selected ? edges.filter((edge) => edge.from === selected.id || edge.to === selected.id) : [];

  return <div className="knowledge-map" aria-label="Sơ đồ xử lý">
    <div className="knowledge-map-nodes">
      {nodes.map((node) => <button
        type="button"
        key={node.id}
        data-kind={node.kind}
        aria-pressed={selectedId === node.id}
        onClick={() => setSelectedId(node.id)}
      >
        <small>{node.kind}</small>
        <strong>{node.label}</strong>
      </button>)}
    </div>

    {selected ? <aside className="knowledge-map-detail" aria-live="polite">
      <div>
        <span>ĐANG XEM</span>
        <h4>{selected.label}</h4>
        {evidence ? <p>{evidence.text}</p> : <p>Node định hướng trong quy trình.</p>}
      </div>
      {connected.length ? <ul>{connected.map((edge) => <li key={`${edge.from}:${edge.to}:${edge.label || ""}`}>
        {edge.from === selected.id ? "Tiếp theo" : "Liên quan từ"}: {edge.label || "liên kết"}
      </li>)}</ul> : null}
      <button type="button" onClick={() => setSelectedId(null)}>Về toàn cảnh</button>
    </aside> : <p className="knowledge-map-hint">Chọn một node để xem ý chính, sau đó có thể mở phần chi tiết bên dưới.</p>}
  </div>;
}
