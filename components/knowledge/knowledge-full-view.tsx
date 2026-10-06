import type { EvidenceText, KnowledgeSourceV1, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";
import KnowledgeActionView from "./knowledge-action-view";
import KnowledgeRiskPanel from "./knowledge-risk-panel";
import KnowledgeSourceList from "./knowledge-source-list";

function FullList({ title, items }: { title: string; items: EvidenceText[] }) {
  if (!items.length) return null;
  return <section className="knowledge-detail-section">
    <h3>{title}</h3>
    <ul>{items.map((item) => <li key={item.id}>{item.text}{item.scope ? <small>{item.scope}</small> : null}</li>)}</ul>
  </section>;
}

export default function KnowledgeFullView({ unit, sources }: { unit: KnowledgeUnitV1; sources: KnowledgeSourceV1[] }) {
  return <div className="knowledge-mode-view knowledge-full-view">
    <section className="knowledge-full-intro">
      <span>TOÀN CẢNH</span>
      <h2>Toàn bộ nội dung</h2>
      <p>{unit.semantics.mainIdea.text}</p>
      <p>{unit.semantics.purpose.text}</p>
    </section>
    <FullList title="Phạm vi áp dụng" items={unit.semantics.scope} />
    <FullList title="Điều kiện trước khi thực hiện" items={unit.semantics.preconditions} />
    <FullList title="Lý do và logic" items={[...unit.semantics.rationale, ...unit.semantics.logic]} />
    <FullList title="Hành động" items={unit.semantics.actions} />
    <FullList title="Kết quả cần đạt" items={unit.semantics.outcomes} />
    <FullList title="Ngoại lệ" items={unit.semantics.exceptions} />
    <KnowledgeActionView unit={unit} />
    <KnowledgeRiskPanel unit={unit} />
    <FullList title="Hậu quả nếu bỏ qua" items={unit.risk.consequences} />
    <FullList title="Khi nào cần hỏi cơ quan/đơn vị phụ trách" items={unit.risk.escalations} />
    <FullList title="Điểm còn phụ thuộc tình huống" items={unit.risk.uncertaintyNotes} />
    <KnowledgeSourceList sources={sources} />
  </div>;
}
