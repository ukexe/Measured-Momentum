import Link from "next/link";

import { audiencePathways } from "@/content/home";

import styles from "@/app/home.module.css";

export function ParticipationPathways() {
  return (
    <section
      className={`container ${styles.participation}`}
      aria-labelledby="participation-title"
    >
      <header className={styles.participationHeading}>
        <p className={styles.eyebrow}>Find an honest next step</p>
        <h2 id="participation-title">
          Different questions need different routes
        </h2>
        <p>
          Reading, registering interest and contributing perspective are
          distinct actions. None creates membership, selection, appointment,
          accreditation, employment or a place in an activity.
        </p>
      </header>

      <ul className={styles.audienceList}>
        {audiencePathways.map((pathway, index) => (
          <li key={pathway.audience}>
            <span className={styles.audienceNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.audienceCopy}>
              <p>{pathway.audience}</p>
              <h3>{pathway.title}</h3>
              <span>{pathway.body}</span>
            </div>
            <Link href={pathway.href} prefetch={false}>
              {pathway.action} <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
