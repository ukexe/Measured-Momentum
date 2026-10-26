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
        <h2 id="objectives-title">Build the conditions before the programme</h2>
        <p>
          Athlete development is an intended area of work. These objectives
          identify foundations to investigate; they are not a current training,
          coaching or selection offer.
        </p>
      </header>

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
    </section>
  );
}
