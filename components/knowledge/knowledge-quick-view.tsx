import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

export default function KnowledgeQuickView({ unit }: { unit: KnowledgeUnitV1 }) {
  return <section className="knowledge-quick" aria-labelledby="knowledge-quick-title">
    <header>
      <span>10 GIÂY</span>
      <h2 id="knowledge-quick-title">Ba điều phải nhớ</h2>
    </header>
    <div className="knowledge-memory-grid">
      {unit.memory.mustRemember.map((item, index) => <article key={item.id}>
        <b>{String(index + 1).padStart(2, "0")}</b>
        <p>{item.text}</p>
        {item.scope ? <small>{item.scope}</small> : null}
      </article>)}
    </div>
    {unit.journey.nextAction ? <div className="knowledge-next-action">
      <span>VIỆC NÊN LÀM NGAY</span>
      <strong>{unit.journey.nextAction.text}</strong>
      {unit.journey.nextAction.scope ? <small>{unit.journey.nextAction.scope}</small> : null}
    </div> : null}
  </section>;
}
