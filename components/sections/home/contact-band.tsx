import { ButtonLink } from "@/components/ui/button";
import { homeContact } from "@/content/home";

import styles from "@/app/home.module.css";

export function ContactBand() {
  return (
    <section className={styles.contact} aria-labelledby="contact-title">
      <div className={`container ${styles.contactGrid}`}>
        <div>
          <p className={styles.eyebrow}>{homeContact.label}</p>
          <h2 id="contact-title">{homeContact.title}</h2>
        </div>
        <div className={styles.contactCopy}>
          <p>{homeContact.body}</p>
          <ButtonLink href="/contact/">View contact options</ButtonLink>
        </div>
      </div>
      <div className={styles.footerTransition} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
