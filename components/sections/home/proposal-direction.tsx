import { homeDirection } from "@/content/home";

import styles from "@/app/home.module.css";

export function ProposalDirection() {
  return (
    <section
      className={styles.direction}
      aria-labelledby="direction-title"
      id="foundation"
    >
      <div className={`container ${styles.directionGrid}`}>
        <header className={styles.directionHeading}>
          <p className={styles.eyebrowInverse}>Intent, held to reality</p>
          <h2 id="direction-title">
            Mission and vision are directions, not claims
          </h2>
          <p>
            These statements describe what the proposal is trying to examine.
            They do not prove an organisation, programme or authority already
            exists.
          </p>
        </header>

        <div className={styles.directionStatements}>
          {[homeDirection.mission, homeDirection.vision].map((statement) => (
            <article key={statement.label}>
              <p className={styles.statementLabel}>{statement.label}</p>
              <h3>{statement.title}</h3>
              <p>{statement.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
