import type {
  EnquiryErrorCode,
  EnquiryErrorResponse,
  EnquirySuccessResponse,
} from "@/lib/contracts/enquiry";
import { jsonResponse } from "@/lib/security";

type EnquiryErrorOptions = {
  readonly status: number;
  readonly code: EnquiryErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly fieldErrors?: Record<string, string[]>;
  readonly headers?: HeadersInit;
};

export function enquiryErrorResponse(
  requestId: string,
  options: EnquiryErrorOptions,
): Response {
  const payload = {
    ok: false,
    error: {
      code: options.code,
      message: options.message,
      retryable: options.retryable,
      ...(options.fieldErrors ? { fieldErrors: options.fieldErrors } : {}),
    },
    requestId,
  } satisfies EnquiryErrorResponse;

  return jsonResponse(payload, {
    status: options.status,
    ...(options.headers ? { headers: options.headers } : {}),
  });
}

export function enquirySuccessResponse(reference: string): Response {
  const payload = {
    ok: true,
    reference,
    message: "Your enquiry has been recorded.",
  } satisfies EnquirySuccessResponse;

  return jsonResponse(payload, { status: 201 });
}
