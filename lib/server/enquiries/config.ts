import { z } from "zod";

import type { EnquiryCapability } from "@/lib/contracts/enquiry";

const UNAVAILABLE_CAPABILITY = {
  available: false,
  reason:
    "The enquiry service is not open because its responsible handling configuration is incomplete.",
} as const satisfies EnquiryCapability;

const rawEnvironmentSchema = z
  .object({
    SITE_ENV: z.unknown().optional(),
    PUBLIC_SITE_URL: z.unknown().optional(),
    FORM_ALLOWED_ORIGINS: z.unknown().optional(),
    PRIVACY_NOTICE_VERSION: z.unknown().optional(),
    SUPABASE_URL: z.unknown().optional(),
    SUPABASE_PUBLISHABLE_KEY: z.unknown().optional(),
    SUPABASE_ENQUIRY_GATE_KEY: z.unknown().optional(),
    RATE_LIMIT_KEY_SALT: z.unknown().optional(),
    TURNSTILE_SITE_KEY: z.unknown().optional(),
    TURNSTILE_SECRET_KEY: z.unknown().optional(),
    TURNSTILE_HOSTNAMES: z.unknown().optional(),
    ENQUIRY_RATE_LIMITER: z.unknown().optional(),
  })
  .passthrough();

const environmentNameSchema = z.enum(["development", "staging", "production"]);

const boundedTokenSchema = z
  .string()
  .min(20)
  .max(2_048)
  .refine((value) => value === value.trim() && !/\s/u.test(value));

const rateLimitSaltSchema = z
  .string()
  .min(32)
  .max(512)
  .refine((value) => value === value.trim() && !/\s/u.test(value));

const baseEnvironmentSchema = z.object({
  SITE_ENV: environmentNameSchema,
  PUBLIC_SITE_URL: z.string().min(1).max(500),
  FORM_ALLOWED_ORIGINS: z.string().min(1).max(2_000),
  PRIVACY_NOTICE_VERSION: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/u),
  SUPABASE_URL: z.string().min(1).max(500),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(20)
    .max(1_024)
    .startsWith("sb_publishable_")
    .refine((value) => value === value.trim() && !/\s/u.test(value)),
  SUPABASE_ENQUIRY_GATE_KEY: z.uuid(),
  RATE_LIMIT_KEY_SALT: rateLimitSaltSchema,
  ENQUIRY_RATE_LIMITER: z.custom<RateLimit>(isRateLimiter),
});

const turnstileEnvironmentSchema = z.object({
  TURNSTILE_SITE_KEY: boundedTokenSchema.max(256),
  TURNSTILE_SECRET_KEY: boundedTokenSchema,
  TURNSTILE_HOSTNAMES: z.string().min(1).max(2_000),
});

export type TurnstileConfiguration =
  | {
      readonly required: false;
    }
  | {
      readonly required: true;
      readonly siteKey: string;
      readonly secretKey: string;
      readonly hostnames: ReadonlySet<string>;
    };

export type EnquiryConfiguration = {
  readonly environment: z.infer<typeof environmentNameSchema>;
  readonly publicSiteOrigin: string;
  readonly allowedOrigins: ReadonlySet<string>;
  readonly privacyNoticeVersion: string;
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly supabaseEnquiryGateKey: string;
  readonly rateLimitKeySalt: string;
  readonly rateLimiter: RateLimit;
  readonly turnstile: TurnstileConfiguration;
};

export type EnquiryConfigurationResult =
  | {
      readonly available: false;
      readonly capability: EnquiryCapability;
    }
  | {
      readonly available: true;
      readonly capability: EnquiryCapability;
      readonly configuration: EnquiryConfiguration;
    };

function isRateLimiter(value: unknown): value is RateLimit {
  return (
    typeof value === "object" &&
    value !== null &&
    "limit" in value &&
    typeof value.limit === "function"
  );
}

function optionalNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value;
}

function parseOrigin(value: string): string | undefined {
  if (value.includes("*")) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const isLocalhost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1";
    const validProtocol =
      url.protocol === "https:" || (url.protocol === "http:" && isLocalhost);

    if (
      !validProtocol ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
}

function parseSupabaseOrigin(value: string): string | undefined {
  const origin = parseOrigin(value);
  if (!origin) {
    return undefined;
  }

  const url = new URL(origin);
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/u.test(url.hostname)
  ) {
    return undefined;
  }

  return origin;
}

