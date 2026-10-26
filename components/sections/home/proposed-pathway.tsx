import { proposedPathway } from "@/content/home";

import styles from "@/app/home.module.css";

export function ProposedPathway() {
  return (
    <section className={styles.pathway} aria-labelledby="pathway-title">
      <div className="container">
        <header className={styles.pathwayHeading}>
          <p className={styles.eyebrow}>{proposedPathway.label}</p>
          <h2 id="pathway-title">{proposedPathway.title}</h2>
          <p>{proposedPathway.status}</p>
        </header>

        <ol className={styles.pathwaySteps}>
          {proposedPathway.steps.map((step) => (
            <li key={step.count}>
              <span className={styles.pathwayCount} aria-hidden="true">
                {step.count}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
