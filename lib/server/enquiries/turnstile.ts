import { z } from "zod";

import { TURNSTILE_MAX_TOKEN_LENGTH } from "@/lib/contracts/enquiry";
import { readBoundedText } from "@/lib/server/enquiries/bounded-body";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 8_000;
const SITEVERIFY_MAX_RESPONSE_BYTES = 16 * 1024;

const siteverifyResponseSchema = z
  .object({
    success: z.boolean(),
    action: z.string().optional(),
    hostname: z.string().optional(),
    "error-codes": z.array(z.string()).optional(),
  })
  .passthrough();

export type TurnstileVerificationResult =
  | {
      readonly status: "verified";
    }
  | {
      readonly status: "rejected";
    }
  | {
      readonly status: "unavailable";
    };

export type TurnstileVerifier = {
  readonly verify: (input: {
    readonly token: string;
    readonly clientIp: string;
    readonly idempotencyKey: string;
  }) => Promise<TurnstileVerificationResult>;
};

export function createTurnstileVerifier(
  secretKey: string,
  allowedHostnames: ReadonlySet<string>,
  fetcher: typeof fetch = fetch,
): TurnstileVerifier {
  return {
    async verify({ token, clientIp, idempotencyKey }) {
      if (token.length === 0 || token.length > TURNSTILE_MAX_TOKEN_LENGTH) {
        return { status: "rejected" };
      }

      const body = new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: clientIp,
        idempotency_key: idempotencyKey,
      });

      let response: Response;
      try {
        response = await fetcher(SITEVERIFY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
          signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
        });
      } catch {
        return { status: "unavailable" };
      }

      if (!response.ok) {
        return { status: "unavailable" };
      }

      const boundedBody = await readBoundedText(
        response.body,
        SITEVERIFY_MAX_RESPONSE_BYTES,
      );
      if (!boundedBody.ok) {
        return { status: "unavailable" };
      }

      let payload: unknown;
      try {
        payload = JSON.parse(boundedBody.text) as unknown;
      } catch {
        return { status: "unavailable" };
      }

      const parsed = siteverifyResponseSchema.safeParse(payload);
      if (!parsed.success) {
        return { status: "unavailable" };
      }

      if (!parsed.data.success) {
        const providerFailure = parsed.data["error-codes"]?.some((code) =>
          [
            "internal-error",
            "missing-input-secret",
            "invalid-input-secret",
            "bad-request",
          ].includes(code),
        );
        if (providerFailure) {
          return { status: "unavailable" };
        }

        return { status: "rejected" };
      }

      const hostname = parsed.data.hostname?.toLowerCase();
      if (
        parsed.data.action !== "enquiry" ||
        !hostname ||
        !allowedHostnames.has(hostname)
      ) {
        return { status: "rejected" };
      }

      return { status: "verified" };
    },
  };
}
