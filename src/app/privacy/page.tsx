import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";

export default function PrivacyPolicyPage() {
  React.useEffect(() => { initPostHog(); trackEvent('privacy_page_viewed'); }, []);
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: November 3, 2025</p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how Conard (the “Service”) collects, uses,
          shares, and protects information about you. We are committed to protecting your
          privacy and complying with applicable data protection laws, including the EU/UK
          GDPR.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Email (via Clerk)</h3>
        <p>
          We collect your email address and basic profile information through our identity
          provider, Clerk, to create and manage your account and authenticate you.
        </p>
        <h3>GitHub repo URLs (not stored permanently)</h3>
        <p>
          When you use features that analyze repositories, we may process repository URLs
          you submit. We do not store repository contents permanently; processing is
          ephemeral or retained only as necessary to provide the feature.
        </p>
        <h3>Usage data (generations, prompts)</h3>
        <p>
          We collect usage metrics such as prompts, generations, timestamps, and feature
          interactions to operate the Service, enforce fair use, and improve product
          quality. Where feasible, we aggregate or pseudonymize this data.
        </p>
        <h3>Payment info (via Stripe, not stored by us)</h3>
        <p>
          Payments are processed by Stripe. We do not store full card details on our
          servers. Stripe may collect and process your payment information in accordance
          with its own privacy policy.
        </p>

        <h2>3. How We Use Information</h2>
        <ul>
          <li>Provide and operate the Service, including authentication and core features</li>
          <li>Process payments and manage subscriptions</li>
          <li>Improve and develop the product, including analytics and troubleshooting</li>
          <li>Send transactional emails (e.g., receipts, account notices, critical updates)</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <h3>Clerk (authentication)</h3>
        <p>We use Clerk to handle user authentication and account management.</p>
        <h3>Stripe (payments)</h3>
        <p>We use Stripe to process payments and manage subscriptions and invoices.</p>
        <h3>OpenRouter (AI processing)</h3>
        <p>
          We may send prompts or relevant inputs to OpenRouter to facilitate AI model
          processing as part of the Service features.
        </p>
        <p>
          We do not sell your personal data. We may disclose information if required by
          law, to protect our rights, or to prevent fraud or abuse.
        </p>

        <h2>5. Data Storage & Security</h2>
        <p>
          We store application data in our Convex database. Data is encrypted in transit
          and protected by access controls. We maintain regular backups and take
          reasonable technical and organizational measures to safeguard your information.
          No method of transmission or storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2>6. Your Rights</h2>
        <ul>
          <li><strong>Access data</strong>: Request a copy of your personal data we process.</li>
          <li><strong>Delete account</strong>: Request deletion of your account and associated data.</li>
          <li><strong>Export data</strong>: Request an export of your data in a portable format.</li>
          <li><strong>Opt-out emails</strong>: Manage email preferences or opt out of non-essential emails.</li>
        </ul>
        <p>
          To exercise these rights, contact our GDPR team at
          <a href="mailto:privacy@contextwizard.com">privacy@contextwizard.com</a>. We will
          respond in accordance with applicable laws.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We use cookies and similar technologies to keep you signed in, remember
          preferences, perform analytics, and improve the Service. You can control cookies
          through your browser settings. Some features may not function properly without
          cookies.
        </p>

        <h2>8. Changes to Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If changes are material,
          we will provide reasonable notice (e.g., by email or in-app). The revised
          policy will be effective when posted unless otherwise stated.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          For privacy questions or data requests, contact us at
          <a href="mailto:privacy@contextwizard.com">privacy@contextwizard.com</a> or
          <a href="mailto:support@contextwizard.com">support@contextwizard.com</a>.
        </p>
      </article>

      <nav className="mt-12 flex items-center gap-6 text-sm">
        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}


