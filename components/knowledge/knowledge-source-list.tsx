import type { KnowledgeSourceV1 } from "@/lib/content-intelligence/types";

const authorityLabel: Record<KnowledgeSourceV1["authority"], string> = {
  "official-legal": "Văn bản pháp lý",
  "official-government": "Nguồn chính thức",
  institutional: "Nguồn cơ quan",
  "commercial-provider": "Nhà cung cấp",
  "professional-reference": "Tài liệu chuyên môn",
  community: "Cộng đồng",
  "personal-experience": "Kinh nghiệm cá nhân",
};

export default function KnowledgeSourceList({ sources }: { sources: KnowledgeSourceV1[] }) {
  return <section className="knowledge-source-list" aria-labelledby="knowledge-source-heading">
    <div className="knowledge-section-heading">
      <span>NGUỒN & ĐỘ MỚI</span>
      <h3 id="knowledge-source-heading">Nguồn đang hỗ trợ nội dung này</h3>
    </div>
    <div className="knowledge-source-grid">
      {sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
        <span>{authorityLabel[source.authority]} · {source.publisher}</span>
        <strong>{source.title}</strong>
        <p>{source.note}</p>
        <small>Kiểm tra: <time dateTime={source.checkedAt}>{source.checkedAt}</time> · {source.authority}</small>
      </a>)}
    </div>
  </section>;
}
