# Architecture recommendation: premium public organisation site

**Decision date:** 25 October 2026  
**Status:** Proposed architecture; no application has been scaffolded and no external integration has been configured or validated.  
**Target:** A premium, accessible public site for a proposed Indian acrobatic rock ’n’ roll and boogie woogie organisation.  
**Primary recommendation:** A static-first vinext App Router application deployed as one Cloudflare Worker with Workers Static Assets, plus one dynamic App Router Route Handler for enquiries.

## 1. Executive recommendation

Use **vinext 1.3.0 on Cloudflare Workers**, with App Router conventions, React Server Components by default, and explicit client islands only for navigation, forms, Motion, and the optional Three.js experience. Pre-render all editorial routes. Keep `/contact` and `/join` dynamic only so they can read runtime form availability and pass a public Turnstile site key to the client. Handle `POST /api/enquiries` in the same Worker.

Persist an accepted enquiry through the Supabase Data API using native `fetch`, a publishable key, a second Worker-only gateway key, column-level grants, and RLS. Do **not** use a Supabase secret/service-role key: it bypasses RLS. Do not add `@supabase/supabase-js` for this single insert.

Turnstile is optional as a deployment capability:

- all Turnstile settings absent: Turnstile is disabled, while validation, origin checks, rate limiting, and the database gateway remain mandatory;
- all Turnstile settings present: every submission must pass server-side Siteverify, including action and hostname checks;
- partially configured: the form is unavailable and the endpoint returns `503`;
- provider failure: fail closed with a retryable `503`, never an accepted response.

The persistence integration is required. With the credentials currently unavailable, the form must render an honest unavailable state and `POST /api/enquiries` must return `503 FORM_SERVICE_UNAVAILABLE`. A `201` is returned only after Supabase confirms the insert. No mock or client flag may produce success in production.

The principal risk is the platform toolchain, not this site’s domain logic: Cloudflare still labels vinext as beta, `cf` is beta, and vinext’s current setup uses the Cloudflare Vite plugin v2 beta. Keep the supported Next.js surface deliberately small, pin the lockfile, run `vinext check`, test the built Worker, and retain static-export plus a small API Worker as the fallback architecture.

## 2. Context and quality attributes

### Required outcomes

- Next.js App Router filesystem and component semantics.
- Strict TypeScript and runtime validation at every untrusted boundary.
- Mostly static, crawlable HTML with useful no-JavaScript content.
- A small client bundle; Three.js is a deferred enhancement, never critical content.
- WCAG 2.2 AA design and release evidence.
- Durable, server-validated enquiries with no false-positive success.
- Cloudflare-native deployment, static asset delivery, bindings, logs, and traces.
- Supabase least privilege, no browser database access, and no read path for enquiries.
- Reproducible, pinned builds and production-like browser tests.

### Explicit non-goals for the first release

- Member accounts, authentication, payments, athlete registration, medical data, certificates, private portals, competition scoring, or a public enquiry dashboard.
- A CMS, ISR, Partial Prerendering, Cache Components, middleware, Server Actions, Cloudflare Images, Durable Objects, Queues, or email delivery.
- User-generated rich text, uploads, analytics, or marketing automation.
- A claim that the proposed organisation is recognised, official, incorporated, affiliated, or a governing body.

## 3. System shape

```text
Browser
  ├─ hashed JS/CSS/images ───────────────> Cloudflare Workers Static Assets
  ├─ pre-rendered/RSC page request ──────> vinext application Worker
  └─ POST /api/enquiries ────────────────> App Router Route Handler
                                               │
                                               ├─ approximate Rate Limit binding
                                               ├─ Turnstile Siteverify, if configured
                                               └─ Supabase Data API over HTTPS
                                                      └─ grants + RLS + DB constraints
```

The vinext-generated routing must remain authoritative. Hashed `/_next/static/*` output bypasses Worker execution; public and page requests follow vinext’s generated Worker/asset routing. “Static-first” describes render semantics, not a promise that every HTML request incurs zero Worker invocations.

## 4. ADR-style decisions

### ADR-001 — Adopt vinext on Workers

**Decision:** Use vinext’s Cloudflare target and generated `cloudflare.config.ts`; do not use OpenNext or Pages for a new project.

**Why:** This is Cloudflare’s current recommended Next.js path, supports App Router/RSC/Route Handlers, runs server code in `workerd`, and uses Workers Static Assets in one deployment unit.

**Constraints:** Treat vinext as a compatibility implementation, not the Next.js compiler/runtime. Run the live compatibility check before every vinext upgrade. Avoid incomplete features: Cache Components, Partial Prerendering, and assumptions about Next.js build-time image/font optimisation.

### ADR-002 — Static-first pages, one integrated dynamic API

**Decision:** Pre-render editorial routes. Keep the form pages and enquiry Route Handler dynamic. Do not split the API into a second Worker initially.

**Why:** One repository, origin, deployment, configuration model, and observability surface are smaller and safer than a static export plus a separately routed API. It also preserves Route Handler semantics and avoids CORS.

**Alternative considered:** `output: "export"` plus a small Worker API would minimise vinext’s runtime surface and make all page files true static assets. It adds a second build/deploy target, cross-artifact contract and configuration drift, and either CORS or zone routing. Reconsider this if vinext page-runtime defects, invocation cost, or release policy outweigh the operational simplicity of one Worker.

### ADR-003 — RSC by default; narrow client islands

**Decision:** Pages, layouts, content lists, metadata, breadcrumbs, status panels, and cards remain server components. Client boundaries are limited to:

- `MobileNav.client.tsx`;
- `EnquiryForm.client.tsx`;
- `TurnstileWidget.client.tsx`;
- `KineticDuet.client.tsx` and its lazily imported canvas;
- small Motion-enhanced disclosures where CSS is insufficient.

**Why:** This keeps hydration and JavaScript proportional to interaction.

### ADR-004 — Local typed content before a CMS

**Decision:** Store launch content in typed TypeScript data modules and structured blocks. Validate records at build time with shared Zod schemas. Do not introduce MDX or a CMS until editorial scale justifies it.

**Why:** The initial content set is small and has unusually strict claim, source, consent, and status requirements. Local content is reviewable in pull requests and avoids another runtime/security boundary.

