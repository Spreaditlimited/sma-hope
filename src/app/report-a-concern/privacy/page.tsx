import Link from 'next/link';
import styles from '@/components/diagnostics/diagnostics.module.css';
import privacy from './privacy.module.css';

export const metadata = {
  title: 'Diagnostic access privacy notice | SMA Hope',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main id="main-content" className={`container ${styles.page} ${styles.public}`}>
      <header className={`${styles.hero} ${privacy.hero}`}>
        <div>
          <p className="eyebrow">SMA Hope / Private case information</p>
          <h1>Your information.<br />A clear purpose.</h1>
          <p className={privacy.intro}>What we ask you to share, who can see it and how we use it to help with your referral.</p>
        </div>
        <aside className={privacy.summary} aria-labelledby="privacy-at-a-glance">
          <p className="eyebrow" id="privacy-at-a-glance">Privacy at a glance</p>
          <ul>
            <li>Photos and videos are optional.</li>
            <li>Access is limited to authorised people involved in your referral.</li>
            <li>We do not publish your medical records or send them to advertising platforms.</li>
          </ul>
          <a href="#requests" className="text-link">Have a privacy question? ↓</a>
        </aside>
      </header>
      <div className={privacy.layout}>
        <aside className={privacy.sidebar}>
          <nav aria-label="In this privacy notice">
            <p className="eyebrow">In this notice</p>
            <ol>
              <li><a href="#information"><span aria-hidden="true">01</span>What we collect and why</a></li>
              <li><a href="#permission"><span aria-hidden="true">02</span>Your permission and your choices</a></li>
              <li><a href="#access"><span aria-hidden="true">03</span>Who can access a case</a></li>
              <li><a href="#storage"><span aria-hidden="true">04</span>Storage and retention</a></li>
              <li><a href="#reporting"><span aria-hidden="true">05</span>Programme reporting</a></li>
              <li><a href="#requests"><span aria-hidden="true">06</span>Questions and privacy requests</a></li>
            </ol>
          </nav>
          <p className={privacy.sidebarNote}>Please do not send medical records through ordinary email. Use your private account to share documents, photos or videos.</p>
          <Link href="/report-a-concern" className="text-link">← Diagnostic pathway</Link>
        </aside>
        <div className={privacy.content}>
          <section id="information" className={privacy.section} aria-labelledby="information-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">01</span><h2 id="information-heading">What we collect and why</h2></div>
            <div className={privacy.sectionBody}><p>Spinal Muscular Atrophy Hope Foundation, Nigeria, runs this service. We ask for your account and contact details, the patient’s name and age, where they live and the concerns you have noticed. You can also choose to share documents, photos or videos. This information helps us organise the referral. We keep a record of the permissions you give and who accesses the case.</p></div>
          </section>
          <section id="permission" className={privacy.section} aria-labelledby="permission-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">02</span><h2 id="permission-heading">Your permission and your choices</h2></div>
            <div className={privacy.sectionBody}><p>If you are an adult seeking help for yourself, you submit your own report. A parent or legal guardian submits for a child. We ask for your permission to share relevant information with the clinician assigned to the case. You do not have to upload photos or videos. If you agree to hear about a future SMA registry, that does not sign you up for research.</p></div>
          </section>
          <section id="access" className={privacy.section} aria-labelledby="access-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">03</span><h2 id="access-heading">Who can access a case</h2></div>
            <div className={privacy.sectionBody}><p>The SMA Hope staff or volunteers authorised to manage referrals, and the verified clinician assigned to your case, can access the records they need. If you agree to testing, the laboratory receives only the information needed for that test. We will explain any sharing with another provider before it happens. We do not publish your medical records or send them to advertising platforms.</p></div>
          </section>
          <section id="storage" className={privacy.section} aria-labelledby="storage-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">04</span><h2 id="storage-heading">Storage and retention</h2></div>
            <div className={privacy.sectionBody}><p>Your report is stored in the foundation’s private database. Uploaded files are kept in restricted Google Workspace storage, which may store them outside Nigeria. Only authorised people involved in your referral can access your information. Contact us if you would like to ask where your information is stored, how it is protected or how long it is kept.</p><p>We retain your referral records unless you ask us to delete them. To request deletion, email help@smahope.org from the address you used for your report. We check that the request comes from the account holder before acting. If you withdraw from the service, the assigned clinician loses access through the portal. Withdrawal does not automatically delete your records. You can ask to see or correct your information, or request its deletion. If a legal obligation requires us to keep any part of a record, we explain what we need to retain and why.</p></div>
          </section>
          <section id="reporting" className={privacy.section} aria-labelledby="reporting-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">05</span><h2 id="reporting-heading">Programme reporting</h2></div>
            <div className={privacy.sectionBody}><p>We may share summaries with donors and policymakers to show where families need help. These summaries will not identify you or include your medical files. Reports submitted to us cannot tell us how common SMA is across Nigeria. We would need separate permission and the appropriate approvals to use identifiable stories or involve anyone in research.</p></div>
          </section>
          <section id="requests" className={privacy.section} aria-labelledby="requests-heading">
            <div className={privacy.sectionHeading}><span aria-hidden="true">06</span><h2 id="requests-heading">Questions and privacy requests</h2></div>
            <div className={privacy.sectionBody}><p>Email <a href="mailto:help@smahope.org">help@smahope.org</a>. Please do not attach medical records to an ordinary email. You can also raise a concern about the use of your personal information with the Nigeria Data Protection Commission.</p></div>
          </section>
        </div>
      </div>
    </main>
  );
}
