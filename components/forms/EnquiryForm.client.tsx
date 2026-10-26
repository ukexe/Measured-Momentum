"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  contactPathways,
  enquiryCapabilitySchema,
  enquiryErrorResponseSchema,
  enquiryFieldErrorMessages,
  enquiryPathwayLabels,
  enquiryRequestSchema,
  enquirySuccessResponseSchema,
  joinPathways,
  type EnquiryCapability,
  type EnquiryPathway,
  type EnquirySuccessResponse,
} from "@/lib/contracts/enquiry";

import styles from "./enquiry-form.module.css";
import { TurnstileWidget } from "./TurnstileWidget.client";

type EnquiryFormProps = {
  readonly kind: "join" | "contact";
};

type FormValues = {
  readonly name: string;
  readonly email: string;
  readonly cityState: string;
  readonly pathway: "" | EnquiryPathway;
  readonly message: string;
  readonly privacyAcknowledged: boolean;
  readonly updatesConsent: boolean;
  readonly website: string;
};

type FieldErrors = Record<string, string[]>;

const initialValues: FormValues = {
  name: "",
  email: "",
  cityState: "",
  pathway: "",
  message: "",
  privacyAcknowledged: false,
  updatesConsent: false,
  website: "",
};

const unconfirmedSubmissionMessage =
  "The submission outcome could not be verified. The service may have recorded your enquiry even though this page received no confirmation. Your entries are still here; submitting again may create a duplicate.";

const fieldIds = {
  name: "enquiry-name",
  email: "enquiry-email",
  cityState: "enquiry-city-state",
  pathway: "enquiry-pathway",
  message: "enquiry-message",
  privacyAcknowledged: "enquiry-privacy",
  updatesConsent: "enquiry-updates",
  turnstileToken: "enquiry-turnstile",
} as const;

function describedBy(
  field: keyof typeof fieldIds,
  errors: FieldErrors,
  hintId?: string,
): string | undefined {
  const values = [
    hintId,
    errors[field]?.length ? `${fieldIds[field]}-error` : undefined,
  ].filter((value): value is string => Boolean(value));

  return values.length > 0 ? values.join(" ") : undefined;
}

function firstMessages(errors: FieldErrors): [string, string][] {
  return Object.entries(errors)
    .filter(([field]) => field in fieldIds)
    .map(([field, messages]) => [field, messages[0] ?? "Review this field."]);
}

function InlineError({
  field,
  errors,
}: {
  readonly field: keyof typeof fieldIds;
  readonly errors: FieldErrors;
}) {
  const messages = errors[field];
  if (!messages?.length) {
    return null;
  }

  return (
    <p className={styles.fieldError} id={`${fieldIds[field]}-error`}>
      {messages.join(" ")}
    </p>
  );
}

