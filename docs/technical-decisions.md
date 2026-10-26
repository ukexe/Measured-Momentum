# Technical decisions

**Original decision date:** 25 October 2026  
**Reconciled with implementation:** 26 October 2026  
**Status:** current until superseded by a dated decision

## TD-001 — Stable Next.js static export

Use Next.js `16.4.3` App Router with `output: "export"`,
`trailingSlash: true` and unoptimised local images. All current editorial
routes pre-render from repository content and build-time public settings.
Crawler-visible content must not depend on JavaScript.

vinext, OpenNext, Pages Functions and an SSR adapter are not used. Any future
need for cookies, request-time page data, ISR, middleware or Server Actions
requires an architecture decision rather than a route-local workaround. The
earlier vinext recommendation remains preserved under `docs/drafts/`.

## TD-002 — One Static Assets deployment, API-only Worker-first routing

Wrangler `4.152.0` packages `out/` and `worker/index.ts`. `ASSETS` is the
static binding, missing pages use the exported 404, and HTML handling forces
trailing slashes.

`assets.run_worker_first` contains only `/api/*`. Non-API delivery remains
asset-first; if a non-API request reaches the Worker, it is explicitly
delegated to `env.ASSETS.fetch`. This is a same-origin API boundary, not a
server-rendered Next runtime.

## TD-003 — Capability-driven, fail-closed enquiries

Implement:

- `GET /api/enquiries/status` as a `200` capability response;
- `POST /api/enquiries` as a configured pipeline that otherwise returns
  `503 FORM_SERVICE_UNAVAILABLE` for a supported JSON request;
- stable JSON `404` and `405` responses for unknown APIs and unsupported
  methods.

Availability requires a valid environment, public origin in the exact
allowlist, Supabase settings, a Worker-only gate value and salt, privacy-notice
version, and the Cloudflare rate-limit binding. Production origins must be
HTTPS. Status checks make no provider calls and expose only capability data
and, when applicable, the public Turnstile site key.

The submission pipeline rate-limits before reading or parsing the body, then
applies bounded UTF-8 JSON parsing, a strict normalising schema, a honeypot,
optional Turnstile and one Supabase insert. It never reports success before a
confirmed `201` from persistence and never automatically retries a failed
insert.

## TD-004 — Supabase REST with a second server-side gate

Use native Supabase REST with a publishable key rather than a browser database
call or service-role key. The Worker sends `Content-Profile: api`, an
insert-only body and a separate `x-enquiry-key`.

The migration grants `anon` only the listed insert columns, forces RLS and
requires an enabled gate value in the insert policy. Browser roles receive no
read, update or delete path. Database constraints repeat the important
application invariants.

The migration and transactional SQL test do not prove a live project. Applying
the migration, provisioning the private gate, checking Data API schema
exposure and executing RLS/grant tests against an isolated then live-approved
environment remain deployment gates.

## TD-005 — Optional Turnstile is atomic

Turnstile is disabled only when site key, secret and hostname list are all
absent. If any one is present, all must validate or the entire enquiry
capability is unavailable.

When enabled, the browser loads the Turnstile script only after capability
discovery. The Worker sends the token to Siteverify with requester IP and a
request UUID, then requires provider success, action `enquiry` and an exact
allowlisted hostname. Timeout, malformed response and provider failure fail
closed; tokens are neither persisted nor logged.

## TD-006 — Local typed content with explicit publication gates

Keep content in typed TypeScript modules. Empty arrays for athletes, people,
competitions and news are intentional production states. A CMS, MDX runtime or
remote build dependency is not justified by the current editorial scale.

News records carry a separate editorial publication review. Static parameters,
archive cards, article lookup and structured data all consume the approved
accessors; dates and populated copy cannot make a draft public. Athlete
profiles use the equivalent verified-publication and consent gate.

`docs/drafts/` remains immutable research/design evidence and is not imported
by the application. Canonical publication control starts at
`docs/content-verification.md`; detailed evidence remains linked rather than
duplicated.

## TD-007 — Narrow client islands

Use Server Components by default. Client code is limited to:

- Radix mobile navigation and its focus lifecycle;
- enquiry capability/form state and conditional Turnstile;
- Saath Rekha adaptation and the lazy canvas.

Shared content, status, links and route structure remain provider-free.
Client-side validation is convenience only; the Worker repeats all
submission validation.

