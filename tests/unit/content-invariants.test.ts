import { describe, expect, it } from "vitest";

import {
  foundationNavigation,
  plannedRoutes,
  siteConfig,
} from "@/content/site";

describe("foundation content invariants", () => {
  it("keeps the mandatory descriptor and status line exact", () => {
    expect(siteConfig.descriptor).toBe(
      "Acrobatic Rock ’n’ Roll + Boogie Woogie in India",
    );
    expect(siteConfig.statusLine).toBe(
      "Proposed organisation · In development",
    );
  });

  it("states the non-claim directly", () => {
    expect(siteConfig.statusStatement).toContain("No legal");
    expect(siteConfig.statusStatement).toContain(
      "international recognition is claimed",
    );
  });

  it("keeps planned static routes unique and trailing-slashed", () => {
    expect(new Set(plannedRoutes).size).toBe(plannedRoutes.length);

    for (const route of plannedRoutes) {
      expect(route).toMatch(/^\/.+\/$/);
    }
  });

  it("links the temporary navigation only to implemented destinations", () => {
    expect(foundationNavigation.map(({ href }) => href)).toEqual([
      "/",
      "#status",
      "#foundation",
    ]);
  });
});
