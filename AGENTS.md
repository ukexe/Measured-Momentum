# Repository guidance

- Preserve every file under `docs/drafts/`; drafts are evidence, not approved
  public copy.
- Keep the site visibly in **Proposed organisation · In development** mode.
- Do not imply legal status, recognition, affiliation, authority, people,
  results, events, sponsors or official contact details without a closed
  verification record.
- Keep editorial routes compatible with static export. Do not add request-time
  page APIs, cookies, ISR, Server Actions or SSR without an approved
  architecture change.
- Cloudflare Static Assets owns non-API delivery. The Worker runs first only
  for `/api/*` and must delegate every non-API request to `env.ASSETS.fetch`.
- Enquiries fail closed. Never return success before durable, server-validated
  persistence is implemented and confirmed.
- Keep secrets server-only and out of `NEXT_PUBLIC_*`, source, examples, logs
  and generated assets.
- Prefer Server Components and native semantics. Add client components,
  providers and dependencies only for demonstrated interaction needs.
- Saath Rekha remains fallback-first; Three/R3F must stay deferred and
  nonessential when the scene is implemented.
- Use exact dependency versions, strict TypeScript and the committed npm
  lockfile.
- Before handoff, run format check, lint, typecheck, unit tests, production
  build and a non-mutating Wrangler dry run when configuration permits.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
