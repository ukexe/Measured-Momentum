# Security

**Scope:** current static export, Cloudflare Worker enquiry API, optional
Turnstile and Supabase REST boundary  
**Status:** implementation description and release gate, not a certification

## Trust boundaries and protected assets

The relevant flow is:

```text
Browser → Cloudflare Static Assets / Worker
        → Cloudflare rate-limit binding
        → optional Turnstile Siteverify
        → Supabase Data API → api.enquiries
```

Protected assets are Worker configuration and secrets, enquiry content,
Turnstile tokens, requester network identifiers, the Supabase gate table,
stored enquiry rows, logs and publication-controlled site content.

The site has no user accounts, payments, uploads, member portal, competition
system or direct browser database client. Adding any of those changes the
threat model.

## Threats and implemented controls

### False acceptance or silent loss

- Capability discovery is separate from submission.
- Incomplete/partial configuration reports `available: false`.
- A supported JSON submission fails with
  `503 FORM_SERVICE_UNAVAILABLE` before its body is read when configuration is
  incomplete.
- Provider uncertainty fails closed; persistence is called once and is not
  automatically retried.
- The API and UI report success only after Supabase REST returns `201`.
- The success reference is a cryptographic UUID. It confirms storage only, not
  membership, selection, accreditation or a response commitment.

Residual limit: there is no server-side idempotency or duplicate-enquiry
record. The client blocks concurrent double-submit, but a later independent
request can create another UUID/row. Operational deduplication and response
handling are not implemented. When a transport, malformed response or
availability failure leaves the client unable to confirm the outcome, the UI
now says that the record may exist and warns that resubmission may duplicate
it; it does not claim the request was definitely lost.

### Spam, cross-site abuse and resource exhaustion

- The configured flow requires the exact request `Origin` from a maximum
  ten-origin allowlist; wildcards, credentials, paths, queries and fragments
  are rejected.
- Production requires HTTPS origins and excludes localhost.
- A strictly parsed IPv4 or IPv6 `CF-Connecting-IP` is required. IPv4 octets
  are range-checked and ambiguous leading zeros are rejected; IPv6 is parsed
  as a complete address, including a checked embedded IPv4 suffix where used.
  This control assumes the Worker remains behind Cloudflare; the header is not
  accepted as an arbitrary client identity outside that boundary.
- The IP is HMAC-SHA-256 keyed with a Worker-only salt before use as the
  Cloudflare rate-limit key. `wrangler.jsonc` sets 10 attempts per 60 seconds.
- Rate limiting occurs before body read, JSON parsing, Turnstile and
  persistence. Limiter failure returns `503`; a limit returns `429` and
  `Retry-After: 60`.
- Declared and streamed body length is limited to 16 KiB. UTF-8 decoding is
  fatal, provider responses are bounded and both external calls have
  eight-second timeouts.
- A hidden honeypot rejects simple automated submissions.
- Optional Turnstile adds a server-verified abuse signal. It is not
  authentication and does not replace origin, validation or rate limiting.

`Origin` can be forged by a non-browser client and is not an authorisation
credential. The gate, rate limit, strict validation and optional Turnstile are
the other relevant controls.

### Malformed, excessive or unexpected data

- Only `application/json` with no parameter or UTF-8 charset is accepted.
- Zod applies a strict, versioned schema, Unicode normalisation, code-point
  length bounds, control-character checks, lower-cased email and an enum for
  pathways.
- Unknown fields are rejected. The form does not accept dates of birth,
  identity documents, health data, payment data or child details.
- Database checks repeat field lengths, schema version, pathway, status,
  source and privacy acknowledgement.
- The browser validates for usability, but only Worker/database validation is
  trusted.

No submitted field is rendered back as HTML by the current application. API
payloads are JSON-serialised and parsed against strict client response schemas.

### Bot-verification failure

Turnstile configuration is atomic: all three of site key, secret and hostname
allowlist must be absent or valid. When enabled:

- the widget script is loaded only after an available capability says it is
  required;
- Siteverify receives the token, requester IP and request UUID;
- success, action `enquiry` and exact lower-cased hostname are required;
- malformed, oversized, timed-out or provider-error responses become
  unavailable;
- tokens are reset client-side after an attempt and are never persisted or
  included in application logs.

The site key is intentionally public through the status endpoint. The secret
must remain Worker-only.

### Database privilege or data exposure

The committed migration:

- revokes public and browser-role schema/table access before granting a narrow
  path;
- forces RLS on `api.enquiries` and `private.enquiry_api_keys`;
- grants `anon` only named insert columns;
- grants no browser-role select, update or delete operation;
- keeps the gate table private;
- uses a `security definer` gate function with an empty `search_path`;
- requires an enabled Worker-provided gate UUID in the insert policy;
- prevents clients from supplying `source` or `status`;
- stores no Turnstile token, IP address or rate-limit digest.

