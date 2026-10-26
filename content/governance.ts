import type { SourceRecord } from "@/types/content";

export const GOVERNANCE_SOURCE_ACCESS_DATE = "25 October 2026";

export const WRRC_DIRECTORY_STATEMENT =
  "The WRRC directory lists “Acrobatic Rock'n'Roll Federation of India” as “On Hold”.";

export const WDSF_DIRECTORY_STATEMENT =
  "WDSF separately lists Amateur DanceSport Federation of India as Full and “Recognised by NOC: No”.";

export const DIRECTORY_RELATIONSHIP_CAUTION =
  "These records do not establish that the two listed entities are identical, that they have a relationship with each other, or that either has a relationship with this proposal.";

export type GovernanceSource = SourceRecord & {
  readonly id: "wrrc-members" | "wdsf-india-member";
  readonly url: string;
  readonly accessedOnLabel: typeof GOVERNANCE_SOURCE_ACCESS_DATE;
};

export const governanceOfficialSources = [
  {
    id: "wrrc-members",
    label: "WRRC members directory",
    url: "https://wrrc.dance/wrrc/members/",
    checkedOn: "2026-10-25",
    accessedOnLabel: GOVERNANCE_SOURCE_ACCESS_DATE,
    ownerRole: "World Rock'N'Roll Confederation",
  },
  {
    id: "wdsf-india-member",
    label: "WDSF member profile for India",
    url: "https://www.worlddancesport.org/Members/Amateur-DanceSport-Federation-of-India-1769",
    checkedOn: "2026-10-25",
    accessedOnLabel: GOVERNANCE_SOURCE_ACCESS_DATE,
    ownerRole: "World DanceSport Federation",
  },
] as const satisfies readonly GovernanceSource[];

export type GovernanceStatusItem = {
  readonly area: string;
  readonly state: string;
  readonly detail: string;
};

export const governanceStatusLedger = [
  {
    area: "Proposal",
    state: "In development",
    detail:
      "This is a proposal for possible future organisational work. It is not presented as an established institution.",
  },
  {
    area: "Legal or entity status",
    state: "Not claimed",
    detail:
      "No incorporated, registered or other legal status is claimed for this proposal.",
  },
  {
    area: "Constitution and bye-laws",
    state: "No adopted document",
    detail:
      "No constitution, bye-laws or governing instrument is presented as adopted.",
  },
  {
    area: "Office-bearers and decision authority",
    state: "Not established",
    detail:
      "No person is presented as an appointed, elected or authorised office-bearer, and no governing mandate is claimed.",
  },
  {
    area: "Recognition and affiliation",
    state: "None claimed",
    detail:
      "No legal, governmental, sporting, NOC or international recognition or affiliation is claimed for this proposal.",
  },
] as const satisfies readonly GovernanceStatusItem[];

export type GovernancePrinciple = {
  readonly title: string;
  readonly detail: string;
};

export const governancePrinciples = [
  {
    title: "Athlete welfare before activity",
    detail:
      "Any future programme should place informed consent, appropriate progression, safeguarding and accessible support ahead of visibility or competitive ambition.",
  },
  {
    title: "Decisions with reasons",
    detail:
      "Material decisions should identify the responsible role, evidence considered, conflicts managed and a dated record of the outcome.",
  },
  {
    title: "Fair concerns and complaints",
    detail:
      "A future complaints route should be understandable, confidential where appropriate, protected from retaliation and separate from conflicted decision-makers.",
  },
  {
    title: "Conflicts disclosed and managed",
    detail:
      "Interests should be declared, relevant people should recuse themselves and the handling decision should be recorded.",
  },
  {
    title: "Financial accountability",
    detail:
      "Any future income, expenditure, procurement and reimbursement should use defined approvals, records and proportionate public reporting.",
  },
  {
    title: "Athlete voice in design",
    detail:
      "People affected by future standards or activity should have a meaningful, documented way to contribute before decisions are adopted.",
  },
] as const satisfies readonly GovernancePrinciple[];

export type PolicyRegisterItem = {
  readonly topic: string;
  readonly state: "Not adopted" | "Planned work" | "Principle only";
  readonly publicPosition: string;
};

export const governancePolicyRegister = [
  {
    topic: "Constitution and bye-laws",
    state: "Not adopted",
    publicPosition:
      "No adopted governing instrument is published. A future draft would need an explicit draft label, review record and adoption reference.",
  },
  {
    topic: "Athlete welfare and safeguarding",
    state: "Principle only",
    publicPosition:
      "Welfare is an intended design principle. No safeguarding policy, responsible officer or reporting process is represented as operational.",
  },
  {
    topic: "Complaints and appeals",
    state: "Planned work",
    publicPosition:
      "A fair, accessible process is planned for consideration. No complaint, investigation or appeal mechanism has been adopted.",
  },
  {
    topic: "Conflicts of interest",
    state: "Principle only",
    publicPosition:
      "Disclosure and recusal are intended principles. No conflicts policy, declaration register or decision panel has been adopted.",
  },
  {
    topic: "Financial accountability",
    state: "Principle only",
    publicPosition:
      "Traceable approvals and reporting are intended principles. No budget, accounts, procurement rule or expenses policy is presented as adopted.",
  },
  {
    topic: "Athlete representation",
    state: "Planned work",
    publicPosition:
      "Ways to include athlete voice may be explored. No representative body, elected seat or appointment is claimed.",
  },
] as const satisfies readonly PolicyRegisterItem[];

export const intendedGovernanceSequence = [
  "Define the proposal’s scope and accountable roles without assigning authority by implication.",
  "Draft governance and welfare material with relevant specialist review.",
  "Invite bounded consultation and publish how material feedback was considered.",
  "Record any adoption decision, effective date, responsible decision-maker and review date.",
  "Publish versioned registers and preserve superseded records in an accessible archive.",
] as const;

export type RelationshipRegisterItem = {
  readonly relationship: string;
  readonly state:
    "No relationship claimed" | "Not established by these records";
  readonly detail: string;
};

export const relationshipRegister = [
  {
    relationship: "This proposal and Acrobatic Rock'n'Roll Federation of India",
    state: "No relationship claimed",
    detail:
      "No identity, succession, control, agency, membership or affiliation is claimed.",
  },
  {
    relationship: "This proposal and Amateur DanceSport Federation of India",
    state: "No relationship claimed",
    detail:
      "No identity, affiliation, authorisation or representative role is claimed.",
  },
  {
    relationship:
      "Acrobatic Rock'n'Roll Federation of India and Amateur DanceSport Federation of India",
    state: "Not established by these records",
    detail:
      "The two official directory records do not establish identity, affiliation, delegation, succession or another relationship between the listed entities.",
  },
  {
    relationship: "This proposal and WRRC, WDSF, an NOC or public authority",
    state: "No relationship claimed",
    detail:
      "No membership, recognition, governing authority, permission or official representative status is claimed.",
  },
] as const satisfies readonly RelationshipRegisterItem[];
