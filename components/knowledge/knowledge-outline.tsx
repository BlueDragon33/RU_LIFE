import type { KnowledgeUnitV1 } from "@/lib/content-intelligence/types";

export default function KnowledgeOutline({ unit }: { unit: KnowledgeUnitV1 }) {
  const nodes = unit.journey.map.nodes;
  const edges = unit.journey.map.edges;
  if (!nodes.length) return <p>Không có sơ đồ cho chủ đề này.</p>;

  const names = new Map(nodes.map((node) => [node.id, node.label]));
  return <section className="knowledge-outline" aria-labelledby="knowledge-outline-heading">
    <h4 id="knowledge-outline-heading">Dạng danh sách</h4>
    <ol>
      {nodes.map((node) => {
        const outgoing = edges.filter((edge) => edge.from === node.id);
        return <li key={node.id}>
          <strong>{node.label}</strong>
          {outgoing.length ? <ul>{outgoing.map((edge) => <li key={`${edge.from}:${edge.to}:${edge.label || ""}`}>
            {edge.label ? `${edge.label} → ` : "→ "}{names.get(edge.to) || edge.to}
          </li>)}</ul> : null}
        </li>;
      })}
    </ol>
  </section>;
}
