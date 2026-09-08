import { redirect } from "next/navigation";
import DeviceHeartbeat from "@/components/device-heartbeat";
import LocalReminderRuntime from "@/components/local-reminder-runtime";
import WorkspaceNavigation from "@/components/workspace-navigation";
import { readDeviceSession } from "@/lib/device-session.server";
import "../workspace.css";
import "../content.css";
import "../tools.css";
import "../deadlines.css";

export const dynamic = "force-dynamic";

export default async function ProtectedWorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await readDeviceSession();
  if (!session) redirect("/");

  return <main className="workspace-shell">
    <DeviceHeartbeat />
    <LocalReminderRuntime />
    <a className="skip-link" href="#workspace-content">Bỏ qua điều hướng</a>
    <aside className="workspace-side">
      <div className="workspace-brand"><span>RU</span><div><small>RU_LIFE</small><strong>Hòa nhập Nga</strong></div></div>
      <WorkspaceNavigation />
      <div className="device-badge"><small>THIẾT BỊ ĐÃ DUYỆT</small><strong>{session.deviceCode}</strong><span>Quyền do Quản trị ứng dụng cấp · phiên được xác minh lại với Trung tâm.</span></div>
    </aside>
    <section className="workspace-main" id="workspace-content" tabIndex={-1}>{children}</section>
  </main>;
}
