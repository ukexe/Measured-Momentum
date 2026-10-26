# Measured Momentum

Static-first website for a proposed initiative described as **Acrobatic Rock
’n’ Roll + Boogie Woogie in India**.

> **Proposed organisation · In development**  
> No legal, governmental, sporting or international recognition, affiliation,
> authority, people, results, events, sponsors or official contact details are
> claimed.

**Hosted preview:** <https://measured-momentum-foundation.ukexe06.workers.dev/>

**Source:** [ukexe/Measured-Momentum](https://github.com/ukexe/Measured-Momentum)

The `workers.dev` preview is intentionally `noindex` and the enquiry service
remains unavailable until its approved Supabase and operational controls are
configured.

## Current implementation

- Next.js 16 App Router statically exports all public information routes with
  trailing-slash URLs. The athlete-profile and news-article route templates
  publish nothing until a repository record passes their verification gates.
- Cloudflare Workers Static Assets serves `out/`. Only `/api/*` is configured
  Worker-first; every non-API request reaching the Worker is delegated to
  `env.ASSETS.fetch`.
- Saath Rekha renders an immediate SVG/CSS presentation. An eligible browser
  loads the global Three/R3F stage only after a post-load grace period and an
  idle opportunity; reduced motion, Save-Data, unsupported WebGL2, context
  loss and load failure retain the static presentation. Rendering is
  frame-capped and pauses while hidden or by user choice.
- `GET /api/enquiries/status` always returns a `200` capability document.
  Incomplete configuration is represented by `available: false`.
- `POST /api/enquiries` fails closed with
  `503 FORM_SERVICE_UNAVAILABLE` until configuration is complete. The
  configured path enforces exact origin, Cloudflare IP presence, a salted
  Cloudflare rate limit, a bounded strict schema and honeypot, optional
  server-verified Turnstile, then one least-privilege Supabase REST insert.
  A `201` is returned only after persistence reports success.

See [`docs/architecture.md`](docs/architecture.md),
[`docs/security.md`](docs/security.md), and
[`docs/technical-decisions.md`](docs/technical-decisions.md) for the
implementation boundaries.

## Public routes

`/`, `/about/`, `/disciplines/`, `/athletes/`,
`/coaches-and-judges/`, `/governance/`, `/team/`, `/competitions/`,
`/news/`, `/join/`, `/contact/`, `/privacy/`, and `/terms/`.

The legal pages are conspicuously labelled drafts, are explicitly
`noindex`, and require professional legal/privacy review before approval.
Empty people, competition and news states are intentional; they must not be
replaced with invented records.

## Evidence and publication gates

Canonical entry points are:

- [`docs/research-and-governance.md`](docs/research-and-governance.md)
- [`docs/content-verification.md`](docs/content-verification.md)
- [`docs/affiliation-questions.md`](docs/affiliation-questions.md)

The detailed records under `docs/drafts/` are preserved evidence, not approved
public copy. The research cutoff is 25 October 2026. No identity or
relationship may be inferred between the WRRC India entry, WDSF’s Indian
member, or this proposal.

## Local setup

Use Node `22.23.2`, npm `10.9.8`, and the committed lockfile.

```sh
npm install
copy .env.example .env.local
npm run dev
```

`NEXT_PUBLIC_SITE_URL` sets canonical URLs. Invalid or absent values fall back
to `https://example.invalid`. Only exact
`NEXT_PUBLIC_SITE_ENV=production` permits general indexing; every other value
emits no-index metadata and a disallowing `robots.txt`. Privacy and terms
remain page-level `noindex` in every environment.

Blank Worker settings keep enquiries unavailable. Secrets and server-only
settings must never be renamed to `NEXT_PUBLIC_*`.

## Commands

- `npm run dev` — Next.js development server
- `npm run build` — static export to `out/`
- `npm run artifact:digest` — deterministic sorted-path/content hash of the
  current `out/`
- `npm run preview` — local Wrangler preview of assets and API
- `npm run deploy:dry-run` — build and validate Cloudflare packaging without
  making an external deployment
- `npm run format:check`, `npm run lint`, `npm run typecheck`
- `npm run test:unit`, `npm run test:e2e`, or `npm test`
- `npm run perf:lab -- <url> 3 [output.json]` — throttled mobile lab samples,
  optionally retained as raw JSON
- `npm run types:worker` — regenerate Cloudflare bindings

Use [`docs/testing.md`](docs/testing.md) for required evidence and
[`docs/performance.md`](docs/performance.md) for measured lab results.
[`docs/test-report.md`](docs/test-report.md) records the final local run.
[`docs/completion-report.md`](docs/completion-report.md) records delivered and
blocked scope against the master acceptance format.
[`docs/deployment.md`](docs/deployment.md) is the non-deploying runbook.
Production remains blocked until the verified operator/legal identity,
professional policy review, public contact and domain, affiliation and founder
claim records, media/logo rights, Cloudflare and Supabase access, and live
database migration/RLS evidence are approved.
