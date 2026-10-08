import Link from "next/link";
import { getContentPacks } from "@/lib/content-intelligence/packs";

export default function ContentPacksPage() {
  const packs = getContentPacks();
  return <>
    <header className="workspace-hero pack-hero">
      <div>
        <Link href="/app" className="breadcrumb">← Tổng quan</Link>
        <span>LỘ TRÌNH THEO MỤC TIÊU</span>
        <h1>Bắt đầu theo hoàn cảnh của bạn</h1>
        <p>Chọn một lộ trình ngắn thay vì tìm trong toàn bộ danh mục. Mỗi gói kết nối các chủ đề gốc đã có nguồn, cảnh báo và công cụ cá nhân riêng.</p>
      </div>
    </header>
    <section className="pack-section" aria-labelledby="pack-list-title">
      <div className="section-heading">
        <div><span>CONTENT PACKS · MỞ TRUY CẬP</span><h2 id="pack-list-title">Bốn lộ trình để bắt đầu</h2></div>
        <p>Các gói là cách sắp xếp nội dung, không nhân bản kiến thức và không yêu cầu mua hàng.</p>
      </div>
      <div className="pack-grid">
        {packs.map((pack, index) => <Link key={pack.id} className="pack-card" href={`/app/packs/${pack.slug}`}>
          <div className="pack-card-top"><span>GÓI {String(index + 1).padStart(2, "0")}</span><small>{pack.unitIds.length} chủ đề</small></div>
          <h3>{pack.title}</h3>
          <strong>{pack.subtitle}</strong>
          <p>{pack.description}</p>
          <div className="pack-card-bottom"><span>Mở tự do</span><b>Xem lộ trình →</b></div>
        </Link>)}
      </div>
    </section>
    <p className="pack-trust-note">Các mốc luật, cư trú, thủ tục và dịch vụ tại Nga có thể thay đổi. Hãy mở từng chủ đề để đọc phạm vi áp dụng, ngày rà soát và nguồn chính thức trước khi thực hiện.</p>
  </>;
}
