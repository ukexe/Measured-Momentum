import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/lib/seo";

import styles from "./legal-draft.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Draft privacy notice",
  description:
    "A legal-review draft describing the disabled and conditionally enabled data flow for this proposed initiative website.",
  pathname: "/privacy/",
  noIndex: true,
});

const legalLabel =
  "DRAFT — REQUIRES PROFESSIONAL LEGAL REVIEW; NOT LEGAL ADVICE";

export default function PrivacyPage() {
  return (
    <article className={styles.page}>
      <p className={styles.legalLabel}>{legalLabel}</p>

      <PageHeader
        eyebrow="Proposed organisation · In development"
        title="Privacy, in plain language"
        description="This draft describes the code’s current fail-closed form boundary and the data flow that would exist only after responsible configuration. It is not an approved privacy notice and makes no compliance claim."
      />

      <p className={styles.version}>
        Draft version: engineering-review-1 · Dated 25 October 2026 · Effective
        date: not approved
      </p>

      <div className={styles.summary}>
        <strong>Current legal and operational state</strong>
        <p>
          The website operator, data controller, lawful basis, retention
          schedule, rights contact and authorised operational owner are
          unresolved. Those are release blockers. This draft does not authorise
          collection, and a deployment with incomplete configuration must keep
          the forms unavailable.
        </p>
      </div>

      <nav className={styles.contents} aria-label="Privacy draft contents">
        <h2>On this page</h2>
        <ol>
          <li>
            <a href="#status">Identity and status</a>
          </li>
          <li>
            <a href="#data">Information in scope</a>
          </li>
          <li>
            <a href="#disabled">When forms are disabled</a>
          </li>
          <li>
            <a href="#enabled">Conditional enabled flow</a>
          </li>
          <li>
            <a href="#purpose">Purpose and legal basis</a>
          </li>
          <li>
            <a href="#providers">Providers and transfers</a>
          </li>
          <li>
            <a href="#retention">Retention and deletion</a>
          </li>
          <li>
            <a href="#children">Children’s information</a>
          </li>
          <li>
            <a href="#rights">Requests and choices</a>
          </li>
          <li>
            <a href="#security">Security and logs</a>
          </li>
          <li>
            <a href="#storage">Cookies and analytics</a>
          </li>
          <li>
            <a href="#changes">Changes and review</a>
          </li>
        </ol>
      </nav>

      <section className={styles.section} id="status">
        <h2>1. Identity and status</h2>
        <p>
          “Acrobatic Rock ’n’ Roll + Boogie Woogie in India” is a working
          descriptor for a proposal. It is not a verified legal name. No legal
          entity, registration, governing authority, recognition or affiliation
          is claimed.
        </p>
        <p className={styles.pending}>
          A final notice must name and verify the real website operator and data
          controller, give an approved privacy contact, and explain each party’s
          role before collection opens.
        </p>
      </section>

      <section className={styles.section} id="data">
        <h2>2. Information in scope</h2>
        <h3>Static website access</h3>
        <p>
          Cloudflare serves the exported website and may process ordinary
          network and request metadata needed to deliver and protect it, such as
          an IP address, request time, requested path, browser headers and
          security signals. The application does not add first-party analytics.
          Cloudflare’s exact operational records and retention require
          contractual and professional review.
        </p>

        <h3>Enquiry form, only if enabled</h3>
        <ul>
          <li>
            Required: schema version, name, email, pathway or category, and
            acknowledgement of this notice.
          </li>
          <li>Optional: broad city/state and a short non-confidential note.</li>
          <li>
            Optional and separate: an unticked choice to record interest in
            future proposal updates.
          </li>
          <li>
            System fields: a random reference, submission time, website source,
            new-record status and the privacy-notice version.
          </li>
        </ul>
        <p>
          The form is not designed to collect dates of birth, identity
          documents, certificates, health information, payment details,
          confidential safeguarding reports or details about a child. Do not
          enter them.
        </p>
      </section>

      <section className={styles.section} id="disabled">
        <h2>3. When forms are disabled</h2>
        <p>
          The browser asks the Worker for a public capability status. If
          persistence, exact origins, the rate-limit binding, notice version or
          any required Turnstile setting is absent, partial or invalid, the
          status says unavailable and form fields are not shown.
        </p>
        <p>
          A submission sent directly to an unconfigured endpoint receives a
          service-unavailable response before its body is read and before
          Turnstile or Supabase is contacted. The site does not fabricate a
          reference, clear entries as if delivered, or report success.
        </p>
      </section>

      <section className={styles.section} id="enabled">
        <h2>4. Conditional enabled data flow</h2>
        <p>
          The following flow exists only for a deployment whose complete
          server-side configuration has been approved:
        </p>
        <ol className={styles.flow}>
          <li>
            The browser validates the fields for convenience and sends UTF-8
            JSON to the same-origin Cloudflare Worker.
          </li>
          <li>
            The Worker enforces method, media type, a 16 KiB body limit, exact
            Origin, a salted rate-limit key and the strict server schema. It
            rejects unknown fields and a filled honeypot.
          </li>
          <li>
            If Turnstile is configured, its script loads only then. The Worker
            sends the short-lived token, requester IP and a random idempotency
            key to Cloudflare Siteverify and checks success, action and
            hostname. The token is not stored.
          </li>
          <li>
            After validation, the Worker makes one native HTTPS request to the
            Supabase Data API using a publishable key and a separate Worker-only
            gate header.
          </li>
          <li>
            Supabase stores the minimal enquiry record behind grants, forced
            row-level security and an insert-only anonymous policy. Public
            clients receive no read, update or delete path.
          </li>
          <li>
            The browser shows “recorded” only after Supabase confirms the
            insert. There is no email, marketing or automated follow-up
            integration in this implementation.
          </li>
        </ol>
      </section>

      <section className={styles.section} id="purpose">
        <h2>5. Purpose, necessity and legal basis</h2>
        <p>
          The intended narrow purpose is to record a person’s expression of
          interest, factual question, correction, governance query, relevant
          expertise or privacy request. City/state and a note are optional.
          Updates interest is separate and is not a condition of submission.
        </p>
        <p className={styles.pending}>
          A qualified owner must approve or replace these purposes, identify a
          lawful basis for each use, decide whether each field is necessary, and
          approve point-of-collection wording. No lawful basis is asserted by
          this draft.
        </p>
      </section>

      <section className={styles.section} id="providers">
        <h2>6. Providers, recipients and transfers</h2>
        <ul>
          <li>
            <strong>Cloudflare:</strong> static hosting, Worker execution,
            request protection, rate limiting and, conditionally, Turnstile.
          </li>
          <li>
            <strong>Supabase:</strong> conditional database API and storage for
            accepted enquiry rows.
          </li>
          <li>
            <strong>Authorised people:</strong> none are named or granted a
            public application path by this draft. Operational access must be
            separately defined and least-privileged.
          </li>
        </ul>
        <p>
          Provider entities, hosting regions, sub-processors, contracts and any
          international transfer mechanism are pending professional assessment.
          No sponsor, sporting body or marketing recipient is part of the coded
          flow.
        </p>
      </section>

      <section className={styles.section} id="retention">
        <h2>7. Retention, deletion and backups</h2>
        <p>
          No retention period is approved. No automatic deletion job or verified
          backup-deletion process is represented. Forms must remain closed until
          an accountable owner approves record and log retention, access,
          correction, deletion, backup expiry and incident handling, and those
          controls are tested.
        </p>
        <p>
          The separate updates choice must not be treated as permission for
          indefinite retention or communication. Withdrawal handling and any
          future mailing system require a separate decision.
        </p>
      </section>

      <section className={styles.section} id="children">
        <h2>8. Children’s information</h2>
        <p>
          This general form is not a child-registration or safeguarding system.
          A person under 18 is directed to ask a parent or guardian to submit
          the adult’s own contact details. The form must not contain a child’s
          name, age, date of birth, school, location, health information,
          documents or activity details.
        </p>
        <p>
          Any future collection involving children requires specialist legal,
          privacy and safeguarding review, age-appropriate information, guardian
          authority and tested operational controls before launch.
        </p>
      </section>

      <section className={styles.section} id="rights">
        <h2>9. Requests, correction and choices</h2>
        <p>
          Applicable rights and response duties depend on the verified operator,
          purposes and law in force. A final notice must explain how to request
          access, correction, deletion or withdrawal and how to escalate a
          concern.
        </p>
        <p>
          No official privacy email, postal address or responsible person is
          verified. If the enquiry service is later approved and available, its
          “Privacy request” category can record a request, but that alone does
          not establish a legally adequate process or response period.
        </p>
      </section>

      <section className={styles.section} id="security">
        <h2>10. Security boundaries and logs</h2>
        <p>
          The application limits request size, validates on the server, checks
          exact origins, rate-limits before external services, optionally
          verifies Turnstile, and relies on database grants and row-level
          security. These are risk-reduction measures, not a guarantee that data
          is secure.
        </p>
        <p>
          Application logs are designed to contain a random request ID, a coarse
          outcome and status only. They must not contain names, email addresses,
          notes, raw IP addresses, rate-limit digests, gate keys, provider
          bodies or Turnstile tokens. Cloudflare platform-level metadata and all
          log retention still require operational review.
        </p>
      </section>

      <section className={styles.section} id="storage">
        <h2>11. Cookies, browser storage and analytics</h2>
        <p>
          This application includes no first-party analytics, advertising
          tracker, marketing pixel or consent-management system. The enquiry
          form does not save its values to local storage.
        </p>
        <p>
          When Turnstile is required, Cloudflare’s widget is a conditional
          third-party browser interaction and may process browser signals or use
          strictly necessary storage according to its then-current service
          behavior. Its accessibility, privacy terms, storage and cross-border
          effects require review before activation. No Turnstile script is
          loaded when verification is disabled.
        </p>
      </section>

      <section className={styles.section} id="changes">
        <h2>12. Changes, approval and contact</h2>
        <p>
          A final notice needs an effective date, immutable version, change
          history, verified operator details and a maintained contact route.
          Material changes to fields, purposes, providers, retention, children’s
          handling, analytics or communications require a new privacy and
          release review.
        </p>
        <p>
          The label “{legalLabel}” must remain until a qualified Indian legal or
          privacy professional approves publication and the implementation is
          checked against that approved notice.
        </p>
      </section>
    </article>
  );
}
