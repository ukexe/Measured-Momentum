# Enquiry form integration notes

`EnquiryForm.client.tsx` asks `/api/enquiries/status` before rendering any
fields. It does not use a build-time or browser-controlled switch to enable the
form. A submission is successful only when the API returns `201` with the
strict success contract.

The Turnstile script is loaded only when the status response says that the
complete Turnstile tuple is configured. The widget uses explicit rendering
with action `enquiry` and is reset after each network submission attempt.

If the site's Content Security Policy is tightened to add `default-src`,
`script-src`, `frame-src`, or `connect-src`, the release owner must add only the
current Cloudflare Turnstile origins documented at
<https://developers.cloudflare.com/turnstile/reference/content-security-policy/>
and test the exact deployed policy. Do not add broad wildcards or weaken
`frame-ancestors`. The checked-in baseline CSP currently has no `default-src`
fallback, so the deferred widget is not enabled by a source allowlist change
in this workstream.

No live provider credential is required by component or boundary tests.
