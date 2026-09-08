import { redirect } from "next/navigation";
import { readDeviceSession } from "@/lib/device-session.server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppPage() {
  const session = await readDeviceSession();
  if (!session) redirect("/");

  return <main className="workspace-shell">
    <aside className="workspace-side">
      <div className="workspace-brand"><span>RU</span><div><small>RU_LIFE</small><strong>Hòa nhập Nga</strong></div></div>
      <nav>
        <button className="active">Tổng quan</button>
        <button disabled>Chuẩn bị sang Nga</button>
        <button disabled>Cuộc sống tại Nga</button>
        <button disabled>Học tập · thủ tục</button>
        <button disabled>Sức khỏe · thuốc</button>
      </nav>
      <div className="device-badge"><small>THIẾT BỊ ĐÃ DUYỆT</small><strong>{session.deviceCode}</strong><span>Phiên do Trung tâm quản trị cấp</span></div>
    </aside>
    <section className="workspace-main">
      <header><div><span>HÒA NHẬP NGA · KẾT NỐI QUẢN TRỊ</span><h1>Khung Web App độc lập đã hoạt động</h1><p>Thiết bị đã vượt qua xác minh khóa P-256 và token của Trung tâm quản trị.</p></div><span className="session-ok">ĐÃ CẤP QUYỀN</span></header>
      <section className="workspace-cards">
        <article><span>01</span><strong>Thiết bị riêng</strong><p>Mã {session.deviceCode}; không dùng quyền đăng nhập của Site Quản trị làm quyền người dùng.</p></article>
        <article><span>02</span><strong>Phiên ngắn hạn</strong><p>Phiên chỉ được tạo sau challenge + chữ ký thiết bị và tự hết hạn để việc thu hồi quyền có hiệu lực nhanh.</p></article>
        <article><span>03</span><strong>Runtime tách biệt</strong><p>Giao diện, PWA, cache và nội dung Hòa nhập Nga nằm trong RU_LIFE; không nằm trong Learning-Management.</p></article>
      </section>
      <section className="workspace-next">
        <span>GIAI ĐOẠN TIẾP THEO</span><h2>Kết nối quản trị trước, nội dung nghiệp vụ sau</h2><p>Khung này cố ý chưa nhồi các module đời sống/học tập vào trước khi đường cấp quyền hai Site được kiểm tra end-to-end trên deployment thật.</p>
      </section>
    </section>
  </main>;
}
