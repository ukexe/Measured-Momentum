import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { AthleteProfile as AthleteProfileRecord } from "@/content/people";

import styles from "./athlete-profile.module.css";

type AthleteProfileProps = {
  readonly profile: AthleteProfileRecord;
};

export function AthleteProfile({ profile }: AthleteProfileProps) {
  return (
    <article className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/athletes/">Athletes</Link>
            </li>
            <li aria-current="page">{profile.publicName}</li>
          </ol>
        </nav>

        <header className={styles.profileHeader}>
          <div>
            <p className={styles.relationship}>{profile.relationshipLabel}</p>
            <h1>{profile.publicName}</h1>
            <p className={styles.disciplineLine}>
              {profile.disciplines.join(" · ")} · {profile.roleLabel}
            </p>
            {profile.generalLocation ? (
              <p className={styles.location}>{profile.generalLocation}</p>
            ) : null}
          </div>
          <dl className={styles.verification}>
            <div>
              <dt>Profile status</dt>
              <dd>Verified for publication</dd>
            </div>
            <div>
              <dt>Last verified</dt>
              <dd>{profile.publication.lastVerifiedOn}</dd>
            </div>
          </dl>
        </header>

        <section
          className={styles.identitySection}
          aria-labelledby="profile-biography-title"
        >
          <div className={styles.portraitFrame}>
            {profile.portrait ? (
              <figure>
                <Image
                  alt={profile.portrait.alt}
                  height={profile.portrait.height}
                  src={profile.portrait.src}
                  width={profile.portrait.width}
                />
                <figcaption>{profile.portrait.credit}</figcaption>
              </figure>
            ) : (
              <div className={styles.portraitAlternative}>
                <span aria-hidden="true">—</span>
                <p>No portrait is published for this profile.</p>
              </div>
            )}
          </div>
          <div className={styles.biography}>
            <p className={styles.kicker}>Approved biography</p>
            <h2 id="profile-biography-title">About this athlete</h2>
            <p>{profile.biography}</p>
          </div>
        </section>

        {profile.practicePerspective ? (
          <section
            className={styles.perspective}
            aria-labelledby="practice-perspective-title"
          >
            <p className={styles.kicker}>Approved perspective</p>
            <h2 id="practice-perspective-title">Practice and preparation</h2>
            <p>{profile.practicePerspective}</p>
          </section>
        ) : null}

        <section
          className={styles.achievements}
          aria-labelledby="verified-achievements-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Source-linked record</p>
            <h2 id="verified-achievements-title">Verified achievements</h2>
          </div>
          {profile.achievements.length === 0 ? (
            <EmptyState
              title="No verified results are listed"
              description="This is not a statement about the person’s experience or ability. A result appears only when its event, category, date and source are verified for publication."
            />
          ) : (
            <ol className={styles.achievementList}>
              {profile.achievements.map((achievement) => (
                <li
                  key={`${achievement.event}-${achievement.category}-${achievement.date}`}
                >
                  <div>
                    <p>{achievement.date}</p>
                    <h3>{achievement.title}</h3>
                    <p>
                      {achievement.event} · {achievement.category}
                    </p>
                  </div>
                  <a href={achievement.sourceUrl}>{achievement.sourceLabel}</a>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section
          className={styles.profileScope}
          aria-labelledby="profile-scope-title"
        >
          <div>
            <p className={styles.kicker}>Profile scope</p>
            <h2 id="profile-scope-title">Publication is not selection</h2>
            <p>
              This consented profile describes only the relationship and
              information stated above. It does not create ranking, endorsement,
              selection, membership or authority to represent India.
            </p>
          </div>
          <div className={styles.actions}>
            <ButtonLink href="/disciplines/">
              Explore the disciplines
            </ButtonLink>
            <ButtonLink
              href={profile.publication.correctionHref}
              variant="secondary"
            >
              Request a factual correction
            </ButtonLink>
          </div>
        </section>
      </div>
    </article>
  );
}
