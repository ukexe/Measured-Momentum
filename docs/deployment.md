# Deployment

**Platform:** Cloudflare Workers Static Assets plus one API Worker  
**Rule:** this is a runbook. Do not deploy without an approved release record
and accountable operator.

## Current deployment shape

`wrangler.jsonc` currently defines:

- Worker name `measured-momentum-foundation`;
- entrypoint `worker/index.ts`;
- compatibility date `2026-10-25` with `nodejs_compat`;
- Static Assets directory `out` bound as `ASSETS`;
- exported 404 handling and forced trailing-slash HTML;
- Worker-first routing only for `/api/*`;
- `ENQUIRY_RATE_LIMITER` at 10 attempts per 60 seconds;
- persisted logs/traces with query-string redaction.

The top-level configuration has **no named staging/production environments,
custom routes/domains or Worker vars**. The package exposes only
`npm run deploy:dry-run`; it has no script that can make an external
deployment. The unnamed default Worker is not safe evidence of environment
isolation.

Before any external deployment, approve and commit either:

1. explicit `env.staging` and `env.production` targets with distinct Worker
   names, bindings and variable ownership; or
2. an equally explicit release record naming the separate config files,
   Worker names, routes/domains and account/profile used.

Until then, named staging and production deploy commands below are blocked.

## Current hosted engineering preview

