"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./enquiry-form.module.css";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileRenderOptions = {
  readonly sitekey: string;
  readonly action: "enquiry";
  readonly callback: (token: string) => void;
  readonly "expired-callback": () => void;
  readonly "error-callback": () => void;
};

type TurnstileApi = {
  readonly render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string;
  readonly reset: (widgetId: string) => void;
  readonly remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  readonly siteKey: string;
  readonly onTokenChange: (token: string) => void;
  readonly registerReset: (reset: (() => void) | null) => void;
};

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  return new Promise((resolve, reject) => {
    let script = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    let shouldAppend = false;

    const handleLoad = () => {
      if (script) {
        script.dataset.turnstileLoaded = "true";
      }
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(new Error("Turnstile API did not initialise."));
      }
    };
    const handleError = () => {
      if (script) {
        script.dataset.turnstileFailed = "true";
      }
      reject(new Error("Turnstile API could not be loaded."));
    };

    if (!script) {
      script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      shouldAppend = true;
    } else if (
      script.dataset.turnstileFailed === "true" ||
      script.dataset.turnstileLoaded === "true"
    ) {
      reject(new Error("Turnstile API is unavailable."));
      return;
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (shouldAppend) {
      document.head.appendChild(script);
    }
  });
}

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  registerReset,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let widgetId: string | undefined;

    void loadTurnstile()
      .then((api) => {
        if (!active || !containerRef.current) {
          return;
        }

        widgetId = api.render(containerRef.current, {
          sitekey: siteKey,
          action: "enquiry",
          callback: (token) => {
            if (active) {
              setLoadFailed(false);
              onTokenChange(token);
            }
          },
          "expired-callback": () => {
            if (active) {
              onTokenChange("");
            }
          },
          "error-callback": () => {
            if (active) {
              onTokenChange("");
              setLoadFailed(true);
            }
          },
        });

        registerReset(() => {
          if (widgetId) {
            api.reset(widgetId);
          }
          onTokenChange("");
        });
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
          onTokenChange("");
        }
      });

    return () => {
      active = false;
      registerReset(null);
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onTokenChange, registerReset, siteKey]);

  return (
    <div className={styles.verification}>
      <p className={styles.label}>Verification</p>
      <div ref={containerRef} />
      {loadFailed ? (
        <p className={styles.fieldError} role="status">
          Verification could not load. Check your connection, then reload this
          page.
        </p>
      ) : null}
    </div>
  );
}
