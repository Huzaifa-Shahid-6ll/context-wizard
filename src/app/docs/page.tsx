import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function DocsPage() {
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('docs_page_viewed'); 
  }, []);
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 text-center">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <div className="mb-4 flex justify-center">
          <BookOpen className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Documentation Coming Soon</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We're working on comprehensive documentation to help you get the most out of Context Wizard.
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert mx-auto">
        <p>
          In the meantime, you can:
        </p>
        <ul>
          <li>Use the dashboard tooltips for quick guidance</li>
          <li>Contact our support team for help</li>
          <li>Explore the features directly in the dashboard</li>
        </ul>
        <p>
          Our documentation will include step-by-step guides, API references, best practices, and troubleshooting tips.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="mailto:support@contextwizard.com">Contact Support</Link>
        </Button>
      </div>

      <nav className="mt-12 flex items-center justify-center gap-6 text-sm">
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}

