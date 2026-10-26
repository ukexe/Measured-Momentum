# Quality Strategy — Proposed Indian Acrobatic Rock ’n’ Roll Organisation Website

**Status:** Draft test and acceptance strategy; no test execution has yet been performed.  
**Document owner:** Independent QA lead  
**Approvers:** Product owner, engineering lead, accessibility owner, security/privacy owner, and content/SEO owner  
**Applies to:** The public website, its public form endpoints, content-management integrations, and any Supabase resources exposed to the site  
**Review points:** Before implementation, before staging sign-off, before production release, and after any material feature, vendor, data-flow, or hosting change

## 1. Purpose and quality position

This strategy defines evidence required to release a trustworthy public website. It is intentionally independent of a particular framework or hosting vendor. Requirements use stable IDs so implementation tickets, automated tests, defects, and release evidence can link back to them.

The organisation is proposed. The website must not imply government recognition, national-governing-body status, federation membership, athlete endorsement, event sanctioning, or legal status unless an accountable content owner supplies current documentary evidence. Images, biographies, rankings, records, partner logos, and claims about athletes—especially children—need documented publication authority.

Passing a scanner is not equivalent to passing this strategy. Automated checks supplement, but do not replace, keyboard, assistive-technology, mobile, abuse-case, content, and independent exploratory testing.

### 1.1 Quality priorities

| Priority | Meaning | Release treatment |
|---|---|---|
| P0 | Safety, unauthorised data access, secret exposure, unusable critical journey, materially false claim, or complete accessibility blocker | Stop release; no waiver |
| P1 | WCAG 2.2 AA failure, exploitable high-risk weakness, broken primary route/form, SEO indexing hazard, or Core Web Vitals gate failure | Stop release unless the release is rolled back or the affected feature is removed |
| P2 | Material degradation with a usable workaround | Fix before release or obtain a named, dated, time-limited risk acceptance |
| P3 | Minor defect with no material user impact | May be scheduled with owner and target date |

Tool severity labels are inputs, not final risk decisions. A human owner must triage each finding in the site’s context.

### 1.2 Initial scope and change triggers

Representative route templates include:

- Home.
- About, governance, safeguarding, and contact information.
- Sport/rules or participation guidance.
- News listing and article.
- Events listing and event detail.
- Gallery/media content.
- Contact, expression-of-interest, or newsletter forms.
- Search, if present.
- Deliberate 404 and server-error states.

Payments, athlete registration, member accounts, medical data, background checks, competition scoring, and private portals are outside this initial public-site strategy. Adding any of them requires a new threat model, privacy review, accessibility review, and test plan before development. Public forms must not collect medical details, identity documents, or unnecessary information about children.

### 1.3 Test environments

| Environment | Intended use | Required controls |
|---|---|---|
| Local | Fast development and integration tests | Mock adapters; local Supabase-compatible services where needed; local mail catcher; synthetic data only |
| CI | Reproducible quality gates | Clean install, pinned runtime, isolated services, deterministic seed, no production credentials |
| Staging | Production-like independent QA | Same built artifact/config shape as production; authentication or IP restriction; `noindex`; test accounts and synthetic data |
| Production | Final smoke tests, synthetic performance, security-header checks, and real-user measurement | No destructive tests; minimal synthetic submissions clearly tagged and deleted; production monitoring |

The artifact promoted from staging should be the artifact released to production. Environment-specific values must be injected at deploy time, not rebuilt into a different code bundle where avoidable.

## 2. Evidence and independence

Each acceptance item needs:

1. A requirement ID from this document.
2. The commit SHA and immutable build/deployment identifier tested.
3. Environment, route, viewport/device, browser, and test-data state.
4. Exact command and tool version for automated checks.
5. Actual result, not only “pass”.
6. An artefact such as a machine-readable report, trace, screenshot, video, header capture, query result, or redacted log.
7. Defect link or a named exception with owner, rationale, expiry date, and compensating control.

The independent QA reviewer must not rely solely on developer demonstrations. At minimum, QA independently executes the critical journeys, accessibility manual checks, production-like form failure/success paths, unauthorised-access matrix, console/network review, and release smoke suite. Test evidence must not contain live personal data, access tokens, secrets, or unredacted form content.

## 3. Accessibility acceptance — WCAG 2.2 Level AA

**A11Y-001:** Every public route and every meaningful state must conform to all applicable WCAG 2.2 Level A and AA success criteria. Conformance applies to first-party code and third-party widgets. No “partial compliance” statement may be used to turn a known failure into a pass.

### 3.1 Priority criteria

The following criteria receive explicit design review and manual evidence because they are common risks for a motion-rich sports site:

