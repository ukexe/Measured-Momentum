import type { Metadata } from "next";

import { CompetitionsPage } from "@/components/sections/activity/competitions-page";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Competitions",
  description:
    "Review the empty competition archive and publication standards for verified third-party or future activity of this proposed initiative.",
  pathname: "/competitions/",
});

export default function CompetitionsRoute() {
  return <CompetitionsPage />;
}
