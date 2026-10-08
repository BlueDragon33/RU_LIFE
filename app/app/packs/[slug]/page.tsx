import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentPack, resolveContentPackTopics } from "@/lib/content-intelligence/packs";

const priorityLabels = {
  essential: "Ưu tiên",
  recommended: "Khuyến nghị",
  reference: "Tra cứu",
} as const;

const freshnessLabels = {
  volatile: "Cần xác minh lại",
  "review-soon": "Cần rà soát nguồn",
  verified: "Đã kiểm tra nguồn",
  "stable-guidance": "Hướng dẫn nền tảng",
} as const;

export default async function ContentPackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = getContentPack(slug);
  if (!pack) notFound();
  const topics = resolveContentPackTopics(pack);
  return <>
    <header className="workspace-hero pack-hero">
      <div>
        <Link href="/app/packs" className="breadcrumb">← Các lộ trình</Link>
        <span>LỘ TRÌNH ĐƯỢC BIÊN SOẠN · MỞ TỰ DO</span>
        <h1>{pack.title}</h1>
        <p>{pack.description}</p>
      </div>
    </header>
    <section className="pack-section" aria-labelledby="pack-detail-title">
      <div className="pack-focus">
        <div><span>MỤC TIÊU</span><h2 id="pack-detail-title">{pack.subtitle}</h2><p>{pack.focus}</p></div>
        <span>{topics.length} chủ đề theo thứ tự gợi ý</span>
      </div>
      <ol className="pack-topic-list">
        {topics.map((topic, index) => <li key={topic.id}>
          <Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`} className="pack-topic-link">
            <span className="pack-step">{String(index + 1).padStart(2, "0")}</span>
            <div className="pack-topic-copy">
              <small>{topic.moduleTitle} · {priorityLabels[topic.priority]}</small>
              <h3>{topic.title}</h3>
              <p>{topic.summary}</p>
              <span>{freshnessLabels[topic.freshness]}{topic.riskSeverity === "high" || topic.riskSeverity === "critical" ? " · Nội dung nhạy cảm, xem cảnh báo" : ""}</span>
            </div>
            <b aria-hidden="true">→</b>
          </Link>
        </li>)}
      </ol>
    </section>
    <p className="pack-trust-note">Thứ tự ở đây là gợi ý học và tra cứu, không phải mốc thời hạn pháp lý. Mọi cảnh báo, nguồn và tình huống ngoại lệ nằm trong từng chủ đề gốc; bạn luôn có thể trở về danh mục 20 chủ đề.</p>
    <Link href="/app" className="pack-back-link">← Về tổng quan</Link>
  </>;
}