- Text alternatives and media: 1.1.1; 1.2.1–1.2.5 where recorded/live audio or video is used. Decorative images use empty alternatives; meaningful sports imagery gets concise contextual alternatives. Captions and transcripts are accurate, not merely auto-generated and unreviewed.
- Structure and relationships: 1.3.1–1.3.5. Use semantic headings, landmarks, lists, tables, labels, autocomplete tokens, and meaningful reading order.
- Visual presentation: 1.4.1, 1.4.3–1.4.5, and 1.4.10–1.4.13. Information cannot depend on colour alone; normal text contrast is at least 4.5:1, large text at least 3:1, and user-interface components/focus indicators meet non-text contrast. Content reflows without loss at 320 CSS px and remains usable with text spacing overrides.
- Keyboard and timing: 2.1.1, 2.1.2, 2.1.4, 2.2.1, and 2.2.2. All actions work without a pointer; there are no traps; moving or auto-updating content can be paused, stopped, or hidden.
- Seizure and motion safety: 2.3.1 and 2.3.3 where applicable. Nothing flashes more than permitted thresholds, and interaction animation can be disabled.
- Navigation and focus: 2.4.1–2.4.7 and 2.4.11. Provide a working skip link; descriptive page titles, headings, and links; logical focus order; visible focus; and focus that is not entirely hidden by sticky UI.
- Pointer and touch: 2.5.1–2.5.4, 2.5.7, and 2.5.8. Do not require multipoint/path gestures or dragging; accessible single-pointer alternatives exist; visible labels match accessible names; motion actuation has a control alternative; targets meet the 24-by-24 CSS-pixel minimum or a valid spacing exception.
- Predictability and input help: 3.1.1–3.1.2, 3.2.1–3.2.4, 3.2.6, 3.3.1–3.3.4, 3.3.7, and 3.3.8 where authentication exists. Errors are identified in text and associated with fields; instructions precede input; repeated details are not needlessly requested.
- Name, role, value, and status: 4.1.2 and 4.1.3. Custom controls expose correct semantics and state; form submission, loading, success, and error messages are announced without unexpectedly moving focus.

Conformance must be checked against the normative WCAG text, not this risk-focused summary.

### 3.2 Keyboard and focus acceptance

**A11Y-010:** On every representative route, QA must complete all actions using Tab, Shift+Tab, Enter, Space, Escape, and arrow keys as applicable.

Evidence must show:

- The skip link is the first practical focus stop, becomes visible, and moves focus to main content.
- Focus order follows reading and interaction order at desktop and mobile breakpoints.
- Menus disclose state and support expected keys without inventing nonstandard behaviour.
- Dialogs have an accessible name, move initial focus deliberately, contain focus while open, close with Escape unless unsafe, and restore focus to the invoker.
- Closing menus, errors, route changes, and client-side navigation never lose focus to the document body. A consistent route-change focus policy is documented and tested.
- No off-screen, hidden, inert, or obscured element receives focus.
- Sticky headers, cookie controls, and chat/help UI do not fully obscure focused elements.
- Focus indication remains visible in normal, forced-colours/high-contrast, zoomed, and dark states.
- Carousels, galleries, maps, and video controls are operable without drag, hover, or autoplay.

### 3.3 Responsive, zoom, and mobile acceptance

**A11Y-020:** Test at 320 CSS px width, 400% browser zoom at 1280-by-1024, 200% text zoom where supported, portrait and landscape orientation, and at least one physical or emulated mid-range Android viewport.

Acceptance:

- No two-dimensional scrolling is needed except for genuinely essential content such as a wide data table; such content has an accessible small-screen treatment.
- Text and controls do not clip, overlap, disappear, or become unreachable.
- Browser zoom and user font settings, rather than disabled zoom, control magnification.
- Touch targets satisfy WCAG 2.2 target-size rules and have sufficient practical spacing.
- Inputs use appropriate types and autocomplete without forcing an inaccessible custom keyboard.
- Hover-only information also appears on focus and can be dismissed and persisted as required.

### 3.4 Reduced motion and animation

**A11Y-030:** `prefers-reduced-motion: reduce` must produce a materially reduced experience, not merely shorter animation.

Acceptance:

- Nonessential parallax, scroll-jacking, continuous rotation, animated backgrounds, camera motion, and decorative transitions are removed or replaced with an instant state change.
- Any essential motion has a nearby pause/disable control whose setting persists for the session.
- Auto-playing media is off by default. No audio starts without user action.
- Motion is not the only way to communicate state or instruction.
- The preference is respected on first paint, with no animated flash before JavaScript initialises.
- Tests cover reduce/no-preference at each animated route, including runtime preference changes where the platform reports them.

### 3.5 WebGL/canvas fallback

**A11Y-040:** WebGL is enhancement only. Navigation, organisation information, calls to action, and form access must remain complete when WebGL is unsupported, blocked, slow, reduced-motion is enabled, data saving is requested, or a context is lost.

Acceptance:

- A semantic HTML/static-image fallback exists and is not hidden inside inaccessible canvas content.
- The fallback conveys the same essential meaning, has an appropriate text alternative, and contains no SEO-critical text only in pixels.
- Capability detection handles `getContext()` returning `null`; a WebGL context-loss test does not crash the page.
- The WebGL bundle and large assets are lazy-loaded after critical content and are not requested in reduced-motion/data-saving fallback states.
- Interactive canvas controls have equivalent native HTML controls and keyboard operation.
- Failure produces no uncaught exception, blank critical region, focus loss, or repeated network retry.
- Testing includes a low-end/mobile GPU profile or representative device, disabled/stubbed WebGL, forced context loss, and slow/failed asset requests.

### 3.6 Accessibility test method and gate

Automated checks:

- Run an axe-compatible engine on every route template and on open menu/dialog, validation-error, success, empty, loading, and 404 states.
- Run semantic HTML validation or equivalent DOM checks; separately inspect accessible names, duplicate IDs, landmarks, headings, and form associations.
- Include automated colour-contrast checks, but manually evaluate text over photographs/video and dynamic states.

Manual checks:

- Keyboard-only review in current Chrome, Firefox, and Safari/WebKit coverage available to the project.
- NVDA with Firefox or Chrome on Windows.
- TalkBack with Chrome on Android for primary journeys.
- VoiceOver with Safari on iOS/macOS before release when suitable hardware is available; lack of hardware is recorded as “not tested”, never “pass”.
- Windows forced colours/high contrast, 200%/400% zoom, text-spacing bookmarklet/style override, reduced motion, and screen orientation.

**Accessibility release gate:** zero untriaged automated violations; zero critical or serious axe findings; zero P0/P1 manual failures; and a criterion-by-criterion WCAG 2.2 A/AA record for representative templates. Lower tool severity does not permit a real Level A/AA failure. An accessibility statement must describe verified facts and known limitations only.

## 4. Performance and Core Web Vitals

### 4.1 User-centred budgets

**PERF-001:** At the 75th percentile of real page views, split by mobile/desktop and monitored per major route group, production must meet:

| Metric | “Good” release/operational target |
|---|---:|
| Largest Contentful Paint (LCP) | ≤ 2.5 s |
| Interaction to Next Paint (INP) | ≤ 200 ms |
| Cumulative Layout Shift (CLS) | ≤ 0.10 |

Field data needs enough samples to be statistically useful. Until a new site has approximately 28 days of representative field data, the performance decision is provisional and uses controlled synthetic results. “No data” is not a pass.

**PERF-002:** Controlled mobile cold-load budgets for each representative route:

| Measure | Budget |
|---|---:|
| Time to First Byte | ≤ 0.8 s |
| First Contentful Paint | ≤ 1.8 s |
| Largest Contentful Paint | ≤ 2.5 s |
| Total Blocking Time | ≤ 200 ms |
| Cumulative Layout Shift | ≤ 0.10 |
| Initial compressed JavaScript | ≤ 170 KiB |
| Initial compressed CSS | ≤ 60 KiB |
| Initial total transfer, excluding user-initiated/lazy media | ≤ 1.5 MiB |
| Initial requests | ≤ 60 |

Budgets are per page, not an invitation to consume every limit. Any WebGL/3D package must be outside the initial critical bundle and loaded only when the enhancement is eligible. Fonts should be subsetted, self-hosted where practical, and kept within the total budget. Images must have explicit dimensions, responsive sources, modern formats where supported, and a suitably compressed LCP candidate.

### 4.2 Realistic mobile protocol

**PERF-010:** Run production-like Lighthouse or equivalent tests with:

- A clean browser profile, mobile viewport, cold cache, no extensions, and consent state documented.
- Approximately 4× CPU slowdown and a throttled mobile profile near 1.6 Mbps down, 0.75 Mbps up, and 150 ms latency. Record the exact implementation because simulated and packet-level throttling are not interchangeable.
- Five runs per route after a warm-up run. Report every run and the median; do not select the best run.
- Worst credible published content, including a long article, a media-rich gallery, and a full events listing.
- Home, the most common landing template, contact/form, and 404 at minimum.

The median must meet all budgets, and no run may exceed LCP 3.0 s, TBT 300 ms, or CLS 0.10 without investigation. A Lighthouse performance score of 90 or higher is a useful smoke gate, but metric budgets take precedence over the composite score.

Run an additional test on an actual mid-range Android device over a controlled or observed mobile connection before release. Record model, OS, browser, network, temperature/power caveats, and trace. If physical-device testing is unavailable, mark it outstanding rather than silently substituting emulation.

### 4.3 Production measurement

**PERF-020:** Production monitoring combines:

- Privacy-minimised real-user Web Vitals using the current `web-vitals` attribution build or an equivalent implementation.
- Nightly or per-deploy synthetic tests against production under the controlled mobile profile.
- Server/CDN timings, error rate, cache status, and asset-size monitoring.
- Route-group, device-class, and release-version dimensions. Do not collect full URLs containing query strings, form values, raw IP addresses, or user identifiers.

Report p50, p75, p95, sample count, collection window, and change from the previous release. Set alerts on sustained p75 regression, not a single noisy sample. Reassess after 7 days and 28 days; investigate route-level regressions even if an origin-wide aggregate remains green.

Additional acceptance:

- No render-blocking third-party script without documented need.
- Critical text and navigation render without waiting for WebGL, analytics, CAPTCHA, or fonts.
- Cache-Control, CDN caching, Brotli/gzip, immutable hashed assets, and image caching are verified from production response headers.
- Back/forward navigation and warm client navigation are measured separately from cold loads.
- Long tasks, layout shifts, LCP element, preload warnings, and request dependency chains are retained as evidence.

## 5. Search, sharing, and index-control acceptance

### 5.1 Metadata and crawl behaviour

**SEO-001:** Every indexable canonical route has:

