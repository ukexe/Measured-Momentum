export const homeHero = {
  status: "Proposed organisation · In development",
  descriptor: "Acrobatic Rock ’n’ Roll + Boogie Woogie in India",
  descriptorLabel: "Working descriptor",
  title: "Movement needs momentum. Progress needs structure.",
  mission:
    "This proposal explores how participation, athlete development and accountable foundations for acrobatic rock ’n’ roll and boogie woogie could be developed in India.",
  nonClaim:
    "Acrobatic Rock ’n’ Roll + Boogie Woogie in India is a working descriptor, not a legal name. No legal, governmental, sporting or international recognition is claimed.",
} as const;

export const homeDisciplines = [
  {
    count: "01",
    name: "Acrobatic Rock ’n’ Roll",
    summary:
      "A partnered discipline that brings musical timing together with athletic movement. Any safe progression would need appropriate instruction, conditioning and staged practice; this introduction is not training guidance.",
    accent: "beat",
  },
  {
    count: "02",
    name: "Boogie Woogie",
    summary:
      "A partnered form shaped by swing music, improvisation and musical interpretation. Its social and competitive contexts have their own character; this introduction is not a rulebook.",
    accent: "balance",
  },
] as const;

export const homeDirection = {
  mission: {
    label: "Proposed mission",
    title: "Make responsible progress easier to understand",
    body: "The proposed initiative aims to connect clear discipline information, participant voice and careful organisational development—without presenting an ambition as an existing service.",
  },
  vision: {
    label: "Working vision",
    title: "Participation supported by trust",
    body: "A future in which people can explore these disciplines through transparent standards, progressive practice, consent and accountable decisions. That future remains conditional, not promised.",
  },
} as const;

export const athleteDevelopmentObjectives = [
  {
    count: "01",
    title: "Orient before asking for commitment",
    body: "Publish clear, sourced introductions so prospective participants can understand the disciplines, their demands and the limits of the information available.",
  },
  {
    count: "02",
    title: "Put welfare into the pathway",
    body: "Explore age-aware, experience-aware progression only alongside safeguarding, qualified supervision, conditioning and appropriate practice environments.",
  },
  {
    count: "03",
    title: "Make athlete voice structural",
    body: "Develop consent, feedback and representation principles before presenting any person as part of a programme, roster or decision process.",
  },
  {
    count: "04",
    title: "Separate learning from status",
    body: "Describe competencies and development needs without implying accreditation, selection, ranking, membership or a national pathway.",
  },
] as const;

export const proposedPathway = {
  label: "Proposed pathway",
  title: "A sequence to examine, not a programme to join",
  status:
    "No training, placement, accreditation or selection pathway is currently offered by this proposal. The sequence below describes questions for future development.",
  steps: [
    {
      count: "1",
      title: "Understand",
      body: "Learn how the disciplines differ, what progressive practice may involve and where verified guidance is still absent.",
    },
    {
      count: "2",
      title: "Prepare",
      body: "Consider rhythm, communication, conditioning, consent and safety before any discipline-specific progression.",
    },
    {
      count: "3",
      title: "Develop",
      body: "If a reviewed framework is established, define staged learning with suitable supervision and transparent expectations.",
    },
    {
      count: "4",
      title: "Participate",
      body: "Only point to verified opportunities when ownership, safeguarding, eligibility and recognition status can be stated clearly.",
    },
  ],
} as const;

export const foundingRecord = {
  label: "Founding story",
  title: "People should appear only with evidence and consent",
  body: "A public founding story is not ready for publication. Any names, biographies, roles, quotations and competition records connected with the proposal are withheld pending verification and publication approval.",
  note: "Their absence is not a statement about any person’s experience, ability or involvement. It is a boundary against publishing unverified claims.",
  heldItems: [
    "Identity, public role and authority",
    "Biography, chronology and qualifications",
    "Competition participation, placements and titles",
  ],
} as const;

export const developmentRoadmap = [
  {
    stage: "Stage A",
    state: "Current · proposed",
    title: "Listen and map",
    body: "The current public position is a proposal to understand needs, evidence, risks and possible contributions. This is not an open programme.",
    current: true,
  },
  {
    stage: "Stage B",
    state: "Future · conditional",
    title: "Draft foundations",
    body: "Would develop safeguarding, governance, privacy, participation and technical principles for accountable review.",
    current: false,
  },
  {
    stage: "Stage C",
    state: "Future · conditional",
    title: "Review and test",
    body: "Would invite bounded consultation and test transparent participation models only when responsible ownership exists.",
    current: false,
  },
  {
    stage: "Stage D",
    state: "Future · conditional",
    title: "Decide the form",
    body: "Would determine whether a legal and operational form is justified, then explore relationships through documented processes.",
    current: false,
  },
] as const;

export const governanceEvidence = [
  {
    subject: "Public identity",
    state: "Working descriptor only",
    detail:
      "The descriptor is descriptive. No final legal name or institutional acronym is presented.",
  },
  {
    subject: "Legal and entity status",
    state: "Not claimed",
    detail:
      "No incorporation, registration, governing authority or membership body status is represented.",
  },
  {
    subject: "Recognition and relationships",
    state: "None claimed",
    detail:
      "No legal, governmental, sporting or international recognition, affiliation, sanction or partnership is claimed.",
  },
  {
    subject: "People and authority",
    state: "Not published",
    detail:
      "No founder, office-bearer, coach, judge, selector or public spokesperson is named without a closed verification record.",
  },
  {
    subject: "Programmes and pathways",
    state: "Not open",
    detail:
      "No training, membership, event, accreditation, selection or placement is offered by this proposal.",
  },
  {
    subject: "Governance documents",
    state: "In development",
    detail:
      "No policy or decision right should be inferred as adopted unless a future publication states that status explicitly.",
  },
] as const;

export const homeNewsEmpty = {
  label: "News and updates",
  title: "No updates have been published yet",
  body: "There is no article, announcement or event to feature. The proposal’s current status is summarised on this page; the governance route explains how future status should be reported.",
} as const;

export const audiencePathways = [
  {
    audience: "Curious newcomers",
    title: "Start with the disciplines",
    body: "Compare the character and shared foundations of acrobatic rock ’n’ roll and boogie woogie.",
    href: "/disciplines/",
    action: "Explore the disciplines",
  },
  {
    audience: "Athletes, dancers and guardians",
    title: "Express an area of interest",
    body: "Use the interest route to understand the available pathways and their privacy boundaries. Interest is not membership or selection.",
    href: "/join/",
    action: "Review interest pathways",
  },
  {
    audience: "Coaches, judges and contributors",
    title: "Offer relevant perspective",
    body: "Registering expertise does not create an appointment, credential, employment relationship or preferred position.",
    href: "/join/",
    action: "Review contribution pathways",
  },
  {
    audience: "Media, researchers and educators",
    title: "Check the publication record",
    body: "The news area is the intended home for dated, contextual updates. It currently contains no published news.",
    href: "/news/",
    action: "Visit news and updates",
  },
  {
    audience: "Institutions and public-interest readers",
    title: "Inspect the status first",
    body: "Review claims, policy states and material absences before drawing a conclusion about the proposal.",
    href: "/governance/",
    action: "Review governance status",
  },
] as const;

export const homeContact = {
  label: "A clear next question",
  title: "Bring evidence, context or a careful challenge",
  body: "Use the contact route for a factual correction, a governance question or relevant context. Check the route before sharing personal or confidential information; no response service should be assumed unless it is explicitly available there.",
} as const;
