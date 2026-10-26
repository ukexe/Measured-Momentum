export type StageVariant = "home" | "inner";

export type StageInput = {
  /** Scroll offset in viewport heights. */
  hero: number;
  /** Normalised pointer position, -1 to 1. */
  pointerX: number;
  pointerY: number;
  /** Document scroll progress, 0 to 1. */
  scroll: number;
};
