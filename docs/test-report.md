# Test report

**Run window:** `2026-10-25T21:15Z`–`2026-10-25T22:06Z`
(26 October 2026 IST)  
**Environment:** Windows 10, Node `22.23.2`, npm `10.9.8`, Wrangler
`4.152.0`  
**Source identity:** branch `master` has no `HEAD`; every project file is
untracked  
**Lockfile SHA-256:**
`2674e566212f08c9cc28a926208e92046ebbbcfc177dfa930a372e29ae9feb7f`  
**Final `out/` tree SHA-256:**
`2e5a2b6589e4b6f84e9959152ab8240eb306430c055713aaa2b9b7f90a1c3ed7`
across `149` regular files  
**Decision:** engineering candidate verified; public release remains blocked by
external governance, legal, data and deployment approvals

This report records the final successful runs and material failed attempts.
It is not evidence of a production deployment, live database policy or legal
approval. Because the repository has no commit, the workspace cannot yet be
recreated or approved by immutable source identity; creating and reviewing an
initial commit is a release blocker.

## Automated gates

Clean locked install:

- `npm ci`
- final result: pass; `531` packages installed and `532` audited with zero
  reported vulnerabilities
- three stale project-local Wrangler preview process trees initially held
  `esbuild.exe`, causing two `EPERM` removals and one stalled recovery attempt;
  the preview trees were stopped and the subsequent clean install passed
- npm emitted a deprecation/support warning for the pinned ESLint `9.39.5`;
  this development dependency should be reassessed with Next compatibility
  before the next release cycle

Formatting:

- `npm run format:check`
- final result: pass; all matched files use Prettier style

Lint:

- `npm run lint`
- final result: pass with zero warnings
- an earlier run incorrectly traversed generated `.wrangler/tmp` files after a
  dry run; `.wrangler/**` and `dist/**` were added to the generated-output
  ignore list, then the repository lint passed

Strict types:

- `npm run typecheck`
- final result: pass

Unit and component tests:

- `npm run test:unit`
- final post-clean-install result: `16` files passed, `84` tests passed, no
  failures in `58.85 s`
- two resource-contended parallel attempts timed out while other CPU-heavy
  gates were running; neither was recorded as a pass. The same complete suite
  passed when executed without that contention.

Production export:

- `npm run build`
- final result: pass
- Next generated `23` static pages/artifacts including route metadata
- the postbuild step removed the two unlinked build-only dynamic sentinels
- all 13 required static information/policy routes and the custom 404 were
  exported

Cross-browser end-to-end:

- `npm run test:e2e`
- final post-clean-install result: `25` passed, `3` skipped, zero failed in
  `4.4` minutes
- projects: desktop Chromium, Firefox, WebKit and Pixel 7 mobile Chromium
- the three skips are the mobile-navigation case in the three desktop
  projects; it passed in mobile Chromium
- coverage includes all public routes, one visible H1 and no horizontal
  overflow, zero captured console/page errors or failed requests, branded hard
  404s, mobile dialog focus/Escape restoration, unconfigured
  capability/submission API behavior, unsupported methods and unknown API
  paths
- axe found zero serious or critical violations on the homepage and the
  selected governance, join and contact states in the final run

The first E2E attempt was blocked by absent Playwright browser binaries. The
pinned Chromium, Firefox and WebKit builds were installed. The next run exposed
real accessible-name and contrast defects plus undersized test timeouts; those
were fixed before the two final passing full-matrix runs.

Dependency review:

- `npm audit --omit=dev`: zero reported vulnerabilities
- `npm audit`: zero reported vulnerabilities
- these npm results do not replace reachability, provenance, licence, secret
  history or future advisory review

Cloudflare packaging:

- `npm run deploy:dry-run`
- final result: pass
- packaged `182` static files
- Worker upload `799.95 KiB`, `126.96 KiB` gzip
- bindings resolved: `ASSETS` and `ENQUIRY_RATE_LIMITER`
- dry run made no deployment and did not validate a Cloudflare account,
  custom domain, remote secret or live binding

## Accessibility and responsive evidence

Automated and browser checks established:

