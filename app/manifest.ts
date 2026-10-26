import type { MetadataRoute } from "next";

import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.descriptor,
    short_name: siteConfig.creativePlatform,
    description: siteConfig.shortDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff8ed",
    theme_color: "#fff8ed",
    lang: "en-IN",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
