import Image from "next/image";

import { cn } from "@/lib/cn";

import styles from "./performance-figure.module.css";

type PerformanceFigureProps = {
  readonly src: string;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
  readonly className?: string | undefined;
  readonly objectPosition?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly tone?: "colour" | "monochrome";
};

export function PerformanceFigure({
  src,
  alt,
  label,
  caption,
  className,
  objectPosition = "50% 50%",
  priority = false,
  sizes = "(max-width: 56rem) 100vw, 50vw",
  tone = "colour",
}: PerformanceFigureProps) {
  return (
    <figure className={cn(styles.figure, className)} data-tone={tone}>
      <div className={styles.frame}>
        <Image
          alt={alt}
          className={styles.image}
          fill
          priority={priority}
          sizes={sizes}
          src={src}
          style={{ objectPosition }}
        />
        <span className={styles.index} aria-hidden="true">
          MM
        </span>
        <span className={styles.focusMark} aria-hidden="true" />
      </div>
      <figcaption>
        <strong>{label}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
