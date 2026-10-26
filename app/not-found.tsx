import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { createRobotsMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The requested page could not be found on this proposed initiative’s website.",
  robots: createRobotsMetadata(true),
};

export default function NotFound() {
  return (
    <section className="container section not-found">
      <PageHeader
        eyebrow="404 · Not found"
        title="The count stops here"
        description="The address may be incorrect, or the page may no longer be published. No status, decision or conclusion should be inferred from an unavailable URL."
      />
      <div className="button-row">
        <ButtonLink href="/">Return home</ButtonLink>
        <ButtonLink href="/about/" variant="secondary">
          Read proposal status
        </ButtonLink>
      </div>
    </section>
  );
}
