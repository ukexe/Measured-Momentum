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

const mockState = vi.hoisted(() => ({
  pathname: "/",
  throwOnRender: false,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockState.pathname,
}));

vi.mock("@/components/three/stage-scene.client", async () => {
  const ReactModule = await import("react");

  type MockStageProps = {
    readonly active: boolean;
    readonly lowQuality: boolean;
    readonly onFailure: () => void;
    readonly onReady: () => void;
    readonly variant: string;
  };

  function MockStageScene({
    active,
    lowQuality,
    onFailure,
    onReady,
    variant,
  }: MockStageProps) {
    const canvasRef = ReactModule.useRef<HTMLCanvasElement>(null);

    ReactModule.useEffect(() => {
      onReady();
    }, [onReady]);

    ReactModule.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const handleContextLoss = (event: Event) => {
        event.preventDefault();
        onFailure();
      };

      canvas.addEventListener("webglcontextlost", handleContextLoss);
      return () =>
        canvas.removeEventListener("webglcontextlost", handleContextLoss);
    }, [onFailure]);

    if (mockState.throwOnRender) {
      throw new Error("Mock stage import failed");
    }

    return (
      <canvas
        data-active={String(active)}
        data-low-quality={String(lowQuality)}
        data-testid="stage-canvas"
        data-variant={variant}
        ref={canvasRef}
      />
    );
  }

  return { default: MockStageScene };
});

import { StageBackdrop } from "@/components/three/stage-backdrop.client";
import { KINETIC_DUET_MOTION_STORAGE_KEY } from "@/components/three/kinetic-duet-policy";

type MediaKind = "coarse" | "forced" | "reduced";

function installMatchMedia({
  coarse = false,
  forced = false,
  reduced = false,
}: {
  coarse?: boolean;
  forced?: boolean;
  reduced?: boolean;
} = {}) {
  const values: Record<MediaKind, boolean> = { coarse, forced, reduced };
  const listeners = new Map<string, Set<() => void>>();
  const kindFor = (query: string): MediaKind => {
    if (query.includes("prefers-reduced-motion")) {
      return "reduced";
    }
    if (query.includes("forced-colors")) {
      return "forced";
    }
    return "coarse";
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const queryListeners = new Set<() => void>();
      listeners.set(query, queryListeners);

      return {
        addEventListener: vi.fn((_type: "change", listener: () => void) => {
          queryListeners.add(listener);
        }),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        get matches() {
          return values[kindFor(query)];
        },
        media: query,
        onchange: null,
        removeEventListener: vi.fn((_type: "change", listener: () => void) => {
          queryListeners.delete(listener);
        }),
        removeListener: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  );

  return {
    listenerCount: () =>
      Array.from(listeners.values()).reduce(
        (total, queryListeners) => total + queryListeners.size,
        0,
      ),
    set: async (kind: MediaKind, value: boolean) => {
      values[kind] = value;
      await act(async () => {
        for (const [query, queryListeners] of listeners) {
          if (kindFor(query) === kind) {
            queryListeners.forEach((listener) => listener());
          }
        }
        await Promise.resolve();
      });
    },
  };
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
let connection: {
  addEventListener: MockInstance;
  listeners: Set<() => void>;
  removeEventListener: MockInstance;
  saveData: boolean;
};

beforeEach(() => {
  vi.useFakeTimers();
  installMatchMedia();
  mockState.pathname = "/";
  mockState.throwOnRender = false;
  sessionStorage.clear();
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  const listeners = new Set<() => void>();
  connection = {
    addEventListener: vi.fn((_type: "change", listener: () => void) => {
      listeners.add(listener);
    }),
    listeners,
    removeEventListener: vi.fn((_type: "change", listener: () => void) => {
      listeners.delete(listener);
    }),
    saveData: false,
  };
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: connection,
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

async function setSaveData(value: boolean) {
  connection.saveData = value;
  await act(async () => {
    connection.listeners.forEach((listener) => listener());
    await Promise.resolve();
  });
}

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
    connection.saveData = true;
    render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(document.documentElement).toHaveAttribute("data-stage", "static");
    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
  });

  it("does not load the scene when forced colours are active", async () => {
    installMatchMedia({ forced: true });
    render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(document.documentElement).toHaveAttribute("data-stage", "static");
    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /motion/i }),
    ).not.toBeInTheDocument();
  });

  it("defers enhancement and exposes an action-labelled pause control", async () => {
    render(<StageBackdrop />);

    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    await advanceDeferredStage();

    const canvas = await screen.findByTestId("stage-canvas");
    await act(async () => Promise.resolve());

    expect(canvas).toHaveAttribute("data-variant", "home");
    expect(canvas).toHaveAttribute("data-active", "true");
    expect(document.documentElement).toHaveAttribute("data-stage", "live");

    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));

    expect(
      screen.getByRole("button", { name: "Play motion" }),
    ).not.toHaveAttribute("aria-pressed");
    expect(canvas).toHaveAttribute("data-active", "false");
    expect(sessionStorage.getItem(KINETIC_DUET_MOTION_STORAGE_KEY)).toBe(
      "paused",
    );
  });

  it("reacts to forced-colours changes and remounts from the fallback", async () => {
    const media = installMatchMedia();
    render(<StageBackdrop />);
    await advanceDeferredStage();

    expect(await screen.findByTestId("stage-canvas")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "live");

    await media.set("forced", true);

    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "static");
    expect(
      screen.queryByRole("button", { name: /motion/i }),
    ).not.toBeInTheDocument();

    await media.set("forced", false);

    expect(await screen.findByTestId("stage-canvas")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "live");
  });

  it("falls back when Save-Data changes at runtime", async () => {
    render(<StageBackdrop />);
    await advanceDeferredStage();

    expect(await screen.findByTestId("stage-canvas")).toBeInTheDocument();

    await setSaveData(true);

    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "static");
  });

  it("persists a paused preference without contradictory toggle semantics", async () => {
    sessionStorage.setItem(KINETIC_DUET_MOTION_STORAGE_KEY, "paused");
    render(<StageBackdrop />);
    await advanceDeferredStage();

    expect(await screen.findByTestId("stage-canvas")).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "Play motion" }),
    ).not.toHaveAttribute("aria-pressed");
  });

  it("returns to the static presentation after WebGL context loss", async () => {
    render(<StageBackdrop />);
    await advanceDeferredStage();

    const canvas = await screen.findByTestId("stage-canvas");
    const contextLoss = new Event("webglcontextlost", {
      cancelable: true,
    });
    fireEvent(canvas, contextLoss);

    expect(contextLoss.defaultPrevented).toBe(true);
    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "static");
  });

  it("contains lazy scene failures and keeps the fallback visible", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockState.throwOnRender = true;
    render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(screen.queryByTestId("stage-canvas")).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-stage", "static");
  });

  it("selects inner and low-quality variants and cleans up listeners", async () => {
    const media = installMatchMedia({ coarse: true });
    mockState.pathname = "/about/";
    const { unmount } = render(<StageBackdrop />);

    await advanceDeferredStage();

    expect(await screen.findByTestId("stage-canvas")).toHaveAttribute(
      "data-variant",
      "inner",
    );
    expect(screen.getByTestId("stage-canvas")).toHaveAttribute(
      "data-low-quality",
      "true",
    );
    expect(media.listenerCount()).toBe(3);

    unmount();

    expect(media.listenerCount()).toBe(0);
    expect(connection.removeEventListener).toHaveBeenCalled();
    expect(document.documentElement).not.toHaveAttribute("data-stage");
  });
});