Commit
[`fff7068a23536ee6359f1d72a22227bacba2ed60`](https://github.com/ukexe/Measured-Momentum/commit/fff7068a23536ee6359f1d72a22227bacba2ed60)
is hosted through the top-level Worker at:

<https://measured-momentum-foundation.ukexe06.workers.dev/>

- Cloudflare version: `20ea3c91-7ed1-43a7-94cb-b33be020b526`;
- static tree SHA-256:
  `a154a2b6372ea813b547c0f3a8a8611ff0ecb0cd42fc86e8bf80ce60db21a376`;
- canonical URLs use the exact `workers.dev` origin;
- staging metadata and `robots.txt` disallow indexing;
- no Worker data-provider values or Turnstile secrets are configured;
- the enquiry status is unavailable and POST fails closed with `503`.

This public engineering preview is not an approved production environment. It
has no custom domain, Cloudflare Access restriction, database persistence or
operational enquiry handling.

## Release prerequisites

Record:

- approved commit/archive identity and clean committed lockfile;
- Node `22.23.2`, npm `10.9.8` and Wrangler `4.152.0`;
- Cloudflare account/profile, target Worker name and approved custom domain;
- previous active Cloudflare version ID;
- environment-specific build URL/index state;
- Worker variable and secret owners;
- Supabase project/region, migration version, private gate record and RLS test
  evidence;
- legal/content approvals and rollback owner.

Run the quality commands in `testing.md`. A Wrangler dry run validates local
bundling only; it does not validate account bindings, domain routes, secrets,
live rate limits or Supabase.

## Build-time environment and indexing

Static canonical and robots metadata is compiled into `out/`, so staging and
production are separate artifacts. Do not build once and promote the same
files while changing only Worker variables.

Every Next.js build validates `NEXT_PUBLIC_SITE_ENV`. Staging and production
also require a clean, non-placeholder HTTPS origin in
`NEXT_PUBLIC_SITE_URL`; credentials, paths, queries, fragments, local hosts
and `.invalid` hosts fail the build.

For staging in PowerShell:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://<approved-staging-host>"
$env:NEXT_PUBLIC_SITE_ENV = "staging"
npm ci
npm run build
npm exec wrangler -- deploy --env staging --dry-run
```

For production:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://<approved-production-host>"
$env:NEXT_PUBLIC_SITE_ENV = "production"
npm ci
npm run build
npm exec wrangler -- deploy --env production --dry-run
```

Replace placeholders; never run them literally. Inspect `out/` and the local
Wrangler preview before upload.

Staging requirements:

- every page emits noindex/nofollow metadata;
- `robots.txt` disallows `/`;
- the canonical host is the approved staging host, never
  `example.invalid`, localhost or production;
- Cloudflare Access or an approved network restriction protects the host.

The repository does not emit an environment-specific `X-Robots-Tag`, and
`robots.txt` is not access control. Staging restriction is an external
Cloudflare task and release blocker. The current `workers.dev` preview contains
only already-public proposal content and must not be used for private review
material.

Production requirements:

- only exact `NEXT_PUBLIC_SITE_ENV=production` enables index/follow on general
  routes and allows `/` in `robots.txt`;
- the canonical, Open Graph and sitemap host is the approved HTTPS domain;
- `/privacy/` and `/terms/` remain page-level `noindex` until their policy
  decision changes and are excluded from the sitemap.

## Worker environment

Required base values:

- `SITE_ENV`
- `PUBLIC_SITE_URL`
- `FORM_ALLOWED_ORIGINS`
- `PRIVACY_NOTICE_VERSION`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_ENQUIRY_GATE_KEY`
- `RATE_LIMIT_KEY_SALT`
- `ENQUIRY_RATE_LIMITER` binding

Optional Turnstile is all-or-nothing:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_HOSTNAMES`

`SITE_ENV`, `PUBLIC_SITE_URL` and allowed origins must match the target;
production allows HTTPS only. Use isolated staging and production Supabase
projects/branches and gate values.

Provision the gate key, salt and Turnstile secret through an approved
Cloudflare secret workflow. Interactive Wrangler form, after named
environments exist:

```powershell
npm exec wrangler -- secret put SUPABASE_ENQUIRY_GATE_KEY --env staging
npm exec wrangler -- secret put RATE_LIMIT_KEY_SALT --env staging
npm exec wrangler -- secret put TURNSTILE_SECRET_KEY --env staging
```

Repeat only for production under separate approval. Do not pass values as
arguments, echo them, commit a secrets file or put them in `NEXT_PUBLIC_*`.
Omit all three Turnstile values when Turnstile is intentionally disabled.

Prefer version-controlled, environment-scoped non-secret vars. If the approved
design instead manages vars in the dashboard, use `--keep-vars` on deploy and
record their names/owners; without it, Wrangler deploy can delete dashboard
vars before setting configured vars. Secrets are not a substitute for missing
environment ownership.

## Supabase gate

Before an enabled-form deployment:

1. apply the committed migration to an isolated target through the approved
   database migration process;
2. configure the Data API to expose the `api` schema as intended;
3. provision one random enabled UUID in
   `private.enquiry_api_keys` with a non-sensitive label;
4. store the same UUID as the environment’s Worker gate secret;
5. execute and retain the isolated RLS test described in `security.md`;
6. independently verify live REST insert-only behavior and denied
   read/update/delete paths;
7. approve operational access, retention, deletion, backup and incident
   procedures.

Do not run the transactional workstream SQL against production. Do not enable
the form merely because the status endpoint can parse configuration.

## Static Assets deployment sequence

After named environments and all gates exist:

1. record the current version:

   ```powershell
   npm exec wrangler -- versions list --env staging --json
   ```

2. set the approved build-time values, run the full quality gate and produce
   `out/`;
3. inspect the dry run:

   ```powershell
   npm exec wrangler -- deploy --env staging --dry-run
   ```

4. deploy the exact staged source with conflict protection and a traceable
   message:

   ```powershell
   npm exec wrangler -- deploy --env staging --strict --message "<commit> staging"
   ```

   Add `--keep-vars` only for the approved dashboard-var model.

5. run staging smoke checks and obtain release approval;
6. rebuild with production canonical/index values and repeat all artifact
   checks;
7. record the current production version, then deploy:

   ```powershell
   npm exec wrangler -- versions list --env production --json
   npm exec wrangler -- deploy --env production --strict --message "<commit> production"
   ```

8. run production smoke checks immediately and record artifact/version IDs.

`npm run deploy:dry-run` cannot publish. Do not add or use a generic deploy
script for staging or production: the current repository still lacks named
environment targets and an explicit dashboard-var preservation policy. The
manual external commands above remain blocked until those controls and the
release record are approved.

## Smoke checks

Run against the exact custom hostname, not only `workers.dev`.

Static delivery:

- all 13 public routes return `200`, show
  **Proposed organisation · In development**, one H1 and the global shell;
- a missing route and both unpublished dynamic sentinels return a real `404`;
- trailing-slash behavior is canonical and assets load without console/network
  errors;
- the SVG Saath Rekha fallback is immediate; reduced-motion and Save-Data do
  not request the canvas chunk; an eligible browser can load and pause it;
- static security and immutable hashed-asset headers match `public/_headers`.

Indexing:

- canonical, Open Graph and sitemap URLs use the target host;
- staging HTML is noindex and `robots.txt` disallows `/`;
- production general routes are indexable and `robots.txt` allows `/`;
- privacy/terms are noindex and absent from the sitemap;
- no URL contains `example.invalid`, localhost or the other environment;

API:

- unknown `/api/*` is JSON `404`; wrong methods return JSON `405` plus `Allow`;
- `GET /api/enquiries/status` is `200`, `no-store` and exactly matches the
  intended enabled/disabled mode;
- in credentialless mode, a JSON `POST /api/enquiries` returns
  `503 FORM_SERVICE_UNAVAILABLE` and no provider/row side effect;
- in enabled mode, use an approved synthetic record to verify exact origin,
  rate limit, optional live Turnstile, one durable row, returned `201`,
  redacted logs and the operational deletion process.

Never use real personal data in smoke tests. Live enabled-mode checks require
privacy/operations approval; leave the service unavailable otherwise.

## Rollback

Select the previously recorded version ID and state the incident reason:

```powershell
npm exec wrangler -- rollback <version-id> --env production --message "<incident-reference>"
```

Use `--env staging` for staging. Confirm the prompt unless the incident
procedure explicitly authorises `--yes`.

Rollback immediately creates a deployment of the selected Worker version.
Repeat all smoke checks and record the new deployment/version. Do not assume it
reverts Supabase schema/data, gate rows, provider settings, custom domains or
other external resources. A deleted or materially changed binding can also
prevent rollback. Database changes need their own reviewed forward/rollback
plan; the committed migration has no down migration.

## External blockers

No production deployment is approved by this runbook alone. Outstanding
inputs include legal identity/operator, professional legal/privacy/terms
review, founder/contact/affiliation evidence, approved domain, Cloudflare and
Supabase credentials, logo/photo rights, live RLS execution, environment
separation, monitoring and an authorised rollback/on-call owner.