Every publishable record must carry the relevant subset of:

```ts
type PublicationState =
  | "proposed"
  | "in-development"
  | "draft-for-review"
  | "verified-fact"
  | "adopted"
  | "archived";

type SourceRecord = {
  label: string;
  url?: string;
  checkedOn: string;      // ISO date
  ownerRole: string;
};

type PublishableRecord = {
  slug: string;
  state: PublicationState;
  title: string;
  summary: string;
  sources: readonly SourceRecord[];
  publishedOn?: string;
  updatedOn?: string;
  noIndex?: boolean;
};
```

### ADR-005 — Progressive 3D, not a page dependency

**Decision:** Use Three.js and React Three Fiber only for the home-page kinetic duet. Render a complete static SVG poster first; lazy-load the canvas near the viewport only when WebGL2 is usable and neither reduced motion nor Save-Data applies.

**Why:** It provides a premium visual signature without delaying content, navigation, LCP, or form access.

**Rules:** No Drei, model loader, textures, post-processing, physics, state library, or animation library inside the scene. Stop frames when hidden, offscreen, paused, or reduced. Keep all meaning in HTML, expose a pause control for continuous motion, cap DPR, and preserve the fallback after context loss.

### ADR-006 — Motion and UI primitives are selective

**Decision:** Use Tailwind’s Vite plugin, Lucide icons, `@radix-ui/react-dialog` for the mobile menu, and local shadcn-style component composition. Do not install the shadcn CLI as a runtime dependency or import a broad component suite.

Use Motion’s `LazyMotion` plus `m` entry point only for interactions that cannot be expressed well in CSS. Honour `prefers-reduced-motion` before loading expressive features.

### ADR-007 — Route Handler, not Server Action, for enquiries

**Decision:** Use `POST /api/enquiries`.

**Why:** A versioned HTTP contract is easier to bound, test in `workerd`, observe, rate-limit, and keep independent from React form state. It also avoids adding Server Action compatibility to the critical submission path.

### ADR-008 — Native Supabase REST request with a custom gate

**Decision:** Use native Worker `fetch` against `/rest/v1/enquiries`, a Supabase publishable key, and an independent `x-enquiry-key` known only to the Worker and a private database table.

**Why:** A Supabase secret key maps to `service_role` and bypasses RLS. A publishable key maps to `anon`, so grants and RLS remain effective. The second key prevents anyone who knows the public project URL/key from bypassing the Worker and inserting directly.

**Dependency result:** `@supabase/supabase-js` was evaluated but rejected for v1; one insert does not justify its client, auth, realtime, and storage surface.

### ADR-009 — Fail closed and expose availability honestly

**Decision:** A shared server-only configuration parser produces one of `available`, `available-with-turnstile`, or `unavailable`. Unknown keys, partial tuples, and invalid URLs are errors. Form pages display that state; the endpoint independently re-checks it.

No configuration path may:

- return a fake reference;
- clear the form as if persisted;
- claim a message was delivered;
- log a successful submission event;
- accept a browser-controlled “mock”, “test”, or “skip verification” flag.

### ADR-010 — Pin and prove the toolchain

**Decision:** Commit an exact lockfile, pin Node and direct dependencies, use automated update pull requests, and upgrade vinext/React/RSC packages together after compatibility, build, preview, and E2E checks.

## 5. Route and rendering plan

### Static routes

Use explicit `dynamic = "force-static"` where it removes ambiguity. Dynamic slug routes define `generateStaticParams()` at the final dynamic segment and `dynamicParams = false`.

- `/`
- `/about`
- `/disciplines`
- `/athletes`
- `/athletes/[slug]`
- `/coaches-and-judges`
- `/governance`
- `/team`
- `/competitions`
- `/news`
- `/news/[slug]`
- `/privacy`
- `/terms`
- `not-found.tsx`
- `sitemap.ts`
- `robots.ts`

Static routes read only repository content. No cookies, headers, request-time database reads, or runtime feature flags. A content change produces a new deployment. Do not add ISR until there is a demonstrated publishing-frequency problem.

### Dynamic routes

- `/join`: dynamic RSC; reads only the public projection of form configuration and either renders the form or an unavailable state.
- `/contact`: same behaviour.
- `POST /api/enquiries`: uncached dynamic Route Handler; the only initial mutation endpoint.

The form pages pass the public Turnstile site key to the client as a prop. It remains public by design but is sourced from the same runtime configuration as the server secret, avoiding separate build-time configuration.

### Metadata and indexing

- Every page has server-rendered title, description, canonical URL, proposal-status wording, and appropriate Open Graph data.
- Use `WebSite`, `WebPage`, `Article`, and `BreadcrumbList` JSON-LD only when visible facts support them.
- Do not emit `SportsOrganization`, `Event`, `Person`, affiliation, rating, or recognition data until independently verified.
- Preview/staging responses must carry `X-Robots-Tag: noindex, nofollow` and HTML robots metadata; production must be tested for accidental `noindex`.
- Unknown slugs return a real 404, not a soft 200.

## 6. Component boundaries

### Server components

- `RootLayout`: fonts, metadata defaults, skip link, shell, security/status copy.
- `StatusRail`: immutable proposed-organisation disclosure.
- `SiteHeader` and `SiteFooter`: render semantic links; only the mobile drawer trigger/panel crosses into a client island.
- `PageHeader`, `Breadcrumbs`, `StatusLedger`, `SourceNote`, `EmptyState`, `ContentCard`, `PolicyRegister`, `ArticleBody`: content-only components.
- `FormPage`: reads the public availability projection and renders `EnquiryForm` only when persistence requirements are complete.

### Client components

- `MobileNav.client`: Radix Dialog focus management; no global app provider.
- `EnquiryForm.client`: local reducer/state, field and summary errors, pending lock, accessible status, preservation of values on retryable failure.
- `TurnstileWidget.client`: explicit rendering, retained widget ID, token callback, expiry/error handling, and reset after every submission attempt.
- `KineticDuet.client`: capability/visibility shell and static fallback.
- `KineticDuetCanvas.client`: separate lazy chunk containing Three.js/R3F.

### Server-only modules

