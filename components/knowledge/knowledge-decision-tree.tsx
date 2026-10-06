"use client";

import Link from "next/link";
import { useState } from "react";
import type { EvidenceText, KnowledgeDecision, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function findEvidence(unit: KnowledgeUnitV1, id: string): EvidenceText | null {
  const buckets: EvidenceText[][] = [
    unit.semantics.actions,
    unit.journey.checklist,
    unit.journey.timeline,
    unit.risk.doNot,
    unit.risk.critical,
    unit.risk.cautions,
    unit.risk.recommended,
  ];
  return buckets.flat().find((item) => item.id === id) || null;
}

function routeForUnitId(id: string) {
  const [prefix, moduleSlug, topicSlug] = id.split(":");
  return prefix === "ru-life" && moduleSlug && topicSlug ? `/app/${moduleSlug}/${topicSlug}` : null;
}

export default function KnowledgeDecisionTree({ decisions, unit }: { decisions: KnowledgeDecision[]; unit: KnowledgeUnitV1 }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  if (!decisions.length) return <p className="knowledge-empty-decision">Không có cây quyết định cho chủ đề này.</p>;

  return <section className="knowledge-decision-tree" aria-label="Cây quyết định">
    {decisions.map((decision) => {
      const choice = decision.options.find((option) => option.id === selected[decision.id]) || null;
      return <article key={decision.id}>
        <h4>{decision.question}</h4>
        <div className="knowledge-decision-options">
          {decision.options.map((option) => <button
            type="button"
            key={option.id}
            aria-pressed={choice?.id === option.id}
            onClick={() => setSelected((current) => ({ ...current, [decision.id]: option.id }))}
          >{option.label}</button>)}
        </div>
        {choice ? <div className="knowledge-decision-result" aria-live="polite">
          <p>{choice.summary}</p>
          {choice.actionIds.length ? <div><strong>Việc cần làm</strong><ul>{choice.actionIds.map((id) => {
            const item = findEvidence(unit, id);
            return item ? <li key={id}>{item.text}</li> : null;
          })}</ul></div> : null}
          {choice.warningIds.length ? <div><strong>Cần lưu ý</strong><ul>{choice.warningIds.map((id) => {
            const item = findEvidence(unit, id);
            return item ? <li key={id}>{item.text}</li> : null;
          })}</ul></div> : null}
          {choice.nextUnitIds.length ? <div className="knowledge-decision-links">{choice.nextUnitIds.map((id) => {
            const href = routeForUnitId(id);
            return href ? <Link href={href} key={id}>Mở nội dung liên quan →</Link> : null;
          })}</div> : null}
        </div> : null}
      </article>;
    })}
  </section>;
}
