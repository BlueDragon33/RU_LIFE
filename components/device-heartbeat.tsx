"use client";

import { useEffect, useRef } from "react";
import { authorizeDevice, establishLocalSession, registerDevice } from "@/lib/device-access.client";

const HEARTBEAT_MS = 60_000;
const SESSION_CHECK_MS = 15_000;
const SESSION_RENEW_MS = 8 * 60_000;

async function clearLocalSession() {
  await fetch("/api/device/session", { method: "DELETE", cache: "no-store" }).catch(() => undefined);
}

async function localSessionStillActive() {
  try {
    const response = await fetch("/api/device/session", { method: "GET", cache: "no-store" });
    if (response.status === 401 || response.status === 403) return false;
    return true;
  } catch {
    return true;
  }
}

export default function DeviceHeartbeat() {
  const running = useRef(false);
  const checkingSession = useRef(false);
  const lastRenewedAt = useRef(0);

  useEffect(() => {
    let stopped = false;
    lastRenewedAt.current = Date.now();

    async function exitIfRevoked() {
      if (stopped || checkingSession.current || document.visibilityState !== "visible") return;
      checkingSession.current = true;
      try {
        const active = await localSessionStillActive();
        if (!active) {
          await clearLocalSession();
          if (!stopped) window.location.replace("/");
        }
      } finally {
        checkingSession.current = false;
      }
    }

    async function heartbeat() {
      if (stopped || running.current || document.visibilityState !== "visible") return;
      running.current = true;
      try {
        const registration = await registerDevice();
        if (stopped) return;

        if (registration.device.status !== "approved") {
          await clearLocalSession();
          if (!stopped) window.location.replace("/");
          return;
        }

        if (Date.now() - lastRenewedAt.current >= SESSION_RENEW_MS) {
          const authorization = await authorizeDevice(registration.keys, registration.device);
          await establishLocalSession(authorization.accessToken);
          lastRenewedAt.current = Date.now();
        }
      } catch {
        // Mất mạng hoặc Trung tâm gián đoạn tạm thời không phá phiên HMAC còn hạn.
        // Introspection server-side sẽ từ chối ngay khi Trung tâm xác nhận phiên đã bị thu hồi.
      } finally {
        running.current = false;
      }
    }

    const heartbeatInitial = window.setTimeout(() => void heartbeat(), HEARTBEAT_MS);
    const heartbeatInterval = window.setInterval(() => void heartbeat(), HEARTBEAT_MS);
    const sessionInitial = window.setTimeout(() => void exitIfRevoked(), SESSION_CHECK_MS);
    const sessionInterval = window.setInterval(() => void exitIfRevoked(), SESSION_CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void exitIfRevoked();
        void heartbeat();
      }
    };
    const onOnline = () => {
      void exitIfRevoked();
      void heartbeat();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      stopped = true;
      window.clearTimeout(heartbeatInitial);
      window.clearInterval(heartbeatInterval);
      window.clearTimeout(sessionInitial);
      window.clearInterval(sessionInterval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
