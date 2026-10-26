type PageHeaderProps = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow?: string;
};

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="page-header__description">{description}</p>
    </header>
  );
}
