import { describe, expect, it } from "vitest";

import {
  dynamicParams,
  generateStaticParams,
} from "@/app/athletes/[slug]/page";
import {
  athleteProfileCorrectionHref,
  athleteProfiles,
  coachAndJudgeProfiles,
  getAthleteStaticParams,
  getVerifiedAthleteProfile,
  getVerifiedAthleteProfiles,
  teamProfiles,
} from "@/content/people";

describe("public people data", () => {
  it("starts with truthful empty profile and roster arrays", () => {
    expect(athleteProfiles).toEqual([]);
    expect(coachAndJudgeProfiles).toEqual([]);
    expect(teamProfiles).toEqual([]);
  });

  it("publishes only consented, verified athlete records", () => {
    for (const profile of getVerifiedAthleteProfiles()) {
      expect(profile.publication.state).toBe("verified-for-publication");
      expect(profile.publication.consent).toBe("recorded");
      expect(profile.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }

    expect(getVerifiedAthleteProfile("unknown-athlete")).toBeUndefined();
    expect(athleteProfileCorrectionHref).toBe("/contact/");
  });
});

describe("athlete profile static route contract", () => {
  it("disables unknown dynamic params", () => {
    expect(dynamicParams).toBe(false);
  });

  it("uses a build-only sentinel when no verified profile can be exported", () => {
    const verifiedParams = getAthleteStaticParams();
    const generatedParams = generateStaticParams();

    expect(verifiedParams).toEqual([]);
    expect(generatedParams).toEqual([{ slug: "profiles-not-published" }]);
    expect(new Set(generatedParams.map(({ slug }) => slug)).size).toBe(
      generatedParams.length,
    );
  });
});
