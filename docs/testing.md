# Testing

**Status:** required commands and evidence ownership  
**Result policy:** this file records no pass/fail result. The release
coordinator must record actual output for the exact commit, artifact and
environment.

## Automated coverage present

Vitest runs `tests/unit/**/*.test.{ts,tsx}` and
`tests/component/**/*.test.{ts,tsx}` in jsdom. The committed suites cover:

- canonical URL, metadata, robots, sitemap, public-route and proposed-status
  invariants;
- homepage, governance/activity and public-information content boundaries;
- global shell/mobile navigation and empty-profile publication contracts;
- enquiry request/response schemas and excluded personal-data fields;
- configuration capability, Worker routing, method/content/origin/body/error
  ordering, rate-limit outcomes, honeypot, Turnstile outcomes, persistence
  confirmation and redacted application logs;
- Turnstile and Supabase adapters with injected/mock fetch implementations;
- enquiry form unavailable, validation, error, duplicate-submit and confirmed
  success states;
- Saath Rekha geometry, load policy, reduced-motion/unsupported fallback,
  viewport activation and pause state.

These tests run Worker modules in the test JavaScript environment, not in a
deployed Cloudflare account. The Saath Rekha shell test mocks the R3F canvas.

Playwright builds the static export, starts `wrangler dev` on port 8787 and
runs the same browser suite in Chromium, Firefox, WebKit and a Pixel 7 Chromium
profile. It covers:

- all 13 public routes, main/H1 presence and horizontal overflow;
- browser console errors, uncaught page errors and failed network requests
  across the route sweep;
- homepage and selected governance/join/contact axe scans;
- keyboard open/Escape/focus restoration for mobile navigation;
- real hard 404 behavior, including unpublished route sentinels removed by
  `postbuild`;
- unconfigured enquiry status (`200`, `available: false`) and submission
  (`503`);
- unsupported API methods and unknown API paths.

The browser suite deliberately uses reduced motion. It does not exercise the
real WebGL enhancement, an enabled form, live Turnstile, Cloudflare rate-limit
enforcement or Supabase.

## Command/evidence matrix

Run from a clean checkout with no production credentials.

### 1. Reproducible install — `npm ci`

- **Evidence:** command, UTC time, exit code, Node/npm versions and lockfile
  digest.
- **Establishes:** the committed lockfile installs without resolution changes.
- **Does not establish:** dependency safety, licence suitability or runtime
  reachability. No audit, secret-scan or SBOM script is currently committed.

### 2. Formatting — `npm run format:check`

- **Evidence:** full command output and exit code.
- **Establishes:** Prettier accepts tracked source and documentation.
- **Does not establish:** correctness or editorial approval.

### 3. Lint — `npm run lint`

- **Evidence:** full output, exit code and ESLint version.
- **Establishes:** Next core-vitals/TypeScript rules and project rules complete
  with zero warnings (`--max-warnings=0`).
- **Does not establish:** browser/runtime behavior or security.

### 4. Strict types — `npm run typecheck`

- **Evidence:** output, exit code and compiler version.
- **Establishes:** the strict TypeScript configuration typechecks without
  emit.
- **Does not establish:** that generated Cloudflare bindings match a remote
  account or that runtime values exist.

### 5. Unit/component suite — `npm run test:unit`

- **Evidence:** Vitest summary, failed/skipped counts, duration and exit code.
- **Establishes:** the committed jsdom boundary/invariant tests described
  above.
- **Does not establish:** workerd equivalence, live provider behavior, browser
  engine behavior, SQL RLS or coverage thresholds. No coverage command or
  threshold is configured.

### 6. Static export — `npm run build`

- **Evidence:** Next build/postbuild output, exit code, `out/` digest and
  environment values by name (never secret values).
- **Establishes:** routes and metadata can be statically exported and unlinked
  empty dynamic sentinels are removed.
- **Does not establish:** the approved canonical/index state unless
  `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SITE_ENV` were explicitly set and the
  output inspected.

After the build, record the reproducible sorted-path/content digest:

```powershell
npm run artifact:digest
```

### 7. Browser suite — `npm run test:e2e`

- **Evidence:** per-project Playwright results, retries/skips, HTML report,
  traces/screenshots for failures, exact build values and exit code.
- **Establishes:** built-output behavior through local Wrangler for the
  committed scenarios and installed browser engines.
- **Does not establish:** actual Safari/iOS or Chrome/Android hardware,
  assistive technology, eligible WebGL behavior, external bindings or deployed
  headers/domains.

For release evidence, ensure port 8787 is free and prevent a local stale server
from being reused:

```powershell
$env:CI = "1"
npm run test:e2e
Remove-Item Env:CI
```

If browsers are unavailable, record the suite as blocked/not run; do not
convert that state to pass.

### 8. Combined npm suite — `npm test`

- **Evidence:** both Vitest and all Playwright project results.
- **Establishes:** the two npm test layers run sequentially.
- **Does not replace:** build artifact inspection, SQL/manual/external gates or
  the other quality commands.

