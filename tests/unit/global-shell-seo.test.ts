import { afterEach, describe, expect, it, vi } from "vitest";

import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  indexablePublicRoutes,
  policyNavigation,
  primaryNavigation,
  siteConfig,
  staticPublicRoutes,
} from "@/content/site";
import {
  createPageMetadata,
  createWebsiteStructuredData,
  serialiseStructuredData,
} from "@/lib/seo";
import { canonicalUrl } from "@/lib/site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("global navigation destinations", () => {
  it("publishes every primary and policy destination once", () => {
    expect(primaryNavigation.map(({ href }) => href)).toEqual([
      "/",
      "/disciplines/",
      "/athletes/",
      "/coaches-and-judges/",
      "/about/",
      "/governance/",
      "/team/",
      "/competitions/",
      "/news/",
      "/join/",
      "/contact/",
    ]);
    expect(policyNavigation.map(({ href }) => href)).toEqual([
      "/privacy/",
      "/terms/",
    ]);
    expect(siteConfig.statusHref).toBe("/about/#status");
    expect(new Set(staticPublicRoutes).size).toBe(staticPublicRoutes.length);
  });
});

describe("static indexing policy", () => {
  it("allows crawling only for the exact production build value", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://proposal.example");

    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });

    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "Production");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });

    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("lists static public routes without dynamic slugs or API paths", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://proposal.example");

    const urls = sitemap().map(({ url }) => url);

    expect(urls).toEqual(
      indexablePublicRoutes.map(
        (pathname) => `https://proposal.example${pathname}`,
      ),
    );
    expect(urls.join(" ")).not.toMatch(/\[slug\]|\/api\//);
    expect(urls).not.toContain("https://proposal.example/privacy/");
    expect(urls).not.toContain("https://proposal.example/terms/");
  });
});

describe("metadata assets and safe structured data", () => {
  it("provides a local manifest and icon", () => {
    const webManifest = manifest();

    expect(webManifest.start_url).toBe("/");
    expect(webManifest.description).toMatch(/proposal in development/i);
    expect(webManifest.icons).toContainEqual(
      expect.objectContaining({
        src: "/icon.svg",
        type: "image/svg+xml",
      }),
    );
  });

  it("normalises canonical routes and supplies social defaults", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://proposal.example");

    expect(canonicalUrl("/about?source=test#status")).toBe(
      "https://proposal.example/about/",
    );

    const metadata = createPageMetadata({
      title: "About",
      description: "A proposed initiative in development.",
      pathname: "/about/",
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://proposal.example/about/",
    });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        images: expect.any(Array),
      }),
    );
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: "summary_large_image",
      }),
    );
  });

  it("emits only safe WebSite structured data", () => {
    const data = createWebsiteStructuredData("https://proposal.example");
    const serialised = serialiseStructuredData(data);

    expect(data["@type"]).toBe("WebSite");
    expect(serialised).not.toMatch(
      /SportsOrganization|Organization|Person|Event|address|affiliation|sameAs/,
    );
  });
});
