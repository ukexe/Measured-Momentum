export const FALLBACK_SITE_URL = "https://example.invalid";

function isLocalHttpUrl(url: URL): boolean {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1" ||
      url.hostname === "[::1]")
  );
}

export function normaliseSiteUrl(
  candidate = process.env.NEXT_PUBLIC_SITE_URL,
): URL {
  if (!candidate) {
    return new URL(FALLBACK_SITE_URL);
  }

  try {
    const url = new URL(candidate);
    const hasSafeProtocol = url.protocol === "https:" || isLocalHttpUrl(url);

    if (!hasSafeProtocol || url.username || url.password) {
      return new URL(FALLBACK_SITE_URL);
    }

    return new URL(url.origin);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function absoluteUrl(
  pathname: `/${string}` = "/",
  candidate?: string,
): string {
  return new URL(pathname, normaliseSiteUrl(candidate)).toString();
}

export function canonicalUrl(
  pathname: `/${string}` = "/",
  candidate?: string,
): string {
  const url = new URL(pathname, normaliseSiteUrl(candidate));

  url.hash = "";
  url.search = "";

  if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}