export function EnquiryForm({ kind }: EnquiryFormProps) {
  const [capability, setCapability] = useState<EnquiryCapability | null>(null);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<EnquirySuccessResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorFocusRequest, setErrorFocusRequest] = useState(0);

  const pendingRef = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const resetTurnstileRef = useRef<(() => void) | null>(null);

  const pathwayOptions = kind === "join" ? joinPathways : contactPathways;
  const formTitle = kind === "join" ? "Register interest" : "Send an enquiry";
  const submitLabel = kind === "join" ? "Register interest" : "Send enquiry";

  useEffect(() => {
    const abortController = new AbortController();

    void fetch("/api/enquiries/status", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Status endpoint was unavailable.");
        }

        const payload = (await response.json()) as unknown;
        const parsed = enquiryCapabilitySchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error("Status response was invalid.");
        }

        setCapability(parsed.data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCapability({
          available: false,
          reason:
            "The form status could not be confirmed, so no information can be submitted.",
        });
      });

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (errorFocusRequest > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errorFocusRequest]);

  useEffect(() => {
    if (success) {
      successRef.current?.focus();
    }
  }, [success]);

  const updateValue = useCallback(
    <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => {
        if (!current[key]) {
          return current;
        }

        const next = { ...current };
        delete next[key];
        return next;
      });
      setFormError(null);
    },
    [],
  );

  const handleTokenChange = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setFieldErrors((current) => {
        if (!current.turnstileToken) {
          return current;
        }

        const next = { ...current };
        delete next.turnstileToken;
        return next;
      });
    }
  }, []);

  const registerTurnstileReset = useCallback((reset: (() => void) | null) => {
    resetTurnstileRef.current = reset;
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pendingRef.current || !capability?.available) {
      return;
    }

    const candidate = {
      schemaVersion: 1,
      name: values.name,
      email: values.email,
      cityState: values.cityState,
      pathway: values.pathway,
      message: values.message,
      privacyAcknowledged: values.privacyAcknowledged,
      updatesConsent: values.updatesConsent,
      turnstileToken,
      website: values.website,
    };

    const parsed = enquiryRequestSchema.safeParse(candidate);
    const nextFieldErrors: FieldErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          typeof field !== "string" ||
          !(field in enquiryFieldErrorMessages)
        ) {
          continue;
        }
        const message =
          enquiryFieldErrorMessages[
            field as keyof typeof enquiryFieldErrorMessages
          ];
        nextFieldErrors[field] ??= [message];
      }
    }

    if (capability.turnstileRequired && !turnstileToken) {
      nextFieldErrors.turnstileToken = [
        "Complete the verification before submitting.",
      ];
    }

    if (!parsed.success || Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("Review the highlighted fields and try again.");
      setErrorFocusRequest((value) => value + 1);
      return;
    }

    pendingRef.current = true;
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      let payload: unknown;
      try {
        payload = (await response.json()) as unknown;
      } catch {
        payload = null;
      }

      if (response.status === 201) {
        const successResult = enquirySuccessResponseSchema.safeParse(payload);
        if (successResult.success) {
          setSuccess(successResult.data);
          return;
        }
      }

      const errorResult = enquiryErrorResponseSchema.safeParse(payload);
      if (errorResult.success) {
        setFormError(
          errorResult.data.error.code === "FORM_SERVICE_UNAVAILABLE"
            ? `${errorResult.data.error.message} ${unconfirmedSubmissionMessage}`
            : errorResult.data.error.message,
        );
        setFieldErrors(
          errorResult.data.error.fieldErrors
            ? { ...errorResult.data.error.fieldErrors }
            : {},
        );
      } else {
        setFormError(unconfirmedSubmissionMessage);
      }
      setErrorFocusRequest((value) => value + 1);
    } catch {
      setFormError(unconfirmedSubmissionMessage);
      setErrorFocusRequest((value) => value + 1);
    } finally {
      resetTurnstileRef.current?.();
      pendingRef.current = false;
      setPending(false);
    }
  }

  if (capability === null) {
    return (
      <section
        className={styles.statusPanel}
        aria-busy="true"
        aria-live="polite"
      >
        <h2>Checking form availability</h2>
        <p>No information can be submitted until the service confirms ready.</p>
      </section>
    );
  }

  if (!capability.available) {
    return (
      <section className={styles.unavailable} aria-live="polite">
        <p className={styles.kicker}>Form unavailable</p>
        <h2>{formTitle} is not open</h2>
        <p>{capability.reason}</p>
        <p>
          Nothing entered on this page is sent or stored. No public alternative
          contact channel has been verified.
        </p>
      </section>
    );
  }

  if (success) {
    return (
      <section
        className={styles.success}
        ref={successRef}
        role="status"
        tabIndex={-1}
      >
        <p className={styles.kicker}>Recorded</p>
        <h2>{success.message}</h2>
        <p>
          Reference: <strong>{success.reference}</strong>
        </p>
        <p>
          This confirms only that the expression of interest or enquiry was
          recorded. It is not membership, selection, accreditation, employment,
          appointment or a place in an activity.
        </p>
      </section>
    );
  }

  const summaryErrors = firstMessages(fieldErrors);

  return (
    <section className={styles.formSection}>
      <div className={styles.formHeading}>
        <p className={styles.kicker}>Minimal information only</p>
        <h2>{formTitle}</h2>
        <p>
          Required fields are marked “Required”. Do not send dates of birth,
          identity documents, certificates, health information, confidential
          safeguarding reports or details about a child.
        </p>
        <p>
          If you are under 18, ask a parent or guardian to complete this form
          using their own contact details.
        </p>
      </div>

      {formError ? (
        <div
          className={styles.errorSummary}
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
        >
          <h3>There is a problem</h3>
          <p>{formError}</p>
          {summaryErrors.length > 0 ? (
            <ul>
              {summaryErrors.map(([field, message]) => (
                <li key={field}>
                  <a href={`#${fieldIds[field as keyof typeof fieldIds]}`}>
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => void submit(event)}
        aria-busy={pending}
      >
        <div className={styles.field}>
          <label htmlFor={fieldIds.name}>
            Name <span>Required</span>
          </label>
          <input
            id={fieldIds.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy("name", fieldErrors)}
          />
          <InlineError field="name" errors={fieldErrors} />
        </div>

        <div className={styles.field}>
          <label htmlFor={fieldIds.email}>
            Email <span>Required</span>
          </label>
          <input
            id={fieldIds.email}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={describedBy("email", fieldErrors)}
          />
          <InlineError field="email" errors={fieldErrors} />
        </div>

        <div className={styles.field}>
          <label htmlFor={fieldIds.cityState}>
            City and state <span>Optional</span>
          </label>
          <input
            id={fieldIds.cityState}
            name="cityState"
            type="text"
            autoComplete="address-level2"
            value={values.cityState}
            onChange={(event) => updateValue("cityState", event.target.value)}
            aria-invalid={Boolean(fieldErrors.cityState)}
            aria-describedby={describedBy("cityState", fieldErrors)}
          />
          <InlineError field="cityState" errors={fieldErrors} />
        </div>

        <div className={styles.field}>
          <label htmlFor={fieldIds.pathway}>
            {kind === "join" ? "Interest pathway" : "Enquiry category"}{" "}
            <span>Required</span>
          </label>
          <select
            id={fieldIds.pathway}
            name="pathway"
            required
            value={values.pathway}
            onChange={(event) =>
              updateValue("pathway", event.target.value as "" | EnquiryPathway)
            }
            aria-invalid={Boolean(fieldErrors.pathway)}
            aria-describedby={describedBy("pathway", fieldErrors)}
          >
            <option value="">Choose one</option>
            {pathwayOptions.map((pathway) => (
              <option value={pathway} key={pathway}>
                {enquiryPathwayLabels[pathway]}
              </option>
            ))}
          </select>
          <InlineError field="pathway" errors={fieldErrors} />
        </div>

        <div className={styles.field}>
          <label htmlFor={fieldIds.message}>
            Short note <span>Optional</span>
          </label>
          <p className={styles.hint} id="enquiry-message-hint">
            If included, use 10–2,000 characters and keep it non-confidential.
          </p>
          <textarea
            id={fieldIds.message}
            name="message"
            rows={7}
            value={values.message}
            onChange={(event) => updateValue("message", event.target.value)}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={describedBy(
              "message",
              fieldErrors,
              "enquiry-message-hint",
            )}
          />
          <InlineError field="message" errors={fieldErrors} />
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="enquiry-website">Website</label>
          <input
            id="enquiry-website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={values.website}
            onChange={(event) => updateValue("website", event.target.value)}
          />
        </div>

        <fieldset className={styles.consents}>
          <legend>Privacy choices</legend>
          <label
            className={styles.checkbox}
            htmlFor={fieldIds.privacyAcknowledged}
          >
            <input
              id={fieldIds.privacyAcknowledged}
              name="privacyAcknowledged"
              type="checkbox"
              required
              checked={values.privacyAcknowledged}
              onChange={(event) =>
                updateValue("privacyAcknowledged", event.target.checked)
              }
              aria-invalid={Boolean(fieldErrors.privacyAcknowledged)}
              aria-describedby={describedBy("privacyAcknowledged", fieldErrors)}
            />
            <span>
              Required — I have read the{" "}
              <a href="/privacy/">draft privacy notice</a> and understand that
              the legal operator, lawful basis and retention period still
              require approval before this form may open.
            </span>
          </label>
          <InlineError field="privacyAcknowledged" errors={fieldErrors} />

          <label className={styles.checkbox} htmlFor={fieldIds.updatesConsent}>
            <input
              id={fieldIds.updatesConsent}
              name="updatesConsent"
              type="checkbox"
              checked={values.updatesConsent}
              onChange={(event) =>
                updateValue("updatesConsent", event.target.checked)
              }
              aria-invalid={Boolean(fieldErrors.updatesConsent)}
              aria-describedby={describedBy("updatesConsent", fieldErrors)}
            />
            <span>
              Optional — record that I would like proposal updates if a separate
              updates process is approved. This is unticked by default and is
              not required to submit.
            </span>
          </label>
          <InlineError field="updatesConsent" errors={fieldErrors} />
        </fieldset>

        {capability.turnstileRequired ? (
          <div id={fieldIds.turnstileToken}>
            <TurnstileWidget
              siteKey={capability.siteKey}
              onTokenChange={handleTokenChange}
              registerReset={registerTurnstileReset}
            />
            <InlineError field="turnstileToken" errors={fieldErrors} />
          </div>
        ) : null}

        <div className={styles.submitArea}>
          <Button type="submit" disabled={pending}>
            {pending ? "Recording…" : submitLabel}
          </Button>
          <p aria-live="polite">
            {pending
              ? "Submission in progress. Do not close this page."
              : "Success appears only after the service confirms a stored record."}
          </p>
        </div>
      </form>
    </section>
  );
}
