import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type TextLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    readonly children: ReactNode;
  };

export function TextLink({
  children,
  className,
  prefetch = false,
  ...props
}: TextLinkProps) {
  return (
    <Link className={cn("text-link", className)} prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}
