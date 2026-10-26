import type { EnquiryRequest } from "@/lib/contracts/enquiry";

const SUPABASE_TIMEOUT_MS = 8_000;

export type EnquiryRepositoryResult =
  | {
      readonly status: "persisted";
    }
  | {
      readonly status: "unavailable";
    };

export type EnquiryRepository = {
  readonly insert: (input: {
    readonly reference: string;
    readonly enquiry: EnquiryRequest;
    readonly privacyNoticeVersion: string;
  }) => Promise<EnquiryRepositoryResult>;
};

type SupabaseRepositoryConfiguration = {
  readonly supabaseUrl: string;
  readonly publishableKey: string;
  readonly enquiryGateKey: string;
};

export function createSupabaseEnquiryRepository(
  configuration: SupabaseRepositoryConfiguration,
  fetcher: typeof fetch = fetch,
): EnquiryRepository {
  const endpoint = new URL("/rest/v1/enquiries", configuration.supabaseUrl);

  return {
    async insert({ reference, enquiry, privacyNoticeVersion }) {
      const payload = {
        id: reference,
        schema_version: enquiry.schemaVersion,
        name: enquiry.name,
        email: enquiry.email,
        city_state: enquiry.cityState ?? null,
        pathway: enquiry.pathway,
        message: enquiry.message ?? null,
        privacy_acknowledged: enquiry.privacyAcknowledged,
        privacy_notice_version: privacyNoticeVersion,
        updates_consent: enquiry.updatesConsent,
      };

      let response: Response;
      try {
        response = await fetcher(endpoint, {
          method: "POST",
          headers: {
            apikey: configuration.publishableKey,
            "Content-Profile": "api",
            "Content-Type": "application/json",
            Prefer: "return=minimal",
            "x-enquiry-key": configuration.enquiryGateKey,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
        });
      } catch {
        return { status: "unavailable" };
      }

      return response.status === 201
        ? { status: "persisted" }
        : { status: "unavailable" };
    },
  };
}
