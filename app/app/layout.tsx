import Link from "next/link";
import { redirect } from "next/navigation";
import DeviceHeartbeat from "@/components/device-heartbeat";
import LocalReminderRuntime from "@/components/local-reminder-runtime";
import LocalStateRuntime from "@/components/local-state-runtime";
import WorkspaceNavigation from "@/components/workspace-navigation";
import { readDeviceSession } from "@/lib/device-session.server";
import "../workspace.css";
import "../content.css";
import "../tools.css";
import "../deadlines.css";
import "../backup.css";
import "../premium-theme.css";
import "../premium-deep.css";

export const dynamic = "force-dynamic";

export default async function ProtectedWorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await readDeviceSession();
  if (!session) redirect("/");

  return <main className="workspace-shell">
    <DeviceHeartbeat />
    <LocalReminderRuntime />
    <LocalStateRuntime />
    <a className="skip-link" href="#workspace-content">Bỏ qua điều hướng</a>
    <aside className="workspace-side">
      <div className="workspace-brand"><span>RU</span><div><small>RU_LIFE</small><strong>Hòa nhập Nga</strong><em>Independent life companion</em></div></div>
      <WorkspaceNavigation />
      <div className="workspace-side-story"><span>KẾT NỐI TRI THỨC · CON NGƯỜI · TƯƠNG LAI</span><strong>Kiến thức đúng<br />Hành trang vững<br />Tương lai rộng mở</strong></div>
      <div className="device-badge"><small>THIẾT BỊ ĐÃ DUYỆT</small><strong>{session.deviceCode}</strong><span>Quyền do Quản trị ứng dụng cấp · phiên được xác minh lại với Trung tâm.</span></div>
    </aside>
    <section className="workspace-main" id="workspace-content" tabIndex={-1}>
      <header className="workspace-topbar" aria-label="Thanh công cụ RU_LIFE">
        <div className="workspace-topbar-copy"><span aria-hidden="true">✦</span><div><small>RU_LIFE · HÒA NHẬP NGA</small><strong>Không gian độc lập · thiết bị đã xác thực</strong></div></div>
        <div className="workspace-topbar-actions">
          <Link className="workspace-quick-link" href="/app#quick-search-title" aria-label="Mở tìm kiếm nhanh"><i aria-hidden="true">⌕</i><span>Tìm chủ đề, thủ tục, hướng dẫn…</span><b>/</b></Link>
          <div className="workspace-profile"><span aria-hidden="true">RU</span><div><small>TRẠNG THÁI</small><strong>Đã cấp quyền</strong></div></div>
        </div>
      </header>
      {children}
    </section>
  </main>;
}
