import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

export default function KnowledgeOutline({ unit }: { unit: KnowledgeUnitV1 }) {
  const nodes = unit.journey.map.nodes;
  const edges = unit.journey.map.edges;
  if (!nodes.length) return <div className="knowledge-outline-empty">Không có sơ đồ dạng danh sách.</div>;

  const labelById = new Map(nodes.map((node) => [node.id, node.label]));

  return <section className="knowledge-outline" aria-labelledby="knowledge-outline-title">
    <header><span>DẠNG DANH SÁCH</span><h3 id="knowledge-outline-title">Sơ đồ không cần tương tác</h3></header>
    <ol>{nodes.map((node) => <li key={node.id}>
      <strong>{node.label}</strong>
      <small>{node.kind}</small>
    </li>)}</ol>
    {edges.length ? <ul className="knowledge-outline-relations">{edges.map((edge, index) => <li key={`${edge.from}:${edge.to}:${index}`}>
      <span>{labelById.get(edge.from) || edge.from}</span>
      <b>→</b>
      <span>{labelById.get(edge.to) || edge.to}</span>
      {edge.label ? <small>{edge.label}</small> : null}
    </li>)}</ul> : null}
  </section>;
}
