import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  peoplePublicationRules,
  roleTaxonomy,
  teamMetadata,
  teamProfiles,
} from "@/content/people";
import { createPageMetadata } from "@/lib/seo";

import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata(teamMetadata);

export default function TeamPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div>
          <PageHeader
            eyebrow="People and accountability · No public roster"
            title="A role should explain who can do what"
            description="This page defines possible relationship labels and the evidence needed before a person is published. It does not state that any role has been created, filled or left vacant."
          />
          <div className="button-row">
            <ButtonLink href="/about/">Understand the proposal</ButtonLink>
            <ButtonLink href="/join/" variant="secondary">
              Register relevant expertise
            </ButtonLink>
          </div>
        </div>
        <aside
          className={styles.roleEquation}
          aria-label="Publication principle"
        >
          <span>Role</span>
          <b aria-hidden="true">+</b>
          <span>Scope</span>
          <b aria-hidden="true">+</b>
          <span>Evidence</span>
          <b aria-hidden="true">+</b>
          <span>Consent</span>
        </aside>
      </section>

      <section
        className={styles.taxonomySection}
        aria-labelledby="taxonomy-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Role taxonomy</p>
            <h2 id="taxonomy-title">Labels with bounded meaning</h2>
            <p>
              These are publication categories, not announced posts. Using a
              label later would require the stated evidence for a real,
              consented relationship.
            </p>
          </div>
          <div className={styles.taxonomyGrid}>
            {roleTaxonomy.map((role, index) => (
              <article key={role.label}>
                <span className={styles.roleNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{role.label}</h3>
                <p>{role.meaning}</p>
                <div>
                  <strong>Publication gate</strong>
                  <p>{role.publicationGate}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`container ${styles.rulesSection}`}
        aria-labelledby="publication-rules-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Publication rules</p>
          <h2 id="publication-rules-title">
            A name follows an accountability record
          </h2>
          <p>
            Visibility is not evidence by itself. The underlying appointment,
            engagement or contribution record must support the exact public
            wording.
          </p>
        </div>
        <ol className={styles.rulesList}>
          {peoplePublicationRules.map((rule, index) => (
            <li key={rule.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.rosterSection} aria-labelledby="roster-title">
        <div className="container">
          <div className={styles.rosterHeading}>
            <div className={styles.sectionHeading}>
              <p className={styles.inverseKicker}>Published roster</p>
              <h2 id="roster-title">Only approved records belong here</h2>
              <p>
                Contributor, adviser, contact and service-provider relationships
                must not be turned into office or authority by presentation.
              </p>
            </div>
            <p className={styles.rosterBoundary}>
              Absence from this page says nothing about whether private
              discussions exist. It also says nothing about vacancies.
            </p>
          </div>

          {teamProfiles.length === 0 ? (
            <EmptyState
              title="No public roster has been approved"
              description="No team profiles are published. Do not infer that roles are filled, vacant, available or not yet created; the only conclusion is that there is no verified public roster here."
              action={
                <ButtonLink href="/about/" variant="quiet">
                  Read the proposal status
                </ButtonLink>
              }
            />
          ) : (
            <div className={styles.profileGrid}>
              {teamProfiles.map((profile) => (
                <article key={profile.slug}>
                  <p>{profile.relationshipLabel}</p>
                  <h3>{profile.publicName}</h3>
                  <dl>
                    <div>
                      <dt>Scope</dt>
                      <dd>{profile.scope}</dd>
                    </div>
                    <div>
                      <dt>Term</dt>
                      <dd>{profile.term}</dd>
                    </div>
                    <div>
                      <dt>Decision rights</dt>
                      <dd>{profile.decisionRights}</dd>
                    </div>
                  </dl>
                  <small>Last verified {profile.lastVerifiedOn}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className={`container ${styles.appointmentSection}`}
        aria-labelledby="appointment-title"
      >
        <div>
          <p className={styles.kicker}>If roles are created</p>
          <h2 id="appointment-title">Appointment should be reportable</h2>
          <p>
            A future process would need published criteria, a decision-maker,
            conflict handling, term and review arrangements, consent, and a
            dated record of what authority was granted. Registering expertise
            would not be an application or appointment.
          </p>
        </div>
        <ButtonLink href="/governance/" variant="secondary">
          Review governance status
        </ButtonLink>
      </section>
    </div>
  );
}
