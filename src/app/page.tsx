"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import { initPostHog, trackEvent, trackAuth, trackGenerationEvent } from "@/lib/analytics";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileCode, BookOpen, Map, Layers, Code2, Sparkles, Brain, Download, ArrowRight, ChevronDown, Check, X, Gift, XCircle, ShieldCheck, Users, Video, Zap, Target, Lock, UserPlus, GitPullRequest, Bot, GitFork, Star, TrendingUp, Headphones, Award, Shield, Mail, MessageSquare, Calendar, Clock, User, Code, GitBranch, Workflow, Plug, DollarSign, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { StickyCtaBar } from "@/components/landing/StickyCtaBar";
import { BackToTop } from "@/components/landing/BackToTop";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { ReadingProgress } from "@/components/landing/ReadingProgress";
import { motion } from "framer-motion";


export default function Home() {
  React.useEffect(() => {
    initPostHog();
    trackEvent("landing_page_viewed");
  }, []);
  const previewAction = useAction(api.actions.previewGeneration);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  type PreviewResult = { repoName: string; techStack: string[]; files: { name: string; content: string }[] };
  const [result, setResult] = useState<PreviewResult | null>(null);

  const isValid = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i.test(url);

  async function onPreview() {
    trackEvent("hero_cta_clicked", { button_text: "Generate Context Files" });
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

  const faqItems = [
    {
      question: "Does this work with private repositories?",
      answer:
        "Yes! Pro users can analyze private repositories by connecting their GitHub account. Free tier users can analyze public repositories without authentication. Your code is processed securely and we never store your source code—only the generated context files.",
    },
    {
      question: "Do I need to know how to code?",
      answer:
        "Not at all! Context Wizard is designed to work for everyone. You just need to paste your GitHub repository URL, and our AI does the rest. The generated context files help both experienced developers and beginners work better with AI coding assistants like Cursor.",
    },
    {
      question: "What if my repo is huge/complex?",
      answer:
        "Context Wizard handles repositories of all sizes efficiently. Our AI analyzes your repository structure, dependencies, and key patterns to generate comprehensive context files. For very large repositories, Pro users get priority processing. If you have concerns about a specific repository, contact us at support@contextwizard.com.",
    },
    {
      question: "Can I use this with Windsurf/other tools?",
      answer:
        "Absolutely! Context Wizard files work with all major AI coding assistants including Cursor, Windsurf, GitHub Copilot, Codeium, Tabnine, and any IDE that supports .cursorrules files. The markdown documentation files are also helpful for onboarding new developers to your project.",
    },
    {
      question: "How is this different from just using Cursor?",
      answer:
        "Cursor alone doesn't understand your project structure, coding conventions, or architecture. Context Wizard analyzes your entire codebase and generates .cursorrules and documentation files that teach Cursor exactly how your project works. This means Cursor generates code that matches your style, uses correct dependencies, and follows your patterns—instead of generic code that doesn't fit.",
    },
    {
      question: "What context files does Context Wizard generate?",
      answer:
        "We generate 6+ essential files including .cursorrules (AI coding guidelines), PROJECT_OVERVIEW.md (project description), ARCHITECTURE.md (folder structure), STACK.md (tech stack documentation), CONVENTIONS.md (coding patterns), and ERROR_FIXES.md (common issues and solutions). Each file is tailored to your specific tech stack and project structure.",
    },
    {
      question: "How does Context Wizard analyze my repository?",
      answer:
        "Our AI analyzes your repository structure, package.json dependencies, README files, code patterns, and framework configurations. We use GPT-4o and Claude 3.5 Sonnet to understand your codebase and generate accurate, helpful context files that make AI coding assistants work better.",
    },
    {
      question: "What{'\''}s the difference between Free and Pro plans?",
      answer:
        "Free plan includes 5 generations per day for public repositories. Pro plan ($9/month) offers unlimited generations, private repository support, priority processing (3x faster), access to premium AI models, and advanced features like custom prompt templates and team collaboration (coming soon).",
    },
    {
      question: "How accurate are the generated context files?",
      answer:
        "Our AI achieves 95%+ accuracy in detecting tech stacks and coding patterns. However, we always recommend reviewing the generated files before using them in production. You can easily edit any file to match your team{'\''}s specific preferences.",
    },
    {
      question: "Can I customize the generated files?",
      answer:
        "Absolutely! All generated files are plain text (markdown and rules files) that you can edit with any text editor. Pro users also get access to custom templates where you can define your team{'\''}s specific coding standards and have them automatically included in all generations.",
    },
    {
      question: "Do you store my code or repository data?",
      answer:
        "No. We only read your repository metadata (file structure, package.json, README) to generate context files. We don't store your source code. Generated context files are saved to your account for 30 days (Free) or forever (Pro) so you can re-download them anytime.",
    },
    {
      question: "What if Context Wizard doesn't support my tech stack?",
      answer:
        "We support 50+ frameworks and languages including React, Next.js, Vue, Python, Node.js, Go, Rust, and more. If we don't support your stack yet, contact us at support@contextwizard.com and we'll prioritize adding it. Pro users can also use custom prompts to guide generation for any tech stack.",
    },
    {
      question: "Can I use Context Wizard for commercial projects?",
      answer:
        "Yes! Both Free and Pro plans allow commercial use. The generated context files become part of your project and you have full rights to use, modify, and distribute them. We only ask that you don't resell the context generation service itself.",
    },
    {
      question: "How do I cancel my Pro subscription?",
      answer:
        "You can cancel anytime from your dashboard → Billing. Your Pro access continues until the end of your billing period, and you can re-subscribe anytime without losing your generation history.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for Pro subscriptions. If you're not satisfied, email support@contextwizard.com within 30 days of your purchase for a full refund.",
    },
  ] as const;

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Context Wizard',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '500',
    },
    operatingSystem: 'Web',
    description: 'Generate perfect context files from GitHub repositories for AI coding assistants',
  };

  return (
    <div className="min-h-screen w-full">
      <ReadingProgress />
      <Navbar />
      <StickyCtaBar />
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden depth-base pt-16">
        {/* Animated gradient background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse shadow-depth-lg" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse shadow-depth-lg" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* layered top inner highlight and bottom drop shadow */}
        <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-black/20 after:blur-3xl after:content-['']" />



        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          {/* Social Proof Bar */}
          <div className="mb-6 overflow-x-auto">
            <div className="inline-flex items-center gap-2 rounded-full depth-layer-2 shadow-depth-sm border-0 px-4 py-2 text-sm font-medium text-foreground/80 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <span>4.9/5 from 500+ developers</span>
              <span className="text-foreground/50">|</span>
              <span className="text-primary">#1 Product of the Day on Product Hunt</span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center rounded-full depth-layer-3 shadow-depth-md text-shadow-sm hover-lift border-0 px-4 py-1 text-sm font-medium text-foreground">
            Free • No Credit Card • Instant Results
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary text-shadow-md">
            Stop Getting Garbage Code from AI Tools
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl font-normal text-foreground/60 text-shadow-sm">
            AI coding tools fail because they don{'\''}t understand your project. Context Wizard analyzes any GitHub repo and generates the perfect .cursorrules and documentation files—so Cursor actually works.
          </p>

          {/* Two-column feature comparison */}
          <div className="mx-auto mt-10 max-w-5xl">
            {/* Comparison Label */}
            <p className="mb-4 text-sm font-medium text-foreground/70">Same Prompt, Different Results</p>
            
            {/* Desktop: Side-by-side, Mobile: Tabs */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              <div className="rounded-xl depth-layer-1 shadow-inset p-6 border border-destructive/20">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-destructive" />
                  <span className="font-semibold text-destructive">Without Context</span>
                </div>
                <div className="mt-4 overflow-hidden rounded-lg">
                  <Image src="/window.svg" alt="Messy code example" width={800} height={480} className="h-auto w-full" />
                </div>
              </div>
              <div className="rounded-xl depth-layer-3 shadow-depth-lg hover-lift p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">With Context</span>
                </div>
                <div className="mt-4 overflow-hidden rounded-lg">
                  <Image src="/file.svg" alt="Clean code example" width={800} height={480} className="h-auto w-full" />
                </div>
              </div>
            </div>

            {/* Mobile: Tabs */}
            <div className="md:hidden">
              <Tabs defaultValue="without" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="without" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Without Context
                  </TabsTrigger>
                  <TabsTrigger value="with" className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    With Context
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="without" className="mt-0">
                  <div className="rounded-xl depth-layer-1 shadow-inset p-6 border border-destructive/20">
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image src="/window.svg" alt="Messy code example" width={800} height={480} className="h-auto w-full" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="with" className="mt-0">
                  <div className="rounded-xl depth-layer-3 shadow-depth-lg p-6 border border-primary/20">
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image src="/file.svg" alt="Clean code example" width={800} height={480} className="h-auto w-full" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Check className="h-3 w-3 mr-1" />
              Free to try
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Check className="h-3 w-3 mr-1" />
              No credit card
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Check className="h-3 w-3 mr-1" />
              1,247+ repos analyzed
            </Badge>
          </div>

          {/* URL input + CTA */}
          <div className="mx-auto mt-6 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/your-username/your-repo"
              className="h-14 sm:h-16 rounded-lg depth-layer-1 shadow-inset border-0 px-4 text-base focus:depth-layer-2 focus:shadow-depth-sm transition-all duration-200"
            />
            <Button
              onClick={onPreview}
              disabled={!isValid || loading}
              className="h-14 sm:h-16 rounded-lg px-8 text-base sm:text-lg font-semibold depth-top shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
            >
              {loading ? "Generating..." : "Analyze My Repo — Free"}
            </Button>
          </div>
          
          {/* Helper text below input */}
          <p className="mt-3 text-sm text-foreground/60">
            <Check className="h-3 w-3 inline mr-1" />
            Works with public and private repos (with token)
          </p>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Risk Reversal Text */}
          <p className="mt-3 text-sm text-foreground/60">
            No signup required for preview | See results before committing
          </p>

          {/* Auth hint - Simplified and less prominent */}
          <div className="mt-6">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-sm text-foreground/60 hover:text-foreground" onClick={() => trackAuth("signin_button_clicked", { location: "landing_auth_hint" })}>
                  Sign in to save/download
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span className="text-sm text-foreground/60">You are signed in.</span>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL PROOF BAR (Immediate Trust) */}
      <section className="w-full bg-muted/20 py-6 border-y border-border/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Trusted by developers at:</span>
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              {/* Placeholder for company logos - replace with actual logos */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border/40 whitespace-nowrap">
                <span className="text-xs font-semibold text-foreground/70">Company Logo</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border/40 whitespace-nowrap">
                <span className="text-xs font-semibold text-foreground/70">Company Logo</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border/40 whitespace-nowrap">
                <span className="text-xs font-semibold text-foreground/70">Company Logo</span>
              </div>
            </div>
            <span className="hidden sm:inline text-foreground/50">|</span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="font-medium text-foreground">1,247 repos analyzed</span>
              <span className="text-foreground/50">•</span>
              <span className="font-medium text-foreground">12,583 context files generated</span>
              <span className="text-foreground/50">•</span>
              <span className="font-medium text-foreground">847 developers building better</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE PROBLEM (Emotional Connection) */}
      <ScrollReveal>
      <section id="problem" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-primary text-shadow-md">
          Why AI Coding Tools Keep Failing You
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Every developer knows the frustration. Here{'\''}s what{'\''}s really going wrong.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Column 1: Broken Code */}
          <Card className="depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="depth-layer-3 shadow-depth-sm w-12 h-12 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-shadow-sm">Cursor Generates Broken Code</h3>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              You paste a prompt and get code that doesn{'\''}t match your project structure, uses wrong dependencies, or completely misses your architecture.
            </p>
          </Card>

          {/* Column 2: Hours Wasted */}
          <Card className="depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="depth-layer-3 shadow-depth-sm w-12 h-12 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-shadow-sm">Hours Wasted on Setup</h3>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              Every new project means manually writing .cursorrules, creating documentation, and explaining your codebase to AI—over and over again.
            </p>
          </Card>

          {/* Column 3: Burning Credits */}
          <Card className="depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="depth-layer-3 shadow-depth-sm w-12 h-12 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-shadow-sm">Burning API Credits</h3>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              Bad context means more back-and-forth, more regenerations, and hundreds of wasted tokens trying to get AI to understand your project.
            </p>
          </Card>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 4: THE SOLUTION (How It Works - Visual) */}
      <ScrollReveal>
      <section 
        id="how-it-works" 
        className="max-w-7xl mx-auto px-4 py-16"
      >
        <h2 
          className="text-3xl sm:text-4xl font-bold text-center mb-4 text-primary
            text-shadow-md"
        >
          How Context Wizard Fixes This in 30 Seconds
        </h2>
        <p className="text-muted-foreground text-center mb-12 text-base">A simple 3-step process that transforms your AI coding experience</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <Card 
            className="relative
              depth-layer-2
              shadow-depth-sm
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden"
          >
            <div 
              className="absolute top-4 left-4
                bg-primary/10
                w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-semibold
                text-primary"
            >
              1
            </div>
            <div
              className="bg-muted/30
                rounded-lg h-40
                flex items-center justify-center
                mb-4"
            >
              <FileCode className="h-14 w-14 text-muted-foreground" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                Paste Your GitHub URL
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Public or private repo—we analyze your entire project structure, dependencies, and code patterns.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card 
            className="relative
              depth-layer-2
              shadow-depth-sm
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden"
          >
            <div 
              className="absolute top-4 left-4
                bg-primary/10
                w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-semibold
                text-primary"
            >
              2
            </div>
            <div
              className="bg-muted/30
                rounded-lg h-40
                flex items-center justify-center
                mb-4"
            >
              <Brain className="h-14 w-14 text-muted-foreground animate-pulse" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                AI Analyzes Your Codebase
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our AI detects your tech stack, coding conventions, architecture patterns, and generates optimized context.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card 
            className="relative
              depth-layer-2
              shadow-depth-sm
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden"
          >
            <div 
              className="absolute top-4 left-4
                bg-primary/10
                w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-semibold
                text-primary"
            >
              3
            </div>
            <div
              className="bg-muted/30
                rounded-lg h-40
                flex items-center justify-center
                mb-4"
            >
              <Download className="h-14 w-14 text-muted-foreground" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                Download Perfect Context Files
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                .cursorrules, PROJECT_OVERVIEW.md, ARCHITECTURE.md, and more—ready to drop into your project.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Helper text consolidated */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Works with GitHub, GitLab, and Bitbucket • Average generation time: 15-30 seconds • Includes 6+ essential context files
        </p>

        {/* Video Demo Embed */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-xl border-2 border-border bg-gradient-to-br from-muted to-muted/50 shadow-2xl overflow-hidden">
            {/* Placeholder for video - replace with actual embed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Video className="h-24 w-24 text-muted-foreground mb-4" />
              <div className="text-xl font-semibold">See Context Wizard in Action</div>
              <div className="text-sm text-muted-foreground mt-2">Watch how easy it is to generate perfect context files</div>
              
              {/* Play button overlay */}
              <button
                aria-label="Play video"
                className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors grid place-items-center animate-pulse"
                onClick={() => {
                  trackEvent("demo_video_played", { section: "solution" });
                }}
              >
                <Video className="h-10 w-10 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      
      
      {result && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-shadow-sm">Preview: {result.repoName}</h2>
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

      {/* SECTION 5: BEFORE/AFTER (Proof It Works) */}
      <ScrollReveal>
      <section id="before-after" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-primary mb-4 text-shadow-md">
          See The Difference Context Makes
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-base max-w-2xl mx-auto">
          Same prompt, completely different results. See why context files matter.
        </p>
        
        {/* Desktop: Side-by-side, Mobile: Tabs */}
        <div className="hidden md:grid grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Before */}
          <Card className="depth-layer-2 shadow-depth-md border-0 p-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl font-semibold text-destructive">Without Context Files</CardTitle>
            </div>
            <div className="rounded-lg depth-layer-1 shadow-inset p-4 mb-4">
              <Image src="/window.svg" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
            <p className="text-sm text-muted-foreground text-center">32 lines of bugs, wrong dependencies, doesn{'\''}t run</p>
          </Card>

          {/* After */}
          <Card className="depth-layer-3 shadow-depth-lg border-0 p-6 hover-lift">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold text-primary">With Context Files</CardTitle>
            </div>
            <div className="rounded-lg depth-layer-3 shadow-depth-sm p-4 mb-4">
              <Image src="/file.svg" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
            <p className="text-sm font-medium text-primary text-center">Production-ready code, correct patterns, works first try</p>
          </Card>
        </div>

        {/* Mobile: Tabs */}
        <div className="md:hidden mb-8">
          <Tabs defaultValue="before" className="w-full">
            <TabsList className="w-full mb-4 h-12">
              <TabsTrigger value="before" className="flex-1 text-base">
                <X className="h-4 w-4 mr-2" />
                Without Context
              </TabsTrigger>
              <TabsTrigger value="after" className="flex-1 text-base">
                <Check className="h-4 w-4 mr-2" />
                With Context
              </TabsTrigger>
            </TabsList>
            <TabsContent value="before" className="mt-0">
              <Card className="depth-layer-2 shadow-depth-md border-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-xl font-semibold text-destructive">Without Context Files</CardTitle>
                </div>
                <div className="rounded-lg depth-layer-1 shadow-inset p-4 mb-4">
                  <Image src="/window.svg" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                </div>
                <p className="text-sm text-muted-foreground text-center">32 lines of bugs, wrong dependencies, doesn{'\''}t run</p>
              </Card>
            </TabsContent>
            <TabsContent value="after" className="mt-0">
              <Card className="depth-layer-3 shadow-depth-lg border-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl font-semibold text-primary">With Context Files</CardTitle>
                </div>
                <div className="rounded-lg depth-layer-3 shadow-depth-sm p-4 mb-4">
                  <Image src="/file.svg" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                </div>
                <p className="text-sm font-medium text-primary text-center">Production-ready code, correct patterns, works first try</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <SignUpButton mode="modal">
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-semibold shadow-depth-lg hover:shadow-elevated"
              onClick={() => {
                trackEvent("before_after_cta_clicked", { button_text: "Try It Free on Your Repo" });
                const el = document.querySelector('input[type="url"]') as HTMLInputElement | null;
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.focus();
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              Try It Free on Your Repo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 6: TESTIMONIALS (Trust - High Up!) */}
      <ScrollReveal>
      <section id="testimonials" className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Section Header with Highlight */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="bg-primary/20 px-3 py-1 rounded">WORLD-CLASS</span> CUSTOMER SUPPORT
            </h2>
            <p className="text-muted-foreground text-sm">
              Don{'\''}t just take our word for it. Our A-team gets tons of praise.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { 
                initials: "JD", 
                bg: "bg-blue-500", 
                quote: "I've been using BluE for 7 months now. Trust my notice all I get paid and support is <mark>excellent</mark>. I contacted human support 3 times, and their support was very <mark>quick to respond</mark> (that drives you crazy with the website itself has made the minimum needed a virtual tool drives you crazy).", 
                name: "Lindy", 
                source: "Trustpilot", 
                date: "2 weeks ago" 
              },
              { 
                initials: "MS", 
                bg: "bg-green-500", 
                quote: "I start out using BluE as a freelancer, it was <mark>easy to use</mark>. Recently I started my own company and I now use BluE as a business to work with my contractors, freelancers and employees. I love how easy it is to <mark>transfer or withdraw</mark> service when I had any questions about the transfers or withdrawals.", 
                name: "Anne", 
                source: "Trustpilot", 
                date: "1 month ago" 
              },
              { 
                initials: "AL", 
                bg: "bg-purple-500", 
                quote: "I have been using Cursor for 5+ years now. I find the pleasure of using BluE for their <mark>excellent communication capabilities</mark> facilitated by the staff.", 
                name: "Rosalie", 
                source: "Trustpilot", 
                date: "3 weeks ago" 
              },
              { 
                initials: "SK", 
                bg: "bg-amber-500", 
                quote: "The .cursorrules files are <mark>game-changing</mark>. Cursor now generates code that matches our style guide perfectly. <mark>No more manual corrections!</mark>", 
                name: "Sarah Kim", 
                source: "Product Hunt", 
                date: "2 weeks ago" 
              },
            ].map((t, idx) => (
              <Card 
                key={idx}
                className="p-4 rounded-lg bg-card border border-border/40 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-full ${t.bg} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p 
                  className="text-sm leading-relaxed mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: t.quote.replace(
                      /<mark>/g, 
                      '<mark class="bg-primary/20 px-1 rounded">'
                    )
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {t.source} • {t.date}
                </p>
              </Card>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <span className="text-sm text-muted-foreground">stars out of 5</span>
            </div>
            <span className="text-muted-foreground/40">|</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">3 minutes</div>
                <div className="text-xs text-muted-foreground">avg. response time</div>
              </div>
            </div>
            <span className="text-muted-foreground/40">|</span>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => trackEvent('trustpilot_clicked')}
            >
              See 275+ reviews on Trustpilot
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 7: FEATURES (What You Get - Benefit-Focused) */}
      <ScrollReveal>
      <section 
        id="features" 
        className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24
          depth-layer-1
          border-y border-border/20"
      >
        <h2 
          className="text-center text-3xl sm:text-4xl font-bold text-primary
            text-shadow-md
            tracking-tight"
        >
          Everything You Need to Build Better with AI
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70 text-base">Six powerful benefits that transform how you work with AI coding assistants.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: FileCode, title: "Never Write .cursorrules Again", desc: "Automatically generates Cursor configuration based on your tech stack, coding style, and project needs." },
            { icon: BookOpen, title: "Instant Project Documentation", desc: "Get comprehensive project documentation that helps new developers understand your codebase in minutes, not days." },
            { icon: Map, title: "Architecture Understanding Out of Box", desc: "Visualize your project structure, data flows, and key boundaries—all automatically detected and documented." },
            { icon: Layers, title: "Tech Stack Best Practices Included", desc: "Frameworks, libraries, versions, and how they fit together—with best practices tailored to your specific setup." },
            { icon: Code2, title: "Code Convention Detection", desc: "Automatically detects and codifies your naming patterns, file organization, and API usage conventions." },
            { icon: Sparkles, title: "Error Prevention Built-In", desc: "Opinionated guidance tuned to your repo's constraints helps prevent common mistakes before they happen." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="group"
              onClick={() => trackEvent("feature_card_clicked", { feature_name: title })}
            >
              <Card 
                className="depth-layer-2
                  shadow-depth-md
                  border-0
                  hover:depth-layer-3
                  hover:shadow-elevated
                  transition-all duration-300
                  overflow-hidden
                  h-full"
              >
                <CardHeader>
                  <div
                    className="depth-layer-3
                      w-12 h-12 rounded-lg
                      shadow-depth-sm
                      flex items-center justify-center
                      group-hover:shadow-depth-md
                      transition-all duration-300"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle
                    className="text-xl font-semibold mt-4
                      text-shadow-sm
                      group-hover:text-primary
                      transition-colors"
                  >
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 8: USE CASES (Who This Is For) */}
      <ScrollReveal>
      <section 
        id="use-cases"
        className="depth-layer-1"
      >
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-center mb-4 text-primary
              text-shadow-md"
          >
            Perfect For Every Developer
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-base">Find your perfect fit—from solo developers to enterprise teams</p>

          {/* Primary: Vibe Coders (40% size) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <Card className="lg:col-span-2 depth-layer-2 shadow-depth-lg border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="depth-layer-3 shadow-depth-sm w-12 h-12 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Vibe Coders</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-base">Using Cursor but getting frustrated with bad results</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">Get production-ready code instead of broken demos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">Stop wasting time fixing AI mistakes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">Build 10x faster with proper context</span>
                </li>
              </ul>
            </Card>

            {/* Secondary cards (20% each) */}
            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Experienced Developers</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Want to automate context setup completely</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Eliminate hours of manual documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Onboard new projects in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Scale your AI-assisted workflow</span>
                </li>
              </ul>
            </Card>

            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <GitFork className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Open Source Maintainers</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Need better project documentation</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Auto-generate comprehensive docs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Help contributors understand codebase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Increase contribution quality</span>
                </li>
              </ul>
            </Card>

            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Teams & Agencies</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Standardize AI context across projects</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Consistent code quality across team</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Faster onboarding for new developers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Better collaboration with AI tools</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 9: THE INNOVATION (Cursor Prompt Builder) */}
      <ScrollReveal>
      <section id="innovation" className="max-w-7xl mx-auto px-4 py-20 bg-muted/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 text-shadow-md">
            Go Beyond Context Files—Build Entire Apps
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            The only tool that generates complete Cursor prompts for building full applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Visual/Screenshot */}
          <div className="order-2 lg:order-1">
            <Card className="depth-layer-2 shadow-depth-lg border-0 p-6">
              <div className="rounded-lg depth-layer-1 shadow-inset h-96 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center">
                  <Workflow className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Cursor Builder Screenshot</p>
                  <p className="text-xs text-muted-foreground mt-2">10-step wizard interface</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Benefits */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-6 text-primary">The Only Tool That Generates Complete Cursor Prompts</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">Not just context—get step-by-step prompts for building features</p>
                  <p className="text-sm text-muted-foreground mt-1">Works for portfolio sites, e-commerce, SaaS, and more</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">Even non-developers can build with AI</p>
                  <p className="text-sm text-muted-foreground mt-1">Guided prompts make complex apps accessible to everyone</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">Includes error handling, best practices, and architecture guidance</p>
                  <p className="text-sm text-muted-foreground mt-1">Production-ready prompts from day one</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">10-step wizard guides you through every aspect</p>
                  <p className="text-sm text-muted-foreground mt-1">From project setup to deployment—all covered</p>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
                <Link href="/dashboard/cursor-builder" onClick={() => trackEvent("cursor_builder_cta_clicked", { location: "innovation_section" })}>
                  Try Cursor Builder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>



      {/* SECTION 11: FAQ (Objection Handling) */}
      <section id="faq" aria-labelledby="faq-heading" className="bg-background">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 id="faq-heading" className="text-4xl font-bold text-center mb-4 text-shadow-sm">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-center mb-12">Everything you need to know about Context Wizard</p>
          <Accordion type="single" collapsible aria-label="Frequently Asked Questions">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger onClick={() => trackEvent('faq_item_clicked', { question_id: item.question })}>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-12">
            <p className="mb-4">Still have questions?</p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <a href="mailto:support@contextwizard.com">Contact Support</a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://discord.gg/your-discord-link">Join Discord Community</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA (Strong Close) */}
      <ScrollReveal>
      <section className="relative max-w-7xl mx-auto px-4 py-20 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary text-shadow-md">
            Ready to Stop Fighting with AI Tools?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 1,247+ developers generating perfect context in seconds.
          </p>

          {/* Large CTA */}
          <div className="mb-8">
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-semibold shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
                onClick={() => trackEvent('final_cta_clicked', { location: 'final_cta_section' })}
              >
                Start Free—No Credit Card Required
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </SignUpButton>
          </div>

          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">1,247+ repos analyzed</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">12,583 context files generated</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">847 developers building better</span>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <Footer />
      <BackToTop />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
