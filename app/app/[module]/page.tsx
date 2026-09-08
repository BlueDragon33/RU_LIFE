import Link from "next/link";
import { notFound } from "next/navigation";
import { getRuLifeModule } from "@/lib/content-catalog";

const priorityLabel = {
  essential: "CẦN ƯU TIÊN",
  recommended: "NÊN CHUẨN BỊ",
  reference: "TRA CỨU",
} as const;

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const module = getRuLifeModule(moduleSlug);
  if (!module) notFound();

  return <>
    <header className="workspace-hero module-hero">
      <div><Link href="/app" className="breadcrumb">← Tổng quan</Link><span>{module.stage} · MODULE {module.code}</span><h1>{module.title}</h1><p>{module.description}</p></div>
      <span className="module-count">{module.topics.length} CHỦ ĐỀ</span>
    </header>

    <section className="topic-index">
      <div className="section-heading"><div><span>CẤU TRÚC MODULE</span><h2>Chọn chủ đề</h2></div><p>Nội dung chuyên sâu sẽ được bổ sung trong từng chủ đề; route và tiến độ của từng phần đã tách độc lập.</p></div>
      <div className="topic-grid">
        {module.topics.map((topic, index) => <Link href={`/app/${module.slug}/${topic.slug}`} className="topic-card" key={topic.slug}>
          <header><b>{String(index + 1).padStart(2, "0")}</b><span className={`priority ${topic.priority}`}>{priorityLabel[topic.priority]}</span></header>
          <h3>{topic.title}</h3>
          <p>{topic.summary}</p>
          <footer><span>{topic.checklist.length} việc trong checklist</span><strong>Mở chủ đề →</strong></footer>
        </Link>)}
      </div>
    </section>

    <section className="module-principle"><span>NGUYÊN TẮC NỘI DUNG</span><h2>Thông tin thay đổi theo thời gian sẽ có nguồn và mốc cập nhật riêng</h2><p>Đặc biệt với thủ tục, cư trú, y tế và quy định tại Nga, phần nội dung chi tiết không được viết như dữ liệu cố định. Mỗi chủ đề sẽ có lớp nguồn tham chiếu và ngày kiểm tra trước khi đưa vào sử dụng.</p></section>
  </>;
}
