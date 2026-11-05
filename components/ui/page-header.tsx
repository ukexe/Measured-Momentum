type PageHeaderProps = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <h1>{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      <div className="page-header__measure" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
    </header>
  );
}
