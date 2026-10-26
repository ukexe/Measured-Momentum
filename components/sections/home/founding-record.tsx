import { foundingRecord } from "@/content/home";

import styles from "@/app/home.module.css";

export function FoundingRecord() {
  return (
    <section
      className={`container ${styles.founding}`}
      aria-labelledby="founding-title"
    >
      <div className={styles.foundingMarker} aria-hidden="true">
        <span>?</span>
      </div>

      <div className={styles.foundingCopy}>
        <p className={styles.eyebrow}>{foundingRecord.label}</p>
        <h2 id="founding-title">{foundingRecord.title}</h2>
        <p className={styles.foundingLead}>{foundingRecord.body}</p>
        <p>{foundingRecord.note}</p>
      </div>

      <div className={styles.heldRecord}>
        <p className={styles.heldRecordTitle}>Held from publication</p>
        <ul>
          {foundingRecord.heldItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Release condition: verified evidence, consent and approval.</p>
      </div>
    </section>
  );
}
