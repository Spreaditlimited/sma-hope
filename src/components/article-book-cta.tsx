import Image from "next/image";
import Link from "next/link";
import type { Guide } from "@/content/guides";
import { amazonEditionUrl } from "@/lib/amazon-marketplaces";
import { book } from "@/lib/book";
import { supportWhatsAppUrl } from "@/lib/support";
import styles from "./article-book-cta.module.css";

export function ArticleBookCTA({ guide }: { guide: Guide }) {
  const market = guide.audience === "United Kingdom" ? "GB" : guide.audience === "Canada" ? "CA" : guide.audience === "United States" ? "US" : undefined;
  const store = market === "GB" ? "Amazon UK" : market === "CA" ? "Amazon Canada" : "Amazon US";
  return <aside className={styles.card} aria-label="Read the family story behind SMA Hope">
    <Image src="/books/when-every-breath-matters-cover.jpg" alt="When Every Breath Matters book cover" width={110} height={170} className={styles.cover} />
    <div>
      <p className="eyebrow">The family story behind the foundation</p>
      <h2>When Every Breath Matters</h2>
      <p>{guide.bookContext || "Tochukwu Nkwocha and Ijeoma Nkwocha share their family’s experience of SMA, care, faith and survival."}</p>
      <p className={styles.formats}>By Tochukwu Nkwocha and Ijeoma Nkwocha · Kindle, paperback and hardcover</p>
      <div className={styles.actions}>
        {market ? <a className="btn btn-primary" href={amazonEditionUrl(book.editions[0].asin, market)} rel="noopener noreferrer">Buy Kindle on {store}</a> : <Link className="btn btn-primary" href="/book#editions">Choose your edition</Link>}
        {market && <Link className="text-link" href={`/book?market=${market}#editions`}>Paperback &amp; hardcover →</Link>}
        {guide.audience === "Nigeria" || guide.audience === "Africa" ? <a className="text-link" href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer">Ask about copies for Nigeria ↗</a> : <Link className="text-link" href="/blog/sma-book-club-discussion-guide">Reading with a group? →</Link>}
      </div>
    </div>
  </aside>;
}
