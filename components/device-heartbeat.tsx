"use client";

import { useEffect, useRef } from "react";
import { authorizeDevice, establishLocalSession, registerDevice } from "@/lib/device-access.client";

const HEARTBEAT_MS = 60_000;
const SESSION_RENEW_MS = 8 * 60_000;

async function clearLocalSession() {
  await fetch("/api/device/session", { method: "DELETE", cache: "no-store" }).catch(() => undefined);
}

export default function DeviceHeartbeat() {
  const running = useRef(false);
  const lastRenewedAt = useRef(Date.now());

  useEffect(() => {
    let stopped = false;

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
        // A transient network/control-center failure must not destroy a still-valid local session.
        // The next heartbeat or server-side session check will retry.
      } finally {
        running.current = false;
      }
    }

    const initial = window.setTimeout(() => void heartbeat(), HEARTBEAT_MS);
    const interval = window.setInterval(() => void heartbeat(), HEARTBEAT_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void heartbeat(); };
    const onOnline = () => void heartbeat();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      stopped = true;
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