- A unique, descriptive HTML title and visible H1 aligned with the page’s actual content.
- A useful, unique meta description; omission is preferable to duplicated or misleading text.
- One absolute, production-host, self-referencing canonical URL unless a reviewed consolidation rule applies.
- Correct `lang` on the root and language changes marked in content.
- Indexable content in the server response or otherwise reliably renderable by major crawlers; critical meaning is not canvas-only.
- A 200 response for valid content, a real 404/410 for missing content, and a limited one-hop redirect for moved/canonicalised URLs.

Query parameters, mixed case, duplicate trailing-slash variants, preview URLs, and tracking parameters must not create competing canonical pages. Pagination and filtering need an explicit crawl/index policy. `hreflang` is added only for complete equivalent translations, with reciprocal links and valid language-region codes.

**SEO-002:** Open Graph and social metadata include accurate title, description, canonical URL, site name, locale, and an accessible 1200-by-630 image where appropriate. Twitter/X card metadata may complement Open Graph. Preview images must be publication-approved, must not expose private information, and must not imply unverified affiliation. Validate at least one article, event, and home preview; record the raw rendered tags because external preview caches may be stale.

### 5.2 Sitemap, robots, staging, and errors

**SEO-010:** The production sitemap:

- Contains only preferred canonical, indexable, 200-status HTTPS URLs.
- Excludes staging, previews, admin, search results, form result pages, redirects, errors, and parameter duplicates.
- Uses `lastmod` only when based on a meaningful content change.
- Is referenced by production `robots.txt` and remains within protocol limits.

Production `robots.txt` must be deliberate and tested against critical URLs. It is crawl guidance, not access control.

**SEO-011:** Every non-production public response must send `X-Robots-Tag: noindex, nofollow` and HTML documents should also carry a robots `noindex, nofollow` meta tag as defence in depth. Staging should additionally require authentication or network restriction. Its `robots.txt` should disallow crawling, but this does not replace `noindex` or access control. A deployment test must fail if a staging/preview hostname is indexable or if production accidentally inherits `noindex`.

Custom 404 acceptance:

- Returns HTTP 404, not a soft-404 200.
- Has `noindex`, a useful title, normal navigation, and recovery links.
- Does not disclose stack traces, storage paths, environment details, or attempted sensitive input.
- Handles malformed/encoded paths without an exception or reflected script.

### 5.3 Structured-data restraint

**SEO-020:** Structured data is optional and must describe visible, verified content only.

- `Organization` or `SportsOrganization` may describe the organisation only after name, status, URL, logo rights, address/contact, and `sameAs` profiles are verified.
- `Event` is used only for a real public event with accurate dates, time zone, location/online mode, status, organiser, image rights, and offer details where applicable.
- `BreadcrumbList` mirrors visible breadcrumbs.
- Do not publish invented ratings, reviews, awards, memberships, governing status, FAQs, people, or actions to seek rich results.
- JSON-LD values from content authors are schema-validated and safely serialised; untrusted strings cannot terminate a script element.

Validation evidence includes rendered JSON-LD, Schema.org validation, the applicable rich-results test, and manual comparison with visible content. Zero errors are required; warnings are individually reviewed rather than automatically ignored. Rich-result eligibility is never promised.

## 6. Security, privacy, and abuse resistance

### 6.1 Threat model and secure validation

The minimum trust boundaries are browser → site/server function → CAPTCHA provider → database/email/content provider. Threats include spam, injection, stored/reflected/DOM XSS, CSRF, broken access control, RLS bypass, credential leakage, malicious content, enumeration, dependency compromise, denial of service, and accidental collection/disclosure of personal data.

**SEC-001:** All input is validated on the server regardless of client checks.

Acceptance:

- Use explicit schemas with allowlisted fields, types, enums, sensible Unicode-aware length limits, normalisation rules, and rejection of unexpected fields.
- Set accepted methods and content types, body-size/time limits, and safe parser behaviour. Unsupported methods/content types return 405/415 as appropriate.
- Parameterise database operations. Do not construct SQL, filters, HTML, headers, email headers, or redirect URLs by concatenating untrusted input.
- Encode output for its exact HTML/attribute/URL/JavaScript context. Rich HTML is disallowed by default or sanitised with a maintained allowlist.
- Generic client errors do not expose stack traces, schema internals, keys, SQL, provider payloads, or whether a private email/account exists.
- Log a correlation ID and safe event metadata, never form bodies, CAPTCHA tokens, passwords, access/refresh tokens, or sensitive query strings.

Boundary tests cover empty, missing, extra, wrong-type, overlong, null-byte/control-character, Unicode confusable, bidi, CRLF, duplicate-key, deeply nested, invalid encoding, oversized, and concurrent submissions.

### 6.2 XSS and content injection

**SEC-010:** Assess reflected, stored, and DOM XSS in every user-controlled or CMS-controlled field, query/path fragment, error display, search result, preview, metadata field, and JSON-LD value.

Use a safe test corpus covering element/attribute/script/URL contexts, malformed markup, SVG/image payloads, `javascript:`/dangerous data URLs, template expressions, and closing `</script>` sequences. Confirm payloads are rendered as inert text or removed—not merely that `alert()` did not appear. Review dangerous DOM sinks and framework escape hatches. Uploaded SVG/HTML, if ever permitted, requires a separate active-content decision and isolated delivery.

The enforced Content Security Policy is defence in depth, not the primary XSS fix. CSP violation reports must omit sensitive URL/query data.