### 9. Worker binding generation — `npm run types:worker`

- **Evidence:** generated-file diff or a clean comparison and Wrangler version.
- **Run when:** `wrangler.jsonc`, compatibility date, bindings or Wrangler
  changes.
- **Does not establish:** remote binding existence or permissions. Generated
  output must be reviewed rather than silently rewritten during release.

### 10. Non-mutating Cloudflare validation

```powershell
npm run deploy:dry-run
```

- **Evidence:** bundle/assets summary, warnings, exit code and Wrangler
  version.
- **Establishes:** current config and local `out/` can be packaged.
- **Does not deploy** and does not validate authentication, account target,
  named environments, domains, secrets, live rate limits or Supabase.
- Once named environments exist, repeat with `--env staging` and
  `--env production` against each environment config.

### 11. Manual isolated RLS/constraint test

This is outside npm and requires a disposable Supabase-compatible database
with `anon` and `authenticated` roles:

```powershell
psql $env:TEST_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/migrations/20261025230000_create_enquiry_boundary.sql
psql $env:TEST_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/enquiries_rls.workstream.sql
```

- **Evidence:** isolated target identifier, schema-before/after record, command
  output and exit code; never include credentials.
- **Establishes:** the SQL test’s synthetic gate allow/deny and browser-role
  assertions on that database. The test transaction rolls its synthetic rows
  back; the migration itself remains applied to the disposable target.
- **Limit:** there is no committed Supabase CLI config or automated harness.
  Never run this workstream SQL against production.

### 12. Deployment smoke

Use the checks in `deployment.md` and retain:

- exact hostname, Cloudflare version/deployment and artifact digest;
- route/status/header/canonical/robots/sitemap observations;
- intended capability mode and safe API responses;
- redacted logs and, only when authorised, a synthetic persisted-row/deletion
  record.

Local tests cannot substitute for this evidence.

### 13. Repeatable mobile lab profile

Start the built Wrangler preview, then run:

```powershell
npm run perf:lab -- http://127.0.0.1:8790/ 3 docs/evidence/performance/home.json
```

- **Evidence:** retain the output JSON containing all samples, medians, exact
  target, timestamp, runtime/browser version and profile. Use a different file
  for each route and do not replace older release evidence.
- **Establishes:** cold-context FCP, LCP, CLS, request/transfer counts and a
  five-second long-task proxy under the documented emulation.
- **Does not establish:** field INP/Core Web Vitals, Lighthouse score,
  production CDN/network behavior, physical-device performance or the
  eligible WebGL path.
- The command includes one warm-up not reported in the medians. Use at least
  three retained runs for development and five against the deployed release.

Current measured results and limitations are in `performance.md`.

## Required manual and external work

### Accessibility

- keyboard-only navigation and focus on every route/state;
- NVDA on Windows, VoiceOver and TalkBack where hardware is available;
- 320 CSS px reflow, 200% text, 400% zoom and text-spacing overrides;
- forced colours/high contrast;
- reduced-motion runtime changes, Save-Data, unsupported WebGL, context loss
  and the actual pause control;
- Turnstile widget accessibility when enabled.

Axe results support but do not prove WCAG 2.2 AA conformance.

### Performance and browser/device

- controlled mobile traces for general routes and eligible Saath Rekha;
- initial/static versus lazy Three/R3F transfer inspection;
- actual mid-range Android and Safari/iOS smoke where available;
- production cache/compression and Core Web Vitals evidence.

The committed Playwright/CDP lab runner is a repeatable development measure,
not a Lighthouse score or performance budget gate. No real-user monitoring is
implemented.

### Security and data

- dependency vulnerability/licence review, secret/history scan and static
  artifact scan;
- Cloudflare account, environment, domain, TLS/HSTS and staging-access review;
- live rate-limit behavior and spoof/abuse tests;
- optional live Turnstile success/reject/timeout/hostname checks;
- Supabase migration review, API schema exposure, live REST and complete
  RLS/grant/database-state evidence;
- operational access, retention, deletion, backups, monitoring, rotation and
  incident response.

### Content, governance and legal

- every claim mapped to `content-verification.md`;
- legal identity/operator, founder claims, public contacts and affiliations;
- domain/name approval and WRRC/WDSF/other mark permissions;
- photo, video, likeness and biography rights;
- professional review of privacy, terms, retention, children’s data,
  safeguarding and other legal/policy copy.

Technical success cannot close these external blockers.

## Coordinator result record

For each command or manual check, record:

```text
Commit/source identity:
Artifact digest and target:
Command or method:
Tool/runtime version:
UTC start/end:
Exit/result:
Passed, failed, blocked or not run:
Evidence location:
Defect/exception and owner:
Reviewer and approval timestamp:
```

Never record “pass” for missing browsers, absent credentials, an unexecuted SQL
test, unavailable hardware, no field data or an earlier artifact.
