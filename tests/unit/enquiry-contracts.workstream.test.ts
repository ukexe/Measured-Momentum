import { describe, expect, it } from "vitest";

import {
  enquiryCapabilitySchema,
  enquiryRequestSchema,
  enquirySuccessResponseSchema,
} from "@/lib/contracts/enquiry";

describe("enquiry contracts workstream", () => {
  it("normalises the minimal versioned request and defaults updates consent", () => {
    const result = enquiryRequestSchema.safeParse({
      schemaVersion: 1,
      name: "  Test   Person  ",
      email: "  PERSON@Example.COM ",
      cityState: "  Pune,   Maharashtra ",
      pathway: "athlete-participant",
      message: "  A short,\r\nnon-confidential note.  ",
      privacyAcknowledged: true,
      website: "",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      schemaVersion: 1,
      name: "Test Person",
      email: "person@example.com",
      cityState: "Pune, Maharashtra",
      pathway: "athlete-participant",
      message: "A short,\nnon-confidential note.",
      privacyAcknowledged: true,
      updatesConsent: false,
      website: "",
    });
  });

  it("rejects unknown or deliberately excluded personal-data fields", () => {
    const result = enquiryRequestSchema.safeParse({
      schemaVersion: 1,
      name: "Test Person",
      email: "person@example.com",
      pathway: "general-question",
      privacyAcknowledged: true,
      dateOfBirth: "2010-01-01",
      healthInformation: "not accepted",
      childName: "not accepted",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unrecognized_keys" }),
      ]),
    );
  });

  it("enforces optional message and Unicode-aware name bounds", () => {
    expect(
      enquiryRequestSchema.safeParse({
        schemaVersion: 1,
        name: "A",
        email: "person@example.com",
        pathway: "general-question",
        message: "short",
        privacyAcknowledged: true,
      }).success,
    ).toBe(false);

    expect(
      enquiryRequestSchema.safeParse({
        schemaVersion: 1,
        name: "Test\nPerson",
        email: "person@example.com",
        pathway: "general-question",
        privacyAcknowledged: true,
      }).success,
    ).toBe(false);

    expect(
      enquiryRequestSchema.safeParse({
        schemaVersion: 1,
        name: "李雷",
        email: "person@example.com",
        pathway: "general-question",
        message: "",
        privacyAcknowledged: true,
      }).success,
    ).toBe(true);
  });

  it("keeps public capability and success responses strict", () => {
    expect(
      enquiryCapabilitySchema.safeParse({
        available: true,
        turnstileRequired: true,
        siteKey: "public-site-key",
        secretKey: "must-not-be-public",
      }).success,
    ).toBe(false);

    expect(
      enquirySuccessResponseSchema.safeParse({
        ok: true,
        reference: "00000000-0000-4000-8000-000000000010",
        message: "Your enquiry has been recorded.",
      }).success,
    ).toBe(true);
  });
});
