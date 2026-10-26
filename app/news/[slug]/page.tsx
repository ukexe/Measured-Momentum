import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsArticle } from "@/components/sections/activity/news-article";
import {
  getPublishedNewsArticle,
  getPublishedNewsArticles,
  getNewsStructuredData,
} from "@/content/news";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

type NewsArticlePageProps = {
  readonly params: Promise<{
    readonly slug: string;
  }>;
};

const EMPTY_ARCHIVE_SENTINEL = "updates-not-published";

export function generateStaticParams() {
  const publishedParams = getPublishedNewsArticles().map((article) => ({
    slug: article.slug,
  }));

  // Next static export rejects an empty params list. The unlinked sentinel is
  // prerendered as the branded 404 and is replaced automatically once a
  // verified article exists.
  return publishedParams.length > 0
    ? publishedParams
    : [{ slug: EMPTY_ARCHIVE_SENTINEL }];
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedNewsArticle(slug);

  if (!article) {
    notFound();
  }

  return createPageMetadata({
    title: article.title,
    description: article.standfirst,
    pathname: `/news/${article.slug}/`,
    noIndex: article.noIndex ?? false,
  });
}

function serialiseStructuredData(value: object): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export default async function NewsArticleRoute({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getPublishedNewsArticle(slug);

  if (!article) {
    notFound();
  }

  const structuredData = getNewsStructuredData(article.slug);

  if (!structuredData) {
    notFound();
  }

  return (
    <>
      {structuredData.map((record) => (
        <script
          dangerouslySetInnerHTML={{
            __html: serialiseStructuredData(record),
          }}
          key={record["@type"]}
          type="application/ld+json"
        />
      ))}
      <NewsArticle article={article} />
    </>
  );
}
