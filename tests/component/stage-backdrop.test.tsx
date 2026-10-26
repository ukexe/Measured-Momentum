import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/three/stage-scene.client", async () => {
  const ReactModule = await import("react");

  type MockStageProps = {
    readonly active: boolean;
    readonly lowQuality: boolean;
    readonly onReady: () => void;
    readonly variant: string;
  };

  function MockStageScene({
    active,
    lowQuality,
    onReady,
    variant,
  }: MockStageProps) {
    ReactModule.useEffect(() => {
      onReady();
    }, [onReady]);

    return (
      <canvas
        data-active={String(active)}
        data-low-quality={String(lowQuality)}
        data-testid="stage-canvas"
        data-variant={variant}
      />
    );
  }

  return { default: MockStageScene };
});

import { StageBackdrop } from "@/components/three/stage-backdrop.client";
import { KINETIC_DUET_MOTION_STORAGE_KEY } from "@/components/three/kinetic-duet-policy";

function installMatchMedia({
  coarse = false,
  reduced = false,
}: {
  coarse?: boolean;
  reduced?: boolean;
} = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const matches = query.includes("prefers-reduced-motion")
        ? reduced
        : coarse;

      return {
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  );
}

async function advanceDeferredStage() {
  await act(async () => {
    vi.advanceTimersByTime(3_500);
    await Promise.resolve();
  });
  vi.useRealTimers();
  await vi.dynamicImportSettled();
  await act(async () => Promise.resolve());
}

let getContextSpy: MockInstance<HTMLCanvasElement["getContext"]>;

beforeEach(() => {
  vi.useFakeTimers();
  installMatchMedia();
  sessionStorage.clear();
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      saveData: false,
    },
  });
  Object.defineProperty(window, "requestIdleCallback", {
    configurable: true,
    value: vi.fn((callback: IdleRequestCallback) => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      });
      return 1;
    }),
  });
  Object.defineProperty(window, "cancelIdleCallback", {
    configurable: true,
    value: vi.fn(),
  });
  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
  getContextSpy.mockImplementation(((contextId: string) =>
    contextId === "webgl2"
      ? {
          getExtension: () => ({ loseContext: vi.fn() }),
        }
      : null) as unknown as HTMLCanvasElement["getContext"]);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.stage;
});

describe("global stage backdrop", () => {
  it("keeps the static presentation under reduced motion", async () => {
    installMatchMedia({ reduced: true });
    render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(document.documentElement).toHaveAttribute("data-stage", "static");
    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /motion/i }),
    ).not.toBeInTheDocument();
  });

  it("does not load the scene when Save-Data is enabled", async () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
    render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(document.documentElement).toHaveAttribute("data-stage", "static");
    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
  });

  it("defers enhancement and exposes a persistent pause control", async () => {
    render(<StageBackdrop />);

    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    await advanceDeferredStage();

    const canvas = await screen.findByTestId("stage-canvas");
    await act(async () => Promise.resolve());

    expect(canvas).toHaveAttribute("data-variant", "home");
    expect(canvas).toHaveAttribute("data-active", "true");
    expect(document.documentElement).toHaveAttribute("data-stage", "live");

    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));

    expect(screen.getByRole("button", { name: "Play motion" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(canvas).toHaveAttribute("data-active", "false");
    expect(sessionStorage.getItem(KINETIC_DUET_MOTION_STORAGE_KEY)).toBe(
      "paused",
    );
  });
});
