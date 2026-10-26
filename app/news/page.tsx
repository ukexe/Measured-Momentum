import type { Metadata } from "next";

import { NewsIndex } from "@/components/sections/activity/news-index";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "News and updates",
  description:
    "A truthful, currently empty archive for verified updates, explainers, consultations, notices and corrections from this proposed initiative.",
  pathname: "/news/",
});

export default function NewsRoute() {
  return <NewsIndex />;
}
