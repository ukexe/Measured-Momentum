import { PerformanceFigure } from "@/components/media/performance-figure";
import { athleteDevelopmentObjectives } from "@/content/home";

import styles from "@/app/home.module.css";

export function AthleteObjectives() {
  return (
    <section
      className={`container ${styles.objectives}`}
      aria-labelledby="objectives-title"
    >
      <header className={styles.objectivesHeading}>
        <p className={styles.eyebrow}>Athlete development</p>
        <h2 id="objectives-title">
          Create the conditions for athletes to develop
        </h2>
        <p>
          The long-term concept begins with structured progression, capable
          coaching, workable partnerships and safe development. These are
          foundations to investigate—not a current training, coaching or
          selection offer.
        </p>
      </header>

      <div className={styles.objectivesBody}>
        <PerformanceFigure
          alt="A wide stage formation arranged in layered lines and coordinated movement."
          caption="A supplied formation image illustrating coordination only; no programme, team, selection or proposal relationship is implied."
          className={styles.objectivesMedia}
          label="Coordination study"
          objectPosition="50% 42%"
          sizes="(max-width: 56rem) 100vw, 48vw"
          src="/media/performance/formation-wide.webp"
        />

        <ol className={styles.objectiveList}>
          {athleteDevelopmentObjectives.map((objective) => (
            <li key={objective.count}>
              <span className={styles.objectiveCount} aria-hidden="true">
                {objective.count}
              </span>
              <div>
                <h3>{objective.title}</h3>
                <p>{objective.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
