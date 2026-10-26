import {
  ENQUIRY_MAX_BODY_BYTES,
  enquiryFieldErrorMessages,
  enquiryRequestSchema,
  type EnquiryCapability,
} from "@/lib/contracts/enquiry";
import { jsonResponse } from "@/lib/security";
import { readBoundedText } from "@/lib/server/enquiries/bounded-body";
import {
  resolveEnquiryConfiguration,
  type EnquiryConfiguration,
} from "@/lib/server/enquiries/config";
import {
  createCloudflareRateLimiter,
  isValidCloudflareClientIp,
  type EnquiryRateLimiter,
  type RateLimitDecision,
} from "@/lib/server/enquiries/rate-limit";
import {
  createSupabaseEnquiryRepository,
  type EnquiryRepository,
  type EnquiryRepositoryResult,
} from "@/lib/server/enquiries/repository";
import {
  enquiryErrorResponse,
  enquirySuccessResponse,
} from "@/lib/server/enquiries/responses";
import {
  createTurnstileVerifier,
  type TurnstileVerificationResult,
  type TurnstileVerifier,
} from "@/lib/server/enquiries/turnstile";

type EnquiryLogEvent = {
  readonly event:
    | "enquiry_rejected"
    | "enquiry_rate_limited"
    | "turnstile_upstream_failed"
    | "supabase_insert_failed"
    | "enquiry_recorded";
  readonly requestId: string;
  readonly status: number;
};

export type EnquiryHandlerDependencies = {
  readonly rateLimiter?: EnquiryRateLimiter;
  readonly verifier?: TurnstileVerifier;
  readonly repository?: EnquiryRepository;
  readonly createUuid?: () => string;
  readonly log?: (event: EnquiryLogEvent) => void;
};

function defaultLog(event: EnquiryLogEvent): void {
  console.info(JSON.stringify(event));
}

function isSupportedJsonContentType(value: string | null): boolean {
  if (!value) {
    return false;
  }

  const [mediaType, ...parameters] = value
    .split(";")
    .map((part) => part.trim().toLowerCase());

  if (mediaType !== "application/json") {
    return false;
  }

  return parameters.every(
    (parameter) =>
      parameter === "charset=utf-8" || parameter === 'charset="utf-8"',
  );
}

function parseContentLength(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  if (!/^\d+$/u.test(value)) {
    return Number.NaN;
  }

  return Number(value);
}

function fieldErrorsFromIssues(
  issues: readonly {
    readonly path: readonly PropertyKey[];
  }[],
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !(field in enquiryFieldErrorMessages)) {
      continue;
    }

    const message =
      enquiryFieldErrorMessages[
        field as keyof typeof enquiryFieldErrorMessages
      ];
    const messages = fieldErrors[field] ?? [];
    if (!messages.includes(message)) {
      messages.push(message);
    }
    fieldErrors[field] = messages;
  }

  return fieldErrors;
}

function unavailableResponse(requestId: string): Response {
  return enquiryErrorResponse(requestId, {
    status: 503,
    code: "FORM_SERVICE_UNAVAILABLE",
    message: "The enquiry service is not currently available.",
    retryable: true,
    headers: { "Retry-After": "300" },
  });
}

function createProductionRateLimiter(
  configuration: EnquiryConfiguration,
): EnquiryRateLimiter {
  return createCloudflareRateLimiter(
    configuration.rateLimiter,
    configuration.rateLimitKeySalt,
  );
}

async function checkRateLimit(
  limiter: EnquiryRateLimiter,
  clientIp: string,
): Promise<RateLimitDecision> {
  try {
    return await limiter.check(clientIp);
  } catch {
    return "unavailable";
  }
}

async function verifyTurnstile(
  verifier: TurnstileVerifier,
  input: {
    readonly token: string;
    readonly clientIp: string;
    readonly idempotencyKey: string;
  },
): Promise<TurnstileVerificationResult> {
  try {
    return await verifier.verify(input);
  } catch {
    return { status: "unavailable" };
  }
}

async function persistEnquiry(
  repository: EnquiryRepository,
  input: Parameters<EnquiryRepository["insert"]>[0],
): Promise<EnquiryRepositoryResult> {
  try {
    return await repository.insert(input);
  } catch {
    return { status: "unavailable" };
  }
}

export function handleEnquiryStatus(environment: unknown): Response {
  const result = resolveEnquiryConfiguration(environment);
  const capability: EnquiryCapability = result.capability;
  return jsonResponse(capability, { status: 200 });
}