### 6.3 CSRF, sessions, and CORS

**SEC-020:** For any state-changing endpoint:

- Cookie-authenticated actions use a proven anti-CSRF token pattern plus `SameSite`, `Secure`, and `HttpOnly` cookies as applicable, and validate `Origin`/`Referer` as defence in depth.
- Bearer-token APIs do not treat CORS as authentication. CORS allows only required origins, headers, and methods; credentialed responses never use wildcard origin.
- Login/session identifiers rotate at authentication and privilege changes; logout and expiry invalidate access as designed.
- Cross-site HTML form, fetch, text/plain, and preflight variants are tested.

Public contact forms can still be abused cross-site. CAPTCHA and rate limiting do not replace CSRF analysis.

### 6.4 Security headers and transport

**SEC-030:** Verify headers on HTML, API, asset, error, and redirect responses:

- HTTPS only; no mixed content. Enable HSTS in production only after all covered hosts are HTTPS-ready, with an intentional `includeSubDomains`/preload decision.
- Enforced Content Security Policy using nonces/hashes where scripts are needed, restrictive `default-src`, no avoidable `unsafe-inline`/`unsafe-eval`, and `frame-ancestors`.
- `X-Content-Type-Options: nosniff`.
- A privacy-preserving `Referrer-Policy`, normally `strict-origin-when-cross-origin` or stricter.
- A minimal `Permissions-Policy`.
- `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and related isolation headers only after compatibility tests with required third parties.
- Correct MIME types, no sensitive caching, and no unnecessary platform/version disclosure.

Deploy CSP in report-only mode during development, resolve legitimate violations, then enforce it before release. Clickjacking, MIME sniffing, mixed-content, cache, TLS, and third-party framing tests are retained.

### 6.5 Turnstile and credentialless behaviour

**SEC-040:** CAPTCHA is a server-verified abuse signal, not authentication or a substitute for validation/rate limiting.

When Turnstile is configured:

- The browser sends a token; the server calls Siteverify using the secret held only server-side.
- Verify success and expected hostname/action; validate any correlation data according to the implementation.
- Reject missing, malformed, expired, duplicate/replayed, wrong-host, wrong-action, and provider-error results.
- Tokens are treated as short-lived and single-use. They are never logged or persisted.
- Provider timeouts fail closed for submission but return a retryable, accessible service message rather than claiming success.
- The widget is tested with keyboard and screen reader, and an inaccessible provider state has a support/retry path.

No external credentials are available during initial development and CI. Therefore:

- Use an injectable local verifier/mock with contract fixtures for success, rejection, timeout, malformed response, and replay. Do not call the live provider from unit/integration tests.
- Use local Supabase services and a local mail catcher, or equivalent in-process adapters, for integration behaviour.
- Mocks must be impossible to enable in production through a client-controlled flag.
- Absence of any required server integration setting—including Turnstile secret, database access, or delivery provider—must make the form endpoint return HTTP 503 with a stable safe code such as `FORM_SERVICE_UNAVAILABLE` and, where appropriate, `Retry-After`.
- The UI must say the form is temporarily unavailable and provide a verified alternative contact route if one exists. It must not show a success state, clear the user’s text as if delivered, emit “submitted” analytics, or fabricate a message ID.
- Missing configuration must not take down unrelated informational pages.

A credentialless informational release is acceptable only if the product owner explicitly accepts unavailable forms and the 503/UI behaviour passes. Enabling real submissions later requires production secrets, live Siteverify and delivery smoke tests, and a new release decision.

### 6.6 Rate limiting and abuse tests

**SEC-050:** Apply server-side limits by endpoint and a privacy-reviewed combination of network and session/identity signals. Limits must account for shared networks and IPv6, trust forwarding headers only from known proxies, and avoid storing raw identifiers longer than necessary.

Tests cover:

- Allowed steady traffic and boundary request.
- Burst, sustained, parallel, distributed-signal, and repeated-invalid-token traffic.
- Reset/window behaviour and clock boundaries.
- Spoofed forwarding headers and IPv4/IPv6 variants.
- Separate limits for expensive validation/delivery work, with limiting before costly downstream calls where practical.
- A 429 response with accessible UI feedback and an accurate `Retry-After`; no false success or duplicate send.
- Recovery after the window and operational override/monitoring.

The initial thresholds must be load-tested and documented; a hard-coded value is not accepted without traffic assumptions and an owner.

### 6.7 Supabase RLS and unauthorised-access testing

**SEC-060:** Row Level Security must be enabled on every exposed table in relevant schemas, with least-privilege grants and explicit policies. Views, materialised views, RPC/functions, storage buckets, realtime publications, and `security definer` functions receive separate review because table RLS alone may not protect them.

Rules:

- The service-role key is server-only and never appears in browser bundles, source maps, logs, examples, or analytics.
- Client-exposed anon/publishable keys are treated as identifiers, not secrets; RLS still enforces every operation.
- Policies handle `auth.uid()` being null explicitly and do not grant access through an accidental null comparison, broad role, mutable user metadata, or user-controlled claim.
- Ownership and role changes occur through trusted server paths. Search paths and execute grants for database functions are constrained.
- Public form submissions should pass through the validated/rate-limited server. If direct anonymous insert is deliberately chosen, the role can insert only required columns and cannot select/update/delete submissions.

The automated unauthorised-access matrix must exercise each table/view/RPC/storage path:

| Actor | Select | Insert | Update | Delete | RPC/storage/realtime |
|---|---|---|---|---|---|
| Anonymous/no JWT | Expected deny or explicitly documented public subset | Deny except narrowly approved flow | Deny | Deny | Deny except approved public asset |
| Malformed, expired, or wrong-project JWT | Deny | Deny | Deny | Deny | Deny |
| Authenticated user A | Own authorised rows only | Allowed fields/ownership only | Own rows/allowed fields only | Per policy | Own authorised resources only |
| Authenticated user B | Cannot observe A’s rows | Cannot assign A ownership | Cannot alter A’s rows | Cannot delete A’s rows | Cannot access A’s resources |
| Approved admin/server role | Only documented operational scope | Documented | Documented | Documented | Documented |

For reads, an RLS denial may correctly appear as a 200 with an empty result rather than a 403; tests must assert absence of rows and side channels, not only status. For every write, verify both response and database state. Test filters, joins, counts, upserts, bulk operations, guessed IDs, pagination, RPC arguments, storage object paths, and realtime subscriptions. Run local database tests from a known seed inside rollback/reset isolation and retain policy definitions plus actual results.

### 6.8 Secrets, builds, and dependency security

**SEC-070:** Secrets exist only in an approved server-side secret store and are scoped per environment with least privilege.

Acceptance:

- No secrets in source, history, fixtures, client-prefixed environment variables, static output, browser bundles, source maps, container layers, CI logs, or screenshots.
- `.env` files are excluded from version control; a safe example documents names only.
- Build and deployed assets are scanned for key patterns and known canary values.
- Logs and error reporting redact authorisation, cookies, CAPTCHA tokens, and form content.
- Rotation/revocation instructions exist; a suspected leak is revoked first and investigated second.
- Production fails safely when required server secrets are missing, as specified in SEC-040.

**DEP-001:** On a clean lockfile-respecting install:

- Run the ecosystem audit for all dependencies and separately for production/runtime dependencies.
- Run an independent vulnerability source such as OSV, plus repository secret scanning.
- Record direct and transitive package versions, lockfile, runtime version, and scanner database timestamp.
- Review direct dependencies for maintenance status, provenance, install scripts, unnecessary permissions, and licence compatibility.
- Generate or retain an SBOM for the released artifact where tooling permits.

Zero known exploitable critical/high runtime vulnerabilities and zero known-exploited dependencies are allowed at release. Dev-only or disputed findings require documented reachability analysis, owner, compensating control, and expiry; scanner suppression without rationale fails. Lockfiles are mandatory and automated update PRs must run the full suite.

### 6.9 Privacy, retention, and legal review

**PRIV-001:** Maintain a data inventory with field, purpose, legal basis selected by a qualified owner, source, recipients/processors, storage location, access roles, retention/deletion rule, and whether children’s data may be involved. Collect the minimum necessary. Do not put personal data in URLs, analytics events, CAPTCHA metadata, client logs, or error-monitoring breadcrumbs.

Provisional engineering defaults—90 days for unanswered/general enquiries, 30 days for diagnostic logs, and 24 hours or less for rate-limit identifiers—are planning assumptions only. The privacy/legal owner must approve or replace them, document deletion jobs and backups, and test deletion. Marketing retention and analytics duration require separate explicit decisions; silence or a pre-ticked box is not consent.

Acceptance includes:

- Nonessential analytics/marketing storage does not run before the required user choice.
- Rejecting consent is as easy as accepting, and the choice can be changed.
- Forms explain required/optional fields, purpose, recipients, and retention at the point of collection.
- Data-subject access, correction, withdrawal, and deletion workflows are rehearsed with synthetic records.
- Export/deletion does not leak another person’s data; deletion propagates to downstream systems and documented backup expiry.
- Publication authority exists for photographs, video, names, results, testimonials, and biographies.
- Children’s data or imagery is not collected/published until a specialist review covers age assurance, guardian authority, safeguarding, notices, processor terms, and applicable Indian law.
- Turnstile, analytics, hosting, email, database, and CDN data flows are reflected in the approved notice and processor assessment.

**Mandatory legal label:** Every privacy notice, cookie notice, terms, safeguarding notice, consent/release form, disclaimer, and data-retention policy remains headed **“DRAFT — REQUIRES PROFESSIONAL LEGAL REVIEW; NOT LEGAL ADVICE”** until qualified Indian counsel or the organisation’s authorised legal/privacy professional approves it. QA must reject placeholders, fabricated compliance claims, or an unrecorded removal of this label. Review must consider the law and rules actually in force at release, including requirements relating to children and cross-border processors.

## 7. Build, functional, and independent QA suite

Commands below describe required capabilities; the implementation must expose equivalent documented package scripts rather than relying on undocumented global tools.

### 7.1 Reproducible pipeline

**QA-001:** From a fresh checkout in a clean CI worker with the supported runtime pinned:

1. Lockfile-only clean install (for example, `npm ci`).
2. Secret scan and dependency/licence audits.
3. Formatting check and lint with no unreviewed warnings.
4. Strict typecheck.
5. Unit tests with coverage.
6. Integration/contract tests using isolated local services/mocks.
7. Production build.
8. Start the production artifact with test configuration.
9. End-to-end cross-browser, accessibility automation, link crawl, and performance-budget tests.

The suite must fail on command failure, unhandled rejection, worker crash, test retry exhaustion, or missing report. Tests cannot silently skip because a credential is absent; they use local substitutes or explicitly verify the 503 configuration path.

### 7.2 Unit and integration acceptance

**QA-010:** Unit tests cover:

- Validation and normalisation boundaries.
- Output encoding/sanitisation helpers.
- Form state transitions, including unavailable and retry states.
- Reduced-motion and WebGL capability decisions.
- Canonical/metadata/structured-data generation.
- Rate-limit boundary logic.
- Authorisation/policy helper logic.
- Date/time-zone formatting for Indian and event contexts.

Critical validation, authorisation, RLS, and secret/configuration branches require complete decision-path coverage; an overall coverage percentage cannot hide an untested high-risk branch.

**QA-011:** Integration tests cover:

- Browser/client → server validation → CAPTCHA adapter → persistence/delivery adapter.
- Local success, provider reject, timeout, malformed response, duplicate/replay, database failure, delivery failure, and rollback/idempotency behaviour.
- Missing configuration returning 503 without making a downstream call.
- 429 before expensive downstream work when limited.
- RLS matrix against local Supabase-compatible services.
- CMS content containing hostile markup and extreme but valid text.
- Cache, redirect, error mapping, and correlation IDs without personal data.

A form reports success only after the defined durable handoff succeeds. If persistence succeeds but delivery fails, behaviour and retry/idempotency must be specified so users and operators do not create silent loss or duplicate messages.

### 7.3 End-to-end browser matrix

**QA-020:** Run primary journeys in current Chromium, Firefox, and WebKit desktop engines, plus a mobile Chromium profile. Manual smoke testing covers actual Safari/iOS and Chrome/Android where available.

E2E scenarios include:

- Header, footer, skip link, menus, route navigation, back/forward, and deep links.
- Each content template with empty, typical, and worst-credible content.
- Search/filter/pagination when present.
- Form valid success against local/mock services.
- Client and independent server validation for every field.
- CAPTCHA reject/timeout/replay, rate limit, downstream failure, double click, refresh/back, offline transition, and missing configuration 503.
- Accessible error summary, field errors, status announcement, focus placement, and preservation of non-sensitive user input when safe.
- No duplicate submission on repeated click/network retry.
- 404 from unknown and malformed paths; direct server request and client navigation.
- Reduced motion, no WebGL, failed lazy asset, disabled JavaScript for essential public content, and narrow viewport.

### 7.4 Console, network, links, and forms

**QA-030:** For each representative route and interaction:

- Zero uncaught exceptions, unhandled promise rejections, hydration mismatches, CSP violations, mixed content, or unexplained console errors/warnings.
- Zero failed essential network requests. Expected failure scenarios are asserted and do not create retry storms.
- No request contains form values or tokens in URL/query/referrer.
- No unexpected third-party host, tracker, cookie, beacon, or preconnect.
- API status, MIME type, cache policy, CORS, payload shape, and response size are correct.
- No duplicate API call or submit caused by rendering, strict mode, retry, or navigation.

Any console/network allowlist identifies exact message/request, reason, owner, and expiry. Broad wildcard suppression fails.

**QA-031:** Crawl the built/staging site:

- Internal links, fragments, assets, canonical URLs, sitemap entries, alternate-language links, and redirects resolve as designed.
- Critical external links are manually verified. Transient third-party failures are reported separately and never hide internal failures.
- No link points to localhost, preview/staging hosts, private storage, obsolete domains, or `javascript:` URLs.
- Email/telephone links are formatted and labelled accessibly.

**QA-032:** Form-specific evidence records the request and safe response for:

| Case | Required outcome |
|---|---|
| Valid data with configured local mocks | One durable accepted submission; accessible confirmation |
| Invalid data | 4xx validation response; no downstream call; field and summary errors |
| Unexpected fields/oversized body/wrong content type | Safe 4xx/413/415; no processing |
| Missing external configuration | 503 stable code; transparent unavailable UI; no success side effects |
| CAPTCHA missing/rejected/replayed/timed out | Rejected/retryable as designed; no send |
| Rate limited | 429 plus accurate retry guidance; no send |
| Persistence/delivery unavailable | No false success; defined retry/idempotency path |
| Duplicate click/retry | At most one accepted operation for the idempotency scope |
| Cross-site request | Rejected where CSRF policy requires |
| XSS/header injection payload | Inert/rejected; no executable/stored payload or header split |

### 7.5 Exploratory and content QA

Independent exploratory charters cover:

- A first-time participant seeking safe, credible “how to start” information on a low-bandwidth phone.
- A keyboard/screen-reader user navigating media, event, and contact journeys.
- A parent checking safeguarding, organisation status, contact, and use of a child’s data/image.
- A search/social visitor landing directly on old, missing, shared, or deep content.
- A malicious/spam user probing forms, IDs, filters, errors, redirects, and client-visible configuration.
- An editor publishing missing images, very long names, unusual Unicode, past/cancelled events, and hostile markup.

Content QA verifies spelling, Indian English conventions selected by the content owner, dates/time zones, phone/address formats, contact ownership, document freshness, image rights, names/pronouns, event status, and evidence for organisational claims.

## 8. Actual-results report template

Copy this section into a dated run report. Never convert “not run”, “blocked”, “no field data”, or “tool unavailable” to pass.

```text
# Quality Run: <release/build> — <UTC date>

