import type { EvidenceText, KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

type RiskSectionProps = {
  label: string;
  kind: string;
  items: EvidenceText[];
};

function RiskSection({ label, kind, items }: RiskSectionProps) {
  if (!items.length) return null;
  return <section className={`knowledge-risk-group ${kind}`}>
    <h3>{label}</h3>
    <ul>{items.map((item) => <li key={item.id}>
      <strong>{item.text}</strong>
      {item.scope ? <small>{item.scope}</small> : null}
    </li>)}</ul>
  </section>;
}

export default function KnowledgeRiskPanel({ unit }: { unit: KnowledgeUnitV1 }) {
  return <section className="knowledge-risk-panel" aria-label="Cảnh báo và lưu ý">
    <RiskSection label="CẤM / KHÔNG ĐƯỢC LÀM" kind="do-not" items={unit.risk.doNot} />
    <RiskSection label="RẤT QUAN TRỌNG" kind="critical" items={unit.risk.critical} />
    <RiskSection label="CẦN LƯU Ý" kind="caution" items={unit.risk.cautions} />
    <RiskSection label="NÊN LÀM" kind="recommended" items={unit.risk.recommended} />
    <RiskSection label="BIẾT THÊM" kind="good-to-know" items={unit.risk.goodToKnow} />
  </section>;
}
