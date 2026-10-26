type RouteMetadata = {
  readonly title: string;
  readonly description: string;
  readonly pathname: `/${string}/`;
};

export type AthleteDiscipline = "Acrobatic Rock ’n’ Roll" | "Boogie Woogie";

export const athleteProfileCorrectionHref = "/contact/" as const;

export type AthleteAchievement = {
  readonly title: string;
  readonly event: string;
  readonly category: string;
  readonly date: string;
  readonly sourceLabel: string;
  readonly sourceUrl: `https://${string}`;
};

export type AthleteProfile = {
  readonly slug: string;
  readonly publicName: string;
  readonly disciplines: readonly AthleteDiscipline[];
  readonly roleLabel: string;
  readonly relationshipLabel: string;
  readonly generalLocation?: string;
  readonly portrait?: {
    readonly src: `/${string}`;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
    readonly credit: string;
    readonly consentExpiresOn?: string;
  };
  readonly biography: string;
  readonly practicePerspective?: string;
  readonly achievements: readonly AthleteAchievement[];
  readonly sources: readonly {
    readonly label: string;
    readonly url: `https://${string}`;
    readonly checkedOn: string;
  }[];
  readonly publication: {
    readonly state: "verified-for-publication";
    readonly consent: "recorded";
    readonly lastVerifiedOn: string;
    readonly reviewerRole: string;
    readonly correctionHref: typeof athleteProfileCorrectionHref;
  };
};

export type PublicPeopleProfile = {
  readonly slug: string;
  readonly publicName: string;
  readonly relationshipLabel: string;
  readonly scope: string;
  readonly term: string;
  readonly decisionRights: string;
  readonly lastVerifiedOn: string;
};

export const athletesMetadata = {
  title: "Athletes and participant pathways",
  description:
    "A proposed athlete pathway, welfare expectations and the current empty profile state for an initiative in development.",
  pathname: "/athletes/",
} as const satisfies RouteMetadata;

export const coachesAndJudgesMetadata = {
  title: "Coaches and judges",
  description:
    "Proposed education, verification and welfare ambitions for coaches and judges; no appointments or certifications are offered.",
  pathname: "/coaches-and-judges/",
} as const satisfies RouteMetadata;

export const teamMetadata = {
  title: "People and accountability",
  description:
    "Proposed role labels and publication rules for an initiative in development, with no public roster or vacancies implied.",
  pathname: "/team/",
} as const satisfies RouteMetadata;

/**
 * This module must contain public, consented records only. Draft or withdrawn
 * personal data does not belong in source control.
 */
export const athleteProfiles: readonly AthleteProfile[] = [];

export const coachAndJudgeProfiles: readonly PublicPeopleProfile[] = [];

export const teamProfiles: readonly PublicPeopleProfile[] = [];

const publicSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getVerifiedAthleteProfiles(): readonly AthleteProfile[] {
  return athleteProfiles.filter(
    (profile) =>
      profile.publication.state === "verified-for-publication" &&
      profile.publication.consent === "recorded" &&
      publicSlugPattern.test(profile.slug),
  );
}

export function getVerifiedAthleteProfile(
  slug: string,
): AthleteProfile | undefined {
  return getVerifiedAthleteProfiles().find((profile) => profile.slug === slug);
}

export function getAthleteStaticParams(): { slug: string }[] {
  return getVerifiedAthleteProfiles().map(({ slug }) => ({ slug }));
}

export const athletePathway = [
  {
    step: "01",
    title: "Discover",
    description:
      "Compare the disciplines, watch source material critically and identify questions about access, age, health, cost and location.",
    status: "Information only",
  },
  {
    step: "02",
    title: "Build foundations",
    description:
      "Develop rhythm, movement quality, conditioning and partner communication with a suitably competent coach.",
    status: "Requires an independent provider",
  },
  {
    step: "03",
    title: "Form a workable partnership",
    description:
      "Explore compatible goals, availability, boundaries and progression with no promise of a match or placement from this proposal.",
    status: "No matching service operates here",
  },
  {
    step: "04",
    title: "Progress through coached practice",
    description:
      "Use category-appropriate technical work and, where relevant, carefully supervised acrobatic progression.",
    status: "No training programme operates here",
  },
  {
    step: "05",
    title: "Assess competition readiness",
    description:
      "A coach and athlete would need to review current rules, welfare, consistency and event-specific eligibility before entry.",
    status: "No selection or approval is provided",
  },
  {
    step: "06",
    title: "Compete through a verified route",
    description:
      "Check the organiser, rule owner, registration route and recognition status directly for each event.",
    status: "No competition pathway is endorsed",
  },
] as const;

export const partnerConsiderations = [
  {
    title: "Shared aims",
    description:
      "Discuss whether each person is exploring social practice, performance, competition or another goal, and revisit that choice.",
  },
  {
    title: "Practical fit",
    description:
      "Compare schedules, travel, costs, coaching access and the pace each person can sustain without pressure.",
  },
  {
    title: "Communication and consent",
    description:
      "Agree how to pause, decline movement, give feedback and resolve disagreement. Consent is specific and can change.",
  },
  {
    title: "Safeguarding context",
    description:
      "For children and young people, contact and training arrangements need guardian involvement and reviewed safeguarding controls.",
  },
] as const;

export const athleteExpectations = [
  "Registering interest is not membership, selection, a training place or a partner match.",
  "No person should be asked to share identity documents, medical details, certificates or a child’s direct contact through a general interest route.",
  "Competition eligibility and category decisions must come from the current rule owner and event organiser, not this overview.",
  "Progress is individual. Visibility, prior experience or interest does not establish readiness, ranking or representative status.",
] as const;

