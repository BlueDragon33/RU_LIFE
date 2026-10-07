import type { KnowledgeSourceV1, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";
import KnowledgeRiskPanel from "./knowledge-risk-panel";
import KnowledgeSourceList from "./knowledge-source-list";

function Group({ title, items }: { title: string; items: Array<{ id: string; text: string; scope?: string }> }) {
  if (!items.length) return null;
  return <section className="knowledge-panel">
    <h2>{title}</h2>
    <ul className="knowledge-evidence-list">{items.map((item) => <li key={item.id}>
      <strong>{item.text}</strong>
      {item.scope ? <small>{item.scope}</small> : null}
    </li>)}</ul>
  </section>;
}

export default function KnowledgeFullView({ unit, sources }: { unit: KnowledgeUnitV1; sources: KnowledgeSourceV1[] }) {
  return <div className="knowledge-view knowledge-full-view">
    <section className="knowledge-panel">
      <span>Ý CHÍNH</span>
      <h2>{unit.semantics.mainIdea.text}</h2>
      <p>{unit.semantics.purpose.text}</p>
    </section>
    <Group title="Logic và lý do" items={[...unit.semantics.rationale, ...unit.semantics.logic]} />
    <Group title="Điều kiện và phạm vi" items={[...unit.semantics.preconditions, ...unit.semantics.scope]} />
    <Group title="Việc cần làm" items={unit.semantics.actions} />
    <Group title="Ngoại lệ" items={unit.semantics.exceptions} />
    <KnowledgeRiskPanel unit={unit} />
    <Group title="Theo dõi sau đó" items={unit.journey.followUps} />
    <section className="knowledge-panel knowledge-provenance">
      <span>NGUỒN & ĐỘ MỚI</span>
      <h2>Nguồn đang hỗ trợ nội dung này</h2>
      <p>Đã kiểm tra: <strong>{unit.provenance.verifiedAt}</strong> · Freshness: <strong>{unit.provenance.freshness}</strong></p>
      <KnowledgeSourceList sources={sources} />
    </section>
  </div>;
}