The Worker uses the Supabase publishable key, not a service-role key or
`Authorization` bearer. The publishable key alone cannot satisfy the RLS gate.

### Secret and personal-data leakage

- Application logs contain only event name, request UUID and HTTP status.
- Provider bodies, form fields, IPs, HMAC results, tokens and keys are not
  logged by application code.
- API errors are stable and do not return provider details.
- `.env`, `.env.*`, `.dev.vars` and Wrangler local state are ignored; only a
  blank-name `.env.example` is committed.
- API responses are `no-store`, `nosniff`, `no-referrer` and use
  `default-src 'none'; frame-ancestors 'none'; sandbox`.
- Wrangler observability is enabled with persisted logs/traces and query-string
  redaction. Cloudflare platform metadata, access and retention still require
  an approved operational review.

## Environment and secret boundary

Build-time public values are compiled into static output:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_ENV`

They are not secrets. Production must inspect the exported artifact for the
approved canonical origin and index state.

Worker-side deployment settings are:

- `SITE_ENV`
- `PUBLIC_SITE_URL`
- `FORM_ALLOWED_ORIGINS`
- `PRIVACY_NOTICE_VERSION`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- optional `TURNSTILE_SITE_KEY`
- optional `TURNSTILE_HOSTNAMES`

The Supabase URL/publishable key and Turnstile site key are not privileged
secrets, but this implementation deliberately keeps them at the Worker
boundary except for the site key returned when needed.

Worker secrets are:

- `SUPABASE_ENQUIRY_GATE_KEY`
- `RATE_LIMIT_KEY_SALT`
- optional `TURNSTILE_SECRET_KEY`

`ENQUIRY_RATE_LIMITER` is a Cloudflare binding, not a string environment
variable. Never put any Worker setting or secret in a `NEXT_PUBLIC_*` value,
source, example value, build log, test evidence or browser bundle. Use an
approved environment-scoped Cloudflare configuration and interactive/managed
secret workflow; see `deployment.md`.

## Static response controls and limits

`public/_headers` applies to static assets:

- `frame-ancestors 'none'`, `X-Frame-Options: DENY`;
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`;
- COOP/CORP same-origin;
- camera, geolocation, microphone, payment and USB disabled;
- strict-origin-when-cross-origin referrer policy;
- MIME sniffing disabled;
- immutable one-year caching for hashed `/_next/static/*`.

Known limits:

- HSTS is intentionally absent until every production host is HTTPS-ready and
  domain ownership is approved.
- The CSP intentionally omits `default-src` and `script-src`; it is not a
  strict script, frame or connection allowlist. Next inline bootstrap/JSON-LD
  and conditional Turnstile need a production CSP decision.
- Non-production noindex is HTML metadata plus `robots.txt`; there is no
  environment-specific static `X-Robots-Tag`.
- Staging authentication/network restriction is external Cloudflare
  configuration and is not present in the repository.

## RLS/SQL test and evidence limitations

`supabase/tests/enquiries_rls.workstream.sql` is a manual psql-style test for
an isolated local Supabase database after the migration. It rolls back
synthetic data and checks:

- missing, wrong and disabled gate values reject insert;
- an enabled gate permits one valid insert;
- `anon` cannot select, update, delete or read the private gate table;
- clients cannot set the protected status column;
- an invalid pathway violates the constraint;
- `authenticated` cannot insert.

It is not invoked by `npm test`, and this repository contains no Supabase CLI
project configuration or CI job. It does not prove:

- that a live migration was applied or that its exact schema is current;
- Supabase Data API exposure/configuration for the `api` schema;
- propagation of the custom header through the live REST stack;
- live publishable-key role behavior, RLS, grants or database constraints;
- operational/admin access, retention, deletion, backup expiry or incident
  response;
- provider-region, contract, subprocessor or cross-border decisions.

Execute it first against an isolated approved database, then perform a
separately authorised live least-privilege test with database-state evidence.
Never run the workstream SQL against production: it creates synthetic gate
records before rolling back and assumes test control of role/session settings.
The migration has no down migration; a Worker rollback does not revert
database changes.

## Release blockers

Enquiry enablement requires all of the following outside code:

- verified operator/controller, legal basis, privacy notice version, retention,
  deletion, access and incident owners;
- professional legal/privacy/terms and children’s-data review;
- approved domain, exact origins and Cloudflare environment isolation;
- Cloudflare/Supabase ownership, credentials and secret rotation process;
- applied migration, private gate provisioning and recorded live RLS/grant
  tests;
- live rate-limit and optional Turnstile tests;
- an authorised way to review/respond to stored records;
- verified public contact route if one is promised.

Founder, affiliation, contact, logo and photo claims remain governed by
`content-verification.md` regardless of technical controls.
