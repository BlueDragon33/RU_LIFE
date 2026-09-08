import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hòa nhập Nga",
    short_name: "RU_LIFE",
    description: "Web App độc lập hỗ trợ cuộc sống, học tập và hòa nhập tại Nga.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#f4f7fb",
    lang: "vi",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
