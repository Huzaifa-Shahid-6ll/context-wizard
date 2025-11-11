import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function TutorialsPage() {
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('tutorials_page_viewed'); 
  }, []);
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 text-center">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <div className="mb-4 flex justify-center">
          <GraduationCap className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Tutorials Coming Soon</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Step-by-step guides for mastering Context Wizard.
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert mx-auto">
        <p>
          Our tutorials will cover:
        </p>
        <ul>
          <li>Getting started with Context Wizard</li>
          <li>Creating effective prompts</li>
          <li>Advanced features and workflows</li>
          <li>Best practices and tips</li>
          <li>Integration guides</li>
        </ul>
        <p>
          In the meantime, explore the dashboard and try out the features!
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/dashboard">Explore Dashboard</Link>
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

