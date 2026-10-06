import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function EvidenceList({ title, items }: { title: string; items: EvidenceText[] }) {
  if (!items.length) return null;
  return <section className="knowledge-detail-section">
    <h3>{title}</h3>
    <ul>{items.map((item) => <li key={item.id}>{item.text}{item.scope ? <small>{item.scope}</small> : null}</li>)}</ul>
  </section>;
}

export default function KnowledgeActionView({ unit }: { unit: KnowledgeUnitV1 }) {
  return <div className="knowledge-mode-view knowledge-action-view">
    {unit.journey.nextAction ? <section className="knowledge-primary-action">
      <span>BƯỚC TIẾP THEO</span>
      <h2>Việc cần làm trước</h2>
      <p>{unit.journey.nextAction.text}</p>
    </section> : null}
    <EvidenceList title="Checklist" items={unit.journey.checklist} />
    <EvidenceList title="Mốc cần theo dõi" items={unit.journey.timeline} />
    <EvidenceList title="Cần chuẩn bị" items={unit.journey.requiredMaterials} />
    <EvidenceList title="Dấu hiệu đã hoàn tất" items={unit.journey.completionEvidence} />
    <EvidenceList title="Sau đó cần nhớ" items={unit.journey.followUps} />
  </div>;
}
