# Architecture

**Implementation snapshot:** 26 October 2026  
**Research cutoff:** 25 October 2026  
**Status:** implemented static site and fail-closed API; external production
readiness is not implied.

This record supersedes the implementation-state statements in
`docs/drafts/architecture-recommendation.md`. The draft remains evidence of the
evaluated vinext alternative. The implemented site uses stable Next.js App
Router static export; it does not use vinext, OpenNext, Pages Functions, SSR,
ISR, Server Actions, middleware or runtime editorial data.

## System shape

```text
Browser
  ├─ public route / asset
  │    └─ Cloudflare Workers Static Assets → out/
  └─ /api/*
       └─ worker/index.ts
            ├─ GET /api/enquiries/status → 200 capability
            ├─ POST /api/enquiries → fail-closed enquiry pipeline
            ├─ other /api/* → JSON 404
            └─ any non-API request → env.ASSETS.fetch(request)
```

Wrangler packages `out/` and the Worker module as one deployment unit. The
Static Assets router is asset-first except for
`assets.run_worker_first: ["/api/*"]`. The Worker is an API and asset
delegation boundary, not a Next.js server.

## Static rendering and routes

`next.config.ts` fixes `output: "export"`, `trailingSlash: true`, unoptimised
images and no remote build-time assets. Repository content and build-time
public values produce crawler-visible HTML.

The public route set is:

- `/`
- `/about/`
- `/disciplines/`
- `/athletes/`
- `/coaches-and-judges/`
- `/governance/`
- `/team/`
- `/competitions/`
- `/news/`
- `/join/`
- `/contact/`
- `/privacy/`
- `/terms/`

Athlete and news dynamic templates use `generateStaticParams()` with
`dynamicParams = false`. Their content arrays are currently empty. Build-only,
unlinked sentinel slugs produce the branded hard 404 until a verified,
consented record exists; they are not public sitemap entries. Competition,
people and news indexes deliberately render truthful empty states.

The sitemap lists the 11 indexable information routes. Privacy and terms remain
publicly linked but set page-level `noindex` and are excluded from the sitemap.
Unknown editorial paths use the exported 404; unknown API paths receive JSON
`404`.

## Component boundaries

Server Components remain the default. Client islands exist only where browser
state or interaction is required:

- Radix-based mobile navigation;
- enquiry form state and the conditional Turnstile widget;
- the adaptive global Saath Rekha shell and lazy Three/R3F stage.

No global client provider is used. Status, navigation, core copy and form
availability meaning remain in semantic HTML.

## Saath Rekha

The global shell mounts a static CSS presentation immediately, while the
homepage adds an SVG paired-ribbon poster. The client shell probes user and
device conditions before loading the separate canvas chunk:

- `prefers-reduced-motion: reduce`, Save-Data, failed/unsupported WebGL2 or a
  major performance caveat keeps the static presentation and avoids scene
  loading;
- an eligible scene starts only after a 3.5-second post-load grace period and
  an idle opportunity;
- mobile/coarse-pointer contexts select lower geometry quality, DPR and a
  20fps cap; higher-quality contexts are capped at 30fps;
- `frameloop="demand"` stops continuous work when page-hidden, session-paused
  or otherwise inactive;
- a visible pause/play control stores its choice in `sessionStorage`;
- WebGL context loss, lazy-load failure and renderer failure return to the
  static CSS/SVG presentation;
- the canvas is decorative, pointer-inert and excluded from the accessibility
  tree.

The implementation uses Three `0.186.1` and R3F `9.8.2`. It does not move
meaning, navigation or instructional content into the canvas.

## Enquiry API

All API responses are JSON with `Cache-Control: no-store`, a closed API CSP,
`nosniff` and `Referrer-Policy: no-referrer`.

### Capability

`GET /api/enquiries/status` validates deployment configuration without making
provider calls and always returns HTTP `200`:

- incomplete, partial or invalid configuration:
  `{ "available": false, "reason": "..." }`;
- complete configuration without Turnstile:
  `{ "available": true, "turnstileRequired": false }`;
- complete configuration with Turnstile:
  `{ "available": true, "turnstileRequired": true, "siteKey": "..." }`.

Turnstile is atomic: all of site key, secret key and hostname allowlist are
absent, or all are valid. Partial configuration disables the whole capability.

### Submission

For `POST /api/enquiries`, method and JSON media-type checks occur before the
configuration gate. With a supported JSON request and incomplete
configuration, the handler returns `503 FORM_SERVICE_UNAVAILABLE` with
`Retry-After: 300` before reading the body or calling a provider.

The configured request order is:

1. require exact allowed `Origin`;
2. require a syntactically valid `CF-Connecting-IP`;
3. HMAC the IP with the Worker-only salt and call the Cloudflare rate-limit
   binding (`10` attempts per `60` seconds in `wrangler.jsonc`);
4. enforce the declared and streamed 16 KiB body limit and fatal UTF-8 decode;
5. parse strict JSON, normalise bounded fields, reject unknown fields and
   reject a filled honeypot;