export const coachingExpectation = {
  title: "Coaching should make progression legible",
  description:
    "A future athlete pathway would need coaches who can explain purpose, prerequisites, load, alternatives and stop points. Credentials alone would not replace current competence, suitable supervision or an athlete’s right to ask questions.",
} as const;

export const welfareExpectation = {
  title: "Welfare is part of the pathway",
  description:
    "Any future activity would need age-appropriate safeguarding, informed consent, injury-aware progression, rest, privacy, clear reporting routes and freedom from retaliation. Those systems are not yet presented as operational.",
} as const;

export const profilePublicationStandard = [
  "The person has approved the public name, relationship label, biography and any image.",
  "Material claims have named sources and a real verification date.",
  "Location and personal detail are minimised, with stronger protections for minors.",
  "The profile has a correction and withdrawal route.",
  "Publication does not create ranking, selection, endorsement or representative status.",
] as const;

export const professionalAmbitions = [
  {
    audience: "Coaches",
    title: "Progressive teaching with athlete welfare",
    description:
      "A future framework could define discipline knowledge, teaching practice, safe progression, safeguarding, first-response boundaries and continuing learning.",
  },
  {
    audience: "Judges and technical officials",
    title: "Consistent decisions that can be reviewed",
    description:
      "A future framework could address current rules, assessment practice, scoring quality, independence, conflicts, reasons and appeal boundaries.",
  },
] as const;

export const professionalDevelopmentSequence = [
  {
    step: "01",
    title: "Define role competence",
    description:
      "Separate discipline knowledge, teaching or judging practice, welfare duties and role limits before naming levels.",
  },
  {
    step: "02",
    title: "Design learning and mentored practice",
    description:
      "Set clear prerequisites, supervised experience, accessible materials and feedback expectations with qualified review.",
  },
  {
    step: "03",
    title: "Assess evidence consistently",
    description:
      "Use published criteria, trained assessors, conflict controls, records and a review route rather than reputation alone.",
  },
  {
    step: "04",
    title: "Maintain and review standing",
    description:
      "If credentials are ever issued, define scope, expiry, continuing learning, complaints, suspension and withdrawal before launch.",
  },
] as const;

export const credentialVerificationSteps = [
  {
    step: "01",
    title: "Identify the exact claim",
    description:
      "Record the issuer, discipline, course or licence, level, scope and the public wording requested.",
  },
  {
    step: "02",
    title: "Check dates and standing",
    description:
      "Confirm issue and expiry dates, current register status and any continuing-learning requirement with the issuer.",
  },
  {
    step: "03",
    title: "Verify securely",
    description:
      "Use a defined evidence channel. Certificate numbers and identity material should not be exposed by default.",
  },
  {
    step: "04",
    title: "Publish only the supported scope",
    description:
      "State the exact verified credential and date; do not turn course completion into appointment, accreditation or authority.",
  },
] as const;

export const professionalSafeguards = [
  {
    title: "Safeguarding",
    description:
      "Before work with children or adults at risk, any future system would need role-appropriate checks, training, conduct rules and an accountable reporting route.",
  },
  {
    title: "Conflicts of interest",
    description:
      "Coaching, judging, selection, commercial and personal relationships would need declaration, proportionate publication and recusal rules.",
  },
  {
    title: "Review and complaints",
    description:
      "Education and appointment decisions would need reasons, records, correction routes and a review path with appropriate independence.",
  },
] as const;

export const professionalCurrentState = {
  title: "No courses, appointments or certifications are available",
  description:
    "This proposed initiative does not currently run education, examine candidates, recognise prior credentials, appoint officials, certify coaches or publish a professional directory. An interest submission does not create any of those outcomes.",
} as const;

export const roleTaxonomy = [
  {
    label: "Accountable lead",
    meaning:
      "A person with a documented responsibility, defined decisions and a bounded term.",
    publicationGate:
      "Appointment basis, scope, start and end dates, decision rights, conflicts and consent must be publishable.",
  },
  {
    label: "Contributor",
    meaning:
      "A person completing defined work without automatically holding organisational authority.",
    publicationGate:
      "Contribution scope, credit preference, conflicts, consent and any end date must be clear.",
  },
  {
    label: "Adviser",
    meaning:
      "A person offering bounded advice; advice does not itself become a decision or endorsement.",
    publicationGate:
      "Subject area, limits, independence, conflicts and permission to name the relationship must be recorded.",
  },
  {
    label: "Service provider",
    meaning:
      "A person or organisation delivering contracted work without an implied governance role.",
    publicationGate:
      "Service scope, relevant conflicts and permission to publish the relationship must be confirmed.",
  },
] as const;

export const peoplePublicationRules = [
  {
    title: "Authority is explicit",
    description:
      "Every published role states what the person may decide and what remains outside that scope.",
  },
  {
    title: "Basis and term are dated",
    description:
      "The appointment or engagement record supplies a start date, review point and end date where applicable.",
  },
  {
    title: "Consent is revocable",
    description:
      "Public names, biographies and images use recorded permission and a workable correction or withdrawal route.",
  },
  {
    title: "Conflicts are handled",
    description:
      "Relevant interests are declared, reviewed and published at a proportionate level with recusal where needed.",
  },
  {
    title: "Changes are not silent",
    description:
      "Ended or changed authority is updated promptly without preserving a misleading current title.",
  },
] as const;