Decision: PASS | PASS WITH EXCEPTIONS | FAIL | BLOCKED
Commit SHA:
Build/deployment ID and artifact digest:
Target URL/environment:
Production-equivalence differences:
Tester(s) and independent reviewer:
Browser/device/OS matrix:
Runtime/package-manager/tool versions:
Test-data seed and consent/config state:

## Gate summary
Gate | Planned threshold | Actual result/metric | Evidence link | Status | Defect/exception
Build integrity |
Functional/E2E |
WCAG 2.2 AA |
Performance |
Security/privacy |
SEO/index control |
Production smoke |

## Commands and results
Command | Start/end UTC | Exit code | Passed/failed/skipped | Report/artifact

## Accessibility
Route/state | WCAG criterion | Tool/manual method | AT/browser | Actual observation | Status

## Performance
Route | Profile | Runs | TTFB | FCP | LCP | INP/TBT | CLS | JS/CSS/transfer | Trace
Field window | Segment | Samples | p50 | p75 | p95 | Previous delta

## Security/privacy
Requirement | Actor/payload | Expected | Actual status/body/data state | Evidence | Status

## SEO/content
URL | Status | Index directive | Canonical | Title/H1 | OG | Structured data | Sitemap | Status

## Forms
Case | Configuration | Expected | Actual | Downstream side effects | Logs/redaction checked | Status