- `lib/server/config.ts`: parses generated Worker bindings into a discriminated configuration result.
- `lib/server/enquiries/handler.ts`: framework-independent request pipeline.
- `lib/server/enquiries/turnstile.ts`: Siteverify adapter.
- `lib/server/enquiries/repository.ts`: Supabase REST adapter.
- `lib/server/enquiries/rate-limit.ts`: Rate Limit binding adapter and privacy-preserving key derivation.
- `lib/contracts/enquiry.ts`: Zod input/output schemas and inferred TypeScript types; safe client subset may be imported by the form.

Mark server modules with `server-only` where vinext supports it. Never import a server binding or secret from a client graph.

## 7. Proposed repository map

```text
.
├─ app/
│  ├─ (site)/
│  │  ├─ about/page.tsx
│  │  ├─ athletes/[slug]/page.tsx
│  │  ├─ athletes/page.tsx
│  │  ├─ coaches-and-judges/page.tsx
│  │  ├─ competitions/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ disciplines/page.tsx
│  │  ├─ governance/page.tsx
│  │  ├─ join/page.tsx
│  │  ├─ news/[slug]/page.tsx
│  │  ├─ news/page.tsx
│  │  ├─ privacy/page.tsx
│  │  ├─ team/page.tsx
│  │  ├─ terms/page.tsx
│  │  └─ page.tsx
│  ├─ api/enquiries/route.ts
│  ├─ error.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ not-found.tsx
│  ├─ robots.ts
│  └─ sitemap.ts
├─ components/
│  ├─ content/
│  ├─ forms/
│  │  ├─ EnquiryForm.client.tsx
│  │  └─ TurnstileWidget.client.tsx
│  ├─ layout/
│  ├─ three/
│  │  ├─ KineticDuet.client.tsx
│  │  ├─ KineticDuetCanvas.client.tsx
│  │  └─ StaticDuet.tsx
│  └─ ui/
├─ content/
│  ├─ athletes.ts
│  ├─ claims.ts
│  ├─ competitions.ts
│  ├─ governance.ts
│  ├─ news.ts
│  └─ site.ts
├─ lib/
│  ├─ contracts/
│  │  ├─ content.ts
│  │  └─ enquiry.ts
│  ├─ server/
│  │  ├─ config.ts
│  │  └─ enquiries/
│  │     ├─ handler.ts
│  │     ├─ rate-limit.ts
│  │     ├─ repository.ts
│  │     └─ turnstile.ts
│  └─ shared/
├─ public/
│  ├─ fonts/
│  ├─ images/
│  └─ social/
├─ supabase/
│  ├─ migrations/
│  └─ tests/
├─ tests/
│  ├─ component/
│  ├─ e2e/
│  ├─ unit/
│  └─ worker/
├─ cloudflare.config.ts
├─ next.config.ts
├─ playwright.config.ts
├─ tsconfig.json
├─ vite.config.ts
├─ vitest.config.ts
└─ package.json
```

This is a target map, not a request to create these files now.

## 8. TypeScript and dependency rules

Enable at least:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "useUnknownInCatchVariables": true,
  "noFallthroughCasesInSwitch": true,
  "verbatimModuleSyntax": true,
  "noEmit": true
}
```

- Parse network, environment, content, and storage data as `unknown`.
- Generate Cloudflare binding/runtime declarations with `cf workers types`; include `.cloudflare/types` in `tsconfig`. Do not hand-write a duplicate `Env`.
- Do not use `any`, double assertions, or non-null assertions at integration boundaries.
- Keep domain functions independent of React and the route adapter.
- Use Web Platform APIs in server code. Add `nodejs_compat` only as required by vinext/generated configuration, not to justify Node-only application libraries.
- Use exact direct versions plus a committed lockfile. Three.js is `0.x`; treat every minor update as potentially breaking.

## 9. Environment and binding contract

### Worker variables: non-secret

- `SITE_ENV`: `development | staging | production`.
- `PUBLIC_SITE_URL`: absolute canonical origin for the environment.
- `FORM_ALLOWED_ORIGINS`: comma-separated exact origins; no wildcard.
- `PRIVACY_NOTICE_VERSION`: immutable identifier stored with each enquiry.
- `SUPABASE_URL`: exact `https://<project>.supabase.co` origin.
- `SUPABASE_PUBLISHABLE_KEY`: low-privilege Supabase key. It is safe to expose according to Supabase, but this design keeps it server-side.
- `TURNSTILE_SITE_KEY`: public widget key; optional only as part of the complete Turnstile tuple.
- `TURNSTILE_HOSTNAMES`: comma-separated exact hostnames, without schemes or paths.

### Worker secrets

- `SUPABASE_ENQUIRY_GATE_KEY`: high-entropy UUID also registered in `private.enquiry_api_keys`.
- `TURNSTILE_SECRET_KEY`: required when any Turnstile setting is present.
- `RATE_LIMIT_KEY_SALT`: random secret used to HMAC the client network signal before it becomes a limiter key.

### Cloudflare binding

- `ENQUIRY_RATE_LIMITER`: Workers Rate Limiting binding. Require it for staging and production form availability; tests inject a deterministic adapter.

### CI/deployment only

- `CLOUDFLARE_ACCOUNT_ID`.
- `CLOUDFLARE_API_TOKEN`, scoped to the required Worker deployment resources.

These values must never be available to browser code. Local secret files must be ignored. Production secrets belong in Cloudflare’s secret store and CI’s protected secret store, not in `cloudflare.config.ts`, shell arguments, logs, or screenshots.

### Configuration truth table

Persistence is complete only when `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ENQUIRY_GATE_KEY`, `PRIVACY_NOTICE_VERSION`, allowed origins, rate-limit salt, and the limiter binding are all valid. Otherwise the capability is `unavailable`.

Turnstile is:

- `disabled` when site key, secret key, and hostnames are all absent;
- `required` when all are valid;
- `misconfigured` for every partial or invalid combination, which makes the form unavailable.

Production should normally enable Turnstile once the production hostname and widget exist. “Optional” is a configuration model, not a recommendation to omit bot verification indefinitely.

## 10. Enquiry API contract

### Request

`POST /api/enquiries`

Headers:

- `Content-Type: application/json`.
- Browser-generated requests must have an exact allowed `Origin`.

Body:

```ts
type EnquiryRequestV1 = {
  schemaVersion: 1;
  name: string;           // trimmed, 2–100 Unicode code points
  email: string;          // trimmed, maximum 254
  cityState?: string;     // trimmed, maximum 120
  enquiryType:
    | "general"
    | "participation"
    | "professional"
    | "club"
    | "event"
    | "governance"
    | "media"
    | "correction"
    | "privacy";
  message: string;        // trimmed, 10–2,000
  privacyAcknowledged: true;
  turnstileToken?: string; // required only when Turnstile is configured; max 2,048
  website?: string;       // honeypot; must be absent or empty
};
```

Reject unknown properties. Client-side validation is convenience only; the Worker schema is authoritative. Do not collect date of birth, identity documents, medical information, certificates, details about a child, or confidential safeguarding reports through this endpoint.

### Success

Only after a confirmed Supabase insert:

```json
{
  "ok": true,
  "reference": "019c…",
  "message": "Your enquiry has been recorded."
}
```

Status `201`, with `Cache-Control: no-store`. The reference is generated by `crypto.randomUUID()` in the Worker and persisted as the row ID. “Recorded” is accurate; do not say “emailed”, “delivered to the team”, or promise a response unless that process exists.

### Error envelope

```ts
type EnquiryError = {
  ok: false;
  error: {
    code:
      | "INVALID_REQUEST"
      | "VALIDATION_FAILED"
      | "ORIGIN_NOT_ALLOWED"
      | "VERIFICATION_FAILED"
      | "RATE_LIMITED"
      | "FORM_SERVICE_UNAVAILABLE";
    message: string;
    retryable: boolean;
    fieldErrors?: Record<string, readonly string[]>;
  };
  requestId: string;
};
```

Status mapping:

- `400`: malformed JSON, honeypot filled, or structurally invalid request.
- `403`: disallowed origin or a definitive Turnstile rejection.
- `413`: payload exceeds 16 KiB.
- `415`: unsupported media type.
- `422`: valid JSON with field-level validation failures.
- `429`: limiter rejected; include a conservative `Retry-After`.
- `503`: missing/partial integration configuration, Turnstile transport/upstream failure, Supabase timeout, or failed insert.

Do not relay provider payloads, schema internals, SQL details, keys, or stack traces.

### Processing order

1. Generate a request ID.
2. Require POST, JSON content type, and a bounded body. A bounded stream reader must stop after 16 KiB; `Content-Length` alone is not trusted.
3. Parse server configuration. Return `503` before consuming a Turnstile token when persistence is unavailable.
4. Check exact `Origin` against `FORM_ALLOWED_ORIGINS`; use `Sec-Fetch-Site` only as defence in depth.
5. Derive a limiter key from `CF-Connecting-IP` only, never a browser-supplied forwarding header. HMAC it with `RATE_LIMIT_KEY_SALT`.
6. Apply the approximate rate limit before Siteverify or Supabase.
7. Parse JSON as `unknown`; validate, normalise, reject unknown keys, and reject a non-empty honeypot.
8. If Turnstile is required, call Siteverify with an 8-second timeout, token, `CF-Connecting-IP`, and a UUID `idempotency_key`. Require HTTP success, `success === true`, action `enquiry`, and an allowed returned hostname.
9. Generate the enquiry UUID and perform one Supabase insert with an 8-second timeout.
10. Return `201` only for the expected PostgREST success. Log a structured result code and timings, never the body, email, message, IP, keys, or Turnstile token.
11. The client resets the retained Turnstile widget ID after every attempt because tokens are single-use.

Turnstile tokens are valid for five minutes, are at most 2,048 characters, and are single-use. A replay must fail.

## 11. Supabase persistence and proposed SQL/RLS

### HTTP insert

The Worker sends:

```http
POST https://<project>.supabase.co/rest/v1/enquiries
apikey: <SUPABASE_PUBLISHABLE_KEY>
Content-Profile: api
Content-Type: application/json
Prefer: return=minimal
x-enquiry-key: <SUPABASE_ENQUIRY_GATE_KEY>
```

Do not send a new short publishable key as `Authorization: Bearer`; it is not a JWT. Do not use `SUPABASE_SECRET_KEY`, legacy `service_role`, or legacy `anon` keys for a new integration.

### Migration sketch

Apply through a reviewed migration, then add `api` to Supabase’s exposed schemas. Supabase’s custom-schema guide shows broad grants as a generic example; this design intentionally uses narrower grants.

```sql
begin;

create schema if not exists api;
create schema if not exists private;

revoke all on schema api from public;
revoke all on schema private from public;

create table api.enquiries (
  id uuid primary key,
  submitted_at timestamptz not null default now(),
  source text not null default 'website'
    check (source = 'website'),
  status text not null default 'new'
    check (status in ('new', 'in_review', 'closed', 'deleted')),
  name text not null
    check (char_length(name) between 2 and 100),
  email text not null
    check (
      char_length(email) between 3 and 254
      and position('@' in email) > 1
    ),
  city_state text
    check (city_state is null or char_length(city_state) between 1 and 120),
  enquiry_type text not null
    check (
      enquiry_type in (
        'general',
        'participation',
        'professional',
        'club',
        'event',
        'governance',
        'media',
        'correction',
        'privacy'
      )
    ),
  message text not null
    check (char_length(message) between 10 and 2000),
  privacy_notice_version text not null
    check (char_length(privacy_notice_version) between 1 and 64)
);

alter table api.enquiries enable row level security;
alter table api.enquiries force row level security;

revoke all on table api.enquiries from public, anon, authenticated;
grant usage on schema api to anon;
grant insert (
  id,
  name,
  email,
  city_state,
  enquiry_type,
  message,
  privacy_notice_version
) on table api.enquiries to anon;

create table private.enquiry_api_keys (
  id uuid primary key,
  label text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table private.enquiry_api_keys enable row level security;
alter table private.enquiry_api_keys force row level security;
revoke all on table private.enquiry_api_keys from public, anon, authenticated;

create or replace function private.enquiry_gate_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.enquiry_api_keys as key
    where key.enabled
      and key.id::text = coalesce(
        (
          coalesce(
            nullif(current_setting('request.headers', true), ''),
            '{}'
          )::jsonb ->> 'x-enquiry-key'
        ),
        ''
      )
  );
$$;

revoke all on function private.enquiry_gate_ok() from public;
grant usage on schema private to anon;
grant execute on function private.enquiry_gate_ok() to anon;

create policy enquiries_insert_from_worker
on api.enquiries
for insert
to anon
with check (
  source = 'website'
  and private.enquiry_gate_ok()
);

commit;
```

