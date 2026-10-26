import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  DIRECTORY_RELATIONSHIP_CAUTION,
  GOVERNANCE_SOURCE_ACCESS_DATE,
  WDSF_DIRECTORY_STATEMENT,
  WRRC_DIRECTORY_STATEMENT,
  governanceOfficialSources,
  governancePolicyRegister,
  governancePrinciples,
  governanceStatusLedger,
  intendedGovernanceSequence,
  relationshipRegister,
} from "@/content/governance";
import { siteConfig } from "@/content/site";

import styles from "./governance-page.module.css";

function OfficialSourceLink({
  href,
  label,
}: {
  readonly href: string;
  readonly label: string;
}) {
  const accessibleLabel = `${label}, official external source (opens in a new tab)`;

  return (
    <a
      aria-label={accessibleLabel}
      className={styles.sourceLink}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <span className={styles.externalLabel}>
        {" "}
        — official external source (opens in a new tab)
      </span>
    </a>
  );
}

export function GovernancePage() {
  const [wrrcSource, wdsfSource] = governanceOfficialSources;

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div>
          <PageHeader
            eyebrow={siteConfig.statusLine}
            title="Trust should be inspectable"
            description="Governance for this proposal is in development. This page records the current public position, separates intended principles from adopted rules and shows the limits of the official records reviewed."
          />
          <div className={styles.heroActions}>
            <ButtonLink href="/about/#status">
              Read the current proposal status
            </ButtonLink>
            <ButtonLink href="/contact/" variant="secondary">
              Request a factual correction
            </ButtonLink>
          </div>
        </div>

        <aside aria-label="Governance status" className={styles.proposalNotice}>
          <p className={styles.noticeLabel}>Current public position</p>
          <p>
            <strong>Proposal only.</strong> No constitution or bye-laws are
            presented as adopted. No office-bearer, recognition, affiliation or
            governing authority is claimed.
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="status-ledger-title"
        className={styles.inkSection}
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.inverseEyebrow}>Status ledger</p>
            <h2 id="status-ledger-title">What is—and is not—established</h2>
            <p>
              Each entry is deliberately narrow. An absence of a public claim is
              not a legal conclusion about another person or entity.
            </p>
          </div>

          <dl className={styles.ledger}>
            {governanceStatusLedger.map((item) => (
              <div className={styles.ledgerItem} key={item.area}>
                <dt>{item.area}</dt>
                <dd>
                  <strong>{item.state}</strong>
                  <span>{item.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="principles-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Governance principles</p>
          <h2 id="principles-title">Standards intended for the design stage</h2>
          <p>
            These are principles and planned work, not adopted policies,
            operational safeguards or guarantees of a service.
          </p>
        </div>

        <ul className={styles.principleGrid}>
          {governancePrinciples.map((principle) => (
            <li key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="policy-register-title"
        className={styles.sandSection}
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Policy work register</p>
            <h2 id="policy-register-title">
              Explicit states, without implied adoption
            </h2>
            <p>
              Topic names describe areas of possible work. They are not titles
              of approved documents.
            </p>
          </div>

          <ul className={styles.register}>
            {governancePolicyRegister.map((item) => (
              <li className={styles.registerItem} key={item.topic}>
                <p className={styles.registerState}>{item.state}</p>
                <h3>{item.topic}</h3>
                <p>{item.publicPosition}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="structure-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.splitSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Intended structure</p>
            <h2 id="structure-title">A documented route from draft to rule</h2>
            <p>
              Any future structure remains subject to evidence, consultation and
              appropriate professional review. No timetable or outcome is
              promised.
            </p>
          </div>

          <ol className={styles.sequence}>
            {intendedGovernanceSequence.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="public-context-title"
        className={styles.contextSection}
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.inverseEyebrow}>Verified public context</p>
            <h2 id="public-context-title">
              Two separate official directory records
            </h2>
            <p>
              The wording below reports only what the named sources displayed on
              the access date.
            </p>
          </div>

          <div className={styles.contextGrid}>
            <article>
              <p className={styles.sourceType}>WRRC directory record</p>
              <p>{WRRC_DIRECTORY_STATEMENT}</p>
              <OfficialSourceLink
                href={wrrcSource.url}
                label={wrrcSource.label}
              />
            </article>

            <article>
              <p className={styles.sourceType}>WDSF directory record</p>
              <p>{WDSF_DIRECTORY_STATEMENT}</p>
              <OfficialSourceLink
                href={wdsfSource.url}
                label={wdsfSource.label}
              />
            </article>
          </div>

          <aside className={styles.caution} aria-label="Record limitation">
            <strong>What these records do not establish</strong>
            <p>{DIRECTORY_RELATIONSHIP_CAUTION}</p>
            <p>
              Directory entries report what their publishers display. They do
              not, by themselves, determine legal identity, authority or the
              current rights attached to a status.
            </p>
          </aside>

          <p className={styles.accessDate}>
            Official sources accessed {GOVERNANCE_SOURCE_ACCESS_DATE}.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="relationship-register-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>
            Relationship and recognition register
          </p>
          <h2 id="relationship-register-title">
            No institutional bridge is inferred
          </h2>
          <p>
            This register records the public non-claims that apply while
            documentary answers remain unavailable.
          </p>
        </div>

        <ul className={styles.relationshipList}>
          {relationshipRegister.map((item) => (
            <li key={item.relationship}>
              <p className={styles.registerState}>{item.state}</p>
              <h3>{item.relationship}</h3>
              <p>{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`container ${styles.documentState}`}>
        <EmptyState
          title="No governance documents have been adopted or published"
          description="That absence is material. Do not infer a constitution, policy, appointment, decision right, complaints process or financial control from this page. Any future draft will be labelled before review."
        />
      </section>

      <section
        aria-labelledby="corrections-title"
        className={`container ${styles.correctionSection}`}
      >
        <div>
          <p className={styles.eyebrow}>Corrections and evidence</p>
          <h2 id="corrections-title">Help keep the public record precise</h2>
          <p>
            If an official source has changed, or a sentence needs factual
            correction, send the exact passage and a primary source. A
            correction request does not establish a relationship or status.
          </p>
        </div>
        <ButtonLink href="/contact/" variant="secondary">
          Contact the corrections route
        </ButtonLink>
      </section>
    </div>
  );
}
