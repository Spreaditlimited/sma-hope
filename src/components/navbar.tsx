"use client";
import { ThemePicker } from "@/components/theme-provider";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
const links = [
  ["Understand SMA", "/what-is-sma"],
  ["For families", "/support-for-families"],
  ["Knowledge hub", "/blog"],
  ["Our story", "/our-story"],
  ["About us", "/about"],
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header
      className="hope-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <div className="utility-bar">
        <div className="container">
          <span className="utility-message"><span className="utility-desktop">Understanding SMA. Standing with families. <b>Rooted in Nigeria.</b></span><span className="utility-mobile">Hope for SMA families</span></span>
          <div className="utility-actions"><ThemePicker /><Link href="/account">
            My account <span aria-hidden="true">↗</span>
          </Link></div>
        </div>
      </div>
      <div className="container hope-nav">
        <Link href="/" className="hope-brand" aria-label="SMA Hope home">
          <BrandLogo priority />
        </Link>
        <nav
          id="hope-navigation"
          aria-label="Main navigation"
          className={open ? "hope-links open" : "hope-links"}
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href || pathname.startsWith(href + "/") ? "page" : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link className="mobile-account" href="/account" onClick={() => setOpen(false)}>
            My account
          </Link>
        </nav>
        <Link href="/donate" className="btn btn-primary donate-nav">
          <Icon name="heart" size={17} /> Give hope
        </Link>
        <button
          className="hope-menu"
          aria-expanded={open}
          aria-controls="hope-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}
