import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/lib/seo";

import styles from "../privacy/legal-draft.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Draft website terms",
  description:
    "Legal-review draft terms for a proposal website that does not claim organisational, sporting or legal authority.",
  pathname: "/terms/",
  noIndex: true,
});

const legalLabel =
  "DRAFT — REQUIRES PROFESSIONAL LEGAL REVIEW; NOT LEGAL ADVICE";

export default function TermsPage() {
  return (
    <article className={styles.page}>
      <p className={styles.legalLabel}>{legalLabel}</p>

      <PageHeader
        eyebrow="Proposed organisation · In development"
        title="Terms for using this website"
        description="These draft boundaries describe an informational proposal website. They are incomplete because the responsible legal operator, rights ownership and governing-law decisions are unresolved."
      />

      <p className={styles.version}>
        Draft version: engineering-review-1 · Dated 25 October 2026 · Effective
        date: not approved
      </p>

      <div className={styles.summary}>
        <strong>No contract or official status is represented</strong>
        <p>
          This draft does not create membership, selection, accreditation,
          appointment, employment, affiliation, sponsorship or a place in any
          event or activity. A form confirmation means only that a record was
          stored for the stated enquiry purpose.
        </p>
      </div>

      <nav className={styles.contents} aria-label="Terms draft contents">
        <h2>On this page</h2>
        <ol>
          <li>
            <a href="#operator">Operator and status</a>
          </li>
          <li>
            <a href="#scope">Information-only scope</a>
          </li>
          <li>
            <a href="#accuracy">Accuracy and corrections</a>
          </li>
          <li>
            <a href="#external">External information</a>
          </li>
          <li>
            <a href="#submissions">Conditional submissions</a>
          </li>
          <li>
            <a href="#acceptable-use">Acceptable use</a>
          </li>
          <li>
            <a href="#availability">Availability</a>
          </li>
          <li>
            <a href="#rights">Content and intellectual property</a>
          </li>
          <li>
            <a href="#liability">Liability wording</a>
          </li>
          <li>
            <a href="#privacy">Privacy</a>
          </li>
          <li>
            <a href="#law">Governing law and disputes</a>
          </li>
          <li>
            <a href="#changes">Changes and contact</a>
          </li>
        </ol>
      </nav>

      <section className={styles.section} id="operator">
        <h2>1. Operator and proposal status</h2>
        <p>
          “Acrobatic Rock ’n’ Roll + Boogie Woogie in India” is a descriptive
          working label for a proposed initiative. The responsible website
          operator and legal entity are not verified. No incorporation,
          governmental authority, sporting recognition, federation status,
          governing-body role, national representation or international
          affiliation is claimed.
        </p>
        <p className={styles.pending}>
          Final terms must identify a real operator with authority to publish
          them. Until then, this document cannot settle contractual rights,
          liability, governing law, dispute handling or ownership.
        </p>
      </section>

      <section className={styles.section} id="scope">
        <h2>2. Information-only scope</h2>
        <p>
          The website explains a proposal and may publish clearly labelled,
          source-checked information. It does not provide coaching, acrobatic
          instruction, medical advice, safeguarding casework, legal advice,
          financial advice, certification, event sanction, athlete assessment or
          selection advice.
        </p>
        <p>
          Do not attempt acrobatic movement from website content. Training and
          participation decisions require appropriately qualified people,
          suitable facilities, progressive instruction and context-specific
          safety arrangements that this website does not provide.
        </p>
      </section>

      <section className={styles.section} id="accuracy">
        <h2>3. Accuracy, dates and corrections</h2>
        <p>
          Content should separate verified facts from proposals, drafts and
          intentions. A published page may become incomplete or outdated.
          Publication quality must not be read as evidence of authority or
          recognition.
        </p>
        <p>
          Dated source notes and correction histories should be used where an
          approved editorial process exists. If the contact service is
          available, a factual-correction category can record a query. No
          response period or correction outcome is promised by this draft.
        </p>
      </section>

      <section className={styles.section} id="external">
        <h2>4. External links, events and third parties</h2>
        <p>
          A link or factual listing does not imply endorsement, affiliation,
          sanction, safety approval, organiser status or selection consequence.
          Third parties control their own content, availability, terms, privacy,
          eligibility, payments and event arrangements.
        </p>
        <p>
          Visitors should confirm current information with the original source.
          No event, club, coach, judge, institution, sponsor or governing body
          is represented as connected to this proposal without a separately
          verified and approved relationship record.
        </p>
      </section>

      <section className={styles.section} id="submissions">
        <h2>5. Conditional enquiry submissions</h2>
        <p>
          Enquiry and interest forms are unavailable unless the Worker confirms
          a complete rate-limited persistence configuration and any configured
          Turnstile tuple. Missing or partial configuration fails closed and
          must not produce a success confirmation.
        </p>
        <p>
          If enabled, a person may send only the minimal fields described on the
          form. Do not send unlawful material, another person’s information
          without authority, confidential safeguarding reports, health data,
          identity documents, credentials, payment information or details about
          a child.
        </p>
        <p>
          A stored enquiry is not an application or acceptance. Optional updates
          interest is separate, unticked by default and does not itself create a
          mailing service or promise future communication.
        </p>
      </section>

      <section className={styles.section} id="acceptable-use">
        <h2>6. Acceptable use</h2>
        <p>Visitors must not deliberately:</p>
        <ul>
          <li>
            submit spam, malicious code, false identity data or harassment;
          </li>
          <li>
            probe, bypass or interfere with validation, rate limiting,
            verification, access controls or service availability;
          </li>
          <li>
            use the website to imply an unverified official relationship,
            credential, endorsement or authority;
          </li>
          <li>
            copy personal information or restricted material for an unrelated
            purpose.
          </li>
        </ul>
        <p>
          Enforcement powers and remedies depend on the eventual operator and
          law and therefore require professional drafting.
        </p>
      </section>

      <section className={styles.section} id="availability">
        <h2>7. Availability and changes</h2>
        <p>
          The website and its form capability may be unavailable, changed or
          withdrawn. There is no promised uptime, response service, launch date,
          event programme or continuation of the proposal.
        </p>
        <p>
          Technical controls intentionally reject submissions when
          configuration, verification, rate limiting or persistence cannot be
          confirmed. Visitors should not treat a failed attempt as accepted. The
          implementation performs no automatic persistence retry.
        </p>
      </section>

      <section className={styles.section} id="rights">
        <h2>8. Content and intellectual property</h2>
        <p>
          Ownership and licensing for the working descriptor, text, code,
          graphics and any future media have not been stated here. No licence to
          use a logo, person’s image, third-party rulebook, event mark or
          sporting-body identity should be inferred.
        </p>
        <p className={styles.pending}>
          Final terms must identify relevant owners, permitted visitor uses,
          open-source notices, third-party rights, reporting routes and takedown
          handling from verified records. They must not claim rights that an
          operator does not hold.
        </p>
      </section>

      <section className={styles.section} id="liability">
        <h2>9. Liability wording requires legal review</h2>
        <p>
          No exclusion, limitation, indemnity or warranty wording is adopted by
          this draft. Such clauses depend on the real operator, services,
          jurisdiction, consumer protections and risks and must be prepared by
          qualified counsel. Nothing on this page should be used to waive rights
          that cannot lawfully be waived.
        </p>
      </section>

      <section className={styles.section} id="privacy">
        <h2>10. Privacy and security</h2>
        <p>
          The <a href="/privacy/">draft privacy notice</a> describes the current
          fail-closed form boundary and conditional Cloudflare, Turnstile and
          Supabase flow. It also records that the controller, lawful basis,
          retention and rights process are pending.
        </p>
        <p>
          Validation, rate limiting and row-level security reduce risk but do
          not guarantee confidentiality or availability. Do not submit sensitive
          or emergency information.
        </p>
      </section>

      <section className={styles.section} id="law">
        <h2>11. Governing law and disputes</h2>
        <p>
          No governing law, court, arbitration process or formal complaints
          route is selected. Those choices cannot be responsibly made until the
          operator, legal form, users, activities and jurisdiction are
          confirmed. Professional Indian legal review is required, including
          consideration of any mandatory rights that contractual wording cannot
          exclude.
        </p>
      </section>

      <section className={styles.section} id="changes">
        <h2>12. Version, changes and contact</h2>
        <p>
          Approved terms must have an effective date, version history, verified
          operator details and a maintained contact route. Material changes to
          site purpose, transactions, accounts, payments, user content, events
          or data handling require a new architecture, privacy and legal review.
        </p>
        <p>
          No official email, postal address or authorised legal contact is
          verified. The label “{legalLabel}” must remain until qualified counsel
          approves terms for the actual operator and implemented website.
        </p>
      </section>
    </article>
  );
}
