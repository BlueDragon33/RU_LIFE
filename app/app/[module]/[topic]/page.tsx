import Link from "next/link";
import { notFound } from "next/navigation";
import TopicProgress from "@/components/topic-progress";
import { getRuLifeTopic } from "@/lib/content-catalog";

const priorityLabel = {
  essential: "Cần ưu tiên",
  recommended: "Nên chuẩn bị",
  reference: "Tra cứu",
} as const;

export default async function TopicPage({ params }: { params: Promise<{ module: string; topic: string }> }) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const found = getRuLifeTopic(moduleSlug, topicSlug);
  if (!found) notFound();
  const { module, topic } = found;

  return <>
    <header className="workspace-hero topic-hero">
      <div><div className="breadcrumbs"><Link href="/app">Tổng quan</Link><span>/</span><Link href={`/app/${module.slug}`}>{module.title}</Link></div><span>{module.stage} · {priorityLabel[topic.priority].toUpperCase()}</span><h1>{topic.title}</h1><p>{topic.summary}</p></div>
      <span className={`topic-priority-badge ${topic.priority}`}>{priorityLabel[topic.priority]}</span>
    </header>

    <div className="topic-layout">
      <section className="topic-content">
        <article className="topic-block"><span>01 · MỤC TIÊU</span><h2>Biết mình cần chuẩn bị và kiểm tra điều gì</h2><p>Trang này là khung nội dung độc lập của chủ đề <strong>{topic.title}</strong>. Nội dung sâu sẽ được bổ sung theo từng khối nhỏ, có thể cập nhật riêng mà không ảnh hưởng các module khác.</p></article>
        <article className="topic-block"><span>02 · NỘI DUNG CHÍNH</span><h2>Khung thông tin đang chờ hoàn thiện</h2><div className="content-placeholder"><b>CONTENT LAYER</b><p>Phần hướng dẫn chi tiết, tình huống thực tế, mẫu câu hoặc quy trình sẽ được đưa vào đây ở lượt phát triển nội dung tiếp theo.</p></div></article>
        <article className="topic-block"><span>03 · NGUỒN & ĐỘ MỚI</span><h2>Không đóng băng thông tin có thể thay đổi</h2><p>Với thông tin về thủ tục, cư trú, giao thông, y tế hoặc quy định, trang sẽ ghi rõ nguồn tham chiếu và lần kiểm tra gần nhất trước khi coi là thông tin đang dùng.</p><div className="source-state"><span>TRẠNG THÁI NGUỒN</span><strong>Chưa bổ sung dữ liệu chuyên sâu</strong><p>Bộ khung hiện chỉ chứa nội dung cấu trúc, không giả định các quy định hiện hành.</p></div></article>
      </section>
      <aside className="topic-side"><TopicProgress moduleSlug={module.slug} topicSlug={topic.slug} checklist={topic.checklist} /></aside>
    </div>

    <footer className="topic-footer"><Link href={`/app/${module.slug}`}>← Quay lại {module.title}</Link><span>RU_LIFE · nội dung độc lập với Quản trị ứng dụng</span></footer>
  </>;
}
