import Link from "next/link";
interface PageHeaderProps {
  title: string;
  intro?: string;
  backgroundImage?: string;
}
export function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="editorial-page-header">
      <div className="container">
        <Link href="/" className="eyebrow">
          SMA Hope Foundation / Nigeria
        </Link>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </header>
  );
}
