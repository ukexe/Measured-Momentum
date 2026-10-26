import { cn } from "@/lib/cn";
import type { KineticDuetProps } from "@/types/kinetic-duet";
import type { PointerEventHandler, ReactNode, Ref } from "react";

const DEFAULT_LABEL =
  "Two woven ribbons trace a coordinated partner dance: they counterbalance, exchange height, and recover together.";

type KineticDuetFallbackProps = Pick<
  KineticDuetProps,
  "className" | "discipline" | "label" | "palette" | "showPhraseRail"
> & {
  readonly fallbackVisible?: boolean;
  readonly onPointerLeave?: PointerEventHandler<HTMLElement>;
  readonly onPointerMove?: PointerEventHandler<HTMLElement>;
  readonly overlay?: ReactNode;
  readonly rootRef?: Ref<HTMLElement>;
  readonly showBadge?: boolean;
};

export function KineticDuetFallback({
  className,
  discipline = "rock-n-roll",
  fallbackVisible = true,
  label = DEFAULT_LABEL,
  onPointerLeave,
  onPointerMove,
  overlay,
  palette,
  rootRef,
  showBadge = true,
  showPhraseRail = true,
}: KineticDuetFallbackProps) {
  const colours = {
    partnerA: palette?.partnerA ?? "#d86543",
    partnerB: palette?.partnerB ?? "#526cc7",
    brass: palette?.brass ?? "#c7a66a",
    ground: palette?.ground ?? "#080b12",
  };

  return (
    <figure
      ref={rootRef}
      className={cn("kinetic-duet", className)}
      data-discipline={discipline}
      data-visual={
        fallbackVisible ? "saath-rekha-fallback" : "saath-rekha-enhanced"
      }
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <svg
        className="kinetic-duet__poster"
        viewBox="0 0 800 360"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        aria-hidden="true"
        style={{ backgroundColor: colours.ground }}
      >
        <g fill="none" opacity={fallbackVisible ? 1 : 0} strokeLinecap="round">
          <path
            d="M72 214 C174 84 254 78 338 176 S514 292 728 138"
            stroke={colours.partnerA}
            strokeWidth="12"
          />
          <path
            d="M72 146 C174 276 254 282 338 184 S514 68 728 222"
            stroke={colours.partnerB}
            strokeWidth="12"
          />
          <g stroke={colours.brass} strokeOpacity=".4" strokeWidth="2">
            <path d="M168 95 L168 265" />
            <path d="M266 93 L266 267" />
            <path d="M350 168 L350 192" />
            <path d="M450 248 L450 112" />
            <path d="M552 268 L552 92" />
            <path d="M648 218 L648 142" />
          </g>
          {showPhraseRail ? (
            <path
              d="M128 310 H672"
              stroke={colours.brass}
              strokeOpacity=".35"
            />
          ) : null}
        </g>
      </svg>
      {overlay}
      <figcaption className="sr-only">
        {label} This decorative visual is not an instructional demonstration.
      </figcaption>
      {showBadge ? (
        <span className="kinetic-duet__badge" aria-hidden="true">
          Static foundation
        </span>
      ) : null}
    </figure>
  );
}
