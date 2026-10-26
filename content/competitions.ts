import type { SourceRecord } from "@/types/content";

export type CompetitionRelationship =
  | "third-party-information"
  | "documented-collaboration"
  | "organised-by-proposal";

export type CompetitionSanctionLabel =
  "source-confirmed-status" | "no-sanction-claim-published";

export type CompetitionListing = {
  readonly slug: string;
  readonly eventName: string;
  readonly organiser: string;
  readonly relationship: CompetitionRelationship;
  readonly relationshipStatement: string;
  readonly sanctionLabel: CompetitionSanctionLabel;
  readonly sanctionStatement: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly location: string;
  readonly disciplines: readonly string[];
  readonly eligibilitySource: string;
  readonly registrationSource: string;
  readonly resultsSource: string;
  readonly updateStatus: string;
  readonly source: SourceRecord;
};

export const competitionListings: readonly CompetitionListing[] = [];

export const competitionListingFields = [
  {
    label: "Event identity",
    detail:
      "The exact event name, accountable organiser and organiser-owned source.",
  },
  {
    label: "Relationship",
    detail:
      "A plain statement of whether the page is reporting third-party information, a documented collaboration or activity genuinely organised by the proposed initiative.",
  },
  {
    label: "Sanction or recognition",
    detail:
      "The exact source-reported status, named issuing body and source—or an explicit statement that no sanction claim is published.",
  },
  {
    label: "Date and place",
    detail:
      "Start and end dates, local time where material, and city, state and country.",
  },
  {
    label: "Participation scope",
    detail:
      "Disciplines, categories and eligibility as stated by the organiser, without turning entry into selection or representative status.",
  },
  {
    label: "Action and updates",
    detail:
      "Organiser-owned registration, cancellation, correction and result sources, plus the date on which the listing was checked.",
  },
] as const;

export const competitionRelationshipLabels = [
  {
    value: "third-party-information",
    label: "Third-party information",
    definition:
      "Information is attributed to an independent organiser. Listing it would not mean endorsement, collaboration, sanction or a selection pathway.",
  },
  {
    value: "documented-collaboration",
    label: "Documented collaboration",
    definition:
      "Reserved for a future activity with a written, publishable agreement that states the parties and scope. No such listing is currently published.",
  },
  {
    value: "organised-by-proposal",
    label: "Organised by the proposed initiative",
    definition:
      "Reserved for future activity only when operational responsibility is documented and the proposal is actually the organiser. No such listing is currently published.",
  },
] as const satisfies readonly {
  readonly value: CompetitionRelationship;
  readonly label: string;
  readonly definition: string;
}[];

export const competitionSanctionLabels = [
  {
    value: "source-confirmed-status",
    label: "Source-confirmed status",
    definition:
      "The listing would quote the named issuing body’s status narrowly, link the source and show when it was checked.",
  },
  {
    value: "no-sanction-claim-published",
    label: "No sanction claim published",
    definition:
      "No adequate source supports a sanction statement. This label would not itself mean that an event is unsanctioned.",
  },
] as const satisfies readonly {
  readonly value: CompetitionSanctionLabel;
  readonly label: string;
  readonly definition: string;
}[];
