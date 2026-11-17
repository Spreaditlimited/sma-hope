"use client";

import { useEffect, useId, useRef, useState } from "react";
import { supportContact, supportWhatsAppUrl } from "@/lib/support";
import { Icon } from "@/components/icon";
import styles from "./support-launcher.module.css";

function WhatsAppIcon() {
  return <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.01 3.2A12.67 12.67 0 0 0 5.02 22.2L3.2 28.8l6.78-1.78A12.65 12.65 0 1 0 16.01 3.2Zm0 2.25a10.4 10.4 0 1 1-5.3 19.35l-.38-.23-4.03 1.06 1.08-3.92-.25-.4A10.4 10.4 0 0 1 16.01 5.45Zm-4.36 5.72c-.24 0-.62.09-.95.45-.32.36-1.25 1.22-1.25 2.98s1.28 3.46 1.46 3.7c.18.24 2.47 3.95 6.1 5.38 3.02 1.18 3.63.95 4.28.89.65-.06 2.1-.86 2.4-1.69.3-.83.3-1.54.21-1.69-.09-.15-.33-.24-.69-.42-.36-.18-2.1-1.04-2.43-1.16-.33-.12-.57-.18-.81.18-.24.36-.93 1.16-1.14 1.4-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.96-1.8-2.14-2.01-2.5-.21-.36-.02-.56.16-.74.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69Z" /></svg>;
}

export function SupportLauncher() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={container}>
      {open && <section id={panelId} role="dialog" aria-labelledby={titleId} className={styles.panel}>
        <header className={styles.header}>
          <div><h2 id={titleId}>We’re here to help</h2><p>Questions about the foundation, family support or the book.</p></div>
          <button type="button" ref={closeButton} className={styles.close} aria-label="Close support" onClick={() => { setOpen(false); trigger.current?.focus(); }}><Icon name="close" /></button>
        </header>
        <div className={styles.body}>
          <p className={styles.label}>Chat on WhatsApp</p>
          <a className={styles.contact} href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <span className={styles.whatsapp}><WhatsAppIcon /></span>
            <span><strong>{supportContact.label}</strong><span className={styles.phone}>{supportContact.displayPhone}</span></span>
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </a>
          <p className={styles.note}>Opens WhatsApp in a new tab.</p>
        </div>
      </section>}
      <button type="button" ref={trigger} className={styles.launcher} aria-expanded={open} aria-controls={open ? panelId : undefined} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>
        <WhatsAppIcon /><span>Support</span>
      </button>
    </div>
  );
}
