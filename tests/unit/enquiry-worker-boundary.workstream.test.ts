import { describe, expect, it } from "vitest";

import type { EnquiryHandlerDependencies } from "@/lib/server/enquiries/handler";
import {
  handleEnquiryStatus,
  handleEnquirySubmission,
} from "@/lib/server/enquiries/handler";
import {
  isValidCloudflareClientIp,
  type RateLimitDecision,
} from "@/lib/server/enquiries/rate-limit";
import type { EnquiryRepositoryResult } from "@/lib/server/enquiries/repository";
import type { TurnstileVerificationResult } from "@/lib/server/enquiries/turnstile";
import { handleWorkerRequest } from "@/worker/index";

const REQUEST_ID = "00000000-0000-4000-8000-000000000101";
const REFERENCE_ID = "00000000-0000-4000-8000-000000000102";

const validPayload = {
  schemaVersion: 1,
  name: "Test Person",
  email: "person@example.com",
  cityState: "Pune, Maharashtra",
  pathway: "general-question",
  message: "A synthetic enquiry for a boundary test.",
  privacyAcknowledged: true,
  updatesConsent: false,
  website: "",
} as const;

function completeEnvironment(
  overrides: Readonly<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    SITE_ENV: "development",
    PUBLIC_SITE_URL: "https://example.test",
    FORM_ALLOWED_ORIGINS: "https://example.test",
    PRIVACY_NOTICE_VERSION: "test-v1",
    SUPABASE_URL: "https://project-ref.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
    SUPABASE_ENQUIRY_GATE_KEY: "00000000-0000-4000-8000-000000000001",
    RATE_LIMIT_KEY_SALT: "s".repeat(32),
    ENQUIRY_RATE_LIMITER: {
      async limit() {
        return { success: true };
      },
    },
    ...overrides,
  };
}

function enquiryRequest(
  body: string = JSON.stringify(validPayload),
  headers: Readonly<Record<string, string>> = {},
): Request {
  return new Request("https://example.test/api/enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.test",
      "CF-Connecting-IP": "203.0.113.20",
      ...headers,
    },
    body,
  });
}

function createHarness(options?: {
  readonly rateLimit?: RateLimitDecision;
  readonly verification?: TurnstileVerificationResult;
  readonly persistence?: EnquiryRepositoryResult;
}) {
  const calls = {
    rateLimit: 0,
    verify: 0,
    persist: 0,
    logs: [] as unknown[],
  };
  const uuids = [REQUEST_ID, REFERENCE_ID];
  let uuidIndex = 0;

  const dependencies: EnquiryHandlerDependencies = {
    rateLimiter: {
      async check() {
        calls.rateLimit += 1;
        return options?.rateLimit ?? "allowed";
      },
    },
    verifier: {
      async verify() {
        calls.verify += 1;
        return options?.verification ?? { status: "verified" };
      },
    },
    repository: {
      async insert() {
        calls.persist += 1;
        return options?.persistence ?? { status: "persisted" };
      },
    },
    createUuid() {
      const uuid = uuids[uuidIndex] ?? REQUEST_ID;
      uuidIndex += 1;
      return uuid;
    },
    log(event) {
      calls.logs.push(event);
    },
  };

  return { calls, dependencies };
}

async function responsePayload(response: Response): Promise<unknown> {
  return (await response.json()) as unknown;
}

