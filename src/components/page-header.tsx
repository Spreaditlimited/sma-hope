type PageHeaderProps = {
  title: string;
  intro: string;
  backgroundImage?: string;
};

export function PageHeader({ title, intro, backgroundImage }: PageHeaderProps) {
  const sectionClass = `section-tight page-header${backgroundImage ? " has-bg" : ""}`;
  const sectionStyle = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined;

  return (
    <section className={sectionClass} style={sectionStyle}>
      <div className="container">
        <div className="page-header-content">
          <p className="kicker">SMA Hope Foundation Nigeria</p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)", marginBottom: "0.8rem" }}>{title}</h1>
          <p className="lead" style={{ maxWidth: "60ch", margin: 0 }}>
            {intro}
          </p>
        </div>
      </div>
    </section>
  );
}
