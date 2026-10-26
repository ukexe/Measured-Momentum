import type { MetadataRoute } from "next";

import { indexablePublicRoutes } from "@/content/site";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePublicRoutes.map((pathname) => ({
    url: absoluteUrl(pathname),
  }));
}
