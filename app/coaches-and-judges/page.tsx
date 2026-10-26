import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  coachesAndJudgesMetadata,
  credentialVerificationSteps,
  professionalAmbitions,
  professionalCurrentState,
  professionalDevelopmentSequence,
  professionalSafeguards,
} from "@/content/people";
import { createPageMetadata } from "@/lib/seo";

import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata(coachesAndJudgesMetadata);

export default function CoachesAndJudgesPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div>
          <PageHeader
            eyebrow="Professional pathways · Proposed"
            title="Knowledge, care and fair decisions"
            description="Coaching and judging require more than visibility. Any future framework would need clear competence, athlete welfare, conflict controls and review processes."
          />
          <div className="button-row">
            <ButtonLink href="/join/">
              Register professional interest
            </ButtonLink>
            <ButtonLink href="/governance/" variant="secondary">
              Review governance work
            </ButtonLink>
          </div>
        </div>
        <aside className={styles.heroBoundary} aria-label="Professional status">
          <span aria-hidden="true">0</span>
          <div>
            <p className={styles.kicker}>Current framework</p>
            <p>
              No course, appointment, accreditation, certification or
              professional listing is offered by this proposed initiative.
            </p>
          </div>
        </aside>
      </section>

      <section className={`container ${styles.currentState}`}>
        <EmptyState
          title={professionalCurrentState.title}
          description={professionalCurrentState.description}
          action={
            <ButtonLink href="/join/" variant="quiet">
              Record professional interest
            </ButtonLink>
          }
        />
      </section>

      <section className={styles.rolesSection} aria-labelledby="roles-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.inverseKicker}>Distinct responsibilities</p>
            <h2 id="roles-title">
              Development and decisions need different skills
            </h2>
            <p>
              The proposed ambitions below do not define a qualification or
              promise that a framework will be adopted.
            </p>
          </div>
          <div className={styles.roleGrid}>
            {professionalAmbitions.map((ambition, index) => (
              <article key={ambition.audience}>
                <div className={styles.roleMarker}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{ambition.audience}</p>
                </div>
                <h3>{ambition.title}</h3>
                <p>{ambition.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`container ${styles.developmentSection}`}
        aria-labelledby="development-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Education ambition</p>
          <h2 id="development-title">Define the system before naming levels</h2>
          <p>
            Course titles, grades and transfer rules would be premature until
            competence, evidence, responsibility and review are designed
            together.
          </p>
        </div>
        <ol className={styles.developmentList}>
          {professionalDevelopmentSequence.map((stage) => (
            <li key={stage.step}>
              <span>{stage.step}</span>
              <div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.verificationSection}
        aria-labelledby="verification-title"
      >
        <div className={`container ${styles.verificationGrid}`}>
          <div className={styles.verificationIntro}>
            <p className={styles.kicker}>Credential verification</p>
            <h2 id="verification-title">
              Check the exact claim, not the impression
            </h2>
            <p>
              Existing experience may be relevant, but no credential is
              transferable merely because it is submitted. The issuer, scope,
              currency and permitted wording all matter.
            </p>
          </div>
          <ol className={styles.verificationSteps}>
            {credentialVerificationSteps.map((stage) => (
              <li key={stage.step}>
                <span>{stage.step}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={`container ${styles.safeguardsSection}`}
        aria-labelledby="safeguards-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Shared safeguards</p>
          <h2 id="safeguards-title">
            Competence must sit inside accountability
          </h2>
        </div>
        <div className={styles.safeguardGrid}>
          {professionalSafeguards.map((safeguard) => (
            <article key={safeguard.title}>
              <h3>{safeguard.title}</h3>
              <p>{safeguard.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`container ${styles.contributionSection}`}
        aria-labelledby="contribution-title"
      >
        <div>
          <p className={styles.kicker}>Contributing expertise</p>
          <h2 id="contribution-title">Input does not create a title</h2>
          <p>
            Subject-matter contributors may help test future standards only
            through a bounded brief, declared interests and a review process.
            Contribution does not confer appointment, preferred status,
            certification or decision authority.
          </p>
        </div>
        <div className={styles.actions}>
          <ButtonLink href="/join/">Register professional interest</ButtonLink>
          <ButtonLink href="/about/" variant="secondary">
            Understand the proposal
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
