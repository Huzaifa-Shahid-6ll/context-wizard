"use client";

import Link from "next/link";
import React, { useState } from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2 } from "@/lib/icons";
import { toast } from "sonner";

export default function ApiDocsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('api_docs_page_viewed'); 
  }, []);
  
  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    trackEvent('api_docs_waitlist_signup', { email });
    setSubmitted(true);
    toast.success('You\'ll be notified when the API is available!');
    setEmail("");
  };
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 text-center">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <div className="mb-4 flex justify-center">
          <Code2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">API Documentation Coming Soon</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Developer API access is coming soon. Join our waitlist to get early access.
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert mx-auto">
        <p>
          Our API will allow you to:
        </p>
        <ul>
          <li>Integrate Context Wizard into your own applications</li>
          <li>Automate prompt generation workflows</li>
          <li>Access advanced features programmatically</li>
          <li>Build custom integrations and tools</li>
        </ul>
      </div>

      {!submitted ? (
        <form onSubmit={handleNotify} className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit">Notify Me</Button>
        </form>
      ) : (
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Thanks! We'll notify you when the API is available.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
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

