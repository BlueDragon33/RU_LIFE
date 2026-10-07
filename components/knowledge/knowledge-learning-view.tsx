import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

function Cards({ items }: { items: EvidenceText[] }) {
  if (!items.length) return null;
  return <div className="knowledge-learning-cards">{items.map((item) => <article key={item.id}>
    <p>{item.text}</p>
    {item.scope ? <small>{item.scope}</small> : null}
  </article>)}</div>;
}

export default function KnowledgeLearningView({ unit }: { unit: KnowledgeUnitV1 }) {
  return <div className="knowledge-view knowledge-learning-view">
    <section className="knowledge-panel">
      <span>MỤC ĐÍCH & LOGIC</span>
      <h2>{unit.semantics.purpose.text}</h2>
      <Cards items={[...unit.semantics.rationale, ...unit.semantics.logic]} />
    </section>

    {unit.memory.memoryAnchor ? <section className="knowledge-panel memory-anchor">
      <span>MEMORY ANCHOR</span>
      <h2>{unit.memory.memoryAnchor.text}</h2>
    </section> : null}

    {unit.memory.contrasts.length ? <section className="knowledge-panel">
      <span>PHÂN BIỆT</span>
      <h2>Những khái niệm dễ nhầm</h2>
      <Cards items={unit.memory.contrasts} />
    </section> : null}

    {unit.memory.myths.length ? <section className="knowledge-panel">
      <span>NGHĨ VẬY NHƯNG KHÔNG PHẢI VẬY</span>
      <h2>Sửa mô hình tư duy sai</h2>
      <Cards items={unit.memory.myths} />
    </section> : null}

    {unit.memory.commonMistakes.length ? <section className="knowledge-panel">
      <span>LỖI THƯỜNG GẶP</span>
      <h2>Người mới dễ bỏ sót</h2>
      <Cards items={unit.memory.commonMistakes} />
    </section> : null}

    {unit.semantics.exceptions.length ? <section className="knowledge-panel">
      <span>NGOẠI LỆ & PHẠM VI</span>
      <h2>Không áp một quy tắc cho mọi trường hợp</h2>
      <Cards items={[...unit.semantics.scope, ...unit.semantics.exceptions]} />
    </section> : null}
  </div>;
}
