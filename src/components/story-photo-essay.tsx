import Image from "next/image";
import photos from "@/content/story-photos.json";
import styles from "./foundation-pages.module.css";

const chapters = {
  early: { eyebrow: "From our family album", title: "The early days, together.", introduction: "Photographs from Lagos and Dubai, before we knew everything this journey would ask of us." },
  dubai: { eyebrow: "Hospital care in Dubai", title: "Kamsi’s admissions at Al Jalila.", introduction: "The first admission, feeding support and further hospital stays became part of our family’s life in Dubai. These photographs record different moments from that experience." },
  uk: { eyebrow: "Hospital care in the United Kingdom", title: "Admissions and recovery at Alder Hey.", introduction: "Access to treatment did not mean the end of hospital care. There have been further admissions, breathing support and periods of recuperation in the UK." },
  everyday: { eyebrow: "Beyond the medical record", title: "Sisters, family life and time outside.", introduction: "Our photographs also hold the quieter parts of the story: being beside one another and making room for ordinary experiences." },
} as const;

export function StoryPhotoEssay({ chapter }: { chapter: keyof typeof chapters }) {
  const copy = chapters[chapter];
  const selected = photos.filter(photo => photo.group === chapter);
  return <section id={`photographs-${chapter}`} className={styles.photoEssay} aria-labelledby={`photographs-${chapter}-title`}>
    <div className={styles.photoIntroduction}><p className="eyebrow">{copy.eyebrow}</p><h2 id={`photographs-${chapter}-title`}>{copy.title}</h2><p>{copy.introduction}</p></div>
    <div className={`${styles.photoGrid} ${selected.length === 2 ? styles.photoPair : ""}`}>
      {selected.map(photo => <figure key={photo.src}>
        <a className={styles.photoLink} href={photo.src} target="_blank" rel="noopener noreferrer" aria-label={`View full photograph: ${photo.caption}`}>
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={selected.length === 2 ? "(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 43vw, 560px" : "(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 43vw, 375px"}/>
        </a>
        <figcaption>{photo.caption}</figcaption>
      </figure>)}
    </div>
  </section>;
}
