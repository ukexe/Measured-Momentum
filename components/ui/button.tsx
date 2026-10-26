import Link, { type LinkProps } from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "quiet";

type ButtonStyleProps = {
  readonly variant?: ButtonVariant;
  readonly className?: string;
};

function buttonClassName(
  variant: ButtonVariant,
  className: string | undefined,
): string {
  return cn("button", `button--${variant}`, className);
}

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps) {
  return (
    <button
      className={buttonClassName(variant, className)}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  ButtonStyleProps & {
    readonly children: ReactNode;
  };

export function ButtonLink({
  children,
  className,
  prefetch = false,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName(variant, className)}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
