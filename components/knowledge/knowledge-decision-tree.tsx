"use client";

import Link from "next/link";
import { useState } from "react";
import type { EvidenceText, KnowledgeDecision, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function routeForUnitId(id: string) {
  const match = /^ru-life:([^:]+):([^:]+)$/.exec(id);
  return match ? `/app/${match[1]}/${match[2]}` : null;
}

function byId(items: EvidenceText[]) {
  return new Map(items.map((item) => [item.id, item]));
}

export default function KnowledgeDecisionTree({ decisions, unit }: { decisions: KnowledgeDecision[]; unit: KnowledgeUnitV1 }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const actions = byId([
    ...unit.semantics.actions,
    ...unit.journey.checklist,
    ...unit.journey.timeline,
    ...(unit.journey.nextAction ? [unit.journey.nextAction] : []),
  ]);
  const warnings = byId([...unit.risk.doNot, ...unit.risk.critical, ...unit.risk.cautions]);

  if (!decisions.length) return <div className="knowledge-decision-empty">Không có nhánh quyết định cho chủ đề này.</div>;

  return <div className="knowledge-decisions">
    {decisions.map((decision) => {
      const selectedOption = decision.options.find((option) => option.id === selected[decision.id]);
      return <section className="knowledge-decision" key={decision.id}>
        <span>NẾU… THÌ…</span>
        <h3>{decision.question}</h3>
        <div className="knowledge-decision-options">
          {decision.options.map((option) => <button
            type="button"
            key={option.id}
            aria-pressed={selectedOption?.id === option.id}
            onClick={() => setSelected((current) => ({ ...current, [decision.id]: option.id }))}
          >{option.label}</button>)}
        </div>
        {selectedOption ? <div className="knowledge-decision-result" aria-live="polite">
          <p>{selectedOption.summary}</p>
          {selectedOption.actionIds.map((id) => actions.get(id)).filter(Boolean).map((item) => <div className="decision-action" key={item!.id}><b>Việc cần làm</b><span>{item!.text}</span></div>)}
          {selectedOption.warningIds.map((id) => warnings.get(id)).filter(Boolean).map((item) => <div className="decision-warning" key={item!.id}><b>Lưu ý</b><span>{item!.text}</span></div>)}
          {selectedOption.nextUnitIds.map((id) => {
            const href = routeForUnitId(id);
            return href ? <Link href={href} key={id}>Xem chủ đề liên quan →</Link> : null;
          })}
        </div> : null}
      </section>;
    })}
  </div>;
}
