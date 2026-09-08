"use client";

import { useEffect, useRef, useState } from "react";
import {
  authorizeDevice,
  DeviceGatewayError,
  establishLocalSession,
  registerDevice,
  type ManagedDevice,
} from "@/lib/device-access.client";

type GateState = "checking" | "pending" | "blocked" | "approved" | "error";

function statusLabel(state: GateState) {
  if (state === "checking") return "Đang nhận diện thiết bị";
  if (state === "pending") return "Chờ Trung tâm cấp quyền";
  if (state === "blocked") return "Thiết bị đã bị khóa";
  if (state === "approved") return "Đã được cấp quyền";
  return "Chưa thể xác thực";
}

export default function DeviceAccessGate() {
  const [state, setState] = useState<GateState>("checking");
  const [device, setDevice] = useState<ManagedDevice | null>(null);
  const [message, setMessage] = useState("Đang tạo danh tính bảo mật cục bộ và kết nối Trung tâm quản trị…");
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  async function checkAccess() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setState("checking");
    setMessage("Đang kiểm tra trạng thái quyền của thiết bị…");
    try {
      const registration = await registerDevice();
      setDevice(registration.device);
      if (registration.device.status === "pending") {
        setState("pending");
        setMessage("Thiết bị đã được gửi tới Trung tâm quản trị. Cần gắn người sử dụng và cấp quyền tại Trung tâm trước khi vào Hòa nhập Nga.");
        return;
      }
      if (registration.device.status === "blocked") {
        setState("blocked");
        setMessage("Thiết bị này đã bị Trung tâm quản trị khóa. Không thể tạo phiên truy cập mới.");
        return;
      }

      setState("approved");
      setMessage("Thiết bị đã được duyệt. Đang xác minh khóa và tạo phiên Hòa nhập Nga…");
      const authorization = await authorizeDevice(registration.keys, registration.device);
      setDevice(authorization.device);
      await establishLocalSession(authorization.accessToken);
      window.location.assign("/app");
    } catch (reason) {
      if (reason instanceof DeviceGatewayError) {
        if (reason.device) setDevice(reason.device);
        if (reason.code === "DEVICE_PENDING") setState("pending");
        else if (reason.code === "DEVICE_BLOCKED") setState("blocked");
        else setState("error");
        setMessage(reason.message);
      } else {
        setState("error");
        setMessage("Không thể hoàn tất xác thực thiết bị. Hãy thử lại.");
      }
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void checkAccess(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state !== "pending") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkAccess();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [state]);

  return <section className="gate-card" aria-live="polite">
    <div className="gate-topline"><span className={`status-dot status-${state}`} /><strong>{statusLabel(state)}</strong></div>
    <div className="gate-device-code">
      <small>MÃ THIẾT BỊ HÒA NHẬP NGA</small>
      <strong>{device?.deviceCode || "ĐANG TẠO…"}</strong>
    </div>
    <p>{message}</p>
    {device ? <dl className="gate-meta">
      <div><dt>Loại</dt><dd>{device.deviceClass}</dd></div>
      <div><dt>Hệ điều hành</dt><dd>{device.osName}</dd></div>
      <div><dt>Trình duyệt</dt><dd>{device.browserName}</dd></div>
      <div><dt>Trạng thái</dt><dd>{device.status}</dd></div>
    </dl> : null}
    <div className="gate-actions">
      <button type="button" onClick={() => void checkAccess()} disabled={busy}>{busy ? "Đang kiểm tra…" : "Kiểm tra lại quyền"}</button>
      {device?.deviceCode ? <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(device.deviceCode)}>Sao chép mã HN</button> : null}
    </div>
    <div className="gate-policy">
      <span>Không có đăng nhập trực tiếp trên Hòa nhập Nga</span>
      <span>Quyền được duyệt từ Site Quản trị theo từng thiết bị</span>
      <span>Khóa riêng P-256 chỉ lưu cục bộ trên thiết bị này</span>
    </div>
  </section>;
}
