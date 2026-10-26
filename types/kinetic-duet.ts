export type KineticDiscipline = "boogie" | "rock-n-roll" | "acro";

export type KineticDuetFailure = "unsupported" | "context-lost" | "load-error";

export type KineticDuetProps = {
  readonly discipline?: KineticDiscipline;
  readonly motion?: "auto" | "still";
  readonly quality?: "auto" | "low" | "high";
  readonly label?: string;
  readonly className?: string | undefined;
  readonly showPhraseRail?: boolean;
  readonly palette?: Partial<{
    readonly partnerA: string;
    readonly partnerB: string;
    readonly brass: string;
    readonly ground: string;
  }>;
  readonly onReady?: () => void;
  readonly onFailure?: (reason: KineticDuetFailure) => void;
};
