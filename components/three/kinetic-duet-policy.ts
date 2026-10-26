export const KINETIC_DUET_MOTION_STORAGE_KEY = "saath-rekha-motion";

export type KineticDuetLoadState = {
  readonly failed: boolean;
  readonly nearViewport: boolean;
  readonly reducedMotion: boolean | null;
  readonly saveData: boolean | null;
  readonly webGL2: boolean | null;
};

export function isKineticDuetLoadEligible({
  failed,
  nearViewport,
  reducedMotion,
  saveData,
  webGL2,
}: KineticDuetLoadState) {
  return (
    nearViewport &&
    !failed &&
    reducedMotion === false &&
    saveData === false &&
    webGL2 === true
  );
}

export function hasUsableWebGL2(
  createCanvas: () => HTMLCanvasElement = () =>
    document.createElement("canvas"),
) {
  try {
    const canvas = createCanvas();
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
    });

    if (!context) {
      return false;
    }

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
