import Link from "next/link";

import { PerformanceFigure } from "@/components/media/performance-figure";
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

      <div className={styles.disciplineMedia}>
        <PerformanceFigure
          alt="A stage formation using layered positions and synchronized raised hands."
          caption="Supplied performance imagery is used for visual context only. No person shown is represented as part of this proposal."
          className={styles.disciplineMediaPrimary}
          label="Formation study"
          objectPosition="50% 44%"
          sizes="(max-width: 56rem) 100vw, 66vw"
          src="/media/performance/formation-motion.webp"
        />
        <PerformanceFigure
          alt="Two dance partners sharing an expressive close performance moment."
          caption="Partnership and expression, without an identity, event, result or relationship claim."
          className={styles.disciplineMediaSecondary}
          label="Partner detail"
          objectPosition="52% 44%"
          sizes="(max-width: 56rem) 88vw, 28vw"
          src="/media/performance/partner-detail.webp"
        />
      </div>

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
