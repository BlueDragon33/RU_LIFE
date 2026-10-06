import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function LearningList({ title, items }: { title: string; items: EvidenceText[] }) {
  if (!items.length) return null;
  return <section className="knowledge-detail-section">
    <h3>{title}</h3>
    <ul>{items.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
  </section>;
}

export default function KnowledgeLearningView({ unit }: { unit: KnowledgeUnitV1 }) {
  return <div className="knowledge-mode-view knowledge-learning-view">
    <section className="knowledge-purpose">
      <span>MỤC ĐÍCH & LOGIC</span>
      <h2>{unit.semantics.mainIdea.text}</h2>
      <p>{unit.semantics.purpose.text}</p>
    </section>
    {unit.memory.memoryAnchor ? <section className="knowledge-memory-anchor">
      <span>MEMORY ANCHOR</span>
      <strong>{unit.memory.memoryAnchor.text}</strong>
    </section> : null}
    <LearningList title="Vì sao cần làm như vậy?" items={unit.semantics.rationale} />
    <LearningList title="Logic xử lý" items={unit.semantics.logic} />
    <LearningList title="Khái niệm dễ nhầm" items={unit.memory.contrasts} />
    <LearningList title="Hiểu lầm thường gặp" items={unit.memory.myths} />
    <LearningList title="Lỗi thường gặp" items={unit.memory.commonMistakes} />
    <LearningList title="Ví dụ thực tế" items={unit.memory.examples} />
    <LearningList title="Ngoại lệ cần biết" items={unit.semantics.exceptions} />
    {unit.memory.keyTerms.length ? <section className="knowledge-detail-section">
      <h3>Từ khóa cần nhận ra</h3>
      <ul>{unit.memory.keyTerms.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
    </section> : null}
    {unit.memory.recallPrompts.length ? <section className="knowledge-recall">
      <h3>Tự kiểm tra nhanh</h3>
      <ol>{unit.memory.recallPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol>
    </section> : null}
  </div>;
}
