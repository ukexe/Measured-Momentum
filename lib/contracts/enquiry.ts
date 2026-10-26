import { z } from "zod";

export const ENQUIRY_SCHEMA_VERSION = 1 as const;
export const ENQUIRY_MAX_BODY_BYTES = 16 * 1024;
export const ENQUIRY_MAX_MESSAGE_LENGTH = 2_000;
export const TURNSTILE_MAX_TOKEN_LENGTH = 2_048;

export const enquiryPathways = [
  "athlete-participant",
  "parent-guardian",
  "coach",
  "judge-technical-official",
  "club-studio",
  "event-organiser",
  "governance-safeguarding",
  "volunteer-contributor",
  "research-media-education",
  "institutional-support",
  "general-updates",
  "general-question",
  "participation-question",
  "governance-documents",
  "media-research",
  "factual-correction",
  "privacy-request",
] as const;

export const enquiryPathwaySchema = z.enum(enquiryPathways);

export type EnquiryPathway = z.infer<typeof enquiryPathwaySchema>;

export const enquiryPathwayLabels = {
  "athlete-participant": "Athlete or participant",
  "parent-guardian": "Parent or guardian",
  coach: "Coach",
  "judge-technical-official": "Judge or technical official",
  "club-studio": "Club, studio or training provider",
  "event-organiser": "Event organiser",
  "governance-safeguarding": "Governance or safeguarding contributor",
  "volunteer-contributor": "Volunteer, creative or technical contributor",
  "research-media-education": "Research, media or education",
  "institutional-support": "Prospective institutional support",
  "general-updates": "General updates interest",
  "general-question": "General question",
  "participation-question": "Participation question",
  "governance-documents": "Governance documents",
  "media-research": "Media or research enquiry",
  "factual-correction": "Factual correction",
  "privacy-request": "Privacy request",
} as const satisfies Record<EnquiryPathway, string>;

export const joinPathways = enquiryPathways.slice(0, 11);
export const contactPathways = enquiryPathways.slice(11);

export const enquiryFieldErrorMessages = {
  schemaVersion: "The form version is not supported. Reload the page.",
  name: "Enter a name between 2 and 100 characters.",
  email: "Enter a valid email address.",
  cityState: "Use no more than 120 characters for city and state.",
  pathway: "Choose an available pathway or enquiry category.",
  message: `Use between 10 and ${ENQUIRY_MAX_MESSAGE_LENGTH} characters, or leave the note empty.`,
  privacyAcknowledged: "Acknowledge the privacy notice to continue.",
  updatesConsent: "Choose a valid updates preference.",
  turnstileToken: "Complete the verification and try again.",
  website: "The enquiry could not be accepted.",
} as const;

function normaliseSingleLine(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

function normaliseMessage(value: string): string {
  return value.normalize("NFKC").replace(/\r\n?/gu, "\n").trim();
}

function hasCodePointLength(
  value: string,
  minimum: number,
  maximum: number,
): boolean {
  const length = Array.from(value).length;
  return length >= minimum && length <= maximum;
}

function hasSingleLineControlCharacter(value: string): boolean {
  return /[\u0000-\u001f\u007f]/u.test(value);
}

const singleLineSchema = z
  .string()
  .refine((value) => !hasSingleLineControlCharacter(value), {
    error: "Control characters are not allowed.",
  })
  .transform(normaliseSingleLine);

const optionalSingleLineSchema = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      if (hasSingleLineControlCharacter(value)) {
        return value;
      }

      const normalised = normaliseSingleLine(value);
      return normalised.length === 0 ? undefined : normalised;
    },
    singleLineSchema
      .refine((value) => hasCodePointLength(value, 1, maximum), {
        error: `Use no more than ${maximum} characters.`,
      })
      .optional(),
  );

const optionalMessageSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalised = normaliseMessage(value);
    return normalised.length === 0 ? undefined : normalised;
  },
  z
    .string()
    .refine(
      (value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
      {
        error: "Control characters are not allowed.",
      },
    )
    .refine(
      (value) => hasCodePointLength(value, 10, ENQUIRY_MAX_MESSAGE_LENGTH),
      {
        error: `Use between 10 and ${ENQUIRY_MAX_MESSAGE_LENGTH} characters.`,
      },
    )
    .optional(),
);

const optionalTurnstileTokenSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.length === 0 ? undefined : value,
  z
    .string()
    .min(1)
    .max(TURNSTILE_MAX_TOKEN_LENGTH)
    .refine((value) => !/\s/u.test(value), {
      error: "The verification token is invalid.",
    })
    .optional(),
);

export const enquiryRequestSchema = z
  .object({
    schemaVersion: z.literal(ENQUIRY_SCHEMA_VERSION),
    name: singleLineSchema.refine(
      (value) => hasCodePointLength(value, 2, 100),
      {
        error: "Use between 2 and 100 characters.",
      },
    ),
    email: singleLineSchema
      .transform((value) => value.toLowerCase())
      .pipe(z.email({ error: "Enter a valid email address." }).max(254)),
    cityState: optionalSingleLineSchema(120),
    pathway: enquiryPathwaySchema,
    message: optionalMessageSchema,
    privacyAcknowledged: z.literal(true, {
      error: "Acknowledge the privacy notice to continue.",
    }),
    updatesConsent: z.boolean().optional().default(false),
    turnstileToken: optionalTurnstileTokenSchema,
    website: z.string().max(200).optional().default(""),
  })
  .strict();

export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;
export type EnquiryRequestInput = z.input<typeof enquiryRequestSchema>;

const unavailableCapabilitySchema = z
  .object({
    available: z.literal(false),
    reason: z.string().min(1).max(240),
  })
  .strict();

const availableWithoutTurnstileSchema = z
  .object({
    available: z.literal(true),
    turnstileRequired: z.literal(false),
  })
  .strict();

const availableWithTurnstileSchema = z
  .object({
    available: z.literal(true),
    turnstileRequired: z.literal(true),
    siteKey: z.string().min(1).max(256),
  })
  .strict();

export const enquiryCapabilitySchema = z.union([
  unavailableCapabilitySchema,
  availableWithoutTurnstileSchema,
  availableWithTurnstileSchema,
]);

export type EnquiryCapability = z.infer<typeof enquiryCapabilitySchema>;

export const enquirySuccessResponseSchema = z
  .object({
    ok: z.literal(true),
    reference: z.uuid(),
    message: z.literal("Your enquiry has been recorded."),
  })
  .strict();

export type EnquirySuccessResponse = z.infer<
  typeof enquirySuccessResponseSchema
>;

export const enquiryErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "VALIDATION_FAILED",
  "ORIGIN_NOT_ALLOWED",
  "VERIFICATION_FAILED",
  "RATE_LIMITED",
  "FORM_SERVICE_UNAVAILABLE",
  "METHOD_NOT_ALLOWED",
  "NOT_FOUND",
]);

export type EnquiryErrorCode = z.infer<typeof enquiryErrorCodeSchema>;

export const enquiryErrorResponseSchema = z
  .object({
    ok: z.literal(false),
    error: z
      .object({
        code: enquiryErrorCodeSchema,
        message: z.string().min(1).max(300),
        retryable: z.boolean(),
        fieldErrors: z
          .record(z.string(), z.array(z.string().min(1)).min(1))
          .optional(),
      })
      .strict(),
    requestId: z.uuid(),
  })
  .strict();

export type EnquiryErrorResponse = z.infer<typeof enquiryErrorResponseSchema>;
