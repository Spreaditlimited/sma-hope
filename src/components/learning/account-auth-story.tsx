import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import styles from './registration.module.css';

export function AccountAuthStory() {
  return (
    <aside className={styles.story} aria-label="About your free course">
        <Link href="/learn/understanding-sma" className={styles.logo} aria-label="Back to the SMA Hope course">
          <BrandLogo />
        </Link>
        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>Learn with SMA Hope</p>
          <h2>A little understanding.<br />A clearer next step.</h2>
          <p>Five short lessons to help you recognise possible signs of SMA and know when to seek medical advice.</p>
          <Image src="/learning/sma-awareness-parent-baby-doctor-transparent.png"
            alt="A mother holding her baby during a conversation with a paediatric doctor."
            width={1254} height={1254} sizes="(max-width: 850px) 0px, 35vw"
            className={styles.artwork} />
          <div className={styles.features}><span>Free to enrol</span><span>Learn at your pace</span><span>Save your progress</span></div>
        </div>
        <Link href="/learn/understanding-sma" className={styles.back}>← Explore the course</Link>
      </aside>
  );
}
