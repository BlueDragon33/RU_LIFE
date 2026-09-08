import { redirect } from "next/navigation";
import DeviceAccessGate from "@/components/device-access-gate";
import { readDeviceSession } from "@/lib/device-session.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await readDeviceSession();
  if (session) redirect("/app");

  return <main className="landing-shell premium-landing">
    <header className="landing-head premium-landing-head">
      <div className="brand-mark premium-brand-mark">RU</div>
      <div><span>RU_LIFE · WEB APP ĐỘC LẬP</span><h1>Hòa nhập Nga</h1></div>
      <div className="landing-head-status"><i />Truy cập theo thiết bị được duyệt</div>
    </header>

    <section className="landing-grid premium-landing-grid">
      <div className="landing-copy premium-landing-copy">
        <span className="eyebrow">HÀNH TRÌNH SỐNG · HỌC TẬP · HÒA NHẬP TẠI NGA</span>
        <h2>Một không gian riêng để chuẩn bị đúng, sống chủ động và hòa nhập tốt hơn.</h2>
        <p>RU_LIFE hoạt động độc lập với Site Quản trị. Thiết bị mới tự tạo danh tính bảo mật và gửi yêu cầu cấp quyền; người dùng không cần và không có màn hình đăng nhập trực tiếp trên Hòa nhập Nga.</p>

        <div className="landing-value-grid" aria-label="Các khu vực chính của Hòa nhập Nga">
          <article><span>01</span><strong>Chuẩn bị sang Nga</strong><p>Hồ sơ, hành lý, tài chính và ngày đầu.</p></article>
          <article><span>02</span><strong>Cuộc sống tại Nga</strong><p>Nhà ở, đi lại, dịch vụ và an toàn.</p></article>
          <article><span>03</span><strong>Học tập · thủ tục</strong><p>Nhập học, cư trú và đầu mối cần nhớ.</p></article>
          <article><span>04</span><strong>Sức khỏe · y tế</strong><p>Bảo hiểm, khám chữa bệnh và cấp cứu.</p></article>
          <article><span>05</span><strong>Ngôn ngữ · hòa nhập</strong><p>Tiếng Nga thực tế và ứng xử hằng ngày.</p></article>
        </div>

        <div className="architecture-strip premium-access-flow">
          <span>01 · Nhận diện thiết bị</span><i>→</i><span>02 · Trung tâm duyệt</span><i>→</i><span>03 · Xác minh khóa</span><i>→</i><span>04 · Vào RU_LIFE</span>
        </div>
      </div>

      <div className="landing-gate-column">
        <div className="landing-welcome-card">
          <small>ДОБРО ПОЖАЛОВАТЬ</small>
          <strong>Chào mừng đến với RU_LIFE</strong>
          <p>Quyền truy cập được cấp từ xa theo từng thiết bị; nội dung và dữ liệu cá nhân vẫn nằm trong web app độc lập này.</p>
          <div className="landing-skyline" aria-hidden="true" />
        </div>
        <DeviceAccessGate />
      </div>
    </section>

    <footer className="landing-footer premium-landing-footer"><span>RU_LIFE</span><p>Kết nối tri thức · Kết nối con người · Kết nối tương lai</p></footer>
  </main>;
}
