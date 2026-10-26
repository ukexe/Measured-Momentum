import { KineticDuet } from "@/components/three/kinetic-duet.client";
import { ButtonLink } from "@/components/ui/button";
import { homeHero } from "@/content/home";

import styles from "@/app/home.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.statusPill}>{homeHero.status}</p>
          <p className={styles.descriptor}>
            <span>{homeHero.descriptorLabel}</span>
            {homeHero.descriptor}
          </p>
          <h1 id="home-title">{homeHero.title}</h1>
          <p className={styles.heroMission}>{homeHero.mission}</p>
          <p className={styles.heroNonClaim}>{homeHero.nonClaim}</p>
          <div className={styles.heroActions}>
            <ButtonLink href="/about/">Explore the proposal</ButtonLink>
            <ButtonLink href="/join/" variant="secondary">
              Register interest
            </ButtonLink>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <KineticDuet
            className={styles.kineticDuet}
            discipline="rock-n-roll"
            label="Two abstract ribbons move in counterbalance across an eight-count measure."
            showPhraseRail
          />
          <div className={styles.countRail} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
          <p className={styles.visualCaption}>
            Abstract counterbalance · decorative, not instructional
          </p>
        </div>
      </div>
    </section>
  );
}
