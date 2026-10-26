import type { Metadata } from "next";

import { GovernancePage } from "@/components/sections/governance/governance-page";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Governance",
  description:
    "Inspect the governance status, intended principles, policy work and relationship non-claims for this proposed initiative in India.",
  pathname: "/governance/",
});

export default function GovernanceRoute() {
  return <GovernancePage />;
}
