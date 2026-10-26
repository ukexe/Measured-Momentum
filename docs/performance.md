# Performance

**Measured:** 26 October 2026  
**Target:** local production export served by Wrangler at `127.0.0.1`  
**Status:** lab evidence only; no field Core Web Vitals are available

## Targets and result

- The 2.5 second LCP target was met in every retained post-remediation sample.
- The 0.1 CLS target was met in every retained sample; each recorded `0`.
- INP cannot be measured from a page-load lab run and is not claimed.
- The repeatable five-second long-task proxy had medians between `292 ms` and
  `558 ms`. It is not INP or Lighthouse TBT, but it means the 200 ms
  interaction target is not yet evidenced.
- Initial transfer and request counts remained below the project budgets in
  all post-remediation samples.

These results do not predict a production percentile. CDN cache state, TLS,
distance, real devices, interactions and an eligible WebGL scene still require
deployed measurement.

## Method

`npm run perf:lab -- <url> 3 <output.json>` runs one warm-up followed by three
cold browser contexts using the pinned Playwright Chromium. The script applies:

- Pixel 7 emulation;
- 4× CPU slowdown;
- 1.6 Mbps download and 0.75 Mbps upload;
- 150 ms latency;
- disabled browser cache and blocked service workers;
- a five-second post-load observation window.

It records navigation timing, FCP, LCP, CLS, response status, request count,
encoded transfer, long-task count and a blocking-time proxy calculated as the
sum of each observed long task beyond 50 ms. The script is
`scripts/measure-lab-performance.mjs`.

The headless browser retained the static Saath Rekha fallback under its
capability policy. These numbers therefore prove fallback-first loading, not
the cost of an eligible GPU scene.

The exact final samples, ISO UTC timestamps, Chromium `156.0.8078.4`, Node
runtime and profile are retained in:

- [`evidence/performance/2026-10-26-home.json`](evidence/performance/2026-10-26-home.json);
- [`evidence/performance/2026-10-26-join.json`](evidence/performance/2026-10-26-join.json);
- [`evidence/performance/2026-10-26-404.json`](evidence/performance/2026-10-26-404.json).

## Post-remediation three-run medians

Homepage `/`:

- FCP `1.184 s`
- LCP `1.184 s`
- CLS `0`
- load event `1.729 s`
- five-second blocking-time proxy `292 ms`
- TTFB `16 ms` on the local Wrangler boundary
- `12` requests and `188,997` encoded bytes

Form route `/join/`:

- FCP `0.988 s`
- LCP `0.988 s`
- CLS `0`
- load event `2.056 s`
- five-second blocking-time proxy `558 ms`
- TTFB `16 ms` locally
- `14` requests and `213,019` encoded bytes

Branded 404 `/performance-not-found/`:

- HTTP `404`
- FCP `0.984 s`
- LCP `0.984 s`
- CLS `0`
- load event `1.743 s`
- five-second blocking-time proxy `350 ms`
- TTFB `16 ms` locally
- `10` requests and `171,860` encoded bytes

## Initial Lighthouse evidence and remediation

Lighthouse `13.5.0` completed two mobile simulated-throttling homepage runs
before the final performance changes:

- scores `75` and `76`;
- FCP `1.47 s` and `1.78 s`;
- LCP `1.83 s` and `2.18 s`;
- CLS `0` in both;
- TBT `1,249 ms` and `905 ms`;
- approximately `220 KB` and `27` requests.

The traces attributed the largest costs to full-page style/layout and
framework hydration. The lazy Three/R3F payload was not among the initial
scripts. Remediation added offscreen `content-visibility` containment to long
homepage sections and disabled automatic Next route prefetch for the global
shell and homepage actions. A five-second Playwright request audit then
recorded `12` requests and no route-prefetch requests.

Subsequent Lighthouse trace attempts repeatedly terminated with
`NO_NAVSTART`. They are recorded as tool failures, not passes. The
Playwright/CDP runner was added to make the retained three-run evidence
repeatable, but its blocking-time proxy must not be compared as if it were a
Lighthouse TBT score.

## Remaining work

Before an indexable production launch:

1. run at least five Lighthouse samples against the exact deployed artifact
   and retain every run;
2. test the eligible WebGL path and manual pause behavior on representative
   mid-range Android hardware;
3. collect privacy-reviewed field LCP, INP and CLS, then evaluate p75 after
   sufficient traffic;
4. profile the remaining React/Radix hydration and form-capability work if
   field INP or long tasks miss target;
5. verify production CDN cache, compression, TLS and response headers;
6. test actual Safari/iOS and Chrome/Android devices.

No performance score or Core Web Vitals pass should be published from this
local report.
