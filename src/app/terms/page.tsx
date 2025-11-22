import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";

export default function TermsPage() {
  React.useEffect(() => { initPostHog(); trackEvent('terms_page_viewed'); }, []);
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: November 3, 2025</p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <h2>1. Introduction</h2>
        <p>
          These Terms of Service (the “Terms”) govern your access to and use of Context
          Wizard (the “Service”). By using the Service, you agree to be bound by these
          Terms. If you do not agree, do not use the Service.
        </p>

        <h2>2. Acceptance of Terms</h2>
        <p>
          By creating an account, clicking “I agree,” or otherwise accessing or using the
          Service, you acknowledge that you have read, understood, and agree to these
          Terms and our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>3. Description of Service</h2>
        <p>
          Conard provides developer productivity tools and related features,
          including but not limited to content generation, workflow utilities, and
          integrations. We may update, modify, or discontinue features at any time with
          or without notice.
        </p>

        <h2>4. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activities under your account. You must promptly notify
          us of any unauthorized use. You must be at least 13 years old (or the age of
          digital consent in your jurisdiction) to use the Service.
        </p>

        <h2>5. Payment Terms</h2>
        <h3>Subscription billing</h3>
        <p>
          Paid plans are billed in advance on a recurring basis (e.g., monthly or
          annually) until canceled. You authorize us and our payment processor to charge
          your payment method for applicable fees, taxes, and any overage or add-on
          charges.
        </p>
        <h3>Refund policy (pro-rated if canceled)</h3>
        <p>
          You may cancel at any time, effective at the end of your current billing
          period. Upon cancellation, we will provide a pro‑rated refund for any unused
          portion of prepaid time, calculated from the effective cancellation date to the
          end of the prepaid period. Refunds are issued to the original payment method
          where possible.
        </p>
        <h3>Price changes notification</h3>
        <p>
          We may change prices for plans and features. Any change will take effect at the
          start of your next billing cycle, and we will provide reasonable prior notice by
          email or in‑app communication. Your continued use after the effective date
          constitutes acceptance of the new pricing.
        </p>

        <h2>6. User Conduct</h2>
        <h3>No abuse, hacking, or misuse</h3>
        <p>
          You agree not to misuse the Service, including without limitation: attempting to
          access non‑public areas, reverse engineering, interfering with or disrupting the
          integrity or performance of the Service, or using it to transmit unlawful,
          infringing, or harmful content.
        </p>
        <h3>Rate limits and fair use</h3>
        <p>
          We may impose rate limits, usage caps, or other fair‑use constraints to ensure
          reliability for all users. You agree not to circumvent such limits. Repeated or
          severe violations may result in suspension or termination.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          The Service, including its software, UI, and content, is owned by Context
          Wizard or its licensors and is protected by intellectual property laws. These
          Terms do not grant you any rights to trademarks, logos, or other brand features.
          You retain rights to content you submit, post, or generate, subject to the
          licenses necessary for operating the Service.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the Service is provided “as is” and
          “as available.” Conard and its affiliates will not be liable for any
          indirect, incidental, special, consequential, or exemplary damages, or for any
          loss of profits, revenues, data, or goodwill, arising from or related to your
          use of the Service, even if we have been advised of the possibility of such
          damages. Our total liability for any claim arising out of or relating to the
          Service is limited to the amount you paid to us for the Service in the twelve
          (12) months preceding the event giving rise to the claim.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. If changes are material, we will
          provide reasonable notice (e.g., by email or in‑app). Changes take effect upon
          posting unless otherwise stated. Your continued use of the Service after changes
          become effective constitutes acceptance of the updated Terms.
        </p>

        <h2>10. Contact Information</h2>
        <p>
          If you have questions about these Terms, please contact us at
          <a href="mailto:support@contextwizard.com">support@contextwizard.com</a>.
        </p>
      </article>

      <nav className="mt-12 flex items-center gap-6 text-sm">
        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}


