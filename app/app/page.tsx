import Link from "next/link";
import { ruLifeModules, topicCount } from "@/lib/content-catalog";

export default function ProtectedAppPage() {
  return <>
    <header className="workspace-hero">
      <div><span>HÒA NHẬP NGA · KHÔNG GIAN CÁ NHÂN</span><h1>Mọi việc cần nhớ khi sống và học tập tại Nga</h1><p>Thông tin được chia theo tình huống và tiến trình sử dụng. Bộ khung này tách hoàn toàn khỏi Quản trị ứng dụng; Trung tâm chỉ quản lý quyền thiết bị.</p></div>
      <span className="session-ok">THIẾT BỊ HỢP LỆ</span>
    </header>

    <section className="workspace-overview">
      <article><span>MODULE</span><strong>{ruLifeModules.length}</strong><p>Nhóm nội dung độc lập, có thể mở rộng mà không phá cấu trúc chung.</p></article>
      <article><span>CHỦ ĐỀ KHỞI TẠO</span><strong>{topicCount()}</strong><p>Các khung chủ đề đã sẵn sàng để bổ sung nội dung có nguồn và ngày cập nhật.</p></article>
      <article><span>TIẾN ĐỘ</span><strong>CỤC BỘ</strong><p>Checklist và ghi chú cá nhân lưu trên chính thiết bị, không trộn với dữ liệu quản trị.</p></article>
    </section>

    <section className="module-section">
      <div className="section-heading"><div><span>BẢN ĐỒ NỘI DUNG</span><h2>Chọn khu vực cần xử lý</h2></div><p>Mỗi module có route riêng và các chủ đề con độc lập để sau này cập nhật từng phần mà không phải sửa toàn bộ Web App.</p></div>
      <div className="module-grid">
        {ruLifeModules.map((module) => <Link href={`/app/${module.slug}`} className="module-card" key={module.slug}>
          <header><span>{module.stage}</span><b>{module.code}</b></header>
          <h3>{module.title}</h3>
          <p>{module.description}</p>
          <footer><span>{module.topics.length} chủ đề</span><strong>Mở module →</strong></footer>
        </Link>)}
      </div>
    </section>

    <section className="workspace-next">
      <span>KIẾN TRÚC NỘI DUNG V1</span><h2>Nội dung có thể đi sâu dần mà không ảnh hưởng lớp cấp quyền</h2><p>Các module, topic, checklist và ghi chú nằm trong RU_LIFE. P-256, session, heartbeat, introspection và quyền thiết bị tiếp tục do lớp tích hợp với Quản trị ứng dụng kiểm soát độc lập.</p>
    </section>
  </>;
}
