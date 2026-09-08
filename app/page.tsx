import { redirect } from "next/navigation";
import DeviceAccessGate from "@/components/device-access-gate";
import { readDeviceSession } from "@/lib/device-session.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await readDeviceSession();
  if (session) redirect("/app");

  return <main className="landing-shell">
    <header className="landing-head">
      <div className="brand-mark">RU</div>
      <div><span>WEB APP ĐỘC LẬP</span><h1>Hòa nhập Nga</h1></div>
    </header>

    <section className="landing-grid">
      <div className="landing-copy">
        <span className="eyebrow">RU_LIFE · DEVICE ACCESS</span>
        <h2>Vào đúng thiết bị đã được Trung tâm quản trị cấp quyền.</h2>
        <p>Site Hòa nhập Nga hoạt động độc lập với Site Quản trị. Lần đầu mở trên thiết bị mới, hệ thống tự tạo mã HN và gửi yêu cầu cấp quyền; không cần và không có màn hình đăng nhập riêng tại đây.</p>
        <div className="architecture-strip">
          <span>01 · Đăng ký thiết bị</span><i>→</i><span>02 · Trung tâm duyệt</span><i>→</i><span>03 · Xác minh khóa</span><i>→</i><span>04 · Phiên RU_LIFE</span>
        </div>
      </div>
      <DeviceAccessGate />
    </section>

    <footer className="landing-footer"><span>RU_LIFE</span><p>Runtime, PWA và phiên người dùng nằm tại repo riêng này. Site Quản trị chỉ điều khiển quyền từ xa.</p></footer>
  </main>;
}