## TD-008 — Saath Rekha is an implemented fallback-first enhancement

The SVG poster is always mounted and carries the visual’s non-instructional
description. Three `0.186.1` and R3F `9.8.2` live in a lazy chunk loaded near
the viewport only after reduced-motion, Save-Data and WebGL2 checks pass.

Use demand rendering, lower quality on mobile/coarse pointers, a persistent
pause control, page/viewport visibility checks, resource disposal and
context-loss/error fallback. The canvas is decorative and never contains
status, navigation or instructional meaning.

## TD-009 — Build-time canonical and indexing policy

`NEXT_PUBLIC_SITE_URL` supplies the canonical origin. The URL normaliser
accepts HTTPS and local HTTP only, rejects credentials, reduces values to their
origin and falls back to `https://example.invalid`.

Only exact `NEXT_PUBLIC_SITE_ENV=production` permits general indexing.
Non-production builds emit page no-index metadata and a disallowing
`robots.txt`. Privacy and terms remain page-level `noindex`.

The Next configuration also runs an explicit build guard. Environment names
outside `development`, `staging` and `production` fail. Staging and production
require a clean approved HTTPS origin and reject placeholders, local hosts,
credentials, paths, queries and fragments.

Emit only verified structured data. The global record is `WebSite`; no
`SportsOrganization`, `Organization`, `Person`, `Event`, affiliation,
recognition, review or address claim is emitted. A verified news record may
later emit its bounded Article and breadcrumb data. The sitemap excludes the
page-level `noindex` privacy and terms drafts while both remain publicly
linked.

## TD-010 — Static-compatible security controls

Static `_headers` deny framing and objects, set MIME/referrer/permissions and
cross-origin controls, and cache hashed Next assets immutably. HSTS waits for
verified production domains. The baseline CSP does not claim a strict
script/frame/connect allowlist while static Next bootstrap, JSON-LD and
conditional Turnstile requirements remain to be reconciled.

API JSON is `no-store`, non-sniffable and governed by a closed CSP. Worker
secrets and server settings never use `NEXT_PUBLIC_*`. Application logs are
restricted to coarse event, request UUID and status.

## TD-011 — Exact reproducible toolchain

Use Node `22.23.2`, npm `10.9.8`, exact direct versions and the committed
lockfile. `@typescript/native` supplies compiler `7.0.2`; the package name
`typescript` points to `@typescript/typescript6@6.0.2` for JavaScript API
consumers.

Principal pins are Next `16.4.3`, React/React DOM `19.3.1`, Tailwind
`4.3.3`, Lucide `1.61.0`, Radix Dialog `1.3.1`, Three `0.186.1`, R3F
`9.8.2`, Motion `14.6.0`, Zod `4.6.7`, Wrangler `4.152.0`, Vitest
`5.0.5`, Playwright `1.64.1` and axe Playwright `4.14.0`.

The lockfile overrides Wrangler’s Undici `7.29.1` transitive to exact
`7.30.1`. Any dependency or compatibility-date change requires the full
quality gate and regenerated Worker types where configuration changes.

## TD-012 — Layered tests, explicit external limits

Vitest/jsdom covers contracts, Worker ordering, provider adapters with injected
fetches, form state, route/content invariants, Saath Rekha policy and geometry.
Playwright builds and runs the Wrangler preview across Chromium, Firefox,
WebKit and mobile Chromium for public routes, selected axe scans, mobile
navigation, hard 404s and the unconfigured API contract.

The SQL RLS test is manual and isolated; configured live Turnstile, Cloudflare
rate limiting, Supabase REST/RLS, deployment domains and operational handling
are not proven by the npm suites. Automated axe checks do not replace keyboard,
screen-reader, zoom, forced-colours, reduced-motion, mobile-device and
professional content/legal review. Commands and evidence ownership are in
`docs/testing.md`.

## TD-013 — Constrain speculative and offscreen work

Disable automatic Next route prefetch on the global shell and homepage actions.
The site is static and navigation remains client-capable, while viewport
prefetching every institutional route created unnecessary background requests
and RSC processing on the first load.

Long below-fold homepage sections use `content-visibility: auto` with an
intrinsic-size estimate. Unsupported browsers ignore the enhancement. This
reduces initial style/layout work without removing content from the source,
accessibility tree or static HTML. The measured effect and remaining
interaction-performance limitation are recorded in `docs/performance.md`.
