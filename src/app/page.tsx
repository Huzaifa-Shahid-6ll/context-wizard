"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, BookOpen, Map, Layers, Code2, Sparkles } from "lucide-react";

const showcaseExamples: {
  title: string;
  before: string;
  after: string;
  beforeMetric: string;
  afterMetric: string;
}[] = [
  {
    title: "React Component Generation",
    before: `function fetchData() {
  // Fetch data from API
  // Process data
  // Update state
}`,
    after: `import { useEffect, useState } from 'react';

function useFetchData(url: string) {
  const [data, setData] = useState<unknown | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const response = await fetch(url);
      const result = await response.json();
      if (isMounted) setData(result);
    }
    fetchData();
    return () => { isMounted = false };
  }, [url]);

  return data;
}`,
    beforeMetric: "32 lines of bugs",
    afterMetric: "Clean, production-ready",
  },
  {
    title: "API Route Creation",
    before: `app.get('/data', (req, res) => {
  // Fetch data from database
  // Send response
});`,
    after: `import express from 'express';
import { getData } from './controllers/dataController';

const router = express.Router();

router.get('/data', getData);

export default router;`,
    beforeMetric: "Unstructured handlers",
    afterMetric: "Typed, modular routing",
  },
  {
    title: "Database Schema Design",
    before: `const User = {
  name: String,
  email: String,
  password: String,
  // Additional fields
};`,
    after: `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);`,
    beforeMetric: "Missing constraints",
    afterMetric: "Validated, indexed fields",
  },
];

