import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  getNewsCategoryLabel,
  getPublishedNewsArticles,
  newsCategories,
} from "@/content/news";
import { siteConfig } from "@/content/site";

import styles from "./activity-pages.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

export function NewsIndex() {
  const publishedArticles = getPublishedNewsArticles();

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <PageHeader
          eyebrow={siteConfig.statusLine}
          title="Updates, with context"
          description="This archive is designed for sourceable proposal updates, explainers, consultations, notices and corrections. Publication would not turn an idea into an adopted decision."
        />
        <aside aria-label="News archive status" className={styles.statusNotice}>
          <p className={styles.kicker}>Archive status</p>
          {publishedArticles.length === 0 ? (
            <p>
              <strong>No articles are published.</strong> There is no
              placeholder update, launch announcement or implied activity behind
              this empty archive.
            </p>
          ) : (
            <p>
              <strong>
                {publishedArticles.length} verified{" "}
                {publishedArticles.length === 1 ? "article" : "articles"}{" "}
                published.
              </strong>{" "}
              Draft, withheld and pending-verification records remain outside
              the public archive.
            </p>
          )}
        </aside>
      </section>

      <section
        aria-labelledby="news-categories-title"
        className={styles.inkSection}
      >
        <div className="container">
          <div className={styles.inverseHeading}>
            <p className={styles.inverseKicker}>Archive model</p>
            <h2 id="news-categories-title">
              Categories ready for verified records
            </h2>
            <p>
              These labels define the editorial model. Filters can be introduced
              when the volume of approved records justifies them.
            </p>
          </div>

          <ul className={styles.categoryGrid}>
            {newsCategories.map((category) => (
              <li key={category.value}>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="news-archive-title"
        className={`container ${styles.section}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Published archive</p>
          <h2 id="news-archive-title">News and updates</h2>
          <p>
            Every future card will expose its category, publication date,
            decision status and accountable editorial role.
          </p>
        </div>

        {publishedArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyState
              title="No news or updates have been published"
              description="For the current scope, status and non-claims, read About the proposal. No conclusion should be drawn from the absence of articles."
              action={
                <ButtonLink href="/about/">Read about the proposal</ButtonLink>
              }
            />
          </div>
        ) : (
          <ol className={styles.recordGrid}>
            {publishedArticles.map((article) => (
              <li key={article.slug}>
                <article className={styles.recordCard}>
                  <p className={styles.recordLabel}>
                    {getNewsCategoryLabel(article.category)} ·{" "}
                    {article.statusLabel}
                  </p>
                  <h3>
                    <Link href={`/news/${article.slug}/`} prefetch={false}>
                      {article.title}
                    </Link>
                  </h3>
                  <p>{article.summary}</p>
                  <p className={styles.recordMeta}>
                    Published{" "}
                    <time dateTime={article.publishedOn}>
                      {formatDate(article.publishedOn)}
                    </time>{" "}
                    · {article.editorialRole}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section
        aria-labelledby="news-corrections-title"
        className={`container ${styles.actionSection}`}
      >
        <div>
          <p className={styles.kicker}>Corrections</p>
          <h2 id="news-corrections-title">
            A future update will retain its correction record
          </h2>
          <p>
            Use the contact route for a factual correction to any published
            page. Include the exact passage and a primary source where possible.
          </p>
        </div>
        <ButtonLink href="/contact/" variant="secondary">
          Request a factual correction
        </ButtonLink>
      </section>
    </div>
  );
}
