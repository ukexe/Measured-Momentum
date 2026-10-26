import { absoluteUrl } from "@/lib/site-url";
import type { PublishableRecord, SourceRecord } from "@/types/content";

export const newsCategories = [
  {
    value: "proposal-update",
    label: "Proposal updates",
    description: "Dated changes to the scope or development of the proposal.",
  },
  {
    value: "explainer",
    label: "Explainers",
    description: "Source-led context about the disciplines or proposal.",
  },
  {
    value: "consultation",
    label: "Consultations",
    description: "A genuine opportunity to review or respond to defined work.",
  },
  {
    value: "notice",
    label: "Notices",
    description:
      "Time-bound operational information, published only when real.",
  },
  {
    value: "correction",
    label: "Corrections",
    description: "Material corrections with a dated account of what changed.",
  },
] as const;

export type NewsCategory = (typeof newsCategories)[number]["value"];

export type NewsArticleSection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
};

export type NewsCorrection = {
  readonly correctedOn: string;
  readonly description: string;
};

export type NewsRelatedLink = {
  readonly href: `/${string}`;
  readonly label: string;
};

export type NewsPublicationReview =
  | {
      readonly state: "draft" | "withheld";
      readonly reason: string;
    }
  | {
      readonly state: "approved-for-publication";
      readonly approvedOn: string;
      readonly reviewerRole: string;
    };

export type NewsArticle = PublishableRecord & {
  readonly category: NewsCategory;
  readonly standfirst: string;
  readonly statusLabel: string;
  readonly editorialRole: string;
  readonly publishedOn: string;
  readonly sources: readonly [SourceRecord, ...SourceRecord[]];
  readonly body: readonly NewsArticleSection[];
  readonly whatChanged: readonly string[];
  readonly whatDidNotChange: readonly string[];
  readonly corrections: readonly NewsCorrection[];
  readonly relatedLinks: readonly NewsRelatedLink[];
  readonly publication: NewsPublicationReview;
};

export type PublishedNewsArticle = NewsArticle & {
  readonly publication: Extract<
    NewsPublicationReview,
    { readonly state: "approved-for-publication" }
  >;
};

/**
 * Draft editorial records may be prepared here. Public surfaces must consume
 * the gated accessors below; a date or populated body is not publication
 * approval.
 */
export const newsArticleRecords: readonly NewsArticle[] = [];

const publicSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isNewsArticleApprovedForPublication(
  article: NewsArticle,
): article is PublishedNewsArticle {
  return (
    article.publication.state === "approved-for-publication" &&
    article.state !== "draft-for-review" &&
    publicSlugPattern.test(article.slug)
  );
}

export function getPublishedNewsArticles(): readonly PublishedNewsArticle[] {
  return newsArticleRecords.filter(isNewsArticleApprovedForPublication);
}

export function getPublishedNewsArticle(
  slug: string,
): PublishedNewsArticle | undefined {
  return getPublishedNewsArticles().find((article) => article.slug === slug);
}

export function getNewsCategoryLabel(category: NewsCategory): string {
  return (
    newsCategories.find((candidate) => candidate.value === category)?.label ??
    category
  );
}

export function filterNewsArticles(
  category: NewsCategory | "all",
): readonly PublishedNewsArticle[] {
  const publishedArticles = getPublishedNewsArticles();

  if (category === "all") {
    return publishedArticles;
  }

  return publishedArticles.filter((article) => article.category === category);
}

type ArticleStructuredData = {
  readonly "@context": "https://schema.org";
  readonly "@type": "Article";
  readonly headline: string;
  readonly description: string;
  readonly datePublished: string;
  readonly dateModified?: string;
  readonly articleSection: string;
  readonly mainEntityOfPage: string;
};

type BreadcrumbStructuredData = {
  readonly "@context": "https://schema.org";
  readonly "@type": "BreadcrumbList";
  readonly itemListElement: readonly {
    readonly "@type": "ListItem";
    readonly position: number;
    readonly name: string;
    readonly item: string;
  }[];
};

export type NewsStructuredData = readonly [
  ArticleStructuredData,
  BreadcrumbStructuredData,
];

export function getNewsStructuredData(
  slug: string,
  siteUrl?: string,
): NewsStructuredData | undefined {
  const article = getPublishedNewsArticle(slug);

  if (!article) {
    return undefined;
  }

  const articleUrl = absoluteUrl(`/news/${article.slug}/`, siteUrl);
  const articleData: ArticleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.standfirst,
    datePublished: article.publishedOn,
    ...(article.updatedOn ? { dateModified: article.updatedOn } : {}),
    articleSection: getNewsCategoryLabel(article.category),
    mainEntityOfPage: articleUrl,
  };

  const breadcrumbData: BreadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/", siteUrl),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "News",
        item: absoluteUrl("/news/", siteUrl),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return [articleData, breadcrumbData];
}
