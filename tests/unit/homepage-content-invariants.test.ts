import { describe, expect, it } from "vitest";

import {
  developmentRoadmap,
  foundingRecord,
  governanceEvidence,
  homeHero,
  proposedPathway,
} from "@/content/home";

describe("homepage content invariants", () => {
  it("keeps the working descriptor and non-recognition statement explicit", () => {
    expect(homeHero.status).toBe("Proposed organisation · In development");
    expect(homeHero.descriptorLabel).toBe("Working descriptor");
    expect(homeHero.nonClaim).toContain("not a legal name");
    expect(homeHero.nonClaim).toContain(
      "No legal, governmental, sporting or international recognition is claimed.",
    );
  });

  it("publishes no unverified founding biography or competition record", () => {
    expect(foundingRecord.body).toContain(
      "withheld pending verification and publication approval",
    );
    expect(foundingRecord.heldItems).toEqual(
      expect.arrayContaining([
        "Biography, chronology and qualifications",
        "Competition participation, placements and titles",
      ]),
    );
  });

  it("marks only Stage A as current and keeps later stages conditional", () => {
    const currentStages = developmentRoadmap.filter((stage) => stage.current);

    expect(currentStages).toHaveLength(1);
    expect(currentStages[0]?.stage).toBe("Stage A");
    expect(currentStages[0]?.state).toBe("Current · proposed");

    for (const stage of developmentRoadmap.slice(1)) {
      expect(stage.state).toBe("Future · conditional");
    }
  });

  it("does not present the proposed pathway as an available service", () => {
    expect(proposedPathway.status).toContain(
      "No training, placement, accreditation or selection pathway is currently offered",
    );
    expect(
      governanceEvidence.find(
        ({ subject }) => subject === "Programmes and pathways",
      )?.state,
    ).toBe("Not open");
  });
});