export async function handleEnquirySubmission(
  request: Request,
  environment: unknown,
  dependencies: EnquiryHandlerDependencies = {},
): Promise<Response> {
  const createUuid = dependencies.createUuid ?? (() => crypto.randomUUID());
  const log = dependencies.log ?? defaultLog;
  const requestId = createUuid();

  if (request.method !== "POST") {
    return enquiryErrorResponse(requestId, {
      status: 405,
      code: "METHOD_NOT_ALLOWED",
      message: "The request method is not supported for this endpoint.",
      retryable: false,
      headers: { Allow: "POST" },
    });
  }

  if (!isSupportedJsonContentType(request.headers.get("Content-Type"))) {
    log({ event: "enquiry_rejected", requestId, status: 415 });
    return enquiryErrorResponse(requestId, {
      status: 415,
      code: "INVALID_REQUEST",
      message: "Send the enquiry as UTF-8 JSON.",
      retryable: false,
    });
  }

  const configurationResult = resolveEnquiryConfiguration(environment);
  if (!configurationResult.available) {
    log({ event: "enquiry_rejected", requestId, status: 503 });
    return unavailableResponse(requestId);
  }
  const configuration = configurationResult.configuration;

  const origin = request.headers.get("Origin");
  if (!origin || !configuration.allowedOrigins.has(origin)) {
    log({ event: "enquiry_rejected", requestId, status: 403 });
    return enquiryErrorResponse(requestId, {
      status: 403,
      code: "ORIGIN_NOT_ALLOWED",
      message: "This origin is not allowed to submit enquiries.",
      retryable: false,
    });
  }

  const clientIpHeader = request.headers.get("CF-Connecting-IP");
  if (!isValidCloudflareClientIp(clientIpHeader)) {
    log({ event: "enquiry_rejected", requestId, status: 503 });
    return unavailableResponse(requestId);
  }
  const clientIp = clientIpHeader;

  const rateLimiter =
    dependencies.rateLimiter ?? createProductionRateLimiter(configuration);
  const rateLimitDecision = await checkRateLimit(rateLimiter, clientIp);
  if (rateLimitDecision === "unavailable") {
    log({ event: "enquiry_rejected", requestId, status: 503 });
    return unavailableResponse(requestId);
  }
  if (rateLimitDecision === "limited") {
    log({ event: "enquiry_rate_limited", requestId, status: 429 });
    return enquiryErrorResponse(requestId, {
      status: 429,
      code: "RATE_LIMITED",
      message: "Too many attempts. Wait before trying again.",
      retryable: true,
      headers: { "Retry-After": "60" },
    });
  }

  const contentLength = parseContentLength(
    request.headers.get("Content-Length"),
  );
  if (
    (contentLength !== undefined && Number.isNaN(contentLength)) ||
    (contentLength !== undefined && contentLength > ENQUIRY_MAX_BODY_BYTES)
  ) {
    const status =
      contentLength !== undefined && contentLength > ENQUIRY_MAX_BODY_BYTES
        ? 413
        : 400;
    log({ event: "enquiry_rejected", requestId, status });
    return enquiryErrorResponse(requestId, {
      status,
      code: "INVALID_REQUEST",
      message:
        status === 413
          ? "The enquiry is too large."
          : "The request body could not be read.",
      retryable: false,
    });
  }

  const body = await readBoundedText(request.body, ENQUIRY_MAX_BODY_BYTES);
  if (!body.ok) {
    const status = body.reason === "too-large" ? 413 : 400;
    log({ event: "enquiry_rejected", requestId, status });
    return enquiryErrorResponse(requestId, {
      status,
      code: "INVALID_REQUEST",
      message:
        status === 413
          ? "The enquiry is too large."
          : "The request body could not be read.",
      retryable: false,
    });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body.text) as unknown;
  } catch {
    log({ event: "enquiry_rejected", requestId, status: 400 });
    return enquiryErrorResponse(requestId, {
      status: 400,
      code: "INVALID_REQUEST",
      message: "The request body is not valid JSON.",
      retryable: false,
    });
  }

  const parsed = enquiryRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromIssues(parsed.error.issues);
    log({ event: "enquiry_rejected", requestId, status: 422 });
    return enquiryErrorResponse(requestId, {
      status: 422,
      code: "VALIDATION_FAILED",
      message: "Review the highlighted fields and try again.",
      retryable: false,
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    });
  }

  if (parsed.data.website.length > 0) {
    log({ event: "enquiry_rejected", requestId, status: 400 });
    return enquiryErrorResponse(requestId, {
      status: 400,
      code: "INVALID_REQUEST",
      message: "The enquiry could not be accepted.",
      retryable: false,
    });
  }

  if (configuration.turnstile.required) {
    const token = parsed.data.turnstileToken;
    if (!token) {
      log({ event: "enquiry_rejected", requestId, status: 403 });
      return enquiryErrorResponse(requestId, {
        status: 403,
        code: "VERIFICATION_FAILED",
        message: "Complete the verification and try again.",
        retryable: false,
      });
    }

    const verifier =
      dependencies.verifier ??
      createTurnstileVerifier(
        configuration.turnstile.secretKey,
        configuration.turnstile.hostnames,
      );
    const verification = await verifyTurnstile(verifier, {
      token,
      clientIp,
      idempotencyKey: requestId,
    });

    if (verification.status === "unavailable") {
      log({ event: "turnstile_upstream_failed", requestId, status: 503 });
      return unavailableResponse(requestId);
    }
    if (verification.status === "rejected") {
      log({ event: "enquiry_rejected", requestId, status: 403 });
      return enquiryErrorResponse(requestId, {
        status: 403,
        code: "VERIFICATION_FAILED",
        message: "Verification was not accepted. Try again.",
        retryable: false,
      });
    }
  }

  const reference = createUuid();
  const repository =
    dependencies.repository ??
    createSupabaseEnquiryRepository({
      supabaseUrl: configuration.supabaseUrl,
      publishableKey: configuration.supabasePublishableKey,
      enquiryGateKey: configuration.supabaseEnquiryGateKey,
    });
  const persistence = await persistEnquiry(repository, {
    reference,
    enquiry: parsed.data,
    privacyNoticeVersion: configuration.privacyNoticeVersion,
  });

  if (persistence.status !== "persisted") {
    log({ event: "supabase_insert_failed", requestId, status: 503 });
    return unavailableResponse(requestId);
  }

  log({ event: "enquiry_recorded", requestId, status: 201 });
  return enquirySuccessResponse(reference);
}
