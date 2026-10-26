import { ButtonLink } from "@/components/ui/button";
import { governanceEvidence } from "@/content/home";

import styles from "@/app/home.module.css";

export function GovernanceEvidence() {
  return (
    <section
      className={styles.evidence}
      aria-labelledby="status-title"
      id="status"
    >
      <div className={`container ${styles.evidenceGrid}`}>
        <header className={styles.evidenceHeading}>
          <p className={styles.eyebrowInverse}>Governance and status</p>
          <h2 id="status-title">Trust starts with the material absences</h2>
          <p>
            This evidence panel states the current publication position. A
            polished website does not establish legal status, authority,
            recognition or activity.
          </p>
          <ButtonLink
            className={styles.evidenceAction ?? ""}
            href="/governance/"
            variant="quiet"
          >
            Review governance status
          </ButtonLink>
        </header>

        <dl className={styles.evidenceList}>
          {governanceEvidence.map((item) => (
            <div key={item.subject}>
              <dt>{item.subject}</dt>
              <dd>
                <strong>{item.state}</strong>
                <span>{item.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
