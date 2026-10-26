import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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

const lazyState = vi.hoisted(() => ({ moduleLoads: 0 }));

vi.mock("@/components/three/kinetic-duet-canvas.client", async () => {
  const ReactModule = await import("react");

  lazyState.moduleLoads += 1;

  type MockCanvasProps = {
    readonly active: boolean;
    readonly lowQuality: boolean;
    readonly onReady?: () => void;
  };

  function MockCanvas({ active, lowQuality, onReady }: MockCanvasProps) {
    ReactModule.useEffect(() => {
      onReady?.();
    }, [onReady]);

    return (
      <canvas
        aria-hidden="true"
        data-active={String(active)}
        data-low-quality={String(lowQuality)}
        data-testid="saath-rekha-canvas"
      />
    );
  }

  return { default: MockCanvas };
});

import { KineticDuet } from "@/components/three/kinetic-duet.client";
import { KINETIC_DUET_MOTION_STORAGE_KEY } from "@/components/three/kinetic-duet-policy";

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly scrollMargin = "0px";
  readonly thresholds: readonly number[];
  private readonly callback: IntersectionObserverCallback;

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.callback = callback;
    this.rootMargin = options.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    MockIntersectionObserver.instances.push(this);
  }

  disconnect() {}

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}

  trigger(isIntersecting: boolean, intersectionRatio: number) {
    this.callback(
      [
        {
          intersectionRatio,
          isIntersecting,
        } as IntersectionObserverEntry,
      ],
      this,
    );
  }
}

function installMatchMedia({
  coarse = false,
  mobile = false,
  reduced = false,
}: {
  coarse?: boolean;
  mobile?: boolean;
  reduced?: boolean;
} = {}) {
  const matchMedia = vi.fn((query: string) => {
    const matches = query.includes("prefers-reduced-motion")
      ? reduced
      : query.includes("pointer: coarse") || query.includes("max-width: 48rem")
        ? coarse || mobile
        : false;

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
  });

  vi.stubGlobal("matchMedia", matchMedia);
}

function triggerViewport({
  near,
  visible,
}: {
  near: boolean;
  visible: boolean;
}) {
  const preloadObserver = MockIntersectionObserver.instances.find(
    (observer) => observer.rootMargin === "280px 0px",
  );
  const visibilityObserver = MockIntersectionObserver.instances.find(
    (observer) => observer.rootMargin !== "280px 0px",
  );

  if (!preloadObserver || !visibilityObserver) {
    throw new Error("Expected both Saath Rekha observers.");
  }

  act(() => {
    preloadObserver.trigger(near, near ? 1 : 0);
    visibilityObserver.trigger(visible, visible ? 0.5 : 0);
  });
}

let getContextSpy: MockInstance<HTMLCanvasElement["getContext"]>;

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  installMatchMedia();
  sessionStorage.clear();
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: { saveData: false },
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Saath Rekha adaptive client shell", () => {
  it("keeps the fallback and description without loading under reduced motion", async () => {
    installMatchMedia({ reduced: true });
    const { container } = render(<KineticDuet />);

    triggerViewport({ near: true, visible: true });
    await act(async () => Promise.resolve());

    expect(lazyState.moduleLoads).toBe(0);
    expect(
      screen.getByText(/decorative visual is not an instructional/),
    ).toBeInTheDocument();
    expect(
      container.querySelector("svg[aria-hidden='true']"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("saath-rekha-canvas")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /motion/i }),
    ).not.toBeInTheDocument();
  });

  it("fails closed to the fallback when WebGL2 is unavailable", async () => {
    getContextSpy.mockImplementation(
      (() => null) as unknown as HTMLCanvasElement["getContext"],
    );
    const onFailure = vi.fn();
    const { container } = render(<KineticDuet onFailure={onFailure} />);

    triggerViewport({ near: true, visible: true });

    await waitFor(() => expect(onFailure).toHaveBeenCalledWith("unsupported"));
    expect(onFailure).toHaveBeenCalledOnce();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByTestId("saath-rekha-canvas")).not.toBeInTheDocument();
  });

  it("loads near the viewport and exposes persistent pause and play states", async () => {
    const { container } = render(<KineticDuet />);

    expect(lazyState.moduleLoads).toBe(0);
    expect(screen.queryByTestId("saath-rekha-canvas")).not.toBeInTheDocument();

    triggerViewport({ near: true, visible: true });

    const canvas = await screen.findByTestId(
      "saath-rekha-canvas",
      {},
      { timeout: 5_000 },
    );
    await waitFor(() => expect(canvas).toHaveAttribute("data-active", "true"));
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(
      container.querySelector("svg[aria-hidden='true']"),
    ).toBeInTheDocument();
    expect(container.querySelector("figure")).toHaveAttribute(
      "data-visual",
      "saath-rekha-enhanced",
    );

    const pause = screen.getByRole("button", {
      name: "Pause motion",
    });
    fireEvent.click(pause);

    expect(screen.getByRole("button", { name: "Play motion" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(canvas).toHaveAttribute("data-active", "false");
    expect(sessionStorage.getItem(KINETIC_DUET_MOTION_STORAGE_KEY)).toBe(
      "paused",
    );

    fireEvent.click(screen.getByRole("button", { name: "Play motion" }));
    expect(
      screen.getByRole("button", { name: "Pause motion" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(canvas).toHaveAttribute("data-active", "true");

    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(canvas).toHaveAttribute("data-active", "false");
  }, 15_000);
});
