import Image from "next/image";
import { Fragment } from "react";

import { KineticDuetFallback } from "@/components/three/kinetic-duet-fallback";
import { ButtonLink } from "@/components/ui/button";
import { homeHero } from "@/content/home";

import styles from "./home-hero.module.css";

const titleWords = homeHero.title.split(" ");

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.stageWindow} aria-hidden="true">
        <Image
          alt=""
          className={styles.heroPhoto}
          fill
          priority
          sizes="100vw"
          src="/media/performance/hero-rehearsal.webp"
        />
        <div className={styles.photoWash} />
        <KineticDuetFallback
          className={styles.ribbonOverlay}
          discipline="rock-n-roll"
          palette={{
            brass: "#d9b878",
            ground: "transparent",
            partnerA: "#ff6b86",
            partnerB: "#45d6cc",
          }}
          showBadge={false}
        />
      </div>

      <div className={styles.registrationRail} aria-hidden="true">
        <span>MM / 01</span>
        <span>Rhythm · Partnership · Evidence</span>
        <span>India / Proposal</span>
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true" />
            {homeHero.status}
          </p>
          <p className={styles.descriptor}>
            <span>{homeHero.descriptorLabel}</span>
            {homeHero.descriptor}
          </p>
          <h1 id="home-title" className={styles.title}>
            {titleWords.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <span
                  className={styles.word}
                  data-accent={word.endsWith(".") ? "true" : undefined}
                >
                  <span className={styles.wordInner}>{word}</span>
                </span>
                {index < titleWords.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <div className={styles.heroDetails}>
            <p className={styles.mission}>{homeHero.mission}</p>
            <p className={styles.nonClaim}>{homeHero.nonClaim}</p>
            <div className={styles.actions}>
              <ButtonLink href="/about/">Explore the proposal</ButtonLink>
              <ButtonLink href="/join/" variant="secondary">
                Register interest
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.footerRow}`}>
        <ol className={styles.countRail} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>{index + 1}</li>
          ))}
        </ol>
        <p className={styles.caption}>
          <strong>Supplied rehearsal image</strong>
          <span>
            Illustrative visual context only · no identity, result,
            representation or relationship is claimed
          </span>
        </p>
      </div>
      <div className={styles.scrollCue} aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
