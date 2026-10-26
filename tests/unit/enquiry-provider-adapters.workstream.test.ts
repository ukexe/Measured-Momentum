import { describe, expect, it } from "vitest";

import { enquiryRequestSchema } from "@/lib/contracts/enquiry";
import { createSupabaseEnquiryRepository } from "@/lib/server/enquiries/repository";
import { createTurnstileVerifier } from "@/lib/server/enquiries/turnstile";

const enquiry = enquiryRequestSchema.parse({
  schemaVersion: 1,
  name: "Test Person",
  email: "person@example.com",
  pathway: "general-question",
  privacyAcknowledged: true,
  updatesConsent: false,
});

function siteverifyFetch(
  payload: unknown,
  status = 200,
  capture?: (init: RequestInit | undefined) => void,
): typeof fetch {
  return async (_input, init) => {
    capture?.(init);
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

describe("enquiry provider adapters workstream", () => {
  it("accepts Turnstile only for success, action and exact hostname", async () => {
    let capturedInit: RequestInit | undefined;
    const verifier = createTurnstileVerifier(
      "synthetic-secret-key-with-safe-length",
      new Set(["example.test"]),
      siteverifyFetch(
        {
          success: true,
          action: "enquiry",
          hostname: "example.test",
        },
        200,
        (init) => {
          capturedInit = init;
        },
      ),
    );

    const result = await verifier.verify({
      token: "synthetic-token",
      clientIp: "203.0.113.20",
      idempotencyKey: "00000000-0000-4000-8000-000000000101",
    });

    expect(result).toEqual({ status: "verified" });
    expect(capturedInit?.method).toBe("POST");
    expect(new Headers(capturedInit?.headers).get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    );
    const submitted = new URLSearchParams(String(capturedInit?.body));
    expect(submitted.get("response")).toBe("synthetic-token");
    expect(submitted.get("remoteip")).toBe("203.0.113.20");
    expect(submitted.get("idempotency_key")).toBe(
      "00000000-0000-4000-8000-000000000101",
    );
  });

  it.each([
    {
      payload: {
        success: false,
        action: "enquiry",
        hostname: "example.test",
      },
      expected: "rejected",
    },
    {
      payload: {
        success: true,
        action: "different-action",
        hostname: "example.test",
      },
      expected: "rejected",
    },
    {
      payload: {
        success: true,
        action: "enquiry",
        hostname: "other.example",
      },
      expected: "rejected",
    },
    {
      payload: {
        success: false,
        "error-codes": ["internal-error"],
      },
      expected: "unavailable",
    },
  ])("classifies Turnstile failure %#", async ({ payload, expected }) => {
    const verifier = createTurnstileVerifier(
      "synthetic-secret-key-with-safe-length",
      new Set(["example.test"]),
      siteverifyFetch(payload),
    );

    await expect(
      verifier.verify({
        token: "synthetic-token",
        clientIp: "203.0.113.20",
        idempotencyKey: "00000000-0000-4000-8000-000000000101",
      }),
    ).resolves.toEqual({ status: expected });
  });

  it("maps Turnstile timeout, transport and malformed responses to unavailable", async () => {
    const timeoutFetch: typeof fetch = async () => {
      throw new DOMException("Timed out", "TimeoutError");
    };
    const timeoutVerifier = createTurnstileVerifier(
      "synthetic-secret-key-with-safe-length",
      new Set(["example.test"]),
      timeoutFetch,
    );
    await expect(
      timeoutVerifier.verify({
        token: "synthetic-token",
        clientIp: "203.0.113.20",
        idempotencyKey: "00000000-0000-4000-8000-000000000101",
      }),
    ).resolves.toEqual({ status: "unavailable" });

    const malformedVerifier = createTurnstileVerifier(
      "synthetic-secret-key-with-safe-length",
      new Set(["example.test"]),
      async () => new Response("not-json", { status: 200 }),
    );
    await expect(
      malformedVerifier.verify({
        token: "synthetic-token",
        clientIp: "203.0.113.20",
        idempotencyKey: "00000000-0000-4000-8000-000000000101",
      }),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("uses one minimal Supabase REST insert and confirms only HTTP 201", async () => {
    const requests: {
      readonly input: RequestInfo | URL;
      readonly init?: RequestInit;
    }[] = [];
    const fetcher: typeof fetch = async (input, init) => {
      requests.push({ input, ...(init ? { init } : {}) });
      return new Response(null, { status: 201 });
    };
    const repository = createSupabaseEnquiryRepository(
      {
        supabaseUrl: "https://project-ref.supabase.co",
        publishableKey: `sb_publishable_${"a".repeat(32)}`,
        enquiryGateKey: "00000000-0000-4000-8000-000000000001",
      },
      fetcher,
    );

    const result = await repository.insert({
      reference: "00000000-0000-4000-8000-000000000102",
      enquiry,
      privacyNoticeVersion: "test-v1",
    });

    expect(result).toEqual({ status: "persisted" });
    expect(requests).toHaveLength(1);
    expect(String(requests[0]?.input)).toBe(
      "https://project-ref.supabase.co/rest/v1/enquiries",
    );

    const headers = new Headers(requests[0]?.init?.headers);
    expect(headers.get("apikey")).toMatch(/^sb_publishable_/u);
    expect(headers.get("Authorization")).toBeNull();
    expect(headers.get("Content-Profile")).toBe("api");
    expect(headers.get("Prefer")).toBe("return=minimal");
    expect(headers.get("x-enquiry-key")).toBe(
      "00000000-0000-4000-8000-000000000001",
    );

    const body: unknown = JSON.parse(String(requests[0]?.init?.body));
    expect(body).toMatchObject({
      id: "00000000-0000-4000-8000-000000000102",
      name: "Test Person",
      email: "person@example.com",
      pathway: "general-question",
      privacy_acknowledged: true,
      privacy_notice_version: "test-v1",
      updates_consent: false,
    });
    expect(JSON.stringify(body)).not.toContain("turnstile");
    expect(JSON.stringify(body)).not.toContain("website");
  });

  it("does not retry a failed Supabase insert", async () => {
    let calls = 0;
    const repository = createSupabaseEnquiryRepository(
      {
        supabaseUrl: "https://project-ref.supabase.co",
        publishableKey: `sb_publishable_${"a".repeat(32)}`,
        enquiryGateKey: "00000000-0000-4000-8000-000000000001",
      },
      async () => {
        calls += 1;
        return new Response('{"provider":"detail"}', { status: 500 });
      },
    );

    await expect(
      repository.insert({
        reference: "00000000-0000-4000-8000-000000000102",
        enquiry,
        privacyNoticeVersion: "test-v1",
      }),
    ).resolves.toEqual({ status: "unavailable" });
    expect(calls).toBe(1);
  });
});
