import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  primaryNavigation,
  siteConfig,
  staticPublicRoutes,
} from "@/content/site";

vi.mock("next/navigation", () => ({
  usePathname: () => "/about/",
}));

afterEach(cleanup);

function normaliseHref(href: string | null): string | null {
  if (!href || href === "/") {
    return href;
  }

  return `${href.replace(/\/+$/, "")}/`;
}

describe("global production navigation", () => {
  it("renders every primary destination and the complete footer sitemap", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    const desktopHrefs = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(".desktop-nav a"),
      (link) => normaliseHref(link.getAttribute("href")),
    );
    const footerHrefs = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(".site-footer a"),
      (link) => normaliseHref(link.getAttribute("href")),
    );

    expect(desktopHrefs).toEqual(primaryNavigation.map(({ href }) => href));
    expect(footerHrefs).toEqual(staticPublicRoutes);
    expect(screen.getAllByText(siteConfig.statusLine).length).toBeGreaterThan(
      1,
    );
    expect(screen.getAllByText(siteConfig.descriptor).length).toBeGreaterThan(
      1,
    );
  });

  it("closes the Radix menu with Escape and restores trigger focus", async () => {
    const user = userEvent.setup();

    render(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Site navigation" });
    expect(within(dialog).getByRole("link", { name: /About/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "Site navigation" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  }, 15_000);
});
