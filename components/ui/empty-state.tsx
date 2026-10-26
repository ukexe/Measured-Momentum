import type { ReactNode } from "react";

type EmptyStateProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <p className="empty-state__label">Current state</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}
