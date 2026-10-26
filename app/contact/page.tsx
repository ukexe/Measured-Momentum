import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/EnquiryForm.client";
import formPageStyles from "@/components/forms/enquiry-page.module.css";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Contact the proposal",
  description:
    "Ask a factual question about a proposed acrobatic rock ’n’ roll and boogie woogie initiative in India, when responsible handling is available.",
  pathname: "/contact/",
});

export default function ContactPage() {
  return (
    <div className={`container ${formPageStyles.page}`}>
      <div className={formPageStyles.intro}>
        <PageHeader
          eyebrow="Proposed organisation · In development"
          title="Ask a clear question"
          description="The contact route is for factual corrections, participation questions, governance-document queries, privacy requests and relevant expertise. It does not represent an official body or staffed response service."
        />

        <aside
          className={formPageStyles.notice}
          aria-labelledby="contact-boundaries"
        >
          <h2 id="contact-boundaries">Contact boundaries</h2>
          <ul className={formPageStyles.boundaries}>
            <li>This is not an emergency service.</li>
            <li>Do not send confidential safeguarding reports here.</li>
            <li>A response does not confer recognition or endorsement.</li>
            <li>No public contact person or response time is verified.</li>
          </ul>
        </aside>
      </div>

      <div className={formPageStyles.formArea}>
        <EnquiryForm kind="contact" />
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