### Security properties

- `anon` can insert only the listed public columns.
- `anon` cannot set `status`, `source`, or `submitted_at`.
- There is no `SELECT`, `UPDATE`, or `DELETE` grant or policy.
- A publishable key alone cannot insert; the RLS helper also requires the Worker-only gate key.
- The gate table is in a private schema, has no client table grants, and is read only by a constrained `SECURITY DEFINER` function with an empty `search_path`.
- Database constraints repeat critical length and enum rules.
- The Worker requests `return=minimal`, so the insert does not require a select grant.

### Provisioning and rotation

Generate a cryptographically random UUID outside source control. Insert it into `private.enquiry_api_keys` through a protected administrative path and store the same value as the Cloudflare secret. Never place the value in a migration. Rotate by adding a new enabled row, updating the Worker secret, validating, then disabling and deleting the old row.

Use separate Supabase projects/branches and separate gate keys for local, staging, and production. Run database tests that explicitly set the `anon` role and request headers. Assert:

- insert without the gate key fails;
- insert with a wrong or disabled key fails;
- valid insert succeeds;
- select/update/delete always fail for `anon` and `authenticated`;
- disallowed columns cannot be supplied;
- constraints reject invalid rows;
- no function or schema grants accidentally expose stored enquiries.

## 12. Abuse resistance

### Required layers

1. Exact method, media type, body size, schema, enum, and length checks.
2. Same-origin policy and no permissive CORS.
3. Non-empty honeypot rejection; do not pretend it succeeded.
4. Cloudflare Rate Limiting binding before external calls.
5. Turnstile when configured, always verified server-side.
6. Supabase custom gate plus RLS and constraints.
7. Timeouts, no automatic submission retry, and structured monitoring.

### Initial limiter proposal

Start with a tolerant limit such as 10 attempts per 60 seconds per HMAC’d `CF-Connecting-IP`, then tune from observed legitimate and abusive traffic. This is the least-bad anonymous actor signal, but it can penalise users behind mobile/carrier NAT and can be evaded with distributed or rotating addresses.

Cloudflare’s Rate Limiting binding is approximate and scoped per Cloudflare location. It is not a strict global security boundary. A Durable Object would provide a stricter distributed limit but is disproportionate for a low-risk enquiry form. Optional account-level WAF/rate-limit rules and managed challenge can absorb obvious abuse before Worker invocation.

Do not persist raw IP addresses in the enquiry table. If an abuse fingerprint is later retained, complete privacy review, use a keyed digest and short retention, and document it in the privacy notice.

## 13. Testing strategy

### Unit tests — Vitest

- Content schemas, claim-state invariants, canonical metadata, and slug uniqueness.
- Enquiry normalisation and every validation branch, including unknown keys, Unicode boundaries, control characters, overlong values, and honeypot.
- Configuration truth table: absent, complete, partial, malformed, and environment-specific hostnames.
- Turnstile result parser: success, wrong action, wrong hostname, reject, replay, timeout, non-2xx, and malformed JSON.
- Supabase adapter: exact endpoint/headers/body, timeout, unexpected status, and provider-body redaction.
- 3D path maths, geometry bounds, reduced-motion/load eligibility, pause and context-loss state.

### Component tests — Vitest + React Testing Library

Use jsdom in a separate test project:

- landmarks, labels, error summary, focus movement, pending lock, field preservation, retryable error, and confirmed success;
- widget lifecycle and reset after every request;
- unavailable form state when persistence or partial Turnstile configuration is detected;
- mobile dialog focus containment, Escape close, and focus restoration;
- static 3D fallback, no lazy import under reduced motion/Save-Data/unsupported WebGL, and cleanup.

### Worker-runtime tests

Use `@cloudflare/vitest-plugin`, not the superseded `@cloudflare/vitest-pool-workers`. Keep its configuration separate from jsdom tests because custom environments are not supported in the Workers integration.

- Run the framework-independent handler in `workerd` with generated Worker types.
- Inject deterministic limiter and fetch adapters.
- Assert `503` and zero outbound calls when unconfigured.
- Assert ordering: limit before Siteverify, Siteverify before persistence.
- Assert no PII or token appears in structured logs.
- Use a local Supabase stack for the migration/RLS matrix; no hosted credentials are required.

The current vinext typed `cloudflare.config.ts` testing path is newer than the documented Wrangler examples. Prefer explicit `main`/Miniflare test options or the scaffold’s generated test integration, and prove it in CI rather than assuming config-loader parity.

### Browser tests — Playwright

Run the built application under the Cloudflare Vite/workerd preview, not only the dev server:

- Chromium, Firefox, WebKit, and a mobile Chromium project.
- Navigation, deep links, 404 status, metadata, empty states, and no hydration/console errors.
- Form success against a server-side test adapter/local Supabase; validation, `403`, `413`, `415`, `429`, `503`, double-submit lock, offline/timeout, and no false success.
- Reduced motion, disabled WebGL, failed lazy chunk, context loss, 320 px reflow, zoom, forced colours, keyboard order, and visible focus.
- No request puts form values or tokens in URLs.

### Accessibility — axe plus manual

- Use `@axe-core/playwright` on every route template and menu open, validation error, unavailable, success, 404, and reduced-motion states.
- Fail on unreviewed violations; do not broadly exclude the canvas shell or third-party widget.
- Manually test WCAG 2.2 AA concerns automation cannot prove: logical reading/focus order, 400% zoom, text spacing, reduced motion, status announcements, meaningful alternatives, and Turnstile usability.
- Release checks should include NVDA on Windows, VoiceOver/Safari, and TalkBack/Android where hardware is available.

### Release gates

- Clean lockfile install, strict typecheck, lint/format check, unit/component/Worker tests, production build, and `vinext check`.
- Playwright/axe against the built preview.
- Static asset and route bundle budgets; Three/R3F absent from the critical route chunk.
- Staging live smoke with real Turnstile and Supabase before enabling forms.
- A fresh real Turnstile token succeeds once and replay fails.
- Database state confirms one row; the tagged synthetic row is deleted through an authorised administrative process.
- Missing production credentials still produce the specified `503`, never a skipped test or mock success.

