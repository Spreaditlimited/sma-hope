import Image from "next/image";
import { book } from "@/lib/book";

type EditionFormat = "EBook" | "Paperback" | "Hardcover";

export function BookEditionMockup({ format }: { format: EditionFormat }) {
  const kind = format === "EBook" ? "kindle" : format.toLowerCase();

  return (
    <div className={`edition-mockup edition-mockup--${kind}`} role="img" aria-label={`${book.title}: ${format === "EBook" ? "Kindle edition shown on an e-reader" : `${format.toLowerCase()} edition mockup`}`}>
      <div className="edition-mockup-object">
        <div className="edition-mockup-cover">
          <Image src={book.cover} alt="" width={1600} height={2473} sizes="180px" />
        </div>
        {format === "EBook" ? <span className="edition-mockup-device-mark" aria-hidden="true">kindle</span> : null}
      </div>
    </div>
  );
}
