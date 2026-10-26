type RouteMetadata = {
  readonly title: string;
  readonly description: string;
  readonly pathname: `/${string}/`;
};

export type ProposalStatusItem = {
  readonly label: string;
  readonly status: string;
  readonly detail: string;
};

export type ProposalValue = {
  readonly title: string;
  readonly description: string;
};

export type DevelopmentStage = {
  readonly step: string;
  readonly title: string;
  readonly description: string;
};

export const aboutMetadata = {
  title: "About the proposal",
  description:
    "Why this proposed initiative in India is being explored, what exists now and what remains in development.",
  pathname: "/about/",
} as const satisfies RouteMetadata;

export const proposalStatus: readonly ProposalStatusItem[] = [
  {
    label: "Working identity",
    status: "Descriptor only",
    detail:
      "Acrobatic Rock ’n’ Roll + Boogie Woogie in India describes the subject of this proposal. It is not a verified legal name.",
  },
  {
    label: "Entity and authority",
    status: "Not established",
    detail:
      "No legal entity, governing authority, representative mandate or decision right is claimed.",
  },
  {
    label: "Recognition and relationships",
    status: "None claimed",
    detail:
      "No governmental, sporting or international recognition, affiliation, sanction or partnership is presented.",
  },
  {
    label: "People and programmes",
    status: "Not operating",
    detail:
      "No office-bearers, team, courses, selections, events or athlete programmes have been approved for publication.",
  },
] as const;

export const proposalRationale = {
  title: "The question behind the proposal",
  paragraphs: [
    "This proposal exists to test whether a useful, accountable structure could help people in India understand and participate in these two disciplines.",
    "That question is not yet an answer. No consultation summary or evidence of a representative mandate has been published, so this website does not claim that a particular organisational model is needed or agreed.",
  ],
} as const;

export const proposalMission = {
  label: "Proposed mission",
  title: "Make participation clearer and development more accountable",
  description:
    "Explore how reliable information, progressive learning, athlete welfare and transparent decision-making could support the disciplines without overstating present capacity or authority.",
} as const;

export const proposalVision = {
  label: "Proposed vision",
  title: "A path that is energetic, safe and inspectable",
  description:
    "People should be able to understand the disciplines, assess a next step and see who is responsible for each decision. This is an ambition for future work, not a description of a programme operating today.",
} as const;

export const proposalValues: readonly ProposalValue[] = [
  {
    title: "Truth before scale",
    description:
      "Publish a smaller, sourced statement rather than imply activity, reach or status that does not exist.",
  },
  {
    title: "Welfare before progression",
    description:
      "Treat consent, safeguarding, suitable supervision and progressive practice as foundations rather than add-ons.",
  },
  {
    title: "Athlete voice with evidence",
    description:
      "Create future participation routes that can be explained, reviewed and changed without inventing representation now.",
  },
  {
    title: "Open decisions",
    description:
      "Show the status, basis and limits of important decisions, subject to legitimate privacy and safety boundaries.",
  },
  {
    title: "Access in practical terms",
    description:
      "Consider geography, cost, language and disability through real research, not decorative claims of inclusion.",
  },
  {
    title: "Consent before visibility",
    description:
      "Publish no person, profile, result or relationship without permission and verification appropriate to the claim.",
  },
] as const;

export const intendedScope = [
  {
    title: "Orientation and education",
    description:
      "Clear introductions, source links and future learning standards that distinguish information from instruction.",
  },
  {
    title: "Participation development",
    description:
      "Research into realistic entry points, partnered progression and local access before any programme is offered.",
  },
  {
    title: "Standards dialogue",
    description:
      "A transparent way to examine coaching, judging, welfare and competition requirements with qualified contributors.",
  },
  {
    title: "Athlete voice",
    description:
      "Future methods for participants to shape priorities without implying that anyone currently represents a wider group.",
  },
  {
    title: "Source-led public information",
    description:
      "Dated references, correction routes and relationship labels that help visitors distinguish fact from intention.",
  },
] as const;

export const statusHorizon = [
  {
    label: "Current",
    title: "An information proposal",
    description:
      "The website can explain intended principles, publish bounded source links and disclose what is absent. It does not deliver training, selection, certification or governance authority.",
  },
  {
    label: "Possible future",
    title: "Work that must earn its status",
    description:
      "Consultation, policies, participation models, verified profiles and formal structures may be explored only through documented review, responsibility and publication gates.",
  },
] as const;

export const developmentSequence: readonly DevelopmentStage[] = [
  {
    step: "01",
    title: "Listen and map needs",
    description:
      "Gather bounded input from prospective participants and subject-matter contributors without treating interest as endorsement.",
  },
  {
    step: "02",
    title: "Draft welfare and governance foundations",
    description:
      "Define safeguarding, consent, conflicts, complaints, privacy and decision responsibilities before activity is opened.",
  },
  {
    step: "03",
    title: "Publish criteria for review",
    description:
      "Label drafts, sources, accountable roles and open questions so feedback concerns a visible proposal rather than an implied decision.",
  },
  {
    step: "04",
    title: "Test participation models carefully",
    description:
      "Assess access, coaching capacity and welfare controls before describing a pathway as available.",
  },
  {
    step: "05",
    title: "Decide legal and operational form",
    description:
      "Choose a structure only after appropriate evidence, advice and decision records exist.",
  },
  {
    step: "06",
    title: "Seek relationships through documented processes",
    description:
      "Describe any future relationship only in the exact scope and status confirmed by the relevant parties.",
  },
] as const;

export const transparencyNote = {
  title: "Changes should leave a trail",
  description:
    "Material updates should identify what changed, what did not and which source or decision supports the new wording. Factual concerns can be sent through the contact route; no confidential safeguarding report should be sent through a general correction enquiry.",
  correctionHref: "/contact/",
  governanceHref: "/governance/",
} as const;
