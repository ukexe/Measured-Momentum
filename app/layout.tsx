import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusRail } from "@/components/layout/status-rail";
import { StageBackdrop } from "@/components/three/stage-backdrop.client";
import { siteConfig } from "@/content/site";
import {
  createPageMetadata,
  createWebsiteStructuredData,
  serialiseStructuredData,
} from "@/lib/seo";

import "./globals.css";

const homeTitle =
  "Acrobatic Rock ’n’ Roll + Boogie Woogie in India — Proposed initiative";
const websiteStructuredData = serialiseStructuredData(
  createWebsiteStructuredData(),
);

export const metadata: Metadata = {
  ...createPageMetadata({
    title: homeTitle,
    description: siteConfig.shortDescription,
  }),
  applicationName: siteConfig.descriptor,
  category: "information",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: homeTitle,
    template: "%s — Proposed initiative in India",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0c13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <StageBackdrop />
        <StatusRail />
        <SiteHeader />
        <main className="site-main" id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteStructuredData }}
        />
      </body>
    </html>
  );
}
