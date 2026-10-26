import Link from "next/link";

import { siteConfig } from "@/content/site";

export function StatusRail() {
  return (
    <aside className="status-rail" aria-label="Proposal status">
      <div className="container status-rail__inner">
        <strong>{siteConfig.statusLine}</strong>
        <Link href={siteConfig.statusHref} prefetch={false}>
          What that means
        </Link>
      </div>
    </aside>
  );
}
