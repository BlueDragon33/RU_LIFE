"use client";

import { useEffect } from "react";

const RELOAD_MARKER = "ru-life-sw-v2-reloaded";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

    let active = true;
    const handleControllerChange = () => {
      if (!active || window.sessionStorage.getItem(RELOAD_MARKER) === "1") return;
      window.sessionStorage.setItem(RELOAD_MARKER, "1");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async (registration) => {
        await registration.update();
      })
      .catch(() => undefined);

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
