import Image from "next/image";
import Link from "next/link";
import { book } from "@/lib/book";
import styles from "./foundation-pages.module.css";

export function FoundationBook({ context }: { context: "story" | "about" }) {
  return <aside className={styles.book} aria-labelledby="foundation-book-title"><div className={styles.bookArt}><Image src={book.cover} alt="When Every Breath Matters by Tochukwu Nkwocha and Ijeoma Nkwocha, cream book cover" width={180} height={279} sizes="(max-width: 600px) 125px, 180px"/></div><div><p className="eyebrow">Our story, in a book</p><h2 id="foundation-book-title">When Every Breath Matters</h2><p className={styles.bookSubtitle}>Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival</p><p>{context === "story" ? "We wrote this book to tell the fuller story: the diagnoses, the search for care, the role of faith and the responsibilities of parenting through uncertainty. It is a personal account of our family’s life with SMA." : "Written by Tochukwu and Ijeoma Nkwocha, this memoir shares the family experience behind SMA Hope. It gives families, friends, healthcare professionals and supporters a fuller understanding of what care can mean beyond the consultation room."}</p><p className={styles.editions}>Available on Amazon in Kindle, paperback and hardcover.</p><Link href="/book#editions" className="btn btn-primary">Explore the book and editions</Link></div></aside>;
}
