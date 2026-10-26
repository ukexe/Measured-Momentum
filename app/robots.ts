import type { MetadataRoute } from "next";

import { isProductionBuild } from "@/lib/seo";
import { absoluteUrl, normaliseSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const production = isProductionBuild();

  return {
    host: normaliseSiteUrl().origin,
    rules: production
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
