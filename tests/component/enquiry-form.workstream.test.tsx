import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EnquiryForm } from "@/components/forms/EnquiryForm.client";

const REQUEST_ID = "00000000-0000-4000-8000-000000000101";
const REFERENCE_ID = "00000000-0000-4000-8000-000000000102";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function availableStatus(): Response {
  return jsonResponse({
    available: true,
    turnstileRequired: false,
  });
}

function fillValidContactForm(): void {
  fireEvent.change(screen.getByLabelText(/Name Required/u), {
    target: { value: "Test Person" },
  });
  fireEvent.change(screen.getByLabelText(/Email Required/u), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Enquiry category Required/u), {
    target: { value: "general-question" },
  });
  fireEvent.click(
    screen.getByLabelText(/Required — I have read the draft privacy notice/u),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("enquiry form workstream", () => {
  it("shows an explicit unavailable state and no fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          available: false,
          reason: "Responsible handling is not configured.",
        }),
      ),
    );

    render(<EnquiryForm kind="join" />);

    expect(
      await screen.findByRole("heading", {
        name: "Register interest is not open",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Responsible handling is not configured."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /Name/u })).toBeNull();
  });

  it("focuses an accessible error summary linked to invalid fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => availableStatus()),
    );
    const user = userEvent.setup();

    render(<EnquiryForm kind="contact" />);

    await user.click(
      await screen.findByRole("button", { name: "Send enquiry" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveFocus();
    expect(alert).toHaveTextContent("There is a problem");
    expect(alert.querySelector('a[href="#enquiry-name"]')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name Required/u)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("preserves values and never shows success after a failed insert", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        if (call === 1) {
          return availableStatus();
        }

        return jsonResponse(
          {
            ok: false,
            error: {
              code: "FORM_SERVICE_UNAVAILABLE",
              message: "The enquiry service is not currently available.",
              retryable: true,
            },
            requestId: REQUEST_ID,
          },
          503,
        );
      }),
    );

    render(<EnquiryForm kind="contact" />);
    await screen.findByRole("button", { name: "Send enquiry" });
    fillValidContactForm();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The enquiry service is not currently available.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The service may have recorded your enquiry",
    );
    expect(screen.getByLabelText(/Name Required/u)).toHaveValue("Test Person");
    expect(screen.getByLabelText(/Email Required/u)).toHaveValue(
      "person@example.com",
    );
    expect(screen.queryByText("Your enquiry has been recorded.")).toBeNull();
  });

  it("locks duplicate submits and announces success only after HTTP 201", async () => {
    let resolveSubmission: ((response: Response) => void) | undefined;
    const pendingSubmission = new Promise<Response>((resolve) => {
      resolveSubmission = resolve;
    });
    let submitCalls = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/api/enquiries/status")) {
          return availableStatus();
        }

        submitCalls += 1;
        return pendingSubmission;
      }),
    );

    render(<EnquiryForm kind="contact" />);
    await screen.findByRole("button", { name: "Send enquiry" });
    fillValidContactForm();

    const button = screen.getByRole("button", { name: "Send enquiry" });
    const form = button.closest("form");
    expect(form).not.toBeNull();
    if (!form) {
      return;
    }

    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(submitCalls).toBe(1);

    resolveSubmission?.(
      jsonResponse(
        {
          ok: true,
          reference: REFERENCE_ID,
          message: "Your enquiry has been recorded.",
        },
        201,
      ),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Your enquiry has been recorded.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(
      screen.getByText(/It is not membership, selection/u),
    ).toBeInTheDocument();
  });

  it("treats a success-shaped body with a non-201 status as unconfirmed", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        return call === 1
          ? availableStatus()
          : jsonResponse({
              ok: true,
              reference: REFERENCE_ID,
              message: "Your enquiry has been recorded.",
            });
      }),
    );

    render(<EnquiryForm kind="contact" />);
    await screen.findByRole("button", { name: "Send enquiry" });
    fillValidContactForm();
    fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The submission outcome could not be verified.",
      );
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "submitting again may create a duplicate",
    );
    expect(screen.queryByText("Your enquiry has been recorded.")).toBeNull();
  });

  it("does not claim non-recording after a transport failure", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        if (call === 1) {
          return availableStatus();
        }

        throw new TypeError("Synthetic connection loss");
      }),
    );

    render(<EnquiryForm kind="contact" />);
    await screen.findByRole("button", { name: "Send enquiry" });
    fillValidContactForm();
    fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The service may have recorded your enquiry",
    );
    expect(screen.getByLabelText(/Name Required/u)).toHaveValue("Test Person");
    expect(screen.queryByText("Your enquiry has been recorded.")).toBeNull();
  });
});
