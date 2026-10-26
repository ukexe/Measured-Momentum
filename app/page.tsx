import {
  AthleteObjectives,
  ContactBand,
  DevelopmentRoadmap,
  DisciplineIntroduction,
  FoundingRecord,
  GovernanceEvidence,
  HomeHero,
  NewsEmpty,
  ParticipationPathways,
  ProposalDirection,
  ProposedPathway,
} from "@/components/sections/home";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <HomeHero />
      <DisciplineIntroduction />
      <ProposalDirection />
      <AthleteObjectives />
      <ProposedPathway />
      <FoundingRecord />
      <DevelopmentRoadmap />
      <GovernanceEvidence />
      <NewsEmpty />
      <ParticipationPathways />
      <ContactBand />
    </div>
  );
}
