import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

export default function KnowledgeQuickView({ unit }: { unit: KnowledgeUnitV1 }) {
  const strongestRisk = unit.risk.doNot[0] || unit.risk.critical[0] || unit.risk.cautions[0];

  return <section className="knowledge-quick-view" aria-labelledby="knowledge-remember-heading">
    <div className="knowledge-remember">
      <span>10 GIÂY</span>
      <h2 id="knowledge-remember-heading">Ba điều phải nhớ</h2>
      <ol>{unit.memory.mustRemember.map((item) => <li key={item.id}>{item.text}</li>)}</ol>
    </div>
    {unit.journey.nextAction ? <article className="knowledge-next-action">
      <span>VIỆC NÊN LÀM NGAY</span>
      <h3>Việc nên làm ngay</h3>
      <p>{unit.journey.nextAction.text}</p>
    </article> : null}
    {strongestRisk ? <article className="knowledge-quick-risk">
      <span>ĐIỂM KHÔNG ĐƯỢC BỎ QUA</span>
      <p>{strongestRisk.text}</p>
      {strongestRisk.scope ? <small>{strongestRisk.scope}</small> : null}
    </article> : null}
  </section>;
}
