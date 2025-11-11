import Link from "next/link";
import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function BlogPage() {
  React.useEffect(() => { 
    initPostHog(); 
    trackEvent('blog_page_viewed'); 
  }, []);
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 text-center">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to Home</Link>
        </nav>
        <div className="mb-4 flex justify-center">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Blog Coming Soon</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'll be sharing AI coding tips, product updates, and developer stories soon.
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert mx-auto">
        <p>
          Our blog will feature:
        </p>
        <ul>
          <li>AI coding best practices and tips</li>
          <li>Product updates and new features</li>
          <li>Developer stories and case studies</li>
          <li>Tutorials and how-to guides</li>
          <li>Industry insights and trends</li>
        </ul>
        <p>
          Stay tuned for our first post!
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/">Get Started Free</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>

      <nav className="mt-12 flex items-center justify-center gap-6 text-sm">
        <Link href="/" className="hover:text-primary">Back to Home</Link>
      </nav>
    </div>
  );
}