- no serious/critical axe result in the covered final states;
- mobile menu initial focus, Escape dismissal and invoker focus restoration;
- no horizontal overflow across every public route in desktop and Pixel 7
  projects;
- direct manual browser reflow at 320 CSS px with no overflowing element;
- core content remains available under reduced motion, with the SVG Saath
  Rekha fallback;
- the unavailable form state is explicit and contains no submission fields.

Defects found and remediated:

- removed a home-link `aria-label` that omitted visible status text and added a
  visible-text-compatible hidden “home” suffix;
- raised the decorative homepage count and governance source-label contrast;
- kept the mobile dialog focus lifecycle under Radix and verified it in the
  browser matrix.

Not tested with physical assistive technology:

- NVDA, VoiceOver and TalkBack;
- physical keyboard/mobile combinations;
- 400% zoom, forced colours and text-spacing overrides across every route;
- enabled Turnstile widget accessibility.

Automated axe and engine emulation do not prove WCAG 2.2 AA conformance.

## Performance evidence

`npm run perf:lab -- <url> 3 <output.json>` completed three retained throttled
mobile samples after one warm-up for the homepage, join route and branded 404.
Homepage median LCP was `1.184 s`, join `0.988 s`, and 404 `0.984 s`; every
sample recorded CLS `0`.

The five-second long-task proxy medians were `292 ms`, `558 ms` and `350 ms`.
They are not INP, so the 200 ms interaction target is not claimed as met.
Initial request/transfer medians were respectively `12 / 188,997 bytes`,
`14 / 213,019 bytes`, and `10 / 171,860 bytes`.

Raw samples are retained under `docs/evidence/performance/`; each file records
its ISO UTC timestamp, target, browser/runtime, throttle profile, samples and
medians. Full methodology, initial Lighthouse evidence, remediation and
limitations are in `performance.md`.

## Response and SEO checks

Direct local Wrangler responses verified:

- `/`: `200`, HTML, static CSP, COOP/CORP, Permissions-Policy,
  Referrer-Policy, `nosniff` and frame denial;
- hashed Next JavaScript: `200` with
  `Cache-Control: public, max-age=31536000, immutable`;
- `/api/enquiries/status`: `200`, `Cache-Control: no-store`, closed API CSP,
  JSON unavailable capability;
- unknown editorial route: real HTTP `404` with the static security headers.

The final sitemap contains the 11 indexable information routes. The noindex
privacy and terms drafts remain publicly linked but are absent from the
sitemap. The default development artifact correctly uses
`https://example.invalid` and disallows all crawling; production canonical and
index behavior still require a separately built, approved-domain artifact.

## Security and database boundary

Vitest covered strict validation, size/content-type/method/origin ordering,
strict IPv4/IPv6 client-address parsing, rate-limit outcomes, Turnstile adapter
outcomes, one-shot Supabase persistence, uncertain client outcomes without a
false loss/success claim, redacted application logs, build-environment guards,
explicit news-publication approval and Worker route contracts.

The repository migration and manual transactional SQL test were reviewed but
not executed because no disposable approved Supabase-compatible database was
provided. No claim is made that a remote project has the schema, gate, grants,
forced RLS or API exposure in force.

The following were not run:

- live Supabase migration or complete unauthorised-access matrix;
- configured end-to-end persistence and deletion;
- live Cloudflare rate-limit enforcement;
- live Turnstile verification/replay/hostname tests;
- secret-history scanner, independent OSV scan, SBOM or licence scanner;
- external penetration test.

## Release blockers

The code candidate is not approved for public launch until the accountable
owners provide:

- an initial reviewed commit and release tag that bind this evidence to source;
- verified legal entity, website operator and data controller;
- professional privacy/terms/retention/children’s-data review;
- approved public name, domain and role-based contact;
- founder, office-bearer, competition and qualification evidence;
- written affiliation/recognition answers and logo/media rights;
- named Cloudflare staging/production environments and access restriction;
- Supabase credentials, applied migration and retained live RLS/grant evidence;
- monitoring, response, correction, deletion, backup and incident operations;
- physical-device, assistive-technology and deployed performance smoke results.

No DNS, domain, Cloudflare, Supabase, WRRC/WDSF or public deployment change was
made.
