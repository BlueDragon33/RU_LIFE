import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./public-premium.css";
import "./workspace.css";
import "./content.css";
import "./tools.css";
import "./deadlines.css";
import "./backup.css";
import "./premium-theme.css";
import "./premium-deep.css";
import "./knowledge.css";

export const metadata: Metadata = {
  title: { default: "Hòa nhập Nga", template: "%s · Hòa nhập Nga" },
  description: "Web App độc lập hỗ trợ cuộc sống, học tập và hòa nhập tại Nga.",
  applicationName: "Hòa nhập Nga",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg?v=site-id-1", shortcut: "/icon.svg?v=site-id-1" },
  appleWebApp: { capable: true, title: "Hòa nhập Nga", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07152f",
};

const STYLE_RECOVERY_SCRIPT = `
(() => {
  try {
    const marker = "ru-life-style-recovery-v3";
    if (window.sessionStorage.getItem(marker) === "done") return;

    const unregister = "serviceWorker" in navigator
      ? navigator.serviceWorker.getRegistrations().then(async (registrations) => {
          const ruLifeRegistrations = registrations.filter((registration) => {
            try {
              const scope = new URL(registration.scope);
              return scope.origin === window.location.origin;
            } catch {
              return false;
            }
          });
          if (!ruLifeRegistrations.length) return false;
          await Promise.all(ruLifeRegistrations.map((registration) => registration.unregister()));
          return true;
        })
      : Promise.resolve(false);

    const clearCaches = "caches" in window
      ? caches.keys().then(async (keys) => {
          const stale = keys.filter((key) => key.startsWith("ru-life-shell-"));
          if (!stale.length) return false;
          await Promise.all(stale.map((key) => caches.delete(key)));
          return true;
        })
      : Promise.resolve(false);

    Promise.all([unregister, clearCaches])
      .then(([removedWorker, removedCache]) => {
        window.sessionStorage.setItem(marker, "done");
        if (!removedWorker && !removedCache) return;
        const url = new URL(window.location.href);
        url.searchParams.set("ru_recover", "3");
        window.location.replace(url.toString());
      })
      .catch(() => {
        window.sessionStorage.setItem(marker, "done");
      });
  } catch {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi">
    <head>
      <script dangerouslySetInnerHTML={{ __html: STYLE_RECOVERY_SCRIPT }} />
    </head>
    <body>{children}</body>
  </html>;
}
