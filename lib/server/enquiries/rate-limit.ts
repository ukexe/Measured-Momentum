export type RateLimitDecision = "allowed" | "limited" | "unavailable";

export type EnquiryRateLimiter = {
  readonly check: (clientIp: string) => Promise<RateLimitDecision>;
};

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function deriveLimiterKey(
  clientIp: string,
  salt: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`enquiries:v1:${clientIp}`),
  );

  return bytesToHex(digest);
}

function isValidIpv4(value: string): boolean {
  const octets = value.split(".");

  return (
    octets.length === 4 &&
    octets.every(
      (octet) => /^(?:0|[1-9]\d{0,2})$/u.test(octet) && Number(octet) <= 255,
    )
  );
}

function isValidIpv6(value: string): boolean {
  if (
    value.length < 2 ||
    value.length > 45 ||
    !value.includes(":") ||
    !/^[0-9a-f:.]+$/iu.test(value)
  ) {
    return false;
  }

  if (value.includes(".")) {
    const embeddedIpv4 = value.slice(value.lastIndexOf(":") + 1);
    if (!isValidIpv4(embeddedIpv4)) {
      return false;
    }
  }

  try {
    const parsed = new URL(`http://[${value}]/`);
    return parsed.hostname.startsWith("[") && parsed.hostname.endsWith("]");
  } catch {
    return false;
  }
}

export function isValidCloudflareClientIp(
  value: string | null,
): value is string {
  return value !== null && (isValidIpv4(value) || isValidIpv6(value));
}

export function createCloudflareRateLimiter(
  binding: RateLimit,
  salt: string,
): EnquiryRateLimiter {
  return {
    async check(clientIp) {
      try {
        const key = await deriveLimiterKey(clientIp, salt);
        const outcome = await binding.limit({ key });
        return outcome.success ? "allowed" : "limited";
      } catch {
        return "unavailable";
      }
    },
  };
}
