import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
const groups = [
  {
    name: "The foundation",
    links: [
      ["About us", "/about"],
      ["Our family story", "/our-story"],
      ["The book", "/book"],
      ["News & updates", "/updates"],
      ["Transparency", "/transparency"],
    ],
  },
  {
    name: "Find understanding",
    links: [
      ["What is SMA?", "/what-is-sma"],
      ["Knowledge hub", "/blog"],
      ["Support for families", "/support-for-families"],
      ["Common questions", "/faqs"],
      ["Our editorial approach", "/editorial-policy"],
    ],
  },
  {
    name: "Be part of it",
    links: [
      ["Make a donation", "/donate"],
      ["Contact us", "/contact"],
      ["My account", "/account"],
      ["Privacy policy", "/privacy-policy"],
      ["Terms of use", "/terms"],
    ],
  },
];
export function Footer() {
  return (
    <footer className="site-footer hope-footer">
      <div className="container hope-footer-grid">
        <div className="footer-intro">
          <BrandLogo />
          <p>
            A Nigerian foundation advancing understanding, dignity, and support for families
            affected by spinal muscular atrophy.
          </p>
          <span>Rooted in experience. Growing in hope.</span>
        </div>
        {groups.map((g) => (
          <nav aria-label={g.name} key={g.name}>
            <h2>{g.name}</h2>
            {g.links.map(([l, h]) => (
              <Link key={h} href={h}>
                {l}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="container hope-footer-bottom">
        <p>© {new Date().getFullYear()} Spinal Muscular Atrophy Hope Foundation.</p>
        <p>5 Olutosin Ajayi Street, Ajao Estate, Lagos, Nigeria.</p>
      </div>
      <div className="container footer-care-note">
        Educational information supports, and does not replace, advice from your own healthcare
        team.
      </div>
    </footer>
  );
}
