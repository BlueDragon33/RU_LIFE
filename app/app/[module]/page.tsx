import Link from "next/link";
import { notFound } from "next/navigation";
import { getRuLifeModule } from "@/lib/content-catalog";

const priorityLabel = {
  essential: "CẦN ƯU TIÊN",
  recommended: "NÊN CHUẨN BỊ",
  reference: "TRA CỨU",
} as const;

const moduleIcon: Record<string, string> = {
  prepare: "✈",
  "daily-life": "⌂",
  "study-procedures": "◆",
  health: "♥",
  integration: "文",
};

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const moduleData = getRuLifeModule(moduleSlug);
  if (!moduleData) notFound();

  return <>
    <header className="workspace-hero module-hero premium-deep-hero">
      <div><Link href="/app" className="breadcrumb">← Tổng quan</Link><span>{moduleData.stage} · MODULE {moduleData.code}</span><h1>{moduleData.title}</h1><p>{moduleData.description}</p></div>
      <div className="module-hero-panel">
        <span className="module-hero-icon" aria-hidden="true">{moduleIcon[moduleData.slug] || "RU"}</span>
        <small>MODULE {moduleData.code}</small>
        <strong>{moduleData.shortTitle}</strong>
        <p>{moduleData.topics.length} chủ đề · nội dung đã tách độc lập</p>
        <span className="module-count">{moduleData.topics.length} CHỦ ĐỀ</span>
      </div>
    </header>

    <section className="topic-index">
      <div className="section-heading"><div><span>CẤU TRÚC MODULE</span><h2>Chọn chủ đề cần xử lý</h2></div><p>Mỗi chủ đề đã có nội dung riêng, checklist, ghi chú, yêu thích và deadline. Bạn có thể đi sâu từng phần mà không ảnh hưởng các module còn lại.</p></div>
      <div className="topic-grid premium-topic-grid">
        {moduleData.topics.map((topic, index) => <Link href={`/app/${moduleData.slug}/${topic.slug}`} className="topic-card premium-topic-card" key={topic.slug}>
          <header><b>{String(index + 1).padStart(2, "0")}</b><span className={`priority ${topic.priority}`}>{priorityLabel[topic.priority]}</span></header>
          <div className="topic-card-icon" aria-hidden="true">{moduleIcon[moduleData.slug] || "•"}</div>
          <h3>{topic.title}</h3>
          <p>{topic.summary}</p>
          <footer><span>{topic.checklist.length} việc trong checklist</span><strong>Mở chủ đề →</strong></footer>
        </Link>)}
      </div>
    </section>

    <section className="module-principle premium-principle"><span>NGUYÊN TẮC NỘI DUNG</span><h2>Thông tin thay đổi theo thời gian luôn đi kèm nguồn và mốc kiểm tra</h2><p>Với thủ tục, cư trú, y tế và quy định tại Nga, RU_LIFE không coi dữ liệu biến động là cố định. Mỗi chủ đề có trạng thái độ mới, nguồn tham chiếu và mốc rà soát nội bộ riêng.</p></section>
  </>;
}
