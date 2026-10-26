import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { chromium, devices } from "@playwright/test";

const targetUrl = new URL(process.argv[2] ?? "http://127.0.0.1:8790/");
const requestedRuns = Number.parseInt(process.argv[3] ?? "3", 10);
const outputPath = process.argv[4];

if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
  throw new Error("The target must use HTTP or HTTPS.");
}

if (
  !Number.isSafeInteger(requestedRuns) ||
  requestedRuns < 1 ||
  requestedRuns > 10
) {
  throw new Error("The run count must be an integer between 1 and 10.");
}

const profile = {
  cpuSlowdownMultiplier: 4,
  downloadBitsPerSecond: 1_600_000,
  uploadBitsPerSecond: 750_000,
  latencyMs: 150,
  observationAfterLoadMs: 5_000,
};

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

async function measure(browser) {
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  const encodedLengths = new Map();
  const requestIds = new Set();

  client.on("Network.responseReceived", ({ requestId }) => {
    requestIds.add(requestId);
  });
  client.on("Network.loadingFinished", ({ encodedDataLength, requestId }) => {
    encodedLengths.set(requestId, encodedDataLength);
  });

  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  await client.send("Network.emulateNetworkConditions", {
    connectionType: "cellular4g",
    downloadThroughput: profile.downloadBitsPerSecond / 8,
    latency: profile.latencyMs,
    offline: false,
    uploadThroughput: profile.uploadBitsPerSecond / 8,
  });
  await client.send("Emulation.setCPUThrottlingRate", {
    rate: profile.cpuSlowdownMultiplier,
  });

  await page.addInitScript(() => {
    const state = {
      cls: 0,
      lcp: 0,
      longTasks: [],
      observers: [],
    };

    globalThis.__measuredMomentumLab = state;

    for (const [type, callback] of [
      [
        "largest-contentful-paint",
        (entries) => {
          const last = entries.at(-1);
          if (last) {
            state.lcp = last.startTime;
          }
        },
      ],
      [
        "layout-shift",
        (entries) => {
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              state.cls += entry.value;
            }
          }
        },
      ],
      [
        "longtask",
        (entries) => {
          state.longTasks.push(
            ...entries.map(({ duration, startTime }) => ({
              duration,
              startTime,
            })),
          );
        },
      ],
    ]) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ buffered: true, type });
        state.observers.push(observer);
      } catch {
        // A missing observer type is reported as a zero metric, not fabricated.
      }
    }
  });

  const response = await page.goto(targetUrl.href, {
    timeout: 120_000,
    waitUntil: "load",
  });
  await page.waitForTimeout(profile.observationAfterLoadMs);

  const browserMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const firstContentfulPaint = performance.getEntriesByName(
      "first-contentful-paint",
    )[0];
    const state = globalThis.__measuredMomentumLab;
    const longTasks = state?.longTasks ?? [];

    return {
      blockingTime5sMs: longTasks.reduce(
        (total, task) => total + Math.max(0, task.duration - 50),
        0,
      ),
      cls: state?.cls ?? 0,
      domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
      fcpMs: firstContentfulPaint?.startTime ?? 0,
      lcpMs: state?.lcp ?? 0,
      loadMs: navigation?.loadEventEnd ?? 0,
      longTaskCount: longTasks.length,
      ttfbMs: navigation
        ? navigation.responseStart - navigation.requestStart
        : 0,
    };
  });

  await context.close();

  return {
    ...browserMetrics,
    requests: requestIds.size,
    status: response?.status() ?? 0,
    transferredBytes: Array.from(encodedLengths.values()).reduce(
      (total, value) => total + value,
      0,
    ),
  };
}

const browser = await chromium.launch({ headless: true });

try {
  await measure(browser);

  const samples = [];
  for (let index = 0; index < requestedRuns; index += 1) {
    samples.push(await measure(browser));
  }

  const numericKeys = [
    "blockingTime5sMs",
    "cls",
    "domContentLoadedMs",
    "fcpMs",
    "lcpMs",
    "loadMs",
    "longTaskCount",
    "requests",
    "transferredBytes",
    "ttfbMs",
  ];
  const medians = Object.fromEntries(
    numericKeys.map((key) => [
      key,
      median(samples.map((sample) => sample[key])),
    ]),
  );

  const report = {
    measuredAt: new Date().toISOString(),
    note: "Lab load metrics only. The five-second blocking-time value is a long-task proxy, not field INP.",
    runtime: {
      browser: browser.version(),
      node: process.version,
      retainedRuns: requestedRuns,
      warmupRuns: 1,
    },
    profile,
    target: targetUrl.href,
    samples,
    medians,
  };
  const serialisedReport = `${JSON.stringify(report, null, 2)}\n`;

  if (outputPath) {
    const resolvedOutputPath = resolve(outputPath);
    await mkdir(dirname(resolvedOutputPath), { recursive: true });
    await writeFile(resolvedOutputPath, serialisedReport, "utf8");
    console.error(`Saved raw lab samples to ${resolvedOutputPath}`);
  }

  console.log(serialisedReport.trimEnd());
} finally {
  await browser.close();
}