## 14. Deployment and operations

### Build baseline

- Pin Node.js `24.22.1` LTS because the current `cf` package requires Node `^24.22.0` on the 24.x line.
- Create the future project through the current Cloudflare/vinext scaffold and select Cloudflare. Do not hand-assemble generated Vite/Worker internals.
- Commit `cloudflare.config.ts`, Vite/Next config, package manifest, and lockfile; ignore generated Cloudflare Build Output and generated types.
- Set Worker compatibility date to `2026-10-25`; review compatibility changes before advancing it.
- Preserve vinext’s generated Static Assets exclusions for `/_next/static/*`. Incorrect `runWorkerFirst` patterns can make scripts/styles return 404.

### Environments

- Local: synthetic data, deterministic test adapters, local Supabase; never production resources.
- Preview: public URLs are access-controlled where possible and always `noindex, nofollow`; isolated secrets and database.
- Staging: production-like bindings and real vendor integrations using non-production projects/widgets.
- Production: separate keys, strict hostname/origin allowlists, custom domain, and no test bypass.

Build mode and deployment environment must be explicit. Record commit, lockfile, Node version, generated output digest, compatibility date, and target Worker for each release.

### Pipeline

1. Clean install from the lockfile.
2. Secret/dependency scan, typecheck, lint, format, unit/component/Worker tests.
3. `vinext check`.
4. Production build.
5. Workerd preview, Playwright, axe, headers, links, and performance budgets.
6. Deploy preview/staging; verify bindings, noindex, logs, and live integrations.
7. Deploy the approved build to production through `@vinext/cloudflare`.
8. Run non-destructive production smoke checks and retain rollback metadata.

The vinext Cloudflare integration currently deploys through `cf` and `cloudflare.config.ts`; do not mix it with hand-maintained Wrangler project configuration. `wrangler` may remain a transitive/tool dependency, but it is not the source of deployment truth for this design.

### Observability

- Enable Workers Logs and traces explicitly in the generated typed configuration; sample production traffic to control cost.
- Upload source maps without serving source files publicly.
- Emit structured events such as `enquiry_rejected`, `turnstile_upstream_failed`, `supabase_insert_failed`, and `enquiry_recorded`.
- Include request ID, environment, result code, status, and coarse timings only.
- Never log names, emails, messages, raw IPs/fingerprints, request bodies, API keys, Turnstile tokens, provider bodies, or authorisation headers.
- Alert on sustained `5xx`, `429`, Siteverify failure, Supabase failure, and absence of expected form success after enablement.

### Operational ownership

Persistence is the durable handoff. Before form enablement, an accountable operator must own monitoring, response, access, retention, correction, deletion, and incident handling. If no operator/data controller exists, ship the informational site with the form unavailable.

## 15. Compatibility report

Checked against official package registry metadata and official documentation on **25 October 2026**. Initial implementation should use exact pins and a lockfile; versions below are not a promise that future latest releases remain compatible.

### Platform/toolchain

