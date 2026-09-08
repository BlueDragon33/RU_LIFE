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

const deviceClassLabel = {
  computer: "Máy tính",
  phone: "Điện thoại",
  tablet: "Máy tính bảng",
  unknown: "Chưa xác định",
} as const;

const deviceStatusLabel = {
  pending: "Chờ cấp quyền",
  approved: "Đã cấp quyền",
  blocked: "Đã khóa",
} as const;

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
  const [message, setMessage] = useState("Đang tự động nhận diện loại thiết bị, tạo danh tính bảo mật cục bộ và kết nối Trung tâm quản trị…");
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  async function checkAccess() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setState("checking");
    setMessage("Đang nhận diện thiết bị và kiểm tra trạng thái quyền…");
    try {
      const registration = await registerDevice();
      setDevice(registration.device);
      const detected = deviceClassLabel[registration.device.deviceClass];
      if (registration.device.status === "pending") {
        setState("pending");
        setMessage(`Đã tự động nhận diện: ${detected}. Hồ sơ thiết bị đã được gửi sang Quản trị ứng dụng và đang chờ gắn người sử dụng, sau đó cấp quyền.`);
        return;
      }
      if (registration.device.status === "blocked") {
        setState("blocked");
        setMessage(`Đã tự động nhận diện: ${detected}. Thiết bị này đang bị Trung tâm quản trị khóa nên không thể tạo phiên truy cập mới.`);
        return;
      }

      setState("approved");
      setMessage(`Đã tự động nhận diện: ${detected}. Thiết bị đã được duyệt; đang xác minh khóa và tạo phiên Hòa nhập Nga…`);
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

  return <section className={`gate-card premium-gate state-${state}`} aria-live="polite">
    <header className="premium-gate-head">
      <div><span>RU_LIFE ACCESS</span><h2>Quyền thiết bị</h2></div>
      <div className="gate-topline"><span className={`status-dot status-${state}`} /><strong>{statusLabel(state)}</strong></div>
    </header>

    <div className="gate-device-code premium-device-code">
      <small>MÃ THIẾT BỊ HÒA NHẬP NGA</small>
      <strong>{device?.deviceCode || "ĐANG TẠO…"}</strong>
      <span>Mã này chỉ dùng để Trung tâm quản trị nhận diện đúng thiết bị cần cấp quyền.</span>
    </div>

    <div className="gate-message"><span aria-hidden="true">i</span><p>{message}</p></div>

    {device ? <dl className="gate-meta premium-gate-meta">
      <div><dt>Loại tự nhận diện</dt><dd>{deviceClassLabel[device.deviceClass]}</dd></div>
      <div><dt>Hệ điều hành</dt><dd>{device.osName}</dd></div>
      <div><dt>Trình duyệt</dt><dd>{device.browserName}</dd></div>
      <div><dt>Trạng thái</dt><dd>{deviceStatusLabel[device.status]}</dd></div>
    </dl> : <div className="gate-detection-skeleton" aria-hidden="true"><i /><i /><i /><i /></div>}

    <div className="gate-actions premium-gate-actions">
      <button type="button" onClick={() => void checkAccess()} disabled={busy}>{busy ? "Đang kiểm tra…" : "Kiểm tra lại quyền"}</button>
      {device?.deviceCode ? <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(device.deviceCode)}>Sao chép mã HN</button> : null}
    </div>

    <div className="gate-policy premium-gate-policy">
      <span>Tự động phân loại Máy tính / Điện thoại / Máy tính bảng</span>
      <span>Quản trị ứng dụng kiểm tra lại tín hiệu trước khi lưu loại thiết bị</span>
      <span>Không có đăng nhập trực tiếp trên Hòa nhập Nga</span>
      <span>Khóa riêng P-256 chỉ lưu cục bộ trên thiết bị này</span>
    </div>
  </section>;
}
