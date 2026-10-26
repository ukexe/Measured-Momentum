import {
  handleEnquiryStatus,
  handleEnquirySubmission,
} from "../lib/server/enquiries/handler";
import { enquiryErrorResponse } from "../lib/server/enquiries/responses";

function methodNotAllowed(allowed: readonly string[]): Response {
  return enquiryErrorResponse(crypto.randomUUID(), {
    status: 405,
    code: "METHOD_NOT_ALLOWED",
    message: "The request method is not supported for this endpoint.",
    retryable: false,
    headers: { Allow: allowed.join(", ") },
  });
}

export async function handleWorkerRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/enquiries/status") {
    return request.method === "GET"
      ? handleEnquiryStatus(env)
      : methodNotAllowed(["GET"]);
  }

  if (pathname === "/api/enquiries") {
    return request.method === "POST"
      ? handleEnquirySubmission(request, env)
      : methodNotAllowed(["POST"]);
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return enquiryErrorResponse(crypto.randomUUID(), {
      status: 404,
      code: "NOT_FOUND",
      message: "The API endpoint does not exist.",
      retryable: false,
    });
  }

  return env.ASSETS.fetch(request);
}

export default {
  fetch(request, env) {
    return handleWorkerRequest(request, env);
  },
} satisfies ExportedHandler<Env>;
