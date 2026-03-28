import Link from "next/link";

const foundationLinks = [
  ["About", "/about"],
  ["Our Story", "/our-story"],
  ["Support for Families", "/support-for-families"],
  ["The Book", "/book"],
  ["Donate", "/donate"],
  ["Contact", "/contact"],
] as const;

const resourceLinks = [
  ["What Is SMA?", "/what-is-sma"],
  ["Updates", "/updates"],
  ["Transparency", "/transparency"],
  ["FAQs", "/faqs"],
] as const;

const legalLinks = [
  ["Privacy Policy", "/privacy-policy"],
  ["Terms", "/terms"],
  ["Sign In", "/account/login"],
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <p className="footer-brand">SMA Hope Foundation Nigeria</p>
          <p className="footer-copy">
            A registered Nigerian foundation advancing SMA awareness, family support, advocacy, and dignified public understanding.
          </p>
          <p className="footer-meta">Registered in Nigeria</p>
        </div>

        <div className="footer-nav-grid">
          <div>
            <p className="footer-heading">Foundation</p>
            <div className="footer-links">
              {foundationLinks.map(([label, href]) => (
                <Link key={href} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="footer-heading">Resources</p>
            <div className="footer-links">
              {resourceLinks.map(([label, href]) => (
                <Link key={href} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="footer-heading">Legal</p>
            <div className="footer-links">
              {legalLinks.map(([label, href]) => (
                <Link key={href} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-meta footer-bottom-line">5 Olutosin Ajayi Street, Ajao Estate, Lagos, Nigeria.</p>
        <p className="footer-meta footer-bottom-line">© {currentYear} Spinal Muscular Atrophy Hope Foundation. All rights reserved.</p>
      </div>
    </footer>
  );
}
