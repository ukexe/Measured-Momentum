import Link from "next/link";

import { footerNavigationGroups, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__intro">
          <p className="site-footer__platform">{siteConfig.creativePlatform}</p>
          <p className="site-footer__descriptor">{siteConfig.descriptor}</p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          {footerNavigationGroups.map((group) => (
            <div className="site-footer__group" key={group.label}>
              <h2>{group.label}</h2>
              <ul className="site-footer__links">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} prefetch={false}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="site-footer__status">
          <strong>{siteConfig.statusLine}</strong>
          <p>{siteConfig.expandedStatusStatement}</p>
        </div>
      </div>
    </footer>
  );
}
