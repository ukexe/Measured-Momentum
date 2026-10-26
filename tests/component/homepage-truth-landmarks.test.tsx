import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/three/kinetic-duet.client", () => ({
  KineticDuet: ({ label }: { readonly label?: string }) => (
    <div aria-label={label} data-testid="kinetic-duet" />
  ),
}));

import HomePage from "@/app/page";

afterEach(cleanup);

describe("homepage truth and landmarks", () => {
  it("states the proposal status and recognition boundary in the hero", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Proposed organisation · In development"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /is a working descriptor, not a legal name\. No legal, governmental, sporting or international recognition is claimed\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("exposes every required homepage section as a named region", () => {
    render(<HomePage />);

    const sectionNames = [
      "Movement needs momentum. Progress needs structure.",
      "Distinct character. Shared responsibility.",
      "Mission and vision are directions, not claims",
      "Build the conditions before the programme",
      "A sequence to examine, not a programme to join",
      "People should appear only with evidence and consent",
      "Four stages, one current position",
      "Trust starts with the material absences",
      "No updates have been published yet",
      "Different questions need different routes",
      "Bring evidence, context or a careful challenge",
    ];

    for (const name of sectionNames) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  it("uses implemented editorial routes for homepage actions", () => {
    render(<HomePage />);

    const linkedPaths = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[href]"),
      (link) => `${link.getAttribute("href")?.replace(/\/+$/, "")}/`,
    );

    for (const href of [
      "/about/",
      "/disciplines/",
      "/join/",
      "/governance/",
      "/contact/",
      "/news/",
    ]) {
      expect(linkedPaths).toContain(href);
    }
  });
});
