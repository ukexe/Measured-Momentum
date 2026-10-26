import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  aboutMetadata,
  developmentSequence,
  intendedScope,
  proposalMission,
  proposalRationale,
  proposalStatus,
  proposalValues,
  proposalVision,
  statusHorizon,
  transparencyNote,
} from "@/content/about";
import { createPageMetadata } from "@/lib/seo";

import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata(aboutMetadata);

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <PageHeader
            eyebrow="Proposed organisation · In development"
            title="A proposal built in the open"
            description="The aim is to explore whether a useful, accountable structure can be developed around Acrobatic Rock ’n’ Roll and Boogie Woogie in India. This page separates that intention from what has actually been established."
          />
          <div className="button-row">
            <ButtonLink href="/governance/">
              Review governance status
            </ButtonLink>
            <ButtonLink href="/join/" variant="secondary">
              Share relevant experience
            </ButtonLink>
          </div>
        </div>

        <aside className={styles.heroStatus} aria-label="Proposal boundary">
          <p className={styles.measureLabel}>
            Working position · 25 October 2026
          </p>
          <p className={styles.heroStatusTitle}>Proposal, not authority</p>
          <p>
            No legal, governmental, sporting or international recognition is
            claimed. The name, structure, policies, roles and programmes remain
            in development.
          </p>
        </aside>
      </section>

      <section
        className={styles.statusSection}
        id="status"
        aria-labelledby="status-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Current status</p>
            <h2 id="status-title">Read the limits before the ambition</h2>
            <p>
              Each line below states the public position of this proposal. An
              absence is not a hidden approval, appointment or relationship.
            </p>
          </div>

          <dl className={styles.statusLedger}>
            {proposalStatus.map((item) => (
              <div className={styles.statusRow} key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  <strong>{item.status}</strong>
                  <span>{item.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className={`container ${styles.rationaleSection}`}
        aria-labelledby="rationale-title"
      >
        <div>
          <p className={styles.kicker}>Why explore this</p>
          <h2 id="rationale-title">{proposalRationale.title}</h2>
        </div>
        <div className={styles.prose}>
          {proposalRationale.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section
        className={`container ${styles.horizonSection}`}
        aria-labelledby="horizon-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Now and later</p>
          <h2 id="horizon-title">Current information is not future capacity</h2>
        </div>
        <div className={styles.horizonGrid}>
          {statusHorizon.map((item) => (
            <article className={styles.horizonCard} key={item.label}>
              <p className={styles.cardLabel}>{item.label}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.intentSection} aria-labelledby="intent-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Mission and vision</p>
            <h2 id="intent-title">Direction under consideration</h2>
            <p>
              These statements guide exploration. They are not adopted objects,
              service commitments or evidence of delivery.
            </p>
          </div>
          <div className={styles.intentGrid}>
            {[proposalMission, proposalVision].map((item) => (
              <article className={styles.intentCard} key={item.label}>
                <p className={styles.cardLabel}>{item.label}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`container ${styles.scopeSection}`}
        aria-labelledby="scope-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Intended scope</p>
          <h2 id="scope-title">Useful work, if the foundations support it</h2>
          <p>
            Every area remains proposed. None describes a current programme,
            mandate or service.
          </p>
        </div>
        <ul className={styles.scopeGrid}>
          {intendedScope.map((item, index) => (
            <li key={item.title}>
              <span className={styles.scopeIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.valuesSection} aria-labelledby="values-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Proposed values</p>
            <h2 id="values-title">The method matters as much as momentum</h2>
          </div>
          <div className={styles.valuesGrid}>
            {proposalValues.map((value) => (
              <article key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`container ${styles.sequenceSection}`}
        aria-labelledby="sequence-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Development sequence</p>
          <h2 id="sequence-title">Evidence before expansion</h2>
          <p>
            The order is intentional; it carries no launch date or promise that
            every stage will proceed.
          </p>
        </div>
        <ol className={styles.sequence}>
          {developmentSequence.map((stage) => (
            <li key={stage.step}>
              <span className={styles.sequenceNumber}>{stage.step}</span>
              <div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`container ${styles.transparencySection}`}
        aria-labelledby="transparency-title"
      >
        <div>
          <p className={styles.kicker}>Transparency and corrections</p>
          <h2 id="transparency-title">{transparencyNote.title}</h2>
          <p>{transparencyNote.description}</p>
        </div>
        <div className={styles.transparencyActions}>
          <ButtonLink href={transparencyNote.correctionHref}>
            Request a factual correction
          </ButtonLink>
          <ButtonLink
            href={transparencyNote.governanceHref}
            variant="secondary"
          >
            Inspect governance work
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
