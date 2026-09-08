import Link from "next/link";
import { notFound } from "next/navigation";
import TopicProgress from "@/components/topic-progress";
import TopicTools from "@/components/topic-tools";
import TopicDeadlines from "@/components/topic-deadlines";
import { getRuLifeTopic } from "@/lib/content-catalog";
import { getResolvedTopicContent } from "@/lib/content-resolver";
import { getSourceReviewMeta } from "@/lib/source-review";

const priorityLabel = {
  essential: "Cần ưu tiên",
  recommended: "Nên chuẩn bị",
  reference: "Tra cứu",
} as const;

const freshnessLabel = {
  verified: "ĐÃ KIỂM TRA NGUỒN",
  "review-soon": "CẦN RÀ SOÁT THƯỜNG XUYÊN",
  "stable-guidance": "HƯỚNG DẪN ỔN ĐỊNH",
} as const;

export default async function TopicPage({ params }: { params: Promise<{ module: string; topic: string }> }) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const found = getRuLifeTopic(moduleSlug, topicSlug);
  if (!found) notFound();
  const { moduleData, topic } = found;
  const content = getResolvedTopicContent(moduleData.slug, topic.slug);
  const sourceReview = content ? getSourceReviewMeta(content.updatedAt, content.freshness) : null;

  return <>
    <header className="workspace-hero topic-hero">
      <div><div className="breadcrumbs"><Link href="/app">Tổng quan</Link><span>/</span><Link href={`/app/${moduleData.slug}`}>{moduleData.title}</Link></div><span>{moduleData.stage} · {priorityLabel[topic.priority].toUpperCase()}</span><h1>{topic.title}</h1><p>{topic.summary}</p></div>
      <span className={`topic-priority-badge ${topic.priority}`}>{priorityLabel[topic.priority]}</span>
    </header>

    <div className="topic-layout">
      <section className="topic-content">
        {content ? <>
          <article className="topic-block topic-intro-block">
            <div className="content-state-line"><span className={`freshness-badge ${content.freshness}`}>{freshnessLabel[content.freshness]}</span><time dateTime={content.updatedAt}>Kiểm tra: {content.updatedAt}</time></div>
            {sourceReview ? <div className={`source-review-inline ${sourceReview.state}`}><span>RÀ SOÁT NỘI BỘ</span><strong>{sourceReview.state === "overdue" ? "Nguồn đã quá mốc cần kiểm tra lại" : sourceReview.state === "due-soon" ? "Nguồn sắp tới mốc cần kiểm tra lại" : sourceReview.state === "unknown" ? "Chưa xác định được mốc rà soát" : `Rà soát lại trước ${sourceReview.reviewBy}`}</strong><p>{sourceReview.reviewBy ? `Mốc kiểm soát chất lượng: ${sourceReview.reviewBy}. ` : ""}Đây không phải ngày hết hiệu lực pháp lý; thông tin nhạy cảm theo thời gian vẫn phải kiểm tra nguồn chính thức tại thời điểm sử dụng.</p></div> : null}
            <h2>Điều cần nắm trước khi thực hiện</h2>
            <p>{content.intro}</p>
          </article>

          {content.blocks.map((block, index) => <article className={`topic-block content-block ${block.tone || "normal"}`} key={block.title}>
            <span>{String(index + 1).padStart(2, "0")} · NỘI DUNG</span>
            <h2>{block.title}</h2>
            {block.lead ? <p>{block.lead}</p> : null}
            <ul className="content-action-list">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>)}

          <article className="topic-block source-block">
            <span>NGUỒN & ĐỘ MỚI</span>
            <h2>{content.sources.length ? "Nguồn đang dùng cho chủ đề này" : "Không có quy định cố định được hard-code"}</h2>
            <p>{content.sources.length ? "Nguồn được lưu cùng ngày kiểm tra. Khi quy định thay đổi, nội dung phải được rà soát lại trước khi tiếp tục gắn trạng thái đã kiểm tra." : "Chủ đề này chủ yếu là hướng dẫn vận hành. Các giới hạn hành lý, thanh toán, viễn thông hoặc quy định cụ thể phải kiểm tra theo nhà cung cấp và thời điểm thực tế."}</p>
            {content.sources.length ? <div className="source-list">{content.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
              <span>{source.publisher}</span><strong>{source.title}</strong><p>{source.note}</p><small>Đã kiểm tra {source.checkedAt} · Mở nguồn chính thức ↗</small>
            </a>)}</div> : <div className="source-state"><span>TRẠNG THÁI NGUỒN</span><strong>Không đóng băng dữ liệu nhà cung cấp</strong><p>Hãy kiểm tra lại hãng bay, ngân hàng, nhà mạng hoặc đơn vị liên quan ngay trước khi sử dụng.</p></div>}
          </article>
        </> : <>
          <article className="topic-block"><span>01 · MỤC TIÊU</span><h2>Biết mình cần chuẩn bị và kiểm tra điều gì</h2><p>Trang này là khung nội dung độc lập của chủ đề <strong>{topic.title}</strong>. Nội dung sâu sẽ được bổ sung theo từng khối nhỏ, có thể cập nhật riêng mà không ảnh hưởng các module khác.</p></article>
          <article className="topic-block"><span>02 · NỘI DUNG CHÍNH</span><h2>Khung thông tin đang chờ hoàn thiện</h2><div className="content-placeholder"><b>CONTENT LAYER</b><p>Phần hướng dẫn chi tiết, tình huống thực tế, mẫu câu hoặc quy trình sẽ được đưa vào đây ở lượt phát triển nội dung tiếp theo.</p></div></article>
          <article className="topic-block"><span>03 · NGUỒN & ĐỘ MỚI</span><h2>Không đóng băng thông tin có thể thay đổi</h2><p>Với thông tin về thủ tục, cư trú, giao thông, y tế hoặc quy định, trang sẽ ghi rõ nguồn tham chiếu và lần kiểm tra gần nhất trước khi coi là thông tin đang dùng.</p><div className="source-state"><span>TRẠNG THÁI NGUỒN</span><strong>Chưa bổ sung dữ liệu chuyên sâu</strong><p>Bộ khung hiện chỉ chứa nội dung cấu trúc, không giả định các quy định hiện hành.</p></div></article>
        </>}
      </section>
      <aside className="topic-side">
        <TopicProgress moduleSlug={moduleData.slug} topicSlug={topic.slug} checklist={topic.checklist} />
        <TopicTools moduleSlug={moduleData.slug} topicSlug={topic.slug} title={topic.title} />
        <TopicDeadlines moduleSlug={moduleData.slug} topicSlug={topic.slug} title={topic.title} checklist={topic.checklist} />
      </aside>
    </div>

    <footer className="topic-footer"><Link href={`/app/${moduleData.slug}`}>← Quay lại {moduleData.title}</Link><span>RU_LIFE · nội dung độc lập với Quản trị ứng dụng</span></footer>
  </>;
}
