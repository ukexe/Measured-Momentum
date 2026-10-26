type BuildEnvironment = Readonly<Record<string, string | undefined>>;

const supportedSiteEnvironments = new Set([
  "development",
  "staging",
  "production",
]);

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function isPlaceholderHostname(hostname: string): boolean {
  return hostname === "example.invalid" || hostname.endsWith(".invalid");
}

export function validateBuildEnvironment(
  environment: BuildEnvironment = process.env,
): void {
  const siteEnvironment = environment.NEXT_PUBLIC_SITE_ENV ?? "development";

  if (!supportedSiteEnvironments.has(siteEnvironment)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_ENV must be development, staging or production.",
    );
  }

  const candidate = environment.NEXT_PUBLIC_SITE_URL;
  if (!candidate) {
    if (siteEnvironment !== "development") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required for staging and production builds.",
      );
    }

    return;
  }

  if (candidate !== candidate.trim()) {
    throw new Error("NEXT_PUBLIC_SITE_URL must not contain surrounding space.");
  }

  let siteUrl: URL;
  try {
    siteUrl = new URL(candidate);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  const localHttp =
    siteUrl.protocol === "http:" && isLocalHostname(siteUrl.hostname);
  if (siteUrl.protocol !== "https:" && !localHttp) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must use HTTPS, except for local development.",
    );
  }

  if (
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin without credentials, path, query or fragment.",
    );
  }

  if (
    siteEnvironment !== "development" &&
    (localHttp || isPlaceholderHostname(siteUrl.hostname))
  ) {
    throw new Error(
      "Staging and production builds require an approved, non-placeholder HTTPS origin.",
    );
  }
}
