import type { KnowledgeSourceV1 } from "@/lib/content-intelligence/types";

const authorityLabel: Record<KnowledgeSourceV1["authority"], string> = {
  "official-legal": "Nguồn pháp lý chính thức",
  "official-government": "Cơ quan nhà nước",
  institutional: "Nguồn tổ chức",
  "commercial-provider": "Nhà cung cấp",
  "professional-reference": "Cơ sở dữ liệu / tham chiếu chuyên môn",
  community: "Cộng đồng",
  "personal-experience": "Kinh nghiệm cá nhân",
};

export default function KnowledgeSourceList({ sources }: { sources: KnowledgeSourceV1[] }) {
  return <div className="knowledge-source-list">
    {sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
      <span>{authorityLabel[source.authority]} · {source.publisher}</span>
      <strong>{source.title}</strong>
      <p>{source.note}</p>
      <small>Kiểm tra {source.checkedAt} · Mở nguồn ↗</small>
    </a>)}
  </div>;
}
