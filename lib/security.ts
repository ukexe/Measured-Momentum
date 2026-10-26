export const STATIC_SECURITY_HEADERS = {
  "Content-Security-Policy":
    "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy":
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

const API_SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'; sandbox",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export function jsonResponse(
  payload: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(API_SECURITY_HEADERS);

  new Headers(init.headers).forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}
