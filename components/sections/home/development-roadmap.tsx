import { developmentRoadmap } from "@/content/home";

import styles from "@/app/home.module.css";

export function DevelopmentRoadmap() {
  return (
    <section
      className={`container ${styles.roadmap}`}
      aria-labelledby="roadmap-title"
    >
      <header className={styles.roadmapHeading}>
        <p className={styles.eyebrow}>Development roadmap</p>
        <h2 id="roadmap-title">Four stages, one current position</h2>
        <p>
          Stage A is the current proposed stage. Stages B–D are conditional
          directions without promised dates; each depends on evidence,
          accountable ownership and review.
        </p>
      </header>

      <ol className={styles.roadmapList}>
        {developmentRoadmap.map((item) => (
          <li
            aria-current={item.current ? "step" : undefined}
            className={item.current ? styles.roadmapCurrent : undefined}
            key={item.stage}
          >
            <div className={styles.roadmapMeta}>
              <span>{item.stage}</span>
              <strong>{item.state}</strong>
            </div>
            <div className={styles.roadmapCopy}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
