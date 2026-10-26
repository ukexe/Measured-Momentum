export type PublicationState =
  | "proposed"
  | "in-development"
  | "draft-for-review"
  | "verified-fact"
  | "adopted"
  | "archived";

export type SourceRecord = {
  readonly label: string;
  readonly checkedOn: string;
  readonly ownerRole: string;
  readonly url?: string;
};

export type PublishableRecord = {
  readonly slug: string;
  readonly state: PublicationState;
  readonly title: string;
  readonly summary: string;
  readonly sources: readonly SourceRecord[];
  readonly publishedOn?: string;
  readonly updatedOn?: string;
  readonly noIndex?: boolean;
};

export type NavigationItem = {
  readonly href: `/${string}` | `#${string}`;
  readonly label: string;
};
