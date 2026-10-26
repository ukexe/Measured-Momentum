import { describe, expect, it } from "vitest";

import { competitionListings } from "@/content/competitions";
import {
  DIRECTORY_RELATIONSHIP_CAUTION,
  GOVERNANCE_SOURCE_ACCESS_DATE,
  WDSF_DIRECTORY_STATEMENT,
  WRRC_DIRECTORY_STATEMENT,
  governanceOfficialSources,
  governancePolicyRegister,
} from "@/content/governance";
import {
  getPublishedNewsArticles,
  getNewsStructuredData,
  isNewsArticleApprovedForPublication,
  newsArticleRecords,
  newsCategories,
  type NewsArticle,
} from "@/content/news";

const draftNewsArticle = {
  slug: "verified-proposal-update",
  state: "verified-fact",
  title: "Verified proposal update",
  summary: "A test-only summary.",
  category: "proposal-update",
  standfirst: "A test-only standfirst.",
  statusLabel: "Verified",
  editorialRole: "Accountable reviewer",
  publishedOn: "2026-10-25",
  sources: [
    {
      label: "Primary record",
      checkedOn: "2026-10-25",
      ownerRole: "Accountable reviewer",
      url: "https://example.test/source",
    },
  ],
  body: [],
  whatChanged: [],
  whatDidNotChange: [],
  corrections: [],
  relatedLinks: [],
  publication: {
    state: "draft",
    reason: "Awaiting accountable approval.",
  },
} as const satisfies NewsArticle;

describe("governance public-source wording", () => {
  it("keeps the two official directory statements narrow and exact", () => {
    expect(WRRC_DIRECTORY_STATEMENT).toBe(
      "The WRRC directory lists “Acrobatic Rock'n'Roll Federation of India” as “On Hold”.",
    );
    expect(WDSF_DIRECTORY_STATEMENT).toBe(
      "WDSF separately lists Amateur DanceSport Federation of India as Full and “Recognised by NOC: No”.",
    );
    expect(DIRECTORY_RELATIONSHIP_CAUTION).toBe(
      "These records do not establish that the two listed entities are identical, that they have a relationship with each other, or that either has a relationship with this proposal.",
    );
  });

  it("retains official links and the stated access date", () => {
    expect(GOVERNANCE_SOURCE_ACCESS_DATE).toBe("25 October 2026");
    expect(governanceOfficialSources).toHaveLength(2);

    for (const source of governanceOfficialSources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.checkedOn).toBe("2026-10-25");
      expect(source.accessedOnLabel).toBe("25 October 2026");
    }
  });

  it("does not represent planned policy work as adopted", () => {
    expect(governancePolicyRegister.map(({ topic }) => topic)).toEqual(
      expect.arrayContaining([
        "Athlete welfare and safeguarding",
        "Complaints and appeals",
        "Conflicts of interest",
        "Financial accountability",
      ]),
    );

    for (const item of governancePolicyRegister) {
      expect(item.state).not.toBe("Adopted");
    }
  });
});

describe("truthful public activity collections", () => {
  it("ships with no invented competitions or news articles", () => {
    expect(competitionListings).toEqual([]);
    expect(newsArticleRecords).toEqual([]);
    expect(getPublishedNewsArticles()).toEqual([]);
  });

  it("requires explicit approval and a public slug before publication", () => {
    const approvedArticle = {
      ...draftNewsArticle,
      publication: {
        state: "approved-for-publication",
        approvedOn: "2026-10-25",
        reviewerRole: "Accountable reviewer",
      },
    } as const satisfies NewsArticle;

    expect(isNewsArticleApprovedForPublication(draftNewsArticle)).toBe(false);
    expect(isNewsArticleApprovedForPublication(approvedArticle)).toBe(true);
    expect(
      isNewsArticleApprovedForPublication({
        ...approvedArticle,
        state: "draft-for-review",
      }),
    ).toBe(false);
    expect(
      isNewsArticleApprovedForPublication({
        ...approvedArticle,
        slug: "Not a public slug",
      }),
    ).toBe(false);
  });

  it("keeps record slugs and category keys unique", () => {
    const competitionSlugs = competitionListings.map(({ slug }) => slug);
    const newsSlugs = newsArticleRecords.map(({ slug }) => slug);
    const categoryKeys = newsCategories.map(({ value }) => value);

    expect(new Set(competitionSlugs).size).toBe(competitionSlugs.length);
    expect(new Set(newsSlugs).size).toBe(newsSlugs.length);
    expect(new Set(categoryKeys).size).toBe(categoryKeys.length);
  });

  it("does not fabricate article or breadcrumb structured data", () => {
    expect(
      getNewsStructuredData("placeholder-article", "https://proposal.example"),
    ).toBeUndefined();
  });
});
