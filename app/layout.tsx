import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./content.css";
import ServiceWorkerRegister from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: { default: "Hòa nhập Nga", template: "%s · Hòa nhập Nga" },
  description: "Web App độc lập hỗ trợ cuộc sống, học tập và hòa nhập tại Nga.",
  applicationName: "Hòa nhập Nga",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi">
    <body>
      <ServiceWorkerRegister />
      {children}
    </body>
  </html>;
}
