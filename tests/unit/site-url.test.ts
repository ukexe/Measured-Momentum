import { describe, expect, it } from "vitest";

import { validateBuildEnvironment } from "@/lib/build-environment";
import { createRobotsMetadata } from "@/lib/seo";
import {
  FALLBACK_SITE_URL,
  absoluteUrl,
  normaliseSiteUrl,
} from "@/lib/site-url";

describe("canonical URL handling", () => {
  it("uses the documented safe fallback for missing and invalid values", () => {
    expect(normaliseSiteUrl("").toString()).toBe(`${FALLBACK_SITE_URL}/`);
    expect(normaliseSiteUrl("not a URL").toString()).toBe(
      `${FALLBACK_SITE_URL}/`,
    );
    expect(normaliseSiteUrl("http://public.example").toString()).toBe(
      `${FALLBACK_SITE_URL}/`,
    );
  });

  it("keeps only a safe origin and preserves route trailing slashes", () => {
    expect(
      normaliseSiteUrl("https://site.example/path?q=1#part").toString(),
    ).toBe("https://site.example/");
    expect(absoluteUrl("/about/", "https://site.example/base")).toBe(
      "https://site.example/about/",
    );
  });
});

describe("build environment guard", () => {
  it("allows the fail-closed development defaults", () => {
    expect(() => validateBuildEnvironment({})).not.toThrow();
    expect(() =>
      validateBuildEnvironment({
        NEXT_PUBLIC_SITE_ENV: "development",
        NEXT_PUBLIC_SITE_URL: "https://example.invalid",
      }),
    ).not.toThrow();
  });

  it("rejects mistyped or incomplete release environments", () => {
    expect(() =>
      validateBuildEnvironment({ NEXT_PUBLIC_SITE_ENV: "Production" }),
    ).toThrow(/NEXT_PUBLIC_SITE_ENV/u);
    expect(() =>
      validateBuildEnvironment({ NEXT_PUBLIC_SITE_ENV: "staging" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL is required/u);
    expect(() =>
      validateBuildEnvironment({
        NEXT_PUBLIC_SITE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://example.invalid",
      }),
    ).toThrow(/non-placeholder HTTPS origin/u);
  });

  it("accepts only a clean approved HTTPS origin for production", () => {
    expect(() =>
      validateBuildEnvironment({
        NEXT_PUBLIC_SITE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://sport.example.org",
      }),
    ).not.toThrow();
    expect(() =>
      validateBuildEnvironment({
        NEXT_PUBLIC_SITE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://sport.example.org/path",
      }),
    ).toThrow(/without credentials, path, query or fragment/u);
  });
});

describe("robots metadata", () => {
  it("indexes only explicit production builds", () => {
    expect(createRobotsMetadata(false, "production")).toMatchObject({
      follow: true,
      index: true,
    });
    expect(createRobotsMetadata(false, "staging")).toMatchObject({
      follow: false,
      index: false,
      nocache: true,
    });
  });

  it("honours a route-level no-index in production", () => {
    expect(createRobotsMetadata(true, "production")).toMatchObject({
      follow: false,
      index: false,
    });
  });
});