- [Node.js 24.22.1](https://nodejs.org/dist/latest-v24.x/) — LTS; satisfies the strictest current CLI engine.
- [vinext 1.3.0](https://www.npmjs.com/package/vinext/v/1.3.0) — requires Node `>=22`, Vite `^8`, React/React DOM `^19.3.1`, `@vitejs/plugin-rsc ^0.5.37`, and `react-server-dom-webpack ^19.3.1`.
- [@vinext/cloudflare 1.2.0](https://www.npmjs.com/package/@vinext/cloudflare/v/1.2.0) — peers with vinext `^1.3.0`, `cf`, and the Cloudflare Vite plugin.
- [create-vinext-app 1.1.0](https://www.npmjs.com/package/create-vinext-app/v/1.1.0) — official vinext starter, Node `>=22`.
- [create-cloudflare 2.74.3](https://www.npmjs.com/package/create-cloudflare/v/2.74.3) — Cloudflare’s alternative scaffold path; Node `>22`.
- [cf 1.0.0-beta.21](https://www.npmjs.com/package/cf/v/1.0.0-beta.21) — beta; engine includes `^24.22.0`.
- [@cloudflare/vite-plugin 2.0.0-beta.v.4](https://www.npmjs.com/package/@cloudflare/vite-plugin/v/2.0.0-beta.v.4) — current v2 beta checked because vinext’s deployment guide says the initializer installs v2; peers with Vite `^7 || ^8`.
- [@cloudflare/vite-plugin 1.65.0](https://www.npmjs.com/package/@cloudflare/vite-plugin/v/1.65.0) — registry `latest` stable tag on the check date. Do not manually substitute it for the initializer’s v2 choice without a build/preview compatibility run.
- [Vite 8.3.5](https://www.npmjs.com/package/vite/v/8.3.5) — compatible with vinext and Tailwind; supports Node `>=22.12` on the selected line.
- [@vitejs/plugin-react 6.1.2](https://www.npmjs.com/package/@vitejs/plugin-react/v/6.1.2) — compatible with Vite 8 and vinext’s peer range.
- [@vitejs/plugin-rsc 0.5.38](https://www.npmjs.com/package/@vitejs/plugin-rsc/v/0.5.38) — satisfies vinext `^0.5.37`; pre-1.0, so pin exactly.
- [React 19.3.1](https://www.npmjs.com/package/react/v/19.3.1), [React DOM 19.3.1](https://www.npmjs.com/package/react-dom/v/19.3.1), and [react-server-dom-webpack 19.3.1](https://www.npmjs.com/package/react-server-dom-webpack/v/19.3.1) — exact aligned set required by vinext.
- [Next.js 16.4.3](https://www.npmjs.com/package/next/v/16.4.3) was registry latest, while vinext’s live dashboard tested Next.js `16.2.6` on 25 October. A new pure vinext starter may not need the `next` runtime package; do not add it solely for branding. The contract is the stable Next.js 16 App Router API surface.
- [TypeScript 7.0.2](https://www.npmjs.com/package/typescript/v/7.0.2) — current stable checked; pin because it is a new major.

### UI/runtime

- [Tailwind CSS 4.3.3](https://www.npmjs.com/package/tailwindcss/v/4.3.3) and [@tailwindcss/vite 4.3.3](https://www.npmjs.com/package/@tailwindcss/vite/v/4.3.3) — matched versions; Vite plugin accepts Vite 8.
- [lucide-react 1.61.0](https://www.npmjs.com/package/lucide-react/v/1.61.0) — peers with React 19.
- [@radix-ui/react-dialog 1.3.1](https://www.npmjs.com/package/@radix-ui/react-dialog/v/1.3.1) — peers with React/React DOM 19; the only proposed Radix runtime package initially.
- [three 0.186.1](https://www.npmjs.com/package/three/v/0.186.1), [@types/three 0.186.0](https://www.npmjs.com/package/@types/three/v/0.186.0), and [@react-three/fiber 9.8.2](https://www.npmjs.com/package/@react-three/fiber/v/9.8.2) — R3F’s peer range is React `>19 <19.4`, React DOM `>19 <19.4`, and Three `>0.156`; the selected versions satisfy it.
- [Motion 14.6.0](https://www.npmjs.com/package/motion/v/14.6.0) — peers with React/React DOM 18 or 19.
- [Zod 4.6.7](https://www.npmjs.com/package/zod/v/4.6.7) — selected for boundary contracts; above Cloudflare guidance’s 4.5.0 memory-retention floor.

### Test stack

- [Vitest 5.0.5](https://www.npmjs.com/package/vitest/v/5.0.5) — peers with Vite 8.
- [@cloudflare/vitest-plugin 1.4.7](https://www.npmjs.com/package/@cloudflare/vitest-plugin/v/1.4.7) — current Workers integration; peers with Vitest `^4.1 || ^5`. It replaces `@cloudflare/vitest-pool-workers`.
- [jsdom 30.1.3](https://www.npmjs.com/package/jsdom/v/30.1.3).
- [@testing-library/dom 10.4.2](https://www.npmjs.com/package/@testing-library/dom/v/10.4.2), [@testing-library/react 16.3.3](https://www.npmjs.com/package/@testing-library/react/v/16.3.3), [@testing-library/jest-dom 7.0.1](https://www.npmjs.com/package/@testing-library/jest-dom/v/7.0.1), and [@testing-library/user-event 14.6.8](https://www.npmjs.com/package/@testing-library/user-event/v/14.6.8) — compatible with React 19/Vitest 5.
- [@playwright/test 1.64.1](https://www.npmjs.com/package/@playwright/test/v/1.64.1).
- [@axe-core/playwright 4.14.0](https://www.npmjs.com/package/@axe-core/playwright/v/4.14.0) — requires a modern Playwright core and Node `>=22.12`.

### Evaluated but not selected

- [@supabase/supabase-js 2.118.0](https://www.npmjs.com/package/@supabase/supabase-js/v/2.118.0) — compatible with the Node toolchain, but unnecessary for one server-side REST insert.
- [wrangler 4.152.0](https://www.npmjs.com/package/wrangler/v/4.152.0) — current registry version checked; not the project configuration/deploy source when vinext generates `cloudflare.config.ts` and uses `cf`.
- [@radix-ui/react-navigation-menu 1.4.1](https://www.npmjs.com/package/@radix-ui/react-navigation-menu/v/1.4.1) — compatible, but native semantic desktop navigation is smaller.

### Compatibility/stability findings

- Cloudflare’s Next.js guide calls vinext beta even though npm has stable `1.x` tags. Treat the official beta warning as authoritative.
- The live vinext dashboard reported 99.6% pass on its supported surface, 95.9% overall, and 93.9% supported-surface coverage against Next.js 16.2.6 on 25 October 2026. This is strong but not full parity.
- vinext targets stable Next.js 16. Cache Components and Partial Prerendering remain incomplete; image/font build behaviour is not identical.
- `cf` and the Vite plugin v2 path are beta. Pinning and staging proof are mandatory.
- RSC package alignment is security-sensitive: upgrade React, React DOM, and `react-server-dom-webpack` as one tested set.
- R3F v10 is alpha; stay on 9.8.2. Three’s `0.x` numbering warrants exact pins and visual/performance regression tests.
- Supabase is deprecating legacy `anon` and `service_role` keys by the end of 2026. Use the new publishable key plus the custom gate; never a secret key for this RLS path.

## 16. Ownership map

- **Product/content owner:** sitemap scope, truthful proposal status, approved actions, source records, and release claims.
- **Web platform/release owner:** vinext/Vite/Cloudflare configuration, dependency pins, compatibility checks, CI, previews, production deploy, and rollback.
- **Frontend/design-system owner:** server/client boundaries, Tailwind tokens, Radix wrappers, responsive behaviour, and bundle budgets.
- **3D/performance owner:** Three/R3F scene, fallback, lifecycle, GPU/device testing, and deferred chunk budget.
- **Data/security owner:** form contract, configuration parser, Turnstile, limiter, Supabase migration/RLS tests, secret rotation, logs, and incident response.
- **Privacy/legal owner:** actual data controller, purpose/lawful basis, notice version, processors/transfers, retention/deletion, children’s-data boundary, terms, and professional review.
- **Accessibility owner:** WCAG mapping, keyboard/AT/manual evidence, Turnstile review, and waiver rejection for Level A/AA failures.
- **Independent QA/release approver:** exact-artifact test evidence, live failure/success paths, noindex checks, residual risk, and go/no-go.
- **Operations/enquiry owner:** daily monitoring, authorised record access, response expectations, deletion, corrections, and outage communication.

No one person needs every role, but every role needs a named accountable owner before its capability is enabled.

## 17. Principal trade-offs and risks

1. **vinext/cf maturity — high:** current strategic fit, incomplete parity and beta deployment pieces. Mitigate with the narrow feature set, exact pins, live compatibility dashboard, preview E2E, and static-export fallback.
2. **No live credentials — release blocker for forms:** code can be contract-tested locally, but no real end-to-end success can be claimed. Default to unavailable/503 until staging and production smoke tests pass.
3. **External write latency/outage — medium:** Supabase and optional Siteverify add network hops. Use bounded timeouts, no automatic mutation retry, explicit `503`, and traces.
4. **Anonymous insert design — medium:** a publishable Supabase key alone is public and an `anon WITH CHECK true` policy would be bypassable. The separate gate key in RLS is therefore required.
5. **Turnstile accessibility/privacy — medium:** it is third-party UI and data processing. Test it with keyboard/AT, document it, and provide a verified alternative contact route when one exists; never silently bypass it.
6. **IP-based limiting — medium:** the only practical anonymous actor signal can affect shared mobile networks and is not strict globally. Use tolerant limits and Turnstile, then tune from evidence.
7. **3D performance — medium:** Three/R3F can dominate JavaScript/GPU cost. Keep it off the critical path, do not load under reduced motion/Save-Data, and enforce real-device budgets.
8. **Content/legal misrepresentation — high:** premium presentation can imply authority. Status disclosure, source-backed content contracts, empty states, and release approval are architectural requirements.
9. **Operational privacy — high:** a database row is useful only if an accountable controller can lawfully monitor, retain, and delete it. Keep forms closed until that process exists.
10. **Build-time dependency volatility — medium:** TypeScript 7, RSC, Vite 8, Three `0.x`, and beta Cloudflare tooling require exact lockfile upgrades, not floating ranges.

## 18. Integration and release checklist

### Architecture/toolchain

- [ ] Re-check the Cloudflare Next.js guide, vinext differences, compatibility dashboard, and package metadata on implementation day.
- [ ] Scaffold with the current official Cloudflare/vinext path; select Cloudflare; commit only source configuration.
- [ ] Pin Node 24.22.1, direct packages, browsers, and the lockfile.
- [ ] Set compatibility date `2026-10-25`, then review before future date changes.
- [ ] Run `vinext check`; document every unsupported/deferred feature used by the app.
- [ ] Confirm generated Static Assets routing and hashed assets in the built preview.

### Supabase

- [ ] Create isolated local/staging/production projects or branches.
- [ ] Apply the reviewed migration and expose only schema `api`.
- [ ] Confirm no broad default table/function grants remain.
- [ ] Generate a separate gateway UUID per environment; store it only in the private table and Cloudflare secret store.
- [ ] Configure a new publishable key; do not use legacy `anon`, service-role, or secret keys.
- [ ] Run and retain the full RLS/grant matrix and database-state assertions.
- [ ] Define authorised staff access outside the public Data API.
- [ ] Approve and test retention/deletion before accepting personal data.

### Turnstile

- [ ] Create separate non-production and production widgets for approved hostnames.
- [ ] Set stable action `enquiry`.
- [ ] Configure site key, secret, and exact hostname list as one atomic change.
- [ ] Add required CSP `script-src`, `frame-src`, and connection allowances without broad wildcards.
- [ ] Validate server-side success, action, hostname, five-minute expiry, single use, provider timeout, and replay.
- [ ] Test widget keyboard, screen reader, zoom, error, expiry, and reset behaviour.

### Cloudflare

- [ ] Configure exact origins, secrets, rate-limit binding, custom domains, and environment isolation in the generated typed config.
- [ ] Generate Worker types and fail CI on config/type drift.
- [ ] Enable source maps, structured logs, and sampled traces; verify PII/token redaction.
- [ ] Protect preview/staging and enforce `noindex, nofollow`; prove production is indexable.
- [ ] Verify HTTPS, security headers, cache headers, asset compression, and correct 404/API statuses.
- [ ] Record rollback procedure and deployment/version identifiers.

### Form readiness

- [ ] Name the real website operator/data controller and operational enquiry owner.
- [ ] Approve purpose, required fields, notice version, processors/transfers, retention, access, deletion, and incident handling.
- [ ] Confirm the form explicitly excludes emergencies, confidential safeguarding reports, medical data, documents, and details about children.
- [ ] Verify unconfigured and partially configured paths return `503 FORM_SERVICE_UNAVAILABLE` with no outbound call or success UI.
- [ ] Verify one real accepted submission persists exactly once and returns `201`.
- [ ] Verify Supabase/Turnstile outages return retryable `503`, invalid verification returns `403`, and limiting returns `429`.
- [ ] Delete the tagged smoke record through an authorised path and retain evidence.

### Experience and quality

- [ ] Confirm every route is useful with no published people, competitions, news, or integrations.
- [ ] Confirm all organisation-status and relationship claims are sourced and approved.
- [ ] Enforce JavaScript, CSS, image, font, and deferred 3D budgets.
- [ ] Run Vitest/RTL/Worker tests and Playwright/axe on the built workerd preview.
- [ ] Complete manual WCAG 2.2 AA, keyboard, AT, zoom, forced-colours, reduced-motion, and mobile checks.
- [ ] Test no WebGL, context loss, Save-Data, slow network, and failed lazy chunks.
- [ ] Obtain independent release approval for the exact production artifact.

## 19. Official references

Platform and framework:

- Cloudflare Next.js guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- vinext documentation: https://vinext.dev/docs
- vinext Cloudflare deployment: https://vinext.dev/docs/deploying/cloudflare
- vinext differences: https://vinext.dev/docs/reference/differences
- vinext compatibility dashboard: https://vinext.dev/compatibility
- Cloudflare CLI: https://developers.cloudflare.com/cf/
- Cloudflare Vite plugin: https://developers.cloudflare.com/workers/vite-plugin/
- Next.js App Router: https://nextjs.org/docs/app

Security, data, and operations:

- Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Workers Rate Limiting binding: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Workers Logs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
- Workers traces: https://developers.cloudflare.com/workers/observability/traces/
- Supabase API keys: https://supabase.com/docs/guides/api/api-keys
- Supabase API security: https://supabase.com/docs/guides/api/securing-your-api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase custom schemas: https://supabase.com/docs/guides/api/using-custom-schemas

UI and test stack:

- Tailwind with Vite: https://tailwindcss.com/docs/installation/using-vite
- Motion bundle reduction: https://motion.dev/docs/react-reduce-bundle-size
- React Three Fiber introduction: https://r3f.docs.pmnd.rs/getting-started/introduction
- Radix Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- Cloudflare Workers Vitest integration: https://developers.cloudflare.com/workers/testing/vitest-integration/
- Playwright accessibility testing: https://playwright.dev/docs/accessibility-testing
