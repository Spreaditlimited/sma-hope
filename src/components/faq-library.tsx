"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FaqItem } from "@/content/faqs";
import faqCategories from "@/content/faq-categories.json";
import { filterFaqItems } from "@/lib/faq-search";
import { Icon } from "@/components/icon";
import styles from "./faq-library.module.css";

export function FAQLibrary({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    function revealAnswer() {
      if (query) { setQuery(""); return; }
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        target.scrollIntoView({ block: "start" });
      }
    }
    window.addEventListener("hashchange", revealAnswer);
    if (!query) revealAnswer();
    return () => window.removeEventListener("hashchange", revealAnswer);
  }, [query]);
  const filtered = filterFaqItems(items, query);
  const groups = faqCategories.map(category => ({ ...category, items: filtered.filter(item => item.category === category.id) })).filter(group => group.items.length);
  return <div id="questions" className={styles.library}>
    <div className={styles.searchRow}>
      <label className={styles.search} htmlFor="faq-search"><Icon name="search" size={20}/><span className="sr-only">Search SMA questions and answers</span><input id="faq-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a question, such as testing or school" autoComplete="off"/></label>
      {query && <button type="button" className={styles.clear} onClick={() => setQuery("")}>Clear search</button>}
      <p className={styles.count} role="status">{filtered.length} {filtered.length === 1 ? "answer" : "answers"}{query ? " found" : " across six topics"}</p>
    </div>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><p className="eyebrow">Jump to a topic</p><nav aria-label="FAQ topics">{groups.map(group => <a key={group.id} href={`#${group.id}`}><span>{group.title}</span><span className={styles.topicCount}>{group.items.length}</span></a>)}</nav><Link className={styles.guideLink} href="/blog">Need more detail?<strong>Explore the knowledge hub →</strong></Link></aside>
      <div className={styles.groups}>
        {groups.map(group => <section key={group.id} id={group.id} className={styles.group} aria-labelledby={`${group.id}-heading`}><div className={styles.groupHeading}><h2 id={`${group.id}-heading`}>{group.title}</h2><p>{group.intro}</p></div>
          {group.items.map(item => <details key={item.id} id={item.id} className={styles.item}><summary><span>{item.question}</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div className={styles.answer}><p>{item.answer}</p>{Boolean(item.links?.length) && <ul className={styles.links}>{item.links?.map(link => <li key={link.href}><Link href={link.href}>{link.label} →</Link></li>)}</ul>}{item.source && <p className={styles.source}>Reference: <a href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.title} ↗</a></p>}<a className={styles.permalink} href={`#${item.id}`} aria-label={`Link to answer: ${item.question}`}>Link to this answer</a></div></details>)}
        </section>)}
        {filtered.length === 0 && <div className={styles.empty}><Icon name="search" size={28}/><h2>No matching answers</h2><p>Try a shorter phrase, such as carrier, school, Nigeria or book. You can also contact the foundation with a practical question.</p><button type="button" className="btn btn-secondary" onClick={() => setQuery("")}>Show all answers</button></div>}
      </div>
    </div>
  </div>;
}
