import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";

export default function CookiePolicyPage() {
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('cookies_page_viewed'); 
  }, []);
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: November 3, 2025</p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device when you visit our website.
          They help us provide, protect, and improve our services.
        </p>

        <h2>2. How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul>
          <li><strong>Authentication:</strong> To keep you signed in and remember your preferences</li>
          <li><strong>Analytics:</strong> To understand how you use our service and improve it</li>
          <li><strong>Security:</strong> To protect against fraud and abuse</li>
          <li><strong>Functionality:</strong> To remember your settings and preferences</li>
        </ul>

        <h2>3. Types of Cookies We Use</h2>
        
        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable core
          functionality such as security, network management, and accessibility.
        </p>
        <ul>
          <li><strong>Clerk:</strong> Authentication and session management</li>
        </ul>

        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting
          and reporting information anonymously.
        </p>
        <ul>
          <li><strong>PostHog:</strong> User analytics, feature usage tracking, and product insights</li>
        </ul>

        <h3>Payment Cookies</h3>
        <p>
          These cookies are used to process payments and manage subscriptions.
        </p>
        <ul>
          <li><strong>Stripe:</strong> Payment processing and subscription management</li>
        </ul>

        <h2>4. Third-Party Cookies</h2>
        <p>
          Some cookies are placed by third-party services that appear on our pages. We use:
        </p>
        <ul>
          <li><strong>Clerk</strong> for authentication</li>
          <li><strong>PostHog</strong> for analytics</li>
          <li><strong>Stripe</strong> for payment processing</li>
        </ul>
        <p>
          These third parties may use cookies to collect information about your online activities
          across different websites. You can learn more about their cookie practices by visiting
          their respective privacy policies.
        </p>

        <h2>5. Managing Cookies</h2>
        <p>
          You can control and manage cookies in various ways. Please keep in mind that removing
          or blocking cookies can impact your user experience and parts of our website may no
          longer be fully accessible.
        </p>
        <ul>
          <li>
            <strong>Browser settings:</strong> Most browsers allow you to refuse or accept cookies.
            You can also delete cookies that have already been set. Check your browser's help
            section for instructions.
          </li>
          <li>
            <strong>Opt-out tools:</strong> You can opt out of certain analytics cookies through
            your browser settings or by using browser extensions.
          </li>
        </ul>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. We will notify you of any changes
          by posting the new Cookie Policy on this page and updating the "Last Updated" date.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at
          <a href="mailto:privacy@contextwizard.com">privacy@contextwizard.com</a>.
        </p>
      </article>

      <nav className="mt-12 flex items-center gap-6 text-sm">
        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}

