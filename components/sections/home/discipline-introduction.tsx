import Link from "next/link";

import { homeDisciplines } from "@/content/home";

import styles from "@/app/home.module.css";

export function DisciplineIntroduction() {
  return (
    <section
      className={`container ${styles.disciplines}`}
      aria-labelledby="disciplines-title"
    >
      <header className={styles.sectionLead}>
        <p className={styles.eyebrow}>Two disciplines</p>
        <h2 id="disciplines-title">
          Distinct character. Shared responsibility.
        </h2>
        <p>
          Both disciplines combine partnership, timing and physical skill, but
          they should not be flattened into one experience. Begin with an
          orientation, not an assumption.
        </p>
      </header>

      <div className={styles.disciplineList}>
        {homeDisciplines.map((discipline) => (
          <article
            className={styles.discipline}
            data-accent={discipline.accent}
            key={discipline.name}
          >
            <p className={styles.disciplineCount} aria-hidden="true">
              {discipline.count}
            </p>
            <div>
              <h3>{discipline.name}</h3>
              <p>{discipline.summary}</p>
            </div>
          </article>
        ))}
      </div>

      <Link className={styles.arrowLink} href="/disciplines/" prefetch={false}>
        Explore the disciplines <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