## Defects
ID | Severity | Requirement | Reproduction | Owner | Target release

## Exceptions
ID | Risk | Rationale | Compensating control | Approver | Expiry | Follow-up

## Residual risk and recommendation
Known limitations:
Tests not run and why:
Field data unavailable:
Rollback trigger/owner:
Final recommendation:
Approvals and UTC timestamps:
```

Machine-readable reports and traces should be retained with CI/release artifacts according to the approved evidence-retention period. Screenshots and recordings must use synthetic data and be redacted before sharing.

## 9. Release gates

### Gate A — Build integrity

- Clean lockfile install, secret scan, audits, formatting/lint, strict typecheck, unit/integration tests, and production build pass.
- Released artifact, SBOM/dependency record, commit, and deployment are traceable.
- No test is silently skipped due to absent external credentials.

### Gate B — Functional and independent QA

- All critical E2E journeys pass in the browser matrix.
- Console/network/link/form/404 suites pass.
- Independent QA completes the critical exploratory charters.
- No open P0/P1 functional defect; P2 exceptions are named, dated, and time-limited.

### Gate C — Accessibility

- All applicable WCAG 2.2 A/AA criteria pass on representative routes/states.
- Keyboard, focus, mobile/zoom, reduced-motion, assistive-technology, and WebGL fallback checks pass.
- Zero critical/serious automated findings and zero known P0/P1 manual accessibility defect.

### Gate D — Performance

- Five-run controlled mobile medians and run guardrails meet the documented budgets on all required routes.
- Production synthetic monitoring is active; RUM is privacy-reviewed and either active or explicitly recorded as awaiting traffic.
- The initial release is re-gated on 7-day and 28-day field data; a sustained p75 CWV regression has an owner and rollback/remediation trigger.

### Gate E — Security and privacy

- Server validation, XSS, CSRF/CORS, header/TLS, Turnstile adapter, rate-limit, secrets, and dependency tests pass.
- Supabase least privilege and the complete RLS unauthorised-access matrix pass with actual database-state evidence.
- No exploitable critical/high runtime vulnerability, known secret exposure, or unauthorised data path remains.
- Data inventory, retention/deletion, processor, imagery/publication authority, and children’s-data decisions have accountable approval.
- Legal policy drafts retain the professional-review label until formally approved.

### Gate F — SEO and deployment controls

- Metadata, canonical, OG, status/redirect, sitemap, robots, 404, and restrained structured-data checks pass.
- Staging/preview is access-restricted and `noindex`; production is free of accidental `noindex`.
- Proposed-organisation status and every material affiliation/recognition claim are evidence-backed.

### Gate G — Production smoke and form mode

- The production artifact passes non-destructive route, header, console, network, index-control, and synthetic performance smoke checks.
- If external integrations remain unconfigured, form endpoints return 503 and the UI transparently reports unavailability with no false-success side effect.
- If forms are enabled, live Turnstile, persistence/delivery, rate-limit, monitoring, and deletion smoke checks pass using a tagged synthetic record that is then removed.
- Rollback procedure, owner, monitoring alerts, support contact, and release decision are recorded.

**Final decision rule:** any P0/P1, unauthorised data access, exposed secret, false form success, accidental staging indexability/production `noindex`, missing professional legal review label on an unapproved policy, or failed WCAG 2.2 A/AA criterion stops release. All gates require actual evidence for the exact artifact; plans and screenshots of earlier builds are not acceptance evidence.
