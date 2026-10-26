import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  competitionListingFields,
  competitionListings,
  competitionRelationshipLabels,
  competitionSanctionLabels,
} from "@/content/competitions";
import { siteConfig } from "@/content/site";

import styles from "./activity-pages.module.css";

export function CompetitionsPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <PageHeader
          eyebrow={siteConfig.statusLine}
          title="Competition information, clearly sourced"
          description="When verified information is available, this archive may distinguish independent events from any future activity of the proposal. A listing would not, by itself, mean endorsement, sanction, ranking or a route to selection."
        />
        <aside
          aria-label="Competition listing status"
          className={styles.statusNotice}
        >
          <p className={styles.kicker}>Listing status</p>
          <p>
            <strong>No events or results are published.</strong> Dates,
            organisers and recognition labels will not be inferred from
            announcements or informal reports.
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="competition-list-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Current archive</p>
          <h2 id="competition-list-title">Published competition records</h2>
          <p>
            A record appears here only when its organiser, source, relationship
            and status wording can be shown together.
          </p>
        </div>

        {competitionListings.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyState
              title="No competitions are currently listed"
              description="No event, sanction, result, ranking or selection pathway should be inferred from this page. Verified organiser information will be listed only when it meets the publication standard below."
              action={
                <ButtonLink href="/disciplines/">
                  Read about the disciplines
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <ul className={styles.recordGrid}>
            {competitionListings.map((listing) => (
              <li key={listing.slug}>
                <article className={styles.recordCard}>
                  <p className={styles.recordLabel}>
                    {listing.relationshipStatement}
                  </p>
                  <h3>{listing.eventName}</h3>
                  <dl className={styles.recordDetails}>
                    <div>
                      <dt>Organiser</dt>
                      <dd>{listing.organiser}</dd>
                    </div>
                    <div>
                      <dt>Dates</dt>
                      <dd>
                        <time dateTime={listing.startsOn}>
                          {listing.startsOn}
                        </time>{" "}
                        to{" "}
                        <time dateTime={listing.endsOn}>{listing.endsOn}</time>
                      </dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{listing.location}</dd>
                    </div>
                    <div>
                      <dt>Sanction or recognition</dt>
                      <dd>{listing.sanctionStatement}</dd>
                    </div>
                  </dl>
                  {listing.source.url ? (
                    <a
                      href={listing.source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Visit the organiser-owned source (opens in a new tab)
                    </a>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="listing-standard-title"
        className={styles.inkSection}
      >
        <div className="container">
          <div className={styles.inverseHeading}>
            <p className={styles.inverseKicker}>Publication standard</p>
            <h2 id="listing-standard-title">
              What every future record must disclose
            </h2>
            <p>
              Cards will keep these fields visible without requiring a visitor
              to infer ownership or status.
            </p>
          </div>

          <dl className={styles.fieldGrid}>
            {competitionListingFields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="relationship-labels-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Relationship labels</p>
          <h2 id="relationship-labels-title">
            A listing must say who is responsible
          </h2>
          <p>
            These definitions are publication rules, not claims that any present
            event or relationship exists.
          </p>
        </div>

        <ul className={styles.definitionGrid}>
          {competitionRelationshipLabels.map((item) => (
            <li key={item.value}>
              <h3>{item.label}</h3>
              <p>{item.definition}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="sanction-labels-title"
        className={styles.sandSection}
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Sanction and recognition labels</p>
            <h2 id="sanction-labels-title">
              Quote the source, or publish no claim
            </h2>
            <p>
              “Sanctioned”, “official”, “national” and similar terms require a
              named source, scope and check date.
            </p>
          </div>

          <dl className={styles.labelList}>
            {competitionSanctionLabels.map((item) => (
              <div key={item.value}>
                <dt>{item.label}</dt>
                <dd>{item.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="competition-corrections-title"
        className={`container ${styles.actionSection}`}
      >
        <div>
          <p className={styles.kicker}>Listings and corrections</p>
          <h2 id="competition-corrections-title">
            Send a source, not a promotional claim
          </h2>
          <p>
            Use the contact route for a factual listing query or correction.
            Publication is not guaranteed and would not create endorsement.
          </p>
        </div>
        <ButtonLink href="/contact/" variant="secondary">
          Contact about a listing
        </ButtonLink>
      </section>
    </div>
  );
}
