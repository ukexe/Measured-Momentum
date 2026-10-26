import type { Metadata } from "next";

import { siteConfig } from "@/content/site";
import { absoluteUrl, canonicalUrl, normaliseSiteUrl } from "@/lib/site-url";

type PageMetadataInput = {
  readonly title: string;
  readonly description: string;
  readonly pathname?: `/${string}`;
  readonly noIndex?: boolean;
};

export const SOCIAL_IMAGE_PATH = "/opengraph-image" as const;

export function isProductionBuild(
  environment = process.env.NEXT_PUBLIC_SITE_ENV,
): boolean {
  return environment === "production";
}

export function createRobotsMetadata(
  noIndex = false,
  environment = process.env.NEXT_PUBLIC_SITE_ENV,
): Metadata["robots"] {
  const mayIndex = isProductionBuild(environment) && !noIndex;

  return {
    follow: mayIndex,
    index: mayIndex,
    nocache: !mayIndex,
    googleBot: {
      follow: mayIndex,
      index: mayIndex,
      noarchive: !mayIndex,
      noimageindex: !mayIndex,
      nosnippet: !mayIndex,
    },
  };
}

export function createPageMetadata({
  title,
  description,
  pathname = "/",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = canonicalUrl(pathname);
  const socialImage = absoluteUrl(SOCIAL_IMAGE_PATH);

  return {
    metadataBase: normaliseSiteUrl(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: siteConfig.descriptor,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: siteConfig.socialImageAlt,
        },
      ],
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: socialImage,
          alt: siteConfig.socialImageAlt,
        },
      ],
    },
    robots: createRobotsMetadata(noIndex),
  };
}

export function createWebsiteStructuredData(candidate?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.descriptor,
    description: siteConfig.shortDescription,
    url: absoluteUrl("/", candidate),
    inLanguage: "en-IN",
  } as const;
}

export function serialiseStructuredData(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
