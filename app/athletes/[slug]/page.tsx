import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AthleteProfile } from "@/components/sections/people/athlete-profile";
import {
  getAthleteStaticParams,
  getVerifiedAthleteProfile,
} from "@/content/people";
import { createPageMetadata } from "@/lib/seo";

type AthleteProfilePageProps = {
  readonly params: Promise<{
    readonly slug: string;
  }>;
};

export const dynamicParams = false;

const EMPTY_PROFILE_SENTINEL = "profiles-not-published";

export function generateStaticParams(): { slug: string }[] {
  const verifiedParams = getAthleteStaticParams();

  // Next static export rejects an empty params list. The unlinked sentinel is
  // prerendered as the branded 404 and is replaced automatically once a
  // verified, consented profile exists.
  return verifiedParams.length > 0
    ? verifiedParams
    : [{ slug: EMPTY_PROFILE_SENTINEL }];
}

export async function generateMetadata({
  params,
}: AthleteProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getVerifiedAthleteProfile(slug);

  if (!profile) {
    notFound();
  }

  return createPageMetadata({
    title: `${profile.publicName} · Athlete profile`,
    description: `A consented, verified athlete profile published by a proposed initiative in development. ${profile.relationshipLabel}.`,
    pathname: `/athletes/${profile.slug}/`,
  });
}

export default async function AthleteProfilePage({
  params,
}: AthleteProfilePageProps) {
  const { slug } = await params;
  const profile = getVerifiedAthleteProfile(slug);

  if (!profile) {
    notFound();
  }

  return <AthleteProfile profile={profile} />;
}
