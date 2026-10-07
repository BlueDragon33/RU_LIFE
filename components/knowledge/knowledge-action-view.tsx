import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";
import KnowledgeRiskPanel from "./knowledge-risk-panel";

function EvidenceList({ items }: { items: Array<{ id: string; text: string; scope?: string }> }) {
  if (!items.length) return null;
  return <ul className="knowledge-evidence-list">{items.map((item) => <li key={item.id}>
    <strong>{item.text}</strong>
    {item.scope ? <small>{item.scope}</small> : null}
  </li>)}</ul>;
}

export default function KnowledgeActionView({ unit }: { unit: KnowledgeUnitV1 }) {
  return <div className="knowledge-view knowledge-action-view">
    {unit.journey.nextAction ? <section className="knowledge-panel primary">
      <span>BƯỚC TIẾP THEO</span>
      <h2>{unit.journey.nextAction.text}</h2>
      {unit.journey.nextAction.scope ? <p>{unit.journey.nextAction.scope}</p> : null}
    </section> : null}

    <KnowledgeRiskPanel unit={unit} />

    <section className="knowledge-panel">
      <span>CHECKLIST</span>
      <h2>Làm theo từng việc</h2>
      <EvidenceList items={unit.journey.checklist} />
    </section>

    <section className="knowledge-panel">
      <span>THỜI GIAN</span>
      <h2>Mốc cần theo dõi</h2>
      <EvidenceList items={unit.journey.timeline} />
    </section>

    {unit.journey.requiredMaterials.length ? <section className="knowledge-panel">
      <span>CẦN CHUẨN BỊ</span>
      <h2>Giấy tờ và thông tin</h2>
      <EvidenceList items={unit.journey.requiredMaterials} />
    </section> : null}

    {unit.journey.completionEvidence.length ? <section className="knowledge-panel">
      <span>HOÀN TẤT KHI</span>
      <h2>Bằng chứng cần giữ</h2>
      <EvidenceList items={unit.journey.completionEvidence} />
    </section> : null}
  </div>;
}
