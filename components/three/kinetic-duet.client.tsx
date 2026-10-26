"use client";

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { KineticDuetFallback } from "@/components/three/kinetic-duet-fallback";
import {
  hasUsableWebGL2,
  isKineticDuetLoadEligible,
  KINETIC_DUET_MOTION_STORAGE_KEY,
} from "@/components/three/kinetic-duet-policy";
import type {
  KineticDuetFailure,
  KineticDuetProps,
} from "@/types/kinetic-duet";

const LazyKineticDuetCanvas = lazy(
  () => import("./kinetic-duet-canvas.client"),
);

const PAUSE_CONTROL_STYLE = {
  position: "absolute",
  right: "1rem",
  bottom: "1rem",
  zIndex: 2,
  minHeight: "2.75rem",
  minWidth: "2.75rem",
  padding: "0.65rem 0.9rem",
  border: "1px solid rgb(242 234 220 / 0.65)",
  borderRadius: "0.25rem",
  background: "rgb(8 11 18 / 0.88)",
  color: "#f2eadc",
  cursor: "pointer",
  fontWeight: 700,
  outlineColor: "#d9f257",
} satisfies CSSProperties;

type ErrorBoundaryProps = {
  readonly children: ReactNode;
  readonly onError: () => void;
};

type ErrorBoundaryState = {
  readonly failed: boolean;
};

class DuetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch() {
    this.props.onError();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

type NetworkConnection = {
  readonly saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  readonly connection?: NetworkConnection;
};

function useSaveData() {
  const [saveData, setSaveData] = useState<boolean | null>(null);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => setSaveData(Boolean(connection?.saveData));

    update();
    connection?.addEventListener?.("change", update);
    return () => connection?.removeEventListener?.("change", update);
  }, []);

  return saveData;
}

function useViewportState(root: RefObject<HTMLElement | null>) {
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const node = root.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setNearViewport(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "280px 0px" },
    );
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setVisible(
          Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.12),
        );
      },
      { threshold: [0, 0.12] },
    );

    preloadObserver.observe(node);
    visibilityObserver.observe(node);

    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [root]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return { nearViewport, pageVisible, visible };
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(-1, value));
}

export function KineticDuet({
  className,
  discipline = "rock-n-roll",
  label,
  motion = "auto",
  onFailure,
  onReady,
  palette,
  quality = "auto",
  showPhraseRail = true,
}: KineticDuetProps) {
  const root = useRef<HTMLElement | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const requestRenderRef = useRef<(() => void) | null>(null);
  const failureReported = useRef<KineticDuetFailure | null>(null);
  const readyReported = useRef(false);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const mobileOrCoarse = useMedia("(pointer: coarse), (max-width: 48rem)");
  const saveData = useSaveData();
  const { nearViewport, pageVisible, visible } = useViewportState(root);
  const [webGL2, setWebGL2] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [pauseState, setPauseState] = useState({
    paused: false,
    restored: false,
  });

  const reportFailure = useCallback(
    (reason: KineticDuetFailure) => {
      if (failureReported.current) {
        return;
      }

      failureReported.current = reason;
      setCanvasReady(false);
      setFailed(true);
      onFailure?.(reason);
    },
    [onFailure],
  );

  useEffect(() => {
    if (reducedMotion === null || saveData === null) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setWebGL2(reducedMotion || saveData ? null : hasUsableWebGL2());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, saveData]);

  useEffect(() => {
    if (webGL2 === false) {
      reportFailure("unsupported");
    }
  }, [reportFailure, webGL2]);

  useEffect(() => {
    let paused = false;

    try {
      paused =
        sessionStorage.getItem(KINETIC_DUET_MOTION_STORAGE_KEY) === "paused";
    } catch {
      // Pausing remains available when storage is blocked.
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setPauseState({ paused, restored: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const policyAllowsLoading = isKineticDuetLoadEligible({
    failed,
    nearViewport: true,
    reducedMotion,
    saveData,
    webGL2,
  });
  const mayLoad = policyAllowsLoading && (nearViewport || canvasReady);
  const active =
    mayLoad &&
    visible &&
    pageVisible &&
    motion === "auto" &&
    pauseState.restored &&
    !pauseState.paused;
  const pointerEnabled =
    mayLoad &&
    visible &&
    pageVisible &&
    reducedMotion === false &&
    mobileOrCoarse === false;
  const lowQuality = quality === "low" || mobileOrCoarse !== false;
  const colours = {
    partnerA: palette?.partnerA ?? "#d86543",
    partnerB: palette?.partnerB ?? "#526cc7",
    brass: palette?.brass ?? "#c7a66a",
    ground: palette?.ground ?? "#080b12",
  };

  useEffect(() => {
    if (!pointerEnabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      requestRenderRef.current?.();
    }
  }, [pointerEnabled]);

  const handleReady = useCallback(() => {
    setCanvasReady(true);

    if (!readyReported.current) {
      readyReported.current = true;
      onReady?.();
    }
  }, [onReady]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!pointerEnabled || event.pointerType === "touch") {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();

      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      pointer.current.x = clampUnit(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      );
      pointer.current.y = clampUnit(
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      requestRenderRef.current?.();
    },
    [pointerEnabled],
  );

  const handlePointerLeave = useCallback(() => {
    pointer.current.x = 0;
    pointer.current.y = 0;
    requestRenderRef.current?.();
  }, []);

  const togglePaused = useCallback(() => {
    setPauseState((current) => {
      const paused = !current.paused;

      try {
        sessionStorage.setItem(
          KINETIC_DUET_MOTION_STORAGE_KEY,
          paused ? "paused" : "playing",
        );
      } catch {
        // The control is not dependent on storage availability.
      }

      return { paused, restored: true };
    });
  }, []);

  return (
    <KineticDuetFallback
      {...(className === undefined ? {} : { className })}
      {...(label === undefined ? {} : { label })}
      discipline={discipline}
      fallbackVisible={!canvasReady || failed || !mayLoad}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      overlay={
        <>
          {mayLoad ? (
            <DuetErrorBoundary onError={() => reportFailure("load-error")}>
              <Suspense fallback={null}>
                <LazyKineticDuetCanvas
                  active={active}
                  colours={colours}
                  discipline={discipline}
                  lowQuality={lowQuality}
                  onFailure={reportFailure}
                  onReady={handleReady}
                  pointer={pointer}
                  requestRenderRef={requestRenderRef}
                  showPhraseRail={showPhraseRail}
                />
              </Suspense>
            </DuetErrorBoundary>
          ) : null}
          {mayLoad &&
          motion === "auto" &&
          reducedMotion === false &&
          pauseState.restored ? (
            <button
              aria-pressed={pauseState.paused}
              onClick={togglePaused}
              style={PAUSE_CONTROL_STYLE}
              type="button"
            >
              {pauseState.paused ? "Play motion" : "Pause motion"}
            </button>
          ) : null}
        </>
      }
      palette={colours}
      rootRef={root}
      showBadge={false}
      showPhraseRail={showPhraseRail}
    />
  );
}
