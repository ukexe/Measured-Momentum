import { ImageResponse } from "next/og";

import { SocialCard } from "@/components/ui/social-card";
import { siteConfig } from "@/content/site";

export const alt = siteConfig.socialImageAlt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const dynamic = "force-static";

export default function TwitterImage() {
  return new ImageResponse(<SocialCard />, size);
}
