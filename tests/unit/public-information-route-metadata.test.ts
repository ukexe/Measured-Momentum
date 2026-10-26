import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

import { metadata as aboutRouteMetadata } from "@/app/about/page";
import { metadata as athletesRouteMetadata } from "@/app/athletes/page";
import { metadata as coachesRouteMetadata } from "@/app/coaches-and-judges/page";
import { metadata as disciplinesRouteMetadata } from "@/app/disciplines/page";
import { metadata as teamRouteMetadata } from "@/app/team/page";
import {
  aboutMetadata,
  proposalMission,
  proposalStatus,
  proposalVision,
} from "@/content/about";
import {
  disciplineOrientation,
  disciplinesMetadata,
  ruleSources,
  sourceBoundary,
} from "@/content/disciplines";
import {
  athletesMetadata,
  coachesAndJudgesMetadata,
  teamMetadata,
} from "@/content/people";

const routeMetadata: readonly {
  readonly metadata: Metadata;
  readonly pathname: `/${string}/`;
}[] = [
  { metadata: aboutRouteMetadata, pathname: aboutMetadata.pathname },
  {
    metadata: disciplinesRouteMetadata,
    pathname: disciplinesMetadata.pathname,
  },
  { metadata: athletesRouteMetadata, pathname: athletesMetadata.pathname },
  {
    metadata: coachesRouteMetadata,
    pathname: coachesAndJudgesMetadata.pathname,
  },
  { metadata: teamRouteMetadata, pathname: teamMetadata.pathname },
];

describe("public information route metadata", () => {
  it("uses proposed-status descriptions and trailing-slashed canonicals", () => {
    for (const route of routeMetadata) {
      expect(String(route.metadata.description)).toMatch(
        /\b(proposed|in development)\b/i,
      );
      expect(
        new URL(String(route.metadata.alternates?.canonical)).pathname,
      ).toBe(route.pathname);
    }
  });

  it("keeps route metadata paths unique", () => {
    const paths = routeMetadata.map(({ pathname }) => pathname);

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((pathname) => pathname.endsWith("/"))).toBe(true);
  });
});

describe("public information content boundaries", () => {
  it("marks mission and vision as proposals and disclaims authority", () => {
    expect(proposalMission.label).toBe("Proposed mission");
    expect(proposalVision.label).toBe("Proposed vision");
    expect(proposalStatus.map(({ status }) => status)).toContain(
      "None claimed",
    );
    expect(
      proposalStatus.some(({ detail }) =>
        detail.includes("No legal entity, governing authority"),
      ),
    ).toBe(true);
  });

  it("states that discipline content is not rules or training", () => {
    expect(disciplineOrientation.title).toBe("Orientation, not instruction");
    expect(disciplineOrientation.description).toContain("not a rulebook");
    expect(disciplineOrientation.description).toContain("training plan");
  });

  it("links only dated WRRC rule-owner references", () => {
    expect(ruleSources).toHaveLength(3);

    for (const source of ruleSources) {
      expect(new URL(source.url).hostname).toBe("wrrc.dance");
      expect(source.owner).toContain("WRRC");
      expect(source.accessedOn).toBe("25 October 2026");
    }

    expect(sourceBoundary).toContain(
      "do not establish any relationship between WRRC and this proposed initiative",
    );
  });
});
