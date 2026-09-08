import { redirect } from "next/navigation";
import DeviceHeartbeat from "@/components/device-heartbeat";
import { readDeviceSession } from "@/lib/device-session.server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppPage() {
  const session = await readDeviceSession();
  if (!session) redirect("/");

  return <main className="workspace-shell">
    <DeviceHeartbeat />
    <aside className="workspace-side">
      <div className="workspace-brand"><span>RU</span><div><small>RU_LIFE</small><strong>Hòa nhập Nga</strong></div></div>
      <nav>
        <button className="active">Tổng quan</button>
        <button disabled>Chuẩn bị sang Nga</button>
        <button disabled>Cuộc sống tại Nga</button>
        <button disabled>Học tập · thủ tục</button>
        <button disabled>Sức khỏe · thuốc</button>
      </nav>
      <div className="device-badge"><small>THIẾT BỊ ĐÃ DUYỆT</small><strong>{session.deviceCode}</strong><span>Heartbeat 60 giây · quyền do Quản trị ứng dụng cấp</span></div>
    </aside>
    <section className="workspace-main">
      <header><div><span>HÒA NHẬP NGA · KẾT NỐI QUẢN TRỊ</span><h1>Khung Web App độc lập đã hoạt động</h1><p>Thiết bị đã vượt qua xác minh khóa P-256 và token của Quản trị ứng dụng.</p></div><span className="session-ok">ĐÃ CẤP QUYỀN</span></header>
      <section className="workspace-cards">
        <article><span>01</span><strong>Thiết bị riêng</strong><p>Mã {session.deviceCode}; không dùng quyền đăng nhập của Quản trị ứng dụng làm quyền người dùng.</p></article>
        <article><span>02</span><strong>Heartbeat 60 giây</strong><p>RU_LIFE cập nhật trạng thái online mỗi phút, đồng bộ lại profile kỹ thuật và tự rời ứng dụng nếu Trung tâm thu hồi hoặc khóa quyền.</p></article>
        <article><span>03</span><strong>Runtime tách biệt</strong><p>Giao diện, PWA, cache và nội dung Hòa nhập Nga nằm trong RU_LIFE; không nằm trong Application-Management.</p></article>
      </section>
      <section className="workspace-next">
        <span>NỀN TẢNG QUẢN TRỊ ĐÃ SẴN SÀNG</span><h2>Kết nối thiết bị được duy trì trong suốt phiên sử dụng</h2><p>Phiên được gia hạn định kỳ bằng challenge + chữ ký P-256. Mất mạng tạm thời không tự đăng xuất; nhưng khi Trung tâm trả trạng thái pending hoặc blocked, RU_LIFE xóa phiên cục bộ và quay về màn hình chờ cấp quyền.</p>
      </section>
    </section>
  </main>;
}
