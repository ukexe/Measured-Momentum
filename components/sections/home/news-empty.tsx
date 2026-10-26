import { ButtonLink } from "@/components/ui/button";
import { homeNewsEmpty } from "@/content/home";

import styles from "@/app/home.module.css";

export function NewsEmpty() {
  return (
    <section
      className={`container ${styles.news}`}
      aria-labelledby="updates-title"
    >
      <div className={styles.newsMeasure} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.newsCopy}>
        <p className={styles.eyebrow}>{homeNewsEmpty.label}</p>
        <h2 id="updates-title">{homeNewsEmpty.title}</h2>
        <p>{homeNewsEmpty.body}</p>
        <ButtonLink href="/governance/" variant="secondary">
          Read how status is reported
        </ButtonLink>
      </div>
      <p className={styles.newsIndex} aria-hidden="true">
        00
      </p>
    </section>
  );
}