function highlightSimple(code: string): string {
  // Extremely lightweight highlighting for demo purposes
  return code
    .replace(/\b(import|from|export|default|function|const|let|return|async|await|useEffect|useState|new|class|extends|interface|type|if|else|for|while|switch|case|break)\b/g, '<span class="text-emerald-400">$1<\/span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-sky-400">$1<\/span>')
    .replace(/(['\"])\b([^\1]*?)\1/g, '<span class="text-amber-300">$1$2$1<\/span>');
}

export default function Home() {
  const previewAction = useAction(api.actions.previewGeneration);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  type PreviewResult = { repoName: string; techStack: string[]; files: { name: string; content: string }[] };
  const [result, setResult] = useState<PreviewResult | null>(null);

  const isValid = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i.test(url);

  async function onPreview() {
    setError(null);
    setResult(null);
    if (!isValid) {
      setError("Enter a valid GitHub repo URL (github.com/owner/repo)");
      return;
    }
    try {
      setLoading(true);
      const data = await previewAction({ repoUrl: url });
      setResult(data as PreviewResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to preview repository");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-background to-card">
        {/* layered top inner highlight and bottom drop shadow */}
        <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-black/20 after:blur-3xl after:content-['']" />

        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-secondary/60 px-4 py-1 text-sm font-medium text-foreground shadow-inner ring-1 ring-white/10">
            Free • No Credit Card • Instant Results
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-primary">
            Stop Fighting Cursor with Bad Context
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-2xl text-xl font-normal text-foreground/60">
            Generate perfect context files from any GitHub repo in 30 seconds
          </p>

          {/* Two-column feature comparison */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-secondary/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-border backdrop-blur-[2px]">
              <h3 className="text-left text-lg font-semibold text-primary">❌ Without Context</h3>
              <div className="mt-4 overflow-hidden rounded-lg">
                <Image src="/window.svg" alt="Messy code example" width={800} height={480} className="h-auto w-full" />
              </div>
            </div>
            <div className="rounded-xl bg-secondary/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-border backdrop-blur-[2px]">
              <h3 className="text-left text-lg font-semibold text-primary">✅ With Context</h3>
              <div className="mt-4 overflow-hidden rounded-lg">
                <Image src="/file.svg" alt="Clean code example" width={800} height={480} className="h-auto w-full" />
              </div>
            </div>
          </div>

          {/* URL input + CTA */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="h-12 rounded-lg border border-transparent bg-secondary/40 px-4 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus-visible:border-ring"
            />
            <Button
              onClick={onPreview}
              disabled={!isValid || loading}
              className="h-12 rounded-lg px-6 shadow-lg transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl"
            >
              {loading ? "Generating..." : "Generate Context Files"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Small text */}
          <p className="mt-3 text-sm text-foreground/60">No signup required for preview</p>

          {/* Auth hint */}
          <div className="mt-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="rounded-md">Sign in to save/download</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span className="text-sm text-foreground/60">You are signed in.</span>
            </SignedIn>
          </div>
        </div>
      </section>

      {result && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Preview: {result.repoName}</h2>
            <button className="rounded border px-3 py-1">Sign up to download</button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Detected stack: {result.techStack.join(", ") || "Unknown"}</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium">Files</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {result.files.map(f => (
                  <li key={f.name} className="rounded border px-3 py-2">{f.name}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border p-3">
              <h3 className="font-medium">Preview</h3>
              <pre className="mt-2 max-h-[420px] overflow-auto text-sm whitespace-pre-wrap">{result.files[0]?.content || "Select a file to preview"}</pre>
            </div>
          </div>
        </section>
      )}

      {/* Showcase Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-primary">See The Difference Context Makes</h2>
        <div className="mt-10 space-y-10">
          {showcaseExamples.map((ex, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Before */}
              <Card className="group relative overflow-hidden rounded-xl bg-card shadow-[inset_0_16px_24px_rgba(0,0,0,0.10),inset_0_-10px_20px_rgba(255,255,255,0.40)] ring-1 ring-border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-left text-lg">{ex.title} - <span className="text-foreground/70">Before • Without Context</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/40 p-4 ring-1 ring-border">
                    <pre className="max-h-[300px] overflow-auto text-sm leading-relaxed text-foreground/70">
                      <code dangerouslySetInnerHTML={{ __html: highlightSimple(ex.before) }} />
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-foreground/70">{ex.beforeMetric}</div>
                </CardFooter>
              </Card>

              {/* After */}
              <Card className="group relative overflow-hidden rounded-xl bg-card shadow-[inset_0_16px_24px_rgba(0,0,0,0.10),inset_0_-10px_20px_rgba(255,255,255,0.50)] ring-1 ring-border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">
                {/* Subtle gradient overlay to draw attention */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10" />
                <CardHeader>
                  <CardTitle className="text-left text-lg">{ex.title} - <span className="text-primary">After • With Context</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-background p-4 ring-1 ring-border">
                    <pre className="max-h-[300px] overflow-auto text-sm leading-relaxed">
                      <code dangerouslySetInnerHTML={{ __html: highlightSimple(ex.after) }} />
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm font-medium text-primary">{ex.afterMetric}</div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get - Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-primary">What You Get</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">Six focused deliverables that make Cursor understand your repo instantly.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: FileCode, title: ".cursorrules Generator", desc: "Generate precise, repo-aware instructions for Cursor to follow." },
            { icon: BookOpen, title: "Project Documentation", desc: "Concise, actionable docs tailored to your codebase." },
            { icon: Map, title: "Architecture Maps", desc: "Visualize flows, ownership, and key boundaries at a glance." },
            { icon: Layers, title: "Tech Stack Guide", desc: "Frameworks, libraries, versions, and how they fit together." },
            { icon: Code2, title: "Code Conventions", desc: "Naming, patterns, file org, and API usage—codified." },
            { icon: Sparkles, title: "Best Practices", desc: "Opinionated guidance tuned to your repo’s constraints." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-xl bg-light shine-top ring-1 ring-border shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
              {/* Subtle vertical gradient to emphasize depth */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/5" />
              <CardHeader className="relative">
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-primary text-lg font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trusted By Developers */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl bg-secondary/40 p-8 ring-1 ring-border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] shine-top">
          <h2 className="text-center text-3xl font-bold text-primary">Trusted By Developers</h2>

          {/* Metrics */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-background p-6 ring-1 ring-border shadow-sm">
              <div className="text-[2.5rem] font-bold leading-tight text-primary">1,247</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-foreground/60">repos analyzed</div>
            </div>
            <div className="rounded-xl bg-background p-6 ring-1 ring-border shadow-sm">
              <div className="text-[2.5rem] font-bold leading-tight text-primary">12,583</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-foreground/60">context files generated</div>
            </div>
          </div>

          {/* Quotes */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1,2,3].map((q) => (
              <div key={q} className="rounded-xl bg-card p-5 ring-1 ring-border shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm leading-relaxed text-foreground/80">“This shaved hours off onboarding. Cursor finally ‘gets’ our code.”</p>
                <div className="mt-3 text-xs text-foreground/60">— Senior Engineer, Placeholder Inc.</div>
              </div>
            ))}
          </div>

          {/* Logo grid */}
          <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-6">
            {[
              { name: "React", src: "/next.svg" },
              { name: "Next.js", src: "/next.svg" },
              { name: "Python", src: "/vercel.svg" },
              { name: "Node.js", src: "/globe.svg" },
              { name: "TypeScript", src: "/file.svg" },
              { name: "Postgres", src: "/window.svg" },
            ].map(({ name, src }, idx) => (
              <div key={idx} className="flex items-center justify-center rounded-md bg-background p-4 ring-1 ring-border shadow-sm">
                <Image src={src} alt={name} width={80} height={24} className="opacity-70" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
