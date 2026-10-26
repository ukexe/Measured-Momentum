import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  disciplineOrientation,
  disciplines,
  disciplinesMetadata,
  ruleSources,
  safetyBoundary,
  sharedFoundations,
  sourceBoundary,
} from "@/content/disciplines";
import { createPageMetadata } from "@/lib/seo";

import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata(disciplinesMetadata);

export default function DisciplinesPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <PageHeader
          eyebrow="The disciplines · High-level orientation"
          title="Two disciplines. Rhythm in different forms."
          description="Acrobatic rock ’n’ roll and boogie woogie share musical energy and partnered movement, but their technique, character and competition formats differ."
        />

        <aside className={styles.orientationNote}>
          <p className={styles.noteLabel}>Read this first</p>
          <h2>{disciplineOrientation.title}</h2>
          <p>{disciplineOrientation.description}</p>
        </aside>
      </section>

      <nav className={styles.jumpNav} aria-label="On this page">
        <div className="container">
          <span>Move through the overview</span>
          <ul>
            {disciplines.map((discipline) => (
              <li key={discipline.id}>
                <a href={`#${discipline.id}`}>{discipline.name}</a>
              </li>
            ))}
            <li>
              <a href="#safety">Safety boundary</a>
            </li>
            <li>
              <a href="#rule-sources">Rule sources</a>
            </li>
          </ul>
        </div>
      </nav>

      <section className={`container ${styles.disciplineStack}`}>
        {disciplines.map((discipline) => (
          <article
            className={styles.discipline}
            id={discipline.id}
            key={discipline.id}
          >
            <div className={styles.disciplineIntro}>
              <p className={styles.disciplineNumber} aria-hidden="true">
                {discipline.number}
              </p>
              <p className={styles.kicker}>Discipline orientation</p>
              <h2>{discipline.name}</h2>
              <p className={styles.lead}>{discipline.introduction}</p>
              <p className={styles.boundary}>{discipline.boundary}</p>
            </div>

            <div className={styles.disciplineDetails}>
              <section aria-labelledby={`${discipline.id}-characteristics`}>
                <h3 id={`${discipline.id}-characteristics`}>
                  Defining characteristics
                </h3>
                <ul>
                  {discipline.characteristics.map((characteristic) => (
                    <li key={characteristic}>{characteristic}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby={`${discipline.id}-skills`}>
                <h3 id={`${discipline.id}-skills`}>Athlete skills</h3>
                <ul>
                  {discipline.athleteSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        ))}
      </section>

      <section
        className={styles.foundationsSection}
        aria-labelledby="shared-foundations-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Across both disciplines</p>
            <h2 id="shared-foundations-title">
              Shared foundations, distinct form
            </h2>
            <p>
              Similar foundations do not make the disciplines interchangeable.
              Their technique and competition expectations should be learned in
              the relevant context.
            </p>
          </div>
          <ul className={styles.foundationRail}>
            {sharedFoundations.map((foundation, index) => (
              <li key={foundation.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{foundation.title}</h3>
                <p>{foundation.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={styles.safetySection}
        id="safety"
        aria-labelledby="safety-title"
      >
        <div className={`container ${styles.safetyGrid}`}>
          <div>
            <p className={styles.inverseKicker}>Safety boundary</p>
            <h2 id="safety-title">{safetyBoundary.title}</h2>
          </div>
          <div className={styles.safetyCopy}>
            {safetyBoundary.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`container ${styles.sourcesSection}`}
        id="rule-sources"
        aria-labelledby="sources-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Authoritative references</p>
          <h2 id="sources-title">Read rules from their owner</h2>
          <p>
            This orientation deliberately avoids reproducing technical rules.
            Use the source indexes below and confirm the current document,
            version and event requirements.
          </p>
        </div>

        <ul className={styles.sourceList}>
          {ruleSources.map((source) => (
            <li key={source.url}>
              <div>
                <p className={styles.sourceOwner}>{source.owner}</p>
                <h3>
                  <a href={source.url}>{source.label}</a>
                </h3>
                <p>{source.scope}</p>
              </div>
              <p className={styles.accessDate}>
                Accessed <time dateTime="2026-10-25">{source.accessedOn}</time>
              </p>
            </li>
          ))}
        </ul>
        <p className={styles.sourceBoundary}>{sourceBoundary}</p>
      </section>

      <section
        className={`container ${styles.nextStep}`}
        aria-labelledby="next-step-title"
      >
        <div>
          <p className={styles.kicker}>A careful next step</p>
          <h2 id="next-step-title">Which path interests you?</h2>
          <p>
            You do not need to assess your own category or readiness here.
            Registering interest records a preference only; it does not create
            membership, coaching, placement or competition eligibility.
          </p>
        </div>
        <div className={styles.actions}>
          <ButtonLink href="/join/">Register athlete interest</ButtonLink>
          <ButtonLink href="/coaches-and-judges/" variant="secondary">
            Read about coaches and judges
          </ButtonLink>
          <ButtonLink href="/contact/" variant="quiet">
            Ask a discipline question
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
