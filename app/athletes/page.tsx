import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  athleteExpectations,
  athletePathway,
  athletesMetadata,
  coachingExpectation,
  getVerifiedAthleteProfiles,
  partnerConsiderations,
  profilePublicationStandard,
  welfareExpectation,
} from "@/content/people";
import { createPageMetadata } from "@/lib/seo";

import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata(athletesMetadata);

export default function AthletesPage() {
  const profiles = getVerifiedAthleteProfiles();

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div>
          <PageHeader
            eyebrow="Athletes · Proposed pathway"
            title="Find a next step without inventing a finish line"
            description="This page sketches a discovery-to-training-to-competition pathway that could be useful if appropriate providers, welfare controls and verified routes exist."
          />
          <div className="button-row">
            <ButtonLink href="/join/">Express athlete interest</ButtonLink>
            <ButtonLink href="/disciplines/" variant="secondary">
              Compare the disciplines
            </ButtonLink>
          </div>
        </div>
        <aside className={styles.notTeam} aria-label="Athlete page boundary">
          <p className={styles.kicker}>What this is not</p>
          <p>
            This is not a team, selection, ranking or representative list. It
            offers no training place, partner match, event entry or eligibility
            decision.
          </p>
        </aside>
      </section>

      <section
        className={styles.pathwaySection}
        aria-labelledby="pathway-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>A proposed pathway</p>
            <h2 id="pathway-title">
              From curiosity to a verified competition route
            </h2>
            <p>
              The sequence describes questions to resolve, not a programme
              delivered by this initiative. A person may pause, repeat or leave
              the pathway at any point.
            </p>
          </div>
          <ol className={styles.pathway}>
            {athletePathway.map((stage) => (
              <li key={stage.step}>
                <div className={styles.stepMarker}>
                  <span>{stage.step}</span>
                </div>
                <div className={styles.stepContent}>
                  <p className={styles.stepStatus}>{stage.status}</p>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={`container ${styles.partnerSection}`}
        aria-labelledby="partner-title"
      >
        <div className={styles.partnerHeading}>
          <p className={styles.kicker}>Finding a partner</p>
          <h2 id="partner-title">Compatibility is more than a category</h2>
          <p>
            No matching or introduction service operates here. These prompts are
            for conversations with a coach, prospective partner and, where
            relevant, a parent or guardian.
          </p>
        </div>
        <div className={styles.partnerGrid}>
          {partnerConsiderations.map((consideration, index) => (
            <article key={consideration.title}>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{consideration.title}</h3>
              <p>{consideration.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.expectationsSection}
        aria-labelledby="expectations-title"
      >
        <div className={`container ${styles.expectationsGrid}`}>
          <div>
            <p className={styles.inverseKicker}>Clear expectations</p>
            <h2 id="expectations-title">Interest does not create status</h2>
          </div>
          <ul>
            {athleteExpectations.map((expectation) => (
              <li key={expectation}>{expectation}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={`container ${styles.supportSection}`}
        aria-labelledby="support-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Coaching and welfare</p>
          <h2 id="support-title">Progress needs people and protections</h2>
        </div>
        <div className={styles.supportGrid}>
          {[coachingExpectation, welfareExpectation].map((expectation) => (
            <article key={expectation.title}>
              <h3>{expectation.title}</h3>
              <p>{expectation.description}</p>
            </article>
          ))}
        </div>
        <ButtonLink href="/coaches-and-judges/" variant="secondary">
          Review proposed professional standards
        </ButtonLink>
      </section>

      <section
        className={`container ${styles.profilesSection}`}
        aria-labelledby="profiles-title"
      >
        <div className={styles.profileHeading}>
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Public profiles</p>
            <h2 id="profiles-title">
              Permission and verification before visibility
            </h2>
            <p>
              If profiles are published later, inclusion will describe only the
              verified relationship shown on that profile.
            </p>
          </div>
          <ul className={styles.standardList}>
            {profilePublicationStandard.map((standard) => (
              <li key={standard}>{standard}</li>
            ))}
          </ul>
        </div>

        {profiles.length === 0 ? (
          <EmptyState
            title="No athlete profiles are published"
            description="Profiles will appear only with the person’s permission and after relevant details are checked. This absence is not evidence of a team, selection process, ranking or lack of athlete activity elsewhere."
            action={
              <ButtonLink href="/join/" variant="quiet">
                Express athlete interest
              </ButtonLink>
            }
          />
        ) : (
          <div className={styles.profileGrid}>
            {profiles.map((profile) => (
              <article key={profile.slug}>
                <p>{profile.relationshipLabel}</p>
                <h3>
                  <Link href={`/athletes/${profile.slug}/`}>
                    {profile.publicName}
                  </Link>
                </h3>
                <p>{profile.disciplines.join(" · ")}</p>
                <small>
                  Last verified {profile.publication.lastVerifiedOn}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        className={`container ${styles.voiceSection}`}
        aria-labelledby="voice-title"
      >
        <div>
          <p className={styles.kicker}>Participant voice</p>
          <h2 id="voice-title">
            Interest can inform a proposal, not approve it
          </h2>
          <p>
            A future representation model would need transparent eligibility,
            accessible participation, conflict handling and published decision
            limits. None is claimed to exist today.
          </p>
        </div>
        <ButtonLink href="/governance/" variant="secondary">
          Read profile and governance standards
        </ButtonLink>
      </section>
    </div>
  );
}
