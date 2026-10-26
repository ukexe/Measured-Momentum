import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import {
  getNewsCategoryLabel,
  type NewsArticle as NewsArticleRecord,
} from "@/content/news";

import styles from "./activity-pages.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

export function NewsArticle({
  article,
}: {
  readonly article: NewsArticleRecord;
}) {
  return (
    <div className={styles.articlePage}>
      <nav
        aria-label="Breadcrumb"
        className={`container ${styles.breadcrumbs}`}
      >
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/news/">News</Link>
          </li>
          <li aria-current="page">{article.title}</li>
        </ol>
      </nav>

      <article className={`container ${styles.article}`}>
        <header className={styles.articleHeader}>
          <p className={styles.articleType}>
            {getNewsCategoryLabel(article.category)} · {article.statusLabel}
          </p>
          <h1>{article.title}</h1>
          <p className={styles.standfirst}>{article.standfirst}</p>
          <dl className={styles.articleMeta}>
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={article.publishedOn}>
                  {formatDate(article.publishedOn)}
                </time>
              </dd>
            </div>
            {article.updatedOn ? (
              <div>
                <dt>Updated</dt>
                <dd>
                  <time dateTime={article.updatedOn}>
                    {formatDate(article.updatedOn)}
                  </time>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Editorial responsibility</dt>
              <dd>{article.editorialRole}</dd>
            </div>
          </dl>
        </header>

        <div className={styles.articleBody}>
          <section aria-labelledby="article-summary">
            <h2 id="article-summary">Summary</h2>
            <p>{article.summary}</p>
          </section>

          {article.body.map((section, index) => {
            const headingId = `article-section-${index + 1}`;

            return (
              <section aria-labelledby={headingId} key={section.heading}>
                <h2 id={headingId}>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            );
          })}

          <section
            aria-labelledby="article-change-record"
            className={styles.changeGrid}
          >
            <h2 id="article-change-record">Change record</h2>
            <div>
              <h3>What changed</h3>
              <ul>
                {article.whatChanged.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>What did not change</h3>
              <ul>
                {article.whatDidNotChange.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="article-sources">
            <h2 id="article-sources">Sources</h2>
            <ul className={styles.sourceList}>
              {article.sources.map((source) => (
                <li key={`${source.label}-${source.checkedOn}`}>
                  {source.url ? (
                    <a
                      href={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {source.label} — external source (opens in a new tab)
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                  <span>
                    Checked {formatDate(source.checkedOn)} · Source owner:{" "}
                    {source.ownerRole}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="article-corrections">
            <h2 id="article-corrections">Correction history</h2>
            {article.corrections.length === 0 ? (
              <p>No corrections are recorded for this published version.</p>
            ) : (
              <ul>
                {article.corrections.map((correction) => (
                  <li
                    key={`${correction.correctedOn}-${correction.description}`}
                  >
                    <time dateTime={correction.correctedOn}>
                      {formatDate(correction.correctedOn)}
                    </time>
                    : {correction.description}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {article.relatedLinks.length > 0 ? (
            <section aria-labelledby="article-related">
              <h2 id="article-related">Related verified content</h2>
              <ul>
                {article.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <section
        aria-labelledby="article-next-step"
        className={`container ${styles.actionSection}`}
      >
        <div>
          <p className={styles.kicker}>Archive and corrections</p>
          <h2 id="article-next-step">
            Keep the record connected to its source
          </h2>
          <p>
            Return to the dated archive, or use Contact to request a factual
            correction with supporting evidence.
          </p>
        </div>
        <div className={styles.actionButtons}>
          <ButtonLink href="/news/">See all updates</ButtonLink>
          <ButtonLink href="/contact/" variant="secondary">
            Request a correction
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