function parseOrigins(value: string): ReadonlySet<string> | undefined {
  const candidates = value.split(",").map((candidate) => candidate.trim());
  if (candidates.length === 0 || candidates.length > 10) {
    return undefined;
  }

  const origins = new Set<string>();
  for (const candidate of candidates) {
    const origin = parseOrigin(candidate);
    if (!origin) {
      return undefined;
    }
    origins.add(origin);
  }

  return origins;
}

function parseHostnames(value: string): ReadonlySet<string> | undefined {
  const candidates = value
    .split(",")
    .map((candidate) => candidate.trim().toLowerCase());

  if (candidates.length === 0 || candidates.length > 10) {
    return undefined;
  }

  for (const candidate of candidates) {
    try {
      const parsed = new URL(`https://${candidate}`);
      if (
        candidate.length === 0 ||
        parsed.hostname !== candidate ||
        parsed.port ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
      ) {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  return new Set(candidates);
}

function unavailable(): EnquiryConfigurationResult {
  return {
    available: false,
    capability: UNAVAILABLE_CAPABILITY,
  };
}

export function resolveEnquiryConfiguration(
  environment: unknown,
): EnquiryConfigurationResult {
  const rawResult = rawEnvironmentSchema.safeParse(environment);
  if (!rawResult.success) {
    return unavailable();
  }

  const raw = rawResult.data;
  const baseResult = baseEnvironmentSchema.safeParse(raw);
  if (!baseResult.success) {
    return unavailable();
  }

  const allowedOrigins = parseOrigins(baseResult.data.FORM_ALLOWED_ORIGINS);
  const publicSiteOrigin = parseOrigin(baseResult.data.PUBLIC_SITE_URL);
  const supabaseUrl = parseSupabaseOrigin(baseResult.data.SUPABASE_URL);

  if (
    !allowedOrigins ||
    !publicSiteOrigin ||
    !supabaseUrl ||
    !allowedOrigins.has(publicSiteOrigin)
  ) {
    return unavailable();
  }

  if (
    baseResult.data.SITE_ENV === "production" &&
    (!publicSiteOrigin.startsWith("https://") ||
      Array.from(allowedOrigins).some(
        (origin) => !origin.startsWith("https://"),
      ))
  ) {
    return unavailable();
  }

  const turnstileValues = [
    optionalNonEmptyString(raw.TURNSTILE_SITE_KEY),
    optionalNonEmptyString(raw.TURNSTILE_SECRET_KEY),
    optionalNonEmptyString(raw.TURNSTILE_HOSTNAMES),
  ] as const;
  const turnstileValueCount = turnstileValues.filter(
    (value) => value !== undefined,
  ).length;

  let turnstile: TurnstileConfiguration;
  let capability: EnquiryCapability;

  if (turnstileValueCount === 0) {
    turnstile = { required: false };
    capability = {
      available: true,
      turnstileRequired: false,
    };
  } else {
    if (turnstileValueCount !== turnstileValues.length) {
      return unavailable();
    }

    const turnstileResult = turnstileEnvironmentSchema.safeParse(raw);
    if (!turnstileResult.success) {
      return unavailable();
    }

    const hostnames = parseHostnames(turnstileResult.data.TURNSTILE_HOSTNAMES);
    if (!hostnames) {
      return unavailable();
    }

    const publicHostname = new URL(publicSiteOrigin).hostname.toLowerCase();
    const productionHasLocalHostname =
      baseResult.data.SITE_ENV === "production" &&
      Array.from(hostnames).some(
        (hostname) =>
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "::1",
      );
    if (!hostnames.has(publicHostname) || productionHasLocalHostname) {
      return unavailable();
    }

    turnstile = {
      required: true,
      siteKey: turnstileResult.data.TURNSTILE_SITE_KEY,
      secretKey: turnstileResult.data.TURNSTILE_SECRET_KEY,
      hostnames,
    };
    capability = {
      available: true,
      turnstileRequired: true,
      siteKey: turnstileResult.data.TURNSTILE_SITE_KEY,
    };
  }

  return {
    available: true,
    capability,
    configuration: {
      environment: baseResult.data.SITE_ENV,
      publicSiteOrigin,
      allowedOrigins,
      privacyNoticeVersion: baseResult.data.PRIVACY_NOTICE_VERSION,
      supabaseUrl,
      supabasePublishableKey: baseResult.data.SUPABASE_PUBLISHABLE_KEY,
      supabaseEnquiryGateKey: baseResult.data.SUPABASE_ENQUIRY_GATE_KEY,
      rateLimitKeySalt: baseResult.data.RATE_LIMIT_KEY_SALT,
      rateLimiter: baseResult.data.ENQUIRY_RATE_LIMITER,
      turnstile,
    },
  };
}
