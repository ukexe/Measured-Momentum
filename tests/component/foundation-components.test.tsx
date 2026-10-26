import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusRail } from "@/components/layout/status-rail";
import { KineticDuetFallback } from "@/components/three/kinetic-duet-fallback";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

describe("shared foundation components", () => {
  it("keeps proposal status visible and linked to its explanation", () => {
    render(<StatusRail />);

    expect(
      screen.getByRole("complementary", { name: "Proposal status" }),
    ).toHaveTextContent("Proposed organisation · In development");
    expect(
      screen.getByRole("link", { name: "What that means" }),
    ).toHaveAttribute("href", "/about#status");
  });

  it("renders an honest empty state with an optional safe action", () => {
    render(
      <EmptyState
        title="No public profiles"
        description="Nothing has been verified for publication."
        action={<ButtonLink href="/">Return home</ButtonLink>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "No public profiles" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("provides a complete static 3D fallback without a canvas", () => {
    const { container } = render(<KineticDuetFallback />);

    expect(
      screen.getByText(/This decorative visual is not an instructional/),
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });
});