describe("enquiry Worker boundary workstream", () => {
  it("accepts only strict IPv4 and IPv6 client addresses", () => {
    for (const address of [
      "0.0.0.0",
      "203.0.113.20",
      "255.255.255.255",
      "::1",
      "2001:db8::1",
      "::ffff:192.0.2.128",
    ]) {
      expect(isValidCloudflareClientIp(address), address).toBe(true);
    }

    for (const address of [
      null,
      "",
      "1.2.3",
      "1.2.3.4.5",
      "01.2.3.4",
      "256.1.1.1",
      "999.999.999.999",
      ":::",
      "2001:db8::1::",
      "[::1]",
      "fe80::1%eth0",
      "203.0.113.20, 198.51.100.2",
    ]) {
      expect(isValidCloudflareClientIp(address), String(address)).toBe(false);
    }
  });

  it("reports public unavailable status with HTTP 200 and no secrets", async () => {
    const response = handleEnquiryStatus({});
    const payload = await responsePayload(response);

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      available: false,
      reason:
        "The enquiry service is not open because its responsible handling configuration is incomplete.",
    });
    expect(JSON.stringify(payload)).not.toContain("SUPABASE");
    expect(JSON.stringify(payload)).not.toContain("SECRET");
  });

  it("reports available status only for complete configuration", async () => {
    const available = handleEnquiryStatus(completeEnvironment());
    expect(await responsePayload(available)).toEqual({
      available: true,
      turnstileRequired: false,
    });

    const partialTurnstile = handleEnquiryStatus(
      completeEnvironment({
        TURNSTILE_SITE_KEY: `site_${"a".repeat(24)}`,
      }),
    );
    expect(await responsePayload(partialTurnstile)).toMatchObject({
      available: false,
    });

    const missingLimiter = handleEnquiryStatus(
      completeEnvironment({ ENQUIRY_RATE_LIMITER: undefined }),
    );
    expect(await responsePayload(missingLimiter)).toMatchObject({
      available: false,
    });

    const unsafeProductionOrigin = handleEnquiryStatus(
      completeEnvironment({
        SITE_ENV: "production",
        FORM_ALLOWED_ORIGINS: "https://example.test,http://localhost:3000",
      }),
    );
    expect(await responsePayload(unsafeProductionOrigin)).toMatchObject({
      available: false,
    });

    const completeTurnstile = handleEnquiryStatus(
      completeEnvironment({
        TURNSTILE_SITE_KEY: `site_${"a".repeat(24)}`,
        TURNSTILE_SECRET_KEY: `secret_${"b".repeat(24)}`,
        TURNSTILE_HOSTNAMES: "example.test",
      }),
    );
    expect(await responsePayload(completeTurnstile)).toEqual({
      available: true,
      turnstileRequired: true,
      siteKey: `site_${"a".repeat(24)}`,
    });
  });

  it("returns unconfigured 503 before any injected adapter is called", async () => {
    const { calls, dependencies } = createHarness();
    const response = await handleEnquirySubmission(
      enquiryRequest(),
      {},
      dependencies,
    );

    expect(response.status).toBe(503);
    expect(await responsePayload(response)).toMatchObject({
      ok: false,
      error: { code: "FORM_SERVICE_UNAVAILABLE" },
      requestId: REQUEST_ID,
    });
    expect(calls).toMatchObject({
      rateLimit: 0,
      verify: 0,
      persist: 0,
    });
  });

  it("rejects unsupported content type without downstream work", async () => {
    const { calls, dependencies } = createHarness();
    const request = enquiryRequest(JSON.stringify(validPayload), {
      "Content-Type": "text/plain",
    });
    const response = await handleEnquirySubmission(
      request,
      completeEnvironment(),
      dependencies,
    );

    expect(response.status).toBe(415);
    expect(calls.rateLimit).toBe(0);
    expect(calls.persist).toBe(0);
  });

  it("rejects a missing or different Origin before limiting", async () => {
    const { calls, dependencies } = createHarness();
    const request = enquiryRequest(JSON.stringify(validPayload), {
      Origin: "https://other.example",
    });
    const response = await handleEnquirySubmission(
      request,
      completeEnvironment(),
      dependencies,
    );

    expect(response.status).toBe(403);
    expect(await responsePayload(response)).toMatchObject({
      error: { code: "ORIGIN_NOT_ALLOWED" },
    });
    expect(calls.rateLimit).toBe(0);
  });

  it("returns 429 before parsing or calling costly adapters", async () => {
    const { calls, dependencies } = createHarness({ rateLimit: "limited" });
    const response = await handleEnquirySubmission(
      enquiryRequest("{not-json"),
      completeEnvironment(),
      dependencies,
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(calls).toMatchObject({
      rateLimit: 1,
      verify: 0,
      persist: 0,
    });
  });

  it("rejects invalid JSON and unknown fields after limiting", async () => {
    const invalidHarness = createHarness();
    const invalidResponse = await handleEnquirySubmission(
      enquiryRequest("{not-json"),
      completeEnvironment(),
      invalidHarness.dependencies,
    );
    expect(invalidResponse.status).toBe(400);
    expect(invalidHarness.calls.persist).toBe(0);

    const unknownHarness = createHarness();
    const unknownResponse = await handleEnquirySubmission(
      enquiryRequest(
        JSON.stringify({ ...validPayload, dateOfBirth: "2010-01-01" }),
      ),
      completeEnvironment(),
      unknownHarness.dependencies,
    );
    expect(unknownResponse.status).toBe(422);
    expect(await responsePayload(unknownResponse)).toMatchObject({
      error: { code: "VALIDATION_FAILED" },
    });
    expect(unknownHarness.calls.persist).toBe(0);
  });

  it("rejects oversized and honeypot submissions", async () => {
    const oversizedHarness = createHarness();
    const oversized = await handleEnquirySubmission(
      enquiryRequest("x".repeat(16 * 1024 + 1)),
      completeEnvironment(),
      oversizedHarness.dependencies,
    );
    expect(oversized.status).toBe(413);
    expect(oversizedHarness.calls.persist).toBe(0);

    const honeypotHarness = createHarness();
    const honeypot = await handleEnquirySubmission(
      enquiryRequest(JSON.stringify({ ...validPayload, website: "filled" })),
      completeEnvironment(),
      honeypotHarness.dependencies,
    );
    expect(honeypot.status).toBe(400);
    expect(honeypotHarness.calls.persist).toBe(0);
  });

  it.each([
    [{ status: "rejected" } as const, 403, "VERIFICATION_FAILED"],
    [{ status: "unavailable" } as const, 503, "FORM_SERVICE_UNAVAILABLE"],
  ])(
    "fails closed for Turnstile result %j",
    async (verification, status, code) => {
      const { calls, dependencies } = createHarness({ verification });
      const response = await handleEnquirySubmission(
        enquiryRequest(
          JSON.stringify({
            ...validPayload,
            turnstileToken: "test-turnstile-token",
          }),
        ),
        completeEnvironment({
          TURNSTILE_SITE_KEY: `site_${"a".repeat(24)}`,
          TURNSTILE_SECRET_KEY: `secret_${"b".repeat(24)}`,
          TURNSTILE_HOSTNAMES: "example.test",
        }),
        dependencies,
      );

      expect(response.status).toBe(status);
      expect(await responsePayload(response)).toMatchObject({
        error: { code },
      });
      expect(calls.verify).toBe(1);
      expect(calls.persist).toBe(0);
      expect(JSON.stringify(calls.logs)).not.toContain("test-turnstile-token");
    },
  );

  it("returns 503 on persistence failure and 201 only after confirmation", async () => {
    const failedHarness = createHarness({
      persistence: { status: "unavailable" },
    });
    const failed = await handleEnquirySubmission(
      enquiryRequest(),
      completeEnvironment(),
      failedHarness.dependencies,
    );
    expect(failed.status).toBe(503);
    expect(failedHarness.calls.persist).toBe(1);

    const confirmedHarness = createHarness();
    const confirmed = await handleEnquirySubmission(
      enquiryRequest(),
      completeEnvironment(),
      confirmedHarness.dependencies,
    );
    expect(confirmed.status).toBe(201);
    expect(await responsePayload(confirmed)).toEqual({
      ok: true,
      reference: REFERENCE_ID,
      message: "Your enquiry has been recorded.",
    });
    expect(confirmedHarness.calls.persist).toBe(1);
    expect(JSON.stringify(confirmedHarness.calls.logs)).not.toContain(
      "person@example.com",
    );
    expect(JSON.stringify(confirmedHarness.calls.logs)).not.toContain(
      "Test Person",
    );
  });

  it("returns JSON 404 for unknown APIs and delegates non-API assets", async () => {
    let assetCalls = 0;
    const environment = {
      ...completeEnvironment(),
      ENQUIRY_RATE_LIMITER: {
        async limit() {
          return { success: true };
        },
      },
      ASSETS: {
        async fetch() {
          assetCalls += 1;
          return new Response("asset");
        },
        connect(): Socket {
          throw new Error("Not used by this test.");
        },
      },
    };

    const missing = await handleWorkerRequest(
      new Request("https://example.test/api/missing"),
      environment,
    );
    expect(missing.status).toBe(404);
    expect(missing.headers.get("Content-Type")).toContain("application/json");
    expect(assetCalls).toBe(0);

    const asset = await handleWorkerRequest(
      new Request("https://example.test/join/"),
      environment,
    );
    expect(await asset.text()).toBe("asset");
    expect(assetCalls).toBe(1);
  });

  it("enforces endpoint methods with JSON 405 responses", async () => {
    const environment = {
      ...completeEnvironment(),
      ENQUIRY_RATE_LIMITER: {
        async limit() {
          return { success: true };
        },
      },
      ASSETS: {
        async fetch() {
          return new Response("asset");
        },
        connect(): Socket {
          throw new Error("Not used by this test.");
        },
      },
    };

    const response = await handleWorkerRequest(
      new Request("https://example.test/api/enquiries", { method: "GET" }),
      environment,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(await responsePayload(response)).toMatchObject({
      error: { code: "METHOD_NOT_ALLOWED" },
    });
  });
});