6. when configured, call Turnstile Siteverify with an eight-second timeout and
   require success, action `enquiry` and an allowlisted hostname;
7. make one eight-second Supabase REST insert using the `api` profile, the
   publishable key and Worker-only `x-enquiry-key`;
8. return `201` with a random reference only when Supabase returns `201`.

Rate-limit, Turnstile or persistence uncertainty fails closed. The repository
does not automatically retry persistence and has no email, notification,
marketing or follow-up integration. Structured logs contain event,
request UUID and HTTP status only, not form fields, tokens or IP addresses.

## Database boundary

`supabase/migrations/20261025230000_create_enquiry_boundary.sql` defines:

- separate `api` and `private` schemas;
- a constrained `api.enquiries` table with forced RLS;
- no browser-role select, update or delete grant;
- a column-limited `anon` insert grant;
- a private gate-key table unavailable to browser roles;
- an insert policy requiring default source/status, schema version, privacy
  acknowledgement and an enabled gate value from the request header.

The Worker deliberately uses Supabase REST rather than a service-role key. The
publishable key alone cannot satisfy the gate policy. The SQL test is a manual,
transaction-rolled-back test for an isolated Supabase-compatible database; it
is not wired into npm and is not evidence that any live project has the
migration, grants or RLS in force. See `docs/security.md`.

## Configuration and indexing

Build-time public values:

- `NEXT_PUBLIC_SITE_URL` supplies canonical and social URLs. It accepts HTTPS
  and local HTTP, strips path/query/fragment by taking the origin, rejects
  credentials and falls back to `https://example.invalid`.
- only exact `NEXT_PUBLIC_SITE_ENV=production` allows general indexing.
  Every other value emits no-index metadata and a disallowing `robots.txt`.

Worker deployment values:

- required base configuration:
  `SITE_ENV`, `PUBLIC_SITE_URL`, `FORM_ALLOWED_ORIGINS`,
  `PRIVACY_NOTICE_VERSION`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ENQUIRY_GATE_KEY`,
  `RATE_LIMIT_KEY_SALT`, and the `ENQUIRY_RATE_LIMITER` binding;
- optional complete Turnstile tuple:
  `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
  `TURNSTILE_HOSTNAMES`.

Production origins and hostnames must be HTTPS and may not include localhost.
The public canonical origin must be in the exact origin allowlist. Worker-only
settings must not use `NEXT_PUBLIC_*`.

`public/_headers` applies static framing, object, MIME, referrer, permissions
and cross-origin controls. It intentionally has no HSTS and no strict
`default-src`/`script-src` policy; domain readiness and an inline-script-aware
CSP remain production security decisions.

## Repository map

```text
app/                    Static routes, metadata, sitemap, robots and 404
components/forms/       Capability-driven enquiry UI and Turnstile island
components/three/       SVG fallback, adaptive policy, geometry and R3F scene
components/layout|ui/   Global shell and semantic primitives
content/                Typed local publication-controlled content
lib/contracts/          Shared strict enquiry contract
lib/server/enquiries/   Config, body, rate-limit, Turnstile and REST adapters
worker/                 API routing and asset delegation
supabase/               Migration and manual RLS test
tests/                  Vitest component/unit and Playwright browser coverage
public/                 Static response headers and exported local assets
docs/drafts/            Preserved evidence; not approved public copy
docs/                   Canonical architecture, governance and runbooks
```

## Environments and release boundary

- **Local/CI:** synthetic data, no production credentials; unconfigured
  enquiry behavior is the default.
- **Preview:** `out/` plus local Wrangler. It does not prove Cloudflare account,
  binding, domain or Supabase state.
- **Staging:** must use a separate approved Cloudflare target, isolated
  Supabase resources, `NEXT_PUBLIC_SITE_ENV=staging` and access restriction.
- **Production:** requires the approved canonical domain, exact
  `NEXT_PUBLIC_SITE_ENV=production`, matching `SITE_ENV=production`, separate
  secrets, applied database controls and a release record.

The current `wrangler.jsonc` defines only one top-level Worker and no named
staging/production environments, routes, domains or Worker vars. Environment
separation therefore remains a configuration blocker; do not infer it from
the application code. Build-time canonical/index values also mean staging and
production are distinct artifacts, each requiring its own digest and evidence.

## Release ownership and blockers

Implementation is not operational approval. Production and form enablement
remain blocked on:

- verified legal identity and accountable website/data operator;
- professional review of privacy, terms, retention, children’s data and
  incident handling;
- verified founder, role, contact, relationship and affiliation records;
- approved domain and Cloudflare account/environment configuration;
- Supabase project credentials, migration application and live RLS/grant tests;
- logo, photo, biography and other publication rights;
- monitoring, access, response, correction and deletion procedures.

Required technical and manual evidence is defined in `docs/testing.md`;
deployment and rollback steps are in `docs/deployment.md`; claim gates are in
`docs/content-verification.md`.
