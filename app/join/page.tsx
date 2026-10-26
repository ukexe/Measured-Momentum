import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/EnquiryForm.client";
import formPageStyles from "@/components/forms/enquiry-page.module.css";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Register interest",
  description:
    "Register an expression of interest in a proposed acrobatic rock ’n’ roll and boogie woogie initiative in India, when responsible handling is available.",
  pathname: "/join/",
});

export default function JoinPage() {
  return (
    <div className={`container ${formPageStyles.page}`}>
      <div className={formPageStyles.intro}>
        <PageHeader
          eyebrow="Proposed organisation · In development"
          title="Help shape what comes next"
          description="An expression of interest can describe what you may want to learn about or contribute to this proposal. The form opens only when its data-handling boundary reports a complete configuration."
        />

        <aside className={formPageStyles.notice} aria-labelledby="join-meaning">
          <h2 id="join-meaning">What registration means</h2>
          <ul className={formPageStyles.boundaries}>
            <li>It is not membership or affiliation.</li>
            <li>It is not selection, accreditation or appointment.</li>
            <li>It is not employment or a place in an activity.</li>
            <li>No response time or future programme is promised.</li>
          </ul>
        </aside>
      </div>

      <div className={formPageStyles.formArea}>
        <EnquiryForm kind="join" />
        <noscript>
          <p className={formPageStyles.noScript}>
            JavaScript is required to confirm whether responsible enquiry
            handling is available. No information has been submitted.
          </p>
        </noscript>
      </div>
    </div>
  );
}
