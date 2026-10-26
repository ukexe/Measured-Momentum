"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/content/site";
import type { NavigationItem } from "@/types/content";

type MobileNavigationProps = {
  readonly items: readonly NavigationItem[];
  readonly utilityItems: readonly NavigationItem[];
};

function normalisePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return `${pathname.replace(/\/+$/, "")}/`;
}

export function MobileNavigation({
  items,
  utilityItems,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const currentPathname = normalisePathname(pathname);

  function renderLink(item: NavigationItem) {
    const isCurrent = normalisePathname(item.href) === currentPathname;

    return (
      <li key={item.href}>
        <Dialog.Close asChild>
          <Link
            className={
              item.href === "/join/" ? "mobile-nav__action" : undefined
            }
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            prefetch={false}
          >
            <span>{item.label}</span>
            {isCurrent ? (
              <span className="mobile-nav__current">Current</span>
            ) : null}
          </Link>
        </Dialog.Close>
      </li>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="mobile-nav__trigger" type="button">
          <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
          <span>Menu</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="mobile-nav__overlay" />
        <Dialog.Content className="mobile-nav__panel">
          <div className="mobile-nav__heading">
            <div>
              <Dialog.Title className="mobile-nav__title">
                Site navigation
              </Dialog.Title>
              <Dialog.Description className="mobile-nav__description">
                {siteConfig.statusLine}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="mobile-nav__close"
                type="button"
                aria-label="Close menu"
              >
                <X aria-hidden="true" size={24} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile">
            <ul className="mobile-nav__list">{items.map(renderLink)}</ul>
          </nav>

          <div className="mobile-nav__footer">
            <nav aria-label="Information">
              <ul className="mobile-nav__utility">
                {utilityItems.map(renderLink)}
              </ul>
            </nav>
            <div className="mobile-nav__status">
              <strong>{siteConfig.statusLine}</strong>
              <p>{siteConfig.expandedStatusStatement}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
