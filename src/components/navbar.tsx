"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["What Is SMA?", "/what-is-sma"],
  ["Our Story", "/our-story"],
  ["Support for Families", "/support-for-families"],
  ["The Book", "/book"],
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container" style={{ padding: "0.65rem 0 0.9rem" }}>
        <div className="nav-main-row">
          <Link href="/" className="brand-link" aria-label="SMA Hope Foundation Nigeria home">
            <Image
              src="/SMA Hope Foundation logo.png"
              alt="SMA Hope Foundation logo"
              width={210}
              height={111}
              style={{ width: "auto", height: "3.2rem" }}
              priority
            />
          </Link>

          <nav
            id="site-navigation"
            aria-label="Main navigation"
            className={`site-nav-links ${open ? "is-open" : ""}`}
          >
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="site-nav-link" onClick={handleNavClick}>
                {label}
              </Link>
            ))}
          </nav>

          <Link href="/donate" className="btn btn-primary nav-donate">
            Donate
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-navigation"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
