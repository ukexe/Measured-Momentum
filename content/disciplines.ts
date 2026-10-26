type RouteMetadata = {
  readonly title: string;
  readonly description: string;
  readonly pathname: `/${string}/`;
};

export type DisciplineOverview = {
  readonly id: "acrobatic-rock-n-roll" | "boogie-woogie";
  readonly number: string;
  readonly name: string;
  readonly shortName: string;
  readonly introduction: string;
  readonly characteristics: readonly string[];
  readonly athleteSkills: readonly string[];
  readonly boundary: string;
};

export type RuleSource = {
  readonly label: string;
  readonly owner: string;
  readonly url: `https://${string}`;
  readonly accessedOn: string;
  readonly scope: string;
};

export const disciplinesMetadata = {
  title: "The disciplines",
  description:
    "A high-level orientation to Acrobatic Rock ’n’ Roll and Boogie Woogie from a proposed initiative in development.",
  pathname: "/disciplines/",
} as const satisfies RouteMetadata;

export const disciplineOrientation = {
  title: "Orientation, not instruction",
  description:
    "This page explains broad characteristics only. It is not a rulebook, assessment, training plan or permission to attempt acrobatic movement. Categories, permitted elements and judging requirements depend on the current rules owned by the relevant body.",
} as const;

export const disciplines: readonly DisciplineOverview[] = [
  {
    id: "acrobatic-rock-n-roll",
    number: "01",
    name: "Acrobatic Rock ’n’ Roll",
    shortName: "Rock ’n’ roll",
    introduction:
      "A partnered dance sport shaped by energetic footwork, clear rhythm and athletic movement. Acrobatic content varies by class and category; it is one part of a performance that also depends on dance quality, timing and partnership.",
    characteristics: [
      "Fast, precise rhythmic movement and recognisable rock ’n’ roll technique",
      "Choreographed partnership, spacing and transitions",
      "Athletic and acrobatic demands that vary under category-specific rules",
      "Competition presentation assessed under a defined technical framework",
    ],
    athleteSkills: [
      "Rhythm, coordination and repeatable footwork",
      "Partner communication, timing and spatial awareness",
      "Strength, mobility, landing control and conditioning",
      "Patient progression under suitably competent supervision",
    ],
    boundary:
      "The presence of acrobatics does not make every element suitable for every athlete. A written rule allowance is not a personal readiness assessment.",
  },
  {
    id: "boogie-woogie",
    number: "02",
    name: "Boogie Woogie",
    shortName: "Boogie woogie",
    introduction:
      "A partnered dance discipline centred on rhythm, musical interpretation and responsive exchange. Improvisational choices and connection between partners are central to its character, including in competitive settings governed by their own rules.",
    characteristics: [
      "Rhythmic footwork with a grounded, responsive quality",
      "Improvisation and choices shaped by the music being played",
      "A visible lead-and-follow conversation between partners",
      "Social and competition settings with distinct purposes and contexts",
    ],
    athleteSkills: [
      "Listening, timing and recognition of musical structure",
      "Clear connection and adaptable partner communication",
      "Footwork control, balance and movement vocabulary",
      "Stamina, presence and decisions made in the moment",
    ],
    boundary:
      "This overview does not prescribe a style, judging outcome or fixed routine. Current competition requirements belong to the published rules for the relevant event and category.",
  },
] as const;

export const sharedFoundations = [
  {
    title: "Rhythm",
    description:
      "Movement choices need a dependable relationship with timing and musical structure.",
  },
  {
    title: "Partnership",
    description:
      "Clear communication, consent, attention and shared responsibility matter in practice and performance.",
  },
  {
    title: "Progression",
    description:
      "Technical and physical demands should increase only when foundations, supervision and context are suitable.",
  },
  {
    title: "Conditioning",
    description:
      "Strength, mobility, coordination, recovery and repeatability support learning; they do not replace technical coaching.",
  },
  {
    title: "Welfare",
    description:
      "Age, health, experience, environment and individual boundaries must inform any real training decision.",
  },
] as const;

export const safetyBoundary = {
  title: "Do not learn acrobatics from this page",
  paragraphs: [
    "Acrobatic elements can involve falls, impact, lifting and rapid load. They require progressive teaching, a suitable surface and space, agreed communication, appropriate assistance or spotting, and a person competent to assess both partners.",
    "Do not treat a video, diagram, rules document or prior experience in another activity as supervision. Anyone considering training should seek an appropriate local coach and discuss relevant health or access needs with a qualified professional.",
  ],
} as const;

export const ruleSources: readonly RuleSource[] = [
  {
    label: "Rock’n’Roll Rules",
    owner: "World Rock’N’Roll Confederation (WRRC)",
    url: "https://wrrc.dance/rules/rock-n-roll-rules/",
    accessedOn: "25 October 2026",
    scope:
      "Owner-maintained index for Rock’n’Roll rules, scoring material and safety-level documents.",
  },
  {
    label: "Boogie Woogie Rules",
    owner: "World Rock’N’Roll Confederation (WRRC)",
    url: "https://wrrc.dance/rules/boogie-woogie-rules/",
    accessedOn: "25 October 2026",
    scope:
      "Owner-maintained index for Boogie Woogie regulations and judging material.",
  },
  {
    label: "Overall Rules of Competitions",
    owner: "World Rock’N’Roll Confederation (WRRC)",
    url: "https://wrrc.dance/rules/overall-rules-of-competitions/",
    accessedOn: "25 October 2026",
    scope:
      "Owner-maintained index for tournament-wide requirements and definitions.",
  },
] as const;

export const sourceBoundary =
  "These links identify the publisher of the referenced materials. They do not establish any relationship between WRRC and this proposed initiative. Rule pages and documents can change; check the owner’s current version before relying on them.";
