"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";
import { initPostHog, trackEvent, trackAuth, trackGenerationEvent } from "@/lib/analytics";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileCode, BookOpen, Map, Layers, Code2, Sparkles, Brain, Download, ArrowRight, ChevronDown, Check, X, Gift, XCircle, ShieldCheck, Users, Video, Zap, Target, Lock, UserPlus, GitPullRequest, Bot, GitFork, Star, TrendingUp, Headphones, Award, Shield, Mail, MessageSquare, Calendar, Clock, User, Code, GitBranch, Workflow, Plug } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
      question: "Can I use Context Wizard with private repositories?",
      answer:
        "Yes! Pro users can analyze private repositories by connecting their GitHub account. Free tier users can analyze public repositories without authentication. Your code is processed securely and we never store your source code—only the generated context files.",
    },
    {
      question: "Which AI coding assistants work with these context files?",
      answer:
        "Context Wizard files work with all major AI coding assistants including Cursor, GitHub Copilot, Codeium, Tabnine, and any IDE that supports .cursorrules files. The markdown documentation files are also helpful for onboarding new developers to your project.",
    },
    {
      question: "What's the difference between Free and Pro plans?",
      answer:
        "Free plan includes 5 generations per day for public repositories. Pro plan ($9/month) offers unlimited generations, private repository support, priority processing (3x faster), access to premium AI models, and advanced features like custom prompt templates and team collaboration (coming soon).",
    },
    {
      question: "How accurate are the generated context files?",
      answer:
        "Our AI achieves 95%+ accuracy in detecting tech stacks and coding patterns. However, we always recommend reviewing the generated files before using them in production. You can easily edit any file to match your team's specific preferences.",
    },
    {
      question: "Can I customize the generated files?",
      answer:
        "Absolutely! All generated files are plain text (markdown and rules files) that you can edit with any text editor. Pro users also get access to custom templates where you can define your team's specific coding standards and have them automatically included in all generations.",
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
        "Yes, we offer a 7-day money-back guarantee for Pro subscriptions. If you're not satisfied, email support@contextwizard.com within 7 days of your purchase for a full refund.",
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

        {/* Top-right auth buttons */}
        <div className="absolute right-6 top-6 z-50 flex items-center gap-2">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button variant="outline" className="rounded_md" onClick={() => trackAuth("signup_button_clicked", { location: "navbar" })}>Sign up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button className="rounded_md" onClick={() => trackAuth("signin_button_clicked", { location: "navbar" })}>Sign in</Button>
            </SignInButton>
          </SignedOut>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full depth-layer-3 shadow-depth-md text-shadow-sm hover-lift border-0 px-4 py-1 text-sm font-medium text-foreground">
            Free • No Credit Card • Instant Results
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-primary text-shadow-md">
            Stop Fighting Cursor with Bad Context
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-2xl text-xl font-normal text-foreground/60 text-shadow-sm">
            Generate perfect context files from any GitHub repo in 30 seconds
          </p>

          {/* Two-column feature comparison */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
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

          {/* URL input + CTA */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="h-12 rounded-lg depth-layer-1 shadow-inset border-0 px-4 text-base focus:depth-layer-2 focus:shadow-depth-sm transition-all duration-200"
            />
            <Button
              onClick={onPreview}
              disabled={!isValid || loading}
              className="h-12 rounded-lg px-6 depth-top shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
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
                <Button variant="outline" className="rounded-md" onClick={() => trackAuth("signin_button_clicked", { location: "landing_auth_hint" })}>Sign in to save/download</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span className="text-sm text-foreground/60">You are signed in.</span>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Trust Badges and Metrics Section */}
      <ScrollReveal>
      <section 
        className="max-w-7xl mx-auto px-4 py-16
          depth-layer-1
          border-y border-border/20"
      >
        {/* Heading */}
        <h2 
          className="text-3xl font-bold text-center mb-12 text-shadow-sm
            text-shadow-md"
        >
          Trusted by Developers & Teams
        </h2>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Metric 1 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-md border-0 hover-lift">
            <Users className="h-8 w-8 text-primary mb-4" />
            <motion.div
              className="text-4xl font-bold text-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              2,500+
            </motion.div>
            <p className="text-lg">Active Developers</p>
            <p className="text-sm text-green-600">+150% this month</p>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-md border-0 hover-lift">
            <GitFork className="h-8 w-8 text-primary mb-4" />
            <motion.div
              className="text-4xl font-bold text-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              15,000+
            </motion.div>
            <p className="text-lg">Repositories Analyzed</p>
            <p className="text-sm text-muted-foreground">24/7 uptime</p>
          </div>

          {/* Metric 3 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-md border-0 hover-lift">
            <FileCode className="h-8 w-8 text-primary mb-4" />
            <motion.div
              className="text-4xl font-bold text-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              50,000+
            </motion.div>
            <p className="text-lg">Context Files Generated</p>
            <p className="text-sm text-green-600">95%+ accuracy</p>
          </div>

          {/* Metric 4 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-md border-0 hover-lift">
            <TrendingUp className="h-8 w-8 text-primary mb-4" />
            <motion.div
              className="text-4xl font-bold text-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              4.9/5
            </motion.div>
            <p className="text-lg">Average Rating</p>
            <p className="text-sm text-muted-foreground">500+ reviews</p>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {/* Badge 1 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">SOC 2 Compliant</p>
            <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Lock className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">GDPR Ready</p>
            <p className="text-sm text-muted-foreground">Data privacy compliant</p>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">99.9% Uptime</p>
            <p className="text-sm text-muted-foreground">Reliable infrastructure</p>
          </div>

          {/* Badge 4 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Headphones className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">24/7 Support</p>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>

          {/* Badge 5 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Award className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">Developer Approved</p>
            <p className="text-sm text-muted-foreground">Loved by 2,500+ devs</p>
          </div>

          {/* Badge 6 */}
          <div className="flex flex-col items-center text-center p-4 depth-layer-2 shadow-depth-sm border-0 hover-lift">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">Money-Back Guarantee</p>
            <p className="text-sm text-muted-foreground">7-day full refund</p>
          </div>
        </div>

        {/* Tech Stack Logos */}
        <h3 className="text-center mb-6">Works with your favorite tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {/* Cursor logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Cursor</span>
            {/* Replace with actual Cursor logo */}
          </div>

          {/* VS Code logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">VS Code</span>
            {/* Replace with actual VS Code logo */}
          </div>

          {/* GitHub Copilot logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Copilot</span>
            {/* Replace with actual GitHub Copilot logo */}
          </div>

          {/* Codeium logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Codeium</span>
            {/* Replace with actual Codeium logo */}
          </div>

          {/* React logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">React</span>
            {/* Replace with actual React logo */}
          </div>

          {/* Next.js logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Next.js</span>
            {/* Replace with actual Next.js logo */}
          </div>

          {/* Python logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Python</span>
            {/* Replace with actual Python logo */}
          </div>

          {/* Node.js logo placeholder */}
          <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 border border-border/40 rounded-lg hover:grayscale-0 transition-all">
            <span className="text-xs text-muted-foreground">Node.js</span>
            {/* Replace with actual Node.js logo */}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Testimonials - Carousel */}
      <ScrollReveal>
      <section className="bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-shadow-sm">Loved by Developers Worldwide</h2>
          <p className="text-muted-foreground text-center mb-12">See what developers are saying about Context Wizard</p>

          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            loop
            autoplay={{ delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
            onSlideChange={(swiper) => {
              trackEvent('testimonial_viewed', { testimonial_id: swiper.realIndex });
              trackEngagementEvent('social_proof_viewed', { testimonial_id: swiper.realIndex });
            }}
            breakpoints={{ 768: { slidesPerView: 2, spaceBetween: 16 }, 1024: { slidesPerView: 3, spaceBetween: 16 } }}
          >
            {[
              { initials: "JD", bg: "bg-blue-500", quote: "Context Wizard cut our onboarding time from 2 weeks to 2 days. New developers can jump right into any project with confidence.", name: "Jane Doe", title: "Engineering Manager", company: "TechCorp Inc." },
              { initials: "MS", bg: "bg-green-500", quote: "The .cursorrules files are game-changing. Cursor now generates code that matches our style guide perfectly. No more manual corrections!", name: "Michael Smith", title: "Senior Full-Stack Developer", company: "StartupXYZ" },
              { initials: "AL", bg: "bg-purple-500", quote: "As an open source maintainer, Context Wizard helped me document my project properly. Contributions increased 300% in the first month!", name: "Alex Lee", title: "Open Source Maintainer", company: "GitHub" },
              { initials: "SK", bg: "bg-amber-500", quote: "Best $9/month I spend. The time I save on documentation alone pays for itself 10x over. Highly recommended for any team.", name: "Sarah Kim", title: "Tech Lead", company: "DevShop" },
              { initials: "RC", bg: "bg-pink-500", quote: "I was skeptical at first, but after trying it on one project, I now use it for everything. The AI really understands code architecture.", name: "Robert Chen", title: "Freelance Developer", company: "Independent" },
              { initials: "EP", bg: "bg-teal-500", quote: "Finally, a tool that makes AI coding assistants actually useful. Context Wizard is now part of our standard development setup.", name: "Emily Park", title: "CTO", company: "BuildFast AI" },
            ].map((t, idx) => (
              <SwiperSlide key={idx}>
                <Card 
                  className="p-6 rounded-xl
                    depth-layer-2
                    shadow-depth-lg
                    border-0
                    h-full"
                >
                  <div className="flex items-center gap-3">
                    {/* Replace with real photo when available */}
                    <div className={`h-12 w-12 rounded-full ${t.bg} text-white flex items-center justify-center font-bold`}>{t.initials}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.title} • {t.company}</div>
                    </div>
                  </div>
                  <p className="text-lg mt-4 mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="text-yellow-500 flex items-center gap-1" aria-label="5 star rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="text-center mt-10">
            <Button asChild>
              <a href="mailto:reviews@contextwizard.com">Leave a Review</a>
            </Button>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Integrations Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-background">
        <h2 className="text-4xl font-bold text-center mb-4 text-shadow-sm">Seamless Integration with Your Workflow</h2>
        <p className="text-muted-foreground text-center mb-12">Works with the tools you already use</p>

        <Tabs defaultValue="ai-assistants" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="ai-assistants" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistants</span>
              </TabsTrigger>
              <TabsTrigger value="version-control" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">Version Control</span>
              </TabsTrigger>
              <TabsTrigger value="dev-tools" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span className="hidden sm:inline">Dev Tools</span>
              </TabsTrigger>
              <TabsTrigger value="cicd" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                <span className="hidden sm:inline">CI/CD</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AI Coding Assistants Tab */}
          <TabsContent value="ai-assistants">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cursor */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card 
                  className="depth-layer-2
                    shadow-depth-md
                    border-0
                    hover:depth-layer-3
                    hover:shadow-elevated
                    p-6 rounded-xl
                    transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="h-16 w-16 rounded-lg
                        depth-layer-3
                        shadow-depth-sm
                        flex items-center justify-center"
                    >
                      <span className="text-sm font-semibold text-primary">Cursor</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Cursor</h3>
                      <span 
                        className="depth-layer-3
                          shadow-depth-sm
                          border-0
                          text-green-600 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Fully Supported
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Native .cursorrules support for perfect code generation
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Auto-loads .cursorrules files
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Understands project context
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Generates style-matched code
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/cursor">View Integration Guide</a>
                  </Button>
                </Card>
              </motion.div>

              {/* GitHub Copilot */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card 
                  className="depth-layer-2
                    shadow-depth-md
                    border-0
                    hover:depth-layer-3
                    hover:shadow-elevated
                    p-6 rounded-xl
                    transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="h-16 w-16 rounded-lg
                        depth-layer-3
                        shadow-depth-sm
                        flex items-center justify-center"
                    >
                      <span className="text-sm font-semibold text-blue-600">Copilot</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">GitHub Copilot</h3>
                      <span 
                        className="depth-layer-3
                          shadow-depth-sm
                          border-0
                          text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Supported
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Works with context files in your repository
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Reads markdown documentation
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Better context understanding
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Improved suggestions
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/copilot">View Guide</a>
                  </Button>
                </Card>
              </motion.div>

              {/* Codeium */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card 
                  className="depth-layer-2
                    shadow-depth-md
                    border-0
                    hover:depth-layer-3
                    hover:shadow-elevated
                    p-6 rounded-xl
                    transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="h-16 w-16 rounded-lg
                        depth-layer-3
                        shadow-depth-sm
                        flex items-center justify-center"
                    >
                      <span className="text-sm font-semibold text-purple-600">Codeium</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Codeium</h3>
                      <span 
                        className="depth-layer-3
                          shadow-depth-sm
                          border-0
                          text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Supported
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Enhanced with context file integration
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Context-aware suggestions
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Project-specific patterns
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Style consistency
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/codeium">Learn More</a>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Version Control Tab */}
          <TabsContent value="version-control">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* GitHub */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-900 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">GitHub</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">GitHub</h3>
                      <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                        Native Integration
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Direct repository analysis and context file generation
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Public repo analysis
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Private repo support (Pro)
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Automatic file detection
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/github">Learn More</a>
                  </Button>
                </Card>
              </motion.div>

              {/* GitLab */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-orange-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">GitLab</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">GitLab</h3>
                      <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        Supported
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Full support for GitLab repositories and CI/CD
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Repository analysis
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      CI/CD integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Merge request context
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/gitlab">Learn More</a>
                  </Button>
                </Card>
              </motion.div>

              {/* Bitbucket */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">Bitbucket</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Bitbucket</h3>
                      <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Atlassian Bitbucket integration in development
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Repository analysis
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Jira integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Team collaboration
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full" disabled>
                    <a href="#">Request Early Access</a>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Development Tools Tab */}
          <TabsContent value="dev-tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* VS Code */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">VS Code</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">VS Code</h3>
                      <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                        Extension Available
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Official extension for seamless integration
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Auto-generate context files
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Real-time updates
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      IntelliSense integration
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/vscode">Install Extension</a>
                  </Button>
                </Card>
              </motion.div>

              {/* IntelliJ IDEA */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-orange-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">IDEA</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">IntelliJ IDEA</h3>
                      <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                        Plugin Coming Soon
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    JetBrains IDE integration in development
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Context file generation
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Project analysis
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Code completion
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full" disabled>
                    <a href="#">Request Beta Access</a>
                  </Button>
                </Card>
              </motion.div>

              {/* Vim/Neovim */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-green-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">Vim</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Vim/Neovim</h3>
                      <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        Manual Setup
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Manual setup guide for Vim and Neovim users
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Configuration guide
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Plugin integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Custom keybindings
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/vim">View Setup Guide</a>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* CI/CD Tab */}
          <TabsContent value="cicd">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* GitHub Actions */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-900 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">Actions</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">GitHub Actions</h3>
                      <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                        Workflow Templates
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Automated context file generation in CI/CD
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Pre-built workflows
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Auto-update on changes
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      PR integration
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/github-actions">View Templates</a>
                  </Button>
                </Card>
              </motion.div>

              {/* GitLab CI */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-orange-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">GitLab</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">GitLab CI</h3>
                      <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                        Pipeline Examples
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    GitLab CI/CD pipeline integration examples
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Pipeline templates
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Merge request triggers
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Artifact generation
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/integrations/gitlab-ci">View Examples</a>
                  </Button>
                </Card>
              </motion.div>

              {/* Jenkins */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="bg-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-red-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">Jenkins</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Jenkins</h3>
                      <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                        Plugin Coming Soon
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Jenkins plugin for automated context generation
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Build integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Pipeline support
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Notification hooks
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full" disabled>
                    <a href="#">Request Beta Access</a>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Don&apos;t see your tool?</p>
          <Button asChild variant="outline" size="lg">
            <a href="/feedback">Request Integration</a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">We&apos;re constantly adding new integrations</p>
        </div>
      </section>

      {/* Use Cases - Real Scenarios */}
      <ScrollReveal>
      <section 
        id="use-cases"
        className="depth-layer-1"
      >
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 
            className="text-4xl font-bold text-center mb-4
              text-shadow-md"
          >
            Built for Real Development Scenarios
          </h2>
          <p className="text-muted-foreground text-center mb-12">See how developers use Context Wizard every day</p>

          <div className="space-y-12">
            {/* Use Case 1 - Onboarding New Developers (Image left, content right) */}
            <Card 
              className="depth-layer-2
                shadow-depth-lg
                border-0
                overflow-hidden
                hover:depth-layer-3
                hover:shadow-elevated
                transition-all duration-500
                group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
                <div className="order-1">
                  <div 
                    className="depth-layer-1
                      shadow-inset
                      h-80
                      flex items-center justify-center
                      group-hover:scale-105
                      transition-transform duration-500"
                  >
                    <UserPlus className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
                <div className="order-2">
                  <Badge
                    className="absolute top-4 left-4 text-shadow-sm
                      depth-layer-3
                      shadow-depth-md
                      border-0
                      text-shadow-sm
                      z-10"
                  >
                    Onboarding
                  </Badge>
                  <h3 
                    className="text-2xl font-bold mb-4 text-shadow-sm
                      text-shadow-sm"
                  >
                    Get New Team Members Up to Speed Faster
                  </h3>
                  <p className="text-foreground/80">New developers can understand your entire codebase in minutes, not days. Our AI-generated documentation explains your project structure, tech stack, and coding conventions in plain English.</p>
                  <ul className="mt-4 space-y-2">
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Reduce onboarding time by 80%</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Standardized documentation for all projects</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Always up-to-date with your current codebase</span>
                    </li>
                  </ul>
                  <Button className="mt-6">Try It Free</Button>
                </div>
              </div>
            </Card>

            {/* Use Case 2 - Better Code Reviews (Content left, image right) */}
            <Card 
              className="depth-layer-2
                shadow-depth-lg
                border-0
                overflow-hidden
                hover:depth-layer-3
                hover:shadow-elevated
                transition-all duration-500
                group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
                <div className="order-2 md:order-1">
                  <Badge
                    className="depth-layer-3 text-shadow-sm
                      shadow-depth-md
                      border-0
                      text-shadow-sm
                      z-10"
                  >
                    Code Quality
                  </Badge>
                  <h3 
                    className="text-2xl font-bold mb-4 text-shadow-sm
                      text-shadow-sm"
                  >
                    Supercharge Your Code Reviews
                  </h3>
                  <p className="text-foreground/80">Give reviewers instant context about your project&apos;s architecture and conventions. No more asking &apos;why did you structure it this way?&apos;—the answer is right in the context files.</p>
                  <ul className="mt-4 space-y-2">
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Faster, more thorough code reviews</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Consistent code style enforcement</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Reduce back-and-forth questions by 60%</span>
                    </li>
                  </ul>
                  <Button className="mt-6" variant="outline">See Examples</Button>
                </div>
                <div className="order-1 md:order-2">
                  <div 
                    className="depth-layer-1
                      shadow-inset
                      h-80
                      flex items-center justify-center
                      group-hover:scale-105
                      transition-transform duration-500"
                  >
                    <GitPullRequest className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Use Case 3 - AI Pair Programming (Image left, content right) */}
            <Card 
              className="depth-layer-2
                shadow-depth-lg
                border-0
                overflow-hidden
                hover:depth-layer-3
                hover:shadow-elevated
                transition-all duration-500
                group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
                <div className="order-1">
                  <div 
                    className="depth-layer-1
                      shadow-inset
                      h-80
                      flex items-center justify-center
                      group-hover:scale-105
                      transition-transform duration-500"
                  >
                    <Bot className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
                <div className="order-2">
                  <Badge
                    className="depth-layer-3 text-shadow-sm
                      shadow-depth-md
                      border-0
                      text-shadow-sm
                      z-10"
                  >
                    AI Coding
                  </Badge>
                  <h3 
                    className="text-2xl font-bold mb-4 text-shadow-sm
                      text-shadow-sm"
                  >
                    Make AI Assistants Understand Your Project
                  </h3>
                  <p className="text-foreground/80">Stop getting generic code suggestions that don&apos;t match your style. Our .cursorrules file teaches Cursor, Copilot, and other AI assistants exactly how you write code.</p>
                  <ul className="mt-4 space-y-2">
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>10x more relevant AI suggestions</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Maintain consistent code style</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Save hours of manual prompt crafting</span>
                    </li>
                  </ul>
                  <Button className="mt-6">Start Generating</Button>
                </div>
              </div>
            </Card>

            {/* Use Case 4 - Open Source Contributions (Content left, image right) */}
            <Card 
              className="depth-layer-2
                shadow-depth-lg
                border-0
                overflow-hidden
                hover:depth-layer-3
                hover:shadow-elevated
                transition-all duration-500
                group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
                <div className="order-2 md:order-1">
                  <Badge
                    className="depth-layer-3 text-shadow-sm
                      shadow-depth-md
                      border-0
                      text-shadow-sm
                      z-10"
                  >
                    Open Source
                  </Badge>
                  <h3 
                    className="text-2xl font-bold mb-4 text-shadow-sm
                      text-shadow-sm"
                  >
                    Help Contributors Get Started Instantly
                  </h3>
                  <p className="text-foreground/80">Make your open source project contributor-friendly. Generate comprehensive documentation that helps anyone understand how to contribute, from first-time contributors to experienced maintainers.</p>
                  <ul className="mt-4 space-y-2">
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Increase contributions by 3x</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Reduce &apos;how do I start?&apos; questions</span>
                    </li>
                    <li
                      className="flex items-start gap-2
                        depth-layer-3
                        rounded-lg p-3
                        shadow-depth-sm
                        hover-lift"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Maintain consistent code quality</span>
                    </li>
                  </ul>
                  <Button className="mt-6" variant="outline">Try for OSS</Button>
                </div>
                <div className="order-1 md:order-2">
                  <div 
                    className="depth-layer-1
                      shadow-inset
                      h-80
                      flex items-center justify-center
                      group-hover:scale-105
                      transition-transform duration-500"
                  >
                    <GitFork className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* How It Works - New Section */}
      <ScrollReveal>
      <section 
        id="how-it-works" 
        className="relative max-w-7xl mx-auto px-4 py-20
          depth-layer-1
          border-y border-border/20"
      >
        <h2 
          className="text-4xl font-bold text-center mb-4
            text-shadow-md"
        >
          How It Works
        </h2>
        <p className="text-muted-foreground text-center mb-16">Get perfect context files in three simple steps</p>

        {/* Arrows between steps (desktop only) */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <ArrowRight className="absolute top-1/2 left-[33.5%] -translate-y-1/2 h-8 w-8 text-muted-foreground/60 animate-pulse" />
          <ArrowRight className="absolute top-1/2 left-[66.5%] -translate-y-1/2 h-8 w-8 text-muted-foreground/60 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative">
            <div 
              className="absolute -top-3 -left-3
                depth-top
                shadow-depth-lg
                w-12 h-12 rounded-full
                flex items-center justify-center
                text-lg font-bold
                text-shadow-sm
                border-4 border-background"
            >
              1
            </div>
            <Card 
              className="relative
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift
                transition-all duration-300"
            >
              <div
                className="depth-layer-1
                  shadow-inset
                  rounded-lg h-48
                  flex items-center justify-center
                  mb-4"
              >
                <FileCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardHeader>
                <CardTitle
                  className="text-xl font-semibold text-shadow-sm
                    text-shadow-sm"
                >
                  Paste GitHub URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enter any public GitHub repository URL. Our AI instantly analyzes the codebase structure, tech stack, and coding patterns.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Works with GitHub, GitLab, and Bitbucket</p>
              </CardContent>
            </Card>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div 
              className="absolute -top-3 -left-3
                depth-top
                shadow-depth-lg
                w-12 h-12 rounded-full
                flex items-center justify-center
                text-lg font-bold
                text-shadow-sm
                border-4 border-background"
            >
              2
            </div>
            <Card 
              className="relative
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift
                transition-all duration-300"
            >
              <div
                className="depth-layer-1
                  shadow-inset
                  rounded-lg h-48
                  flex items-center justify-center
                  mb-4"
              >
                <Brain className="h-16 w-16 text-muted-foreground animate-pulse" />
              </div>
              <CardHeader>
                <CardTitle
                  className="text-xl font-semibold text-shadow-sm
                    text-shadow-sm"
                >
                  AI Analyzes & Generates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our advanced AI models process your repository, detecting frameworks, dependencies, and code conventions to create comprehensive context files.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Average generation time: 15-30 seconds</p>
              </CardContent>
            </Card>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div 
              className="absolute -top-3 -left-3
                depth-top
                shadow-depth-lg
                w-12 h-12 rounded-full
                flex items-center justify-center
                text-lg font-bold
                text-shadow-sm
                border-4 border-background"
            >
              3
            </div>
            <Card 
              className="relative
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift
                transition-all duration-300"
            >
              <div
                className="depth-layer-1
                  shadow-inset
                  rounded-lg h-48
                  flex items-center justify-center
                  mb-4"
              >
                <Download className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardHeader>
                <CardTitle
                  className="text-xl font-semibold text-shadow-sm
                    text-shadow-sm"
                >
                  Download & Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get .cursorrules, PROJECT_OVERVIEW.md, ARCHITECTURE.md, and more. Drop them into your project and watch your AI assistant understand everything perfectly.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Includes 6+ essential context files</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg inline-flex items-center justify-center mx-auto shadow hover:shadow-lg transition-shadow"
            onClick={() => {
              trackEvent("hero_cta_clicked", { button_text: "Ready to try it?" });
              const el = document.querySelector('input[type="url"]') as HTMLInputElement | null;
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Ready to try it?
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="text-muted-foreground mt-2">No credit card required • Free tier available</p>
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

      {/* See The Difference - Tabbed */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-primary">See The Difference Context Makes</h2>
        <Tabs defaultValue="react" className="mt-8">
          <div className="flex justify-center">
            <TabsList className="rounded-lg">
              <TabsTrigger value="react">React Component</TabsTrigger>
              <TabsTrigger value="api">API Route</TabsTrigger>
              <TabsTrigger value="db">Database Schema</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: React Component */}
          <TabsContent value="react" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="p-0
                  depth-layer-2
                  shadow-depth-md
                  border-0"
              >
                <CardHeader className="flex flex-row items-center gap-2">
                  <X className="text-red-500" />
                  <CardTitle className="text-left text-lg text-shadow-sm">Before • Without Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="rounded-lg
                      depth-layer-1
                      shadow-inset
                      p-4 relative"
                  >
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed text-foreground/70">
{`function fetchData() {
  // Fetch data from API
  // Process data
  // Update state
}`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-foreground/70">Lines of bugs: 8</div>
                </CardFooter>
              </Card>
              <Card 
                className="p-0
                  depth-layer-2
                  shadow-depth-md
                  border-0"
              >
                <CardHeader className="flex flex-row items-center gap-2">
                  <Check className="text-green-600" />
                  <CardTitle className="text-left text-lg text-shadow-sm">After • With Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="rounded-lg
                      depth-layer-3
                      shadow-depth-sm
                      p-4 relative"
                  >
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed">
{`import { useEffect, useState } from 'react';

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
}`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm font-medium text-primary">Production-ready: ✓</div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: API Route */}
          <TabsContent value="api" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-0">
                <CardHeader className="flex flex-row items-center gap-2">
                  <X className="text-red-500" />
                  <CardTitle className="text-left text-lg text-shadow-sm">Before • Poor Express Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/40 p-4 ring-1 ring-border relative">
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed text-foreground/70">
{`app.get('/data', (req, res) => {
  // Fetch data from database
  // Send response
});`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-foreground/70">Lines of bugs: 8</div>
                </CardFooter>
              </Card>
              <Card className="p-0">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Check className="text-green-600" />
                  <CardTitle className="text-left text-lg text-shadow-sm">After • Next.js API Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-background p-4 ring-1 ring-border relative">
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed">
{`import type { NextRequest } from 'next/server';
export async function GET(req: NextRequest) {
  try {
    const data = await fetch('https://api.example.com/data').then(r => r.json());
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm font-medium text-primary">Production-ready: ✓</div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Database Schema */}
          <TabsContent value="db" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-0">
                <CardHeader className="flex flex-row items-center gap-2">
                  <X className="text-red-500" />
                  <CardTitle className="text-left text-lg text-shadow-sm">Before • Inconsistent Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/40 p-4 ring-1 ring-border relative">
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed text-foreground/70">
{`const User = {
  name: String,
  email: String,
  password: String,
  // Additional fields
};`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-foreground/70">Lines of bugs: 8</div>
                </CardFooter>
              </Card>
              <Card className="p-0">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Check className="text-green-600" />
                  <CardTitle className="text-left text-lg text-shadow-sm">After • Prisma Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-background p-4 ring-1 ring-border relative">
                    <button className="absolute right-3 top-3 text-xs rounded border px-2 py-1">Copy</button>
                    <pre className="max-h-[400px] overflow-auto text-sm leading-relaxed">
{`model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm font-medium text-primary">Production-ready: ✓</div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* What You Get - Feature Grid */}
      <ScrollReveal>
      <section 
        id="features" 
        className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24
          depth-layer-1
          border-y border-border/20"
      >
        <h2 
          className="text-center text-3xl font-bold text-primary
            text-shadow-md
            tracking-tight"
        >
          What You Get
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">Six focused deliverables that make Cursor understand your repo instantly.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: FileCode, title: ".cursorrules Generator", desc: "Generate precise, repo-aware instructions for Cursor to follow." },
            { icon: BookOpen, title: "Project Documentation", desc: "Concise, actionable docs tailored to your codebase." },
            { icon: Map, title: "Architecture Maps", desc: "Visualize flows, ownership, and key boundaries at a glance." },
            { icon: Layers, title: "Tech Stack Guide", desc: "Frameworks, libraries, versions, and how they fit together." },
            { icon: Code2, title: "Code Conventions", desc: "Naming, patterns, file org, and API usage—codified." },
            { icon: Sparkles, title: "Best Practices", desc: "Opinionated guidance tuned to your repo's constraints." },
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
                  <p className="text-muted-foreground">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* Demo - Video Section */}
      <ScrollReveal>
      <section id="demo" className="bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-shadow-sm">See Context Wizard in Action</h2>
          <p className="text-muted-foreground text-center mb-12">Watch how easy it is to generate perfect context files</p>

          {/* Decorative gradient blur orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          </div>

          {/* Video placeholder */}
          <div className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted to-muted/50 shadow-2xl overflow-hidden">
            {/* Placeholder content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Video className="h-24 w-24 text-muted-foreground mb-4" />
              <div className="text-xl font-semibold">Demo Video Coming Soon</div>
              <div className="text-sm text-muted-foreground">We&apos;re creating an awesome demo video for you!</div>

              {/* Play button overlay */}
              <button
                aria-label="Play video"
                className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors grid place-items-center animate-pulse"
                onClick={() => {
                  trackEvent("demo_video_played");
                  trackEvent("demo_video_completed");
                }}
                <Video className="h-10 w-10 text-primary" />
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="p-6 rounded-lg
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift"
            >
              <Zap className="h-8 w-8 text-primary mb-2" />
              <div className="text-lg font-semibold">⚡ Lightning Fast</div>
              <div className="text-sm text-muted-foreground">Generate context in 30 seconds</div>
            </Card>
            <Card 
              className="p-6 rounded-lg
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift"
            >
              <Target className="h-8 w-8 text-primary mb-2" />
              <div className="text-lg font-semibold">🎯 Highly Accurate</div>
              <div className="text-sm text-muted-foreground">95%+ accuracy in tech stack detection</div>
            </Card>
            <Card 
              className="p-6 rounded-lg
                depth-layer-2
                shadow-depth-md
                border-0
                hover-lift"
            >
              <Lock className="h-8 w-8 text-primary mb-2" />
              <div className="text-lg font-semibold">🔒 Secure & Private</div>
              <div className="text-sm text-muted-foreground">Your code stays yours, we never store it</div>
            </Card>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Mid-Page CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div 
          className="depth-layer-2
            shadow-depth-lg
            border-0
            rounded-2xl p-8 text-center"
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3 text-shadow-sm">Ready to Transform Your Development Workflow?</h2>
          <p className="text-muted-foreground mb-6">Join 2,500+ developers who already boosted their productivity</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </SignUpButton>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href="/pricing">See Pricing</a>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">No credit card required • 5 free generations daily</p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[
                { bg: 'bg-blue-500', initials: 'JD' },
                { bg: 'bg-green-500', initials: 'MS' },
                { bg: 'bg-purple-500', initials: 'AL' },
                { bg: 'bg-amber-500', initials: 'SK' },
                { bg: 'bg-pink-500', initials: 'RC' },
                { bg: 'bg-teal-500', initials: 'EP' }
              ].map((avatar, idx) => (
                <div 
                  key={idx}
                  className={`h-8 w-8 rounded-full ${avatar.bg} text-white text-xs flex items-center justify-center font-semibold border-2 border-background`}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-foreground/80">2,500+ developers</span>
          </div>
        </div>
      </section>

      

      {/* FAQ - Accordion Section (moved below Pricing) */}
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

      {/* Blog/Resources Section */}
      <section id="resources" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 text-shadow-sm">Latest from Our Blog</h2>
        <p className="text-muted-foreground text-center mb-12">Tips, tutorials, and insights for better development</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Blog Post 1 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 h-48 rounded-t-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-16 w-16 text-blue-500/60" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Tutorial
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-muted-foreground">March 15, 2025</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  How to Write Perfect .cursorrules Files
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  Learn the secrets to creating .cursorrules that make AI assistants generate exactly the code you want...
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Sarah Chen</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <a href="/blog/cursorrules-guide">Read More</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog Post 2 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 h-48 rounded-t-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-16 w-16 text-purple-500/60" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    Best Practices
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-muted-foreground">March 10, 2025</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  Onboarding Developers 10x Faster with Context Files
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  Discover how leading tech companies are using automated documentation to reduce onboarding time...
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>7 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Mike Johnson</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <a href="/blog/onboarding-guide">Read More</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog Post 3 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 h-48 rounded-t-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-16 w-16 text-green-500/60" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    Case Study
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-muted-foreground">March 5, 2025</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  How StartupXYZ Improved Code Review Speed by 60%
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  A detailed look at how one startup transformed their code review process using Context Wizard...
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>10 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Alex Rivera</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <a href="/blog/startup-case-study">Read More</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="text-center">
          <Button asChild size="lg" className="mb-4">
            <a href="/blog">View All Articles</a>
          </Button>
          <p className="text-muted-foreground">Subscribe to our newsletter for weekly development tips</p>
        </div>
      </section>

      {/* Pre-Footer CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-card rounded-3xl border p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              <h2 className="text-3xl font-bold mb-3 text-shadow-sm">Still on the Fence?</h2>
              <p className="text-lg text-muted-foreground mb-6">Try Context Wizard risk-free for 7 days</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>No credit card required for free tier</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Full access to all free features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Upgrade to Pro anytime</span>
                </li>
              </ul>
              
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Free Trial
                </Button>
              </SignUpButton>
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-3xl font-bold mb-3 text-shadow-sm">Have Questions?</h2>
              <p className="text-muted-foreground mb-6">We&apos;re here to help! Talk to our team about your specific use case.</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <a href="mailto:support@contextwizard.com" className="text-foreground hover:text-primary transition-colors">
                    support@contextwizard.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                  <a href="#" className="text-foreground hover:text-primary transition-colors">
                    Join our community
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <a href="#" className="text-foreground hover:text-primary transition-colors">
                    Book a demo call
                  </a>
                </div>
              </div>
              
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <a href="mailto:sales@contextwizard.com">Contact Sales</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

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
