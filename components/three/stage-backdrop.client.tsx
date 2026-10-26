"use client";

import { Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  hasUsableWebGL2,
  KINETIC_DUET_MOTION_STORAGE_KEY,
} from "@/components/three/kinetic-duet-policy";
import type { StageInput, StageVariant } from "@/components/three/stage-types";

import styles from "./stage-backdrop.module.css";

const LazyStageScene = lazy(() => import("./stage-scene.client"));

type BoundaryProps = {
  readonly children: ReactNode;
  readonly onError: () => void;
};

type BoundaryState = {
  readonly failed: boolean;
};

class StageErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
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

type NavigatorWithConnection = Navigator & {
  readonly connection?: {
    readonly saveData?: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
};

function useSaveData() {
  const [saveData, setSaveData] = useState<boolean | null>(null);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    let cancelled = false;
    const update = () => {
      if (!cancelled) {
        setSaveData(Boolean(connection?.saveData));
      }
    };

    queueMicrotask(update);
    connection?.addEventListener?.("change", update);

    return () => {
      cancelled = true;
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return saveData;
}

const STAGE_DEFER_MS = 3_500;

function useDeferredStart() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | undefined;
    let delayHandle: number | undefined;
    const begin = () => {
      if (!cancelled) {
        setStarted(true);
      }
    };
    const schedule = () => {
      delayHandle = window.setTimeout(() => {
        delayHandle = undefined;

        if (typeof window.requestIdleCallback === "function") {
          idleHandle = window.requestIdleCallback(begin, { timeout: 2_500 });
        } else {
          begin();
        }
      }, STAGE_DEFER_MS);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (
        idleHandle !== undefined &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleHandle);
      }
      if (delayHandle !== undefined) {
        window.clearTimeout(delayHandle);
      }
    };
  }, []);

  return started;
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(-1, value));
}

export function StageBackdrop() {
  const pathname = usePathname();
  const variant: StageVariant =
    pathname === null || pathname === "/" ? "home" : "inner";
  const input = useRef<StageInput>({
    hero: 0,
    pointerX: 0,
    pointerY: 0,
    scroll: 0,
  });
  const requestRenderRef = useRef<(() => void) | null>(null);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const coarse = useMedia("(pointer: coarse), (max-width: 48rem)");
  const saveData = useSaveData();
  const started = useDeferredStart();
  const [webGL2, setWebGL2] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motion, setMotion] = useState({ paused: false, restored: false });

  useEffect(() => {
    if (!started || reducedMotion !== false || saveData !== false) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setWebGL2(hasUsableWebGL2());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, saveData, started]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

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
        setMotion({ paused, restored: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const mayLoad =
    started &&
    !failed &&
    reducedMotion === false &&
    saveData === false &&
    webGL2 === true;
  const live = mayLoad && ready;
  const active =
    live && pageVisible && motion.restored && motion.paused === false;

  useEffect(() => {
    if (!mayLoad) {
      return;
    }

    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      input.current.scroll =
        range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      input.current.hero =
        window.innerHeight > 0 ? window.scrollY / window.innerHeight : 0;
      requestRenderRef.current?.();
    };
    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      input.current.pointerX = clampUnit(
        (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
      );
      input.current.pointerY = clampUnit(
        -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1),
      );
      requestRenderRef.current?.();
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    if (coarse === false) {
      window.addEventListener("pointermove", updatePointer, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, [coarse, mayLoad, pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.stage = live ? "live" : "static";

    return () => {
      delete root.dataset.stage;
    };
  }, [live]);

  const handleFailure = useCallback(() => {
    setReady(false);
    setFailed(true);
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);

  const togglePaused = useCallback(() => {
    setMotion((current) => {
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
    <>
      <div
        aria-hidden="true"
        className={styles.backdrop}
        data-live={live ? "true" : "false"}
        data-variant={variant}
      >
        {mayLoad ? (
          <StageErrorBoundary onError={handleFailure}>
            <Suspense fallback={null}>
              <LazyStageScene
                active={active}
                input={input}
                lowQuality={coarse !== false}
                onFailure={handleFailure}
                onReady={handleReady}
                requestRenderRef={requestRenderRef}
                variant={variant}
              />
            </Suspense>
          </StageErrorBoundary>
        ) : null}
        <div className={styles.scrim} />
      </div>
      {live && motion.restored ? (
        <button
          aria-pressed={motion.paused}
          className={styles.motionToggle}
          onClick={togglePaused}
          type="button"
        >
          {motion.paused ? (
            <Play aria-hidden="true" size={16} strokeWidth={2.4} />
          ) : (
            <Pause aria-hidden="true" size={16} strokeWidth={2.4} />
          )}
          <span>{motion.paused ? "Play motion" : "Pause motion"}</span>
        </button>
      ) : null}
    </>
  );
}
