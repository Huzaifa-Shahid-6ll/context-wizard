import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";

export default function GDPRPage() {
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('gdpr_page_viewed'); 
  }, []);
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">GDPR Compliance</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: November 3, 2025</p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <h2>1. Our Commitment</h2>
        <p>
          Context Wizard is committed to protecting your privacy and complying with the General
          Data Protection Regulation (GDPR) and other applicable data protection laws. We process
          your personal data lawfully, fairly, and transparently.
        </p>

        <h2>2. Your Rights Under GDPR</h2>
        <p>As a data subject, you have the following rights:</p>
        <ul>
          <li>
            <strong>Right of Access:</strong> You can request a copy of the personal data we hold
            about you.
          </li>
          <li>
            <strong>Right to Rectification:</strong> You can request correction of inaccurate or
            incomplete personal data.
          </li>
          <li>
            <strong>Right to Erasure:</strong> You can request deletion of your personal data in
            certain circumstances.
          </li>
          <li>
            <strong>Right to Restrict Processing:</strong> You can request that we limit how we
            use your personal data.
          </li>
          <li>
            <strong>Right to Data Portability:</strong> You can request a copy of your data in a
            machine-readable format.
          </li>
          <li>
            <strong>Right to Object:</strong> You can object to certain types of processing of
            your personal data.
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Where we rely on consent, you can withdraw
            it at any time.
          </li>
        </ul>

        <h2>3. How to Exercise Your Rights</h2>
        <p>
          To exercise any of your rights, please contact us at
          <a href="mailto:privacy@contextwizard.com">privacy@contextwizard.com</a>. We will
          respond to your request within one month (or inform you if we need more time).
        </p>
        <p>
          Please include:
        </p>
        <ul>
          <li>Your full name and email address</li>
          <li>A clear description of the right you wish to exercise</li>
          <li>Any relevant details to help us locate your data</li>
        </ul>

        <h2>4. Data Processing</h2>
        <p>
          We process your personal data based on:
        </p>
        <ul>
          <li><strong>Contract:</strong> To provide our services to you</li>
          <li><strong>Consent:</strong> Where you have given clear consent</li>
          <li><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
        </ul>

        <h2>5. Data Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries outside the European Economic
          Area (EEA). We ensure appropriate safeguards are in place, such as Standard Contractual
          Clauses, to protect your data in accordance with GDPR requirements.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain your personal data only for as long as necessary to fulfill the purposes
          outlined in our Privacy Policy, unless a longer retention period is required by law.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal
          data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>8. Complaints</h2>
        <p>
          If you believe we have not addressed your concerns adequately, you have the right to
          lodge a complaint with your local data protection authority. For EU residents, you can
          find your authority at{" "}
          <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer">
            edpb.europa.eu
          </a>.
        </p>

        <h2>9. More Information</h2>
        <p>
          For detailed information about how we collect, use, and protect your personal data,
          please see our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          For GDPR-related inquiries, please contact our Data Protection Officer at
          <a href="mailto:privacy@contextwizard.com">privacy@contextwizard.com</a>.
        </p>
      </article>

      <nav className="mt-12 flex items-center gap-6 text-sm">
        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        <Link href="/cookies" className="hover:text-primary">Cookie Policy</Link>
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}

