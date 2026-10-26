import Link from "next/link";

import { MobileNavigation } from "@/components/layout/mobile-navigation.client";
import {
  desktopNavigationGroups,
  policyNavigation,
  primaryNavigation,
  routes,
  siteConfig,
} from "@/content/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-lockup" href={routes.home.href} prefetch={false}>
          <span className="site-lockup__descriptor">
            {siteConfig.descriptor}
          </span>
          <span className="site-lockup__status">{siteConfig.statusLine}</span>
          <span className="visually-hidden"> — home</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          <ul className="desktop-nav__list">
            <li>
              <Link
                className="desktop-nav__link"
                href={routes.home.href}
                prefetch={false}
              >
                {routes.home.label}
              </Link>
            </li>
            <li>
              <Link
                className="desktop-nav__link"
                href={routes.disciplines.href}
                prefetch={false}
              >
                {routes.disciplines.label}
              </Link>
            </li>
            {desktopNavigationGroups.map((group) => (
              <li key={group.label}>
                <details className="desktop-nav__group">
                  <summary>{group.label}</summary>
                  <ul className="desktop-nav__submenu">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} prefetch={false}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
            <li>
              <Link
                className="desktop-nav__action"
                href={routes.join.href}
                prefetch={false}
              >
                {routes.join.label}
              </Link>
            </li>
            <li>
              <Link
                className="desktop-nav__link"
                href={routes.contact.href}
                prefetch={false}
              >
                {routes.contact.label}
              </Link>
            </li>
          </ul>
        </nav>

        <MobileNavigation
          items={primaryNavigation}
          utilityItems={policyNavigation}
        />
      </div>
    </header>
  );
}
