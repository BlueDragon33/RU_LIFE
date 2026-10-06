import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

type RiskBucket = {
  key: string;
  label: string;
  icon: string;
  items: EvidenceText[];
};

export default function KnowledgeRiskPanel({ unit }: { unit: KnowledgeUnitV1 }) {
  const buckets: RiskBucket[] = [
    { key: "do-not", label: "CẤM / KHÔNG ĐƯỢC LÀM", icon: "🔴", items: unit.risk.doNot },
    { key: "critical", label: "RẤT QUAN TRỌNG", icon: "🟠", items: unit.risk.critical },
    { key: "caution", label: "CẦN LƯU Ý", icon: "🟡", items: unit.risk.cautions },
    { key: "recommended", label: "NÊN LÀM", icon: "🟢", items: unit.risk.recommended },
    { key: "good-to-know", label: "BIẾT THÊM", icon: "🔵", items: unit.risk.goodToKnow },
  ];

  return <section className="knowledge-risk-panel" aria-label="Mức độ quan trọng và cảnh báo">
    {buckets.filter((bucket) => bucket.items.length).map((bucket) => <article className={`knowledge-risk knowledge-risk-${bucket.key}`} key={bucket.key}>
      <h3><span aria-hidden="true">{bucket.icon}</span> {bucket.label}</h3>
      <ul>{bucket.items.map((item) => <li key={item.id}>
        <p>{item.text}</p>
        {item.scope ? <small>{item.scope}</small> : null}
      </li>)}</ul>
    </article>)}
  </section>;
}
