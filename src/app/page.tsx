"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initPostHog, trackEvent, trackAuth, trackGenerationEvent } from "@/lib/analytics";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileCode, BookOpen, Map, Layers, Code2, Sparkles, Brain, Download, ArrowRight, ChevronDown, Check, X, Gift, XCircle, ShieldCheck, Users, Video, Zap, Target, Lock, UserPlus, GitPullRequest, Bot, GitFork, Star, TrendingUp, Headphones, Award, Shield, Mail, MessageSquare, Calendar, Clock, User, Code, GitBranch, Workflow, Plug, DollarSign, AlertCircle, Rocket, Boxes, RefreshCw, HelpCircle, Settings } from "@/lib/icons";
import AccordionExpandIconDemo from "@/components/shadcn-studio/accordion/accordion-06";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { StickyCtaBar } from "@/components/landing/StickyCtaBar";
import { BackToTop } from "@/components/landing/BackToTop";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { ReadingProgress } from "@/components/landing/ReadingProgress";
import { LogoLoop } from "@/components/LogoLoop";
import { ScrollLockedCards } from "@/components/landing/ScrollLockedCards";
import { BentoGrid, BentoGridItem } from "@/components/landing/BentoGrid";
import { WizardAnimation, PromptAnimation, TemplatesAnimation, SecurityAnimation, NonDevAnimation, DeploymentAnimation } from "@/components/landing/BentoGridAnimations";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  const router = useRouter();
  const featuresSectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    initPostHog();
    trackEvent("landing_page_viewed");
  }, []);



  const faqItems = [
    {
      icon: HelpCircle,
      title: "Do I need to know how to code?",
      content:
        "Not at all! Cursor Builder is designed for everyone. Our 10-step wizard guides you through building complete apps with step-by-step prompts. Even if you're new to coding, you can follow the prompts in Cursor to build production-ready applications.",
    },
    {
      icon: Boxes,
      title: "What types of apps can I build?",
      content:
        "You can build portfolio sites, e-commerce platforms, SaaS applications, and custom apps. Our wizard covers everything from authentication and database setup to API routes and deployment. Each app type comes with tailored prompts for that specific use case.",
    },
    {
      icon: HelpCircle,
      title: "How does the 10-step wizard work?",
      content:
        "The wizard guides you through selecting your app type, tech stack preferences, features needed, and more. At each step, you'll get AI-generated Cursor prompts that you can copy and paste directly into Cursor to build that specific part of your app.",
    },
    {
      icon: Shield,
      title: "Are the prompts production-ready?",
      content:
        "Yes! Every prompt includes error handling, security best practices, and proper architecture patterns. The prompts are designed to generate production-ready code from day one, not just prototypes or demos.",
    },
    {
      icon: Settings,
      title: "Can I customize the prompts?",
      content:
        "Absolutely! All prompts are plain text that you can edit before using in Cursor. Pro users also get access to custom templates where you can define your team's specific requirements and have them automatically included in all generated prompts.",
    },
    {
      icon: DollarSign,
      title: "What's the difference between Free and Pro plans?",
      content:
        "Free plan includes 5 app builds per day with access to all app templates. Pro plan ($9/month) offers unlimited builds, priority processing (3x faster), access to premium AI models, custom prompt templates, and team collaboration features (coming soon).",
    },
    {
      icon: Clock,
      title: "How long does it take to build an app?",
      content:
        "The wizard itself takes just a few minutes to complete. Building the actual app depends on complexity, but with our guided prompts, most apps can be built in hours rather than days or weeks. The prompts are designed to be efficient and comprehensive.",
    },
  ];

  const featureCards = [
    {
      icon: <Workflow className="h-6 w-6 text-purple-400" />,
      title: "10-Step Guided Wizard",
      desc: "Complete step-by-step process from app type selection to deployment. Our comprehensive wizard walks you through every stage of development—from choosing your app architecture to setting up authentication, database connections, API endpoints, and deployment configurations.",
      className: "md:col-span-2",
      header: <WizardAnimation />,
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      title: "AI-Generated Cursor Prompts",
      desc: "Get production-ready prompts for every feature you need—authentication systems, database setup and migrations, API routes with proper error handling, frontend components with state management.",
      className: "md:col-span-1",
      header: <PromptAnimation />,
    },
    {
      icon: <Code2 className="h-6 w-6 text-purple-400" />,
      title: "Multiple App Templates",
      desc: "Choose from a wide variety of app templates including portfolio sites, e-commerce platforms, SaaS applications, blog systems, dashboards, or build completely custom apps with our guided prompts.",
      className: "md:col-span-1",
      header: <TemplatesAnimation />,
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      title: "Best Practices Built-In",
      desc: "Every prompt includes comprehensive error handling, security considerations, input validation, proper authentication flows, and architecture patterns from day one. We've learned from thousands of projects to ensure your code is secure.",
      className: "md:col-span-2",
      header: <SecurityAnimation />,
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      title: "Works for Non-Developers",
      desc: "Even if you're new to coding, our guided prompts make complex apps accessible to everyone. Each step is explained in plain language, with clear instructions on what to do and why.",
      className: "md:col-span-1",
      header: <NonDevAnimation />,
    },
    {
      icon: <Rocket className="h-6 w-6 text-purple-400" />,
      title: "From Idea to Production",
      desc: "Complete workflow from project setup to deployment. All prompts are production-ready and tested, covering everything from initial project scaffolding to database migrations, API development, frontend implementation.",
      className: "md:col-span-2",
      header: <DeploymentAnimation />,
    },
  ];

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Conard',
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
    description: 'Build complete apps with guided Cursor prompts. Step-by-step wizard for building production-ready applications.',
  };

  return (
    <div className="min-h-screen w-full">
      <ReadingProgress />
      <Navbar />
      <StickyCtaBar />
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#0a0a0a] pt-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a]" />

        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          {/* Social Proof Bar */}
          <div className="mb-12 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <Star className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            <span className="tracking-tight">4.9/5 from 500+ developers</span>
            <span className="text-white/20">|</span>
            <span className="text-white/80">#1 Product of the Day</span>
          </div>

          {/* Headline - Large, bold, simple text */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Make Great <span className="text-purple-400">Prompts</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            The only tool that generates step-by-step prompts for building full applications. From portfolio sites to SaaS platforms—build anything with guided AI assistance.
          </p>

          {/* CTA Button */}
          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300"
              onClick={() => trackEvent('hero_cta_clicked', { button_text: 'Start Building Apps' })}
            >
              <Link href="/dashboard/cursor-builder">
                Start Building Apps Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL PROOF BAR (Immediate Trust) */}
      <LogoLoop
        logos={[
          { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
          { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
          { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
          { src: "/logos/company4.png", alt: "Company 4", href: "https://company4.com" },
          { src: "/logos/company5.png", alt: "Company 5", href: "https://company5.com" },
          { src: "/logos/company6.png", alt: "Company 6", href: "https://company6.com" },
        ]}
        speed={100}
        direction="left"
        logoHeight={60}
        gap={60}
        hoverSpeed={20}
        fadeOut={true}
        scaleOnHover={true}
        ariaLabel="Partner logos"
      />

      {/* SECTION 3: THE PROBLEM (Emotional Connection) */}
      <section id="problem" className="relative bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Why AI Coding Tools Keep Failing You
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-white/60">
            Every developer knows the frustration. Here's what's really going wrong.
          </p>
        </div>
        <ScrollLockedCards />
      </section>

      {/* SECTION 4: THE SOLUTION (How It Works - Visual) */}
      <ScrollReveal>
        <section
          id="how-it-works"
          className="bg-[#0a0a0a]"
        >
          <div className="max-w-7xl mx-auto px-4 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Build Complete Apps in 3 Simple Steps
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60">
              From idea to production-ready app with guided Cursor prompts
            </p>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Workflow className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  1. Choose Your App Type
                </h3>
                <p className="text-base text-white/60">
                  Select from portfolio sites, e-commerce, SaaS platforms, or custom apps. Our wizard guides you through every step.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  2. Get Step-by-Step Prompts
                </h3>
                <p className="text-base text-white/60">
                  Our AI generates complete Cursor prompts for every feature—from setup to deployment. Copy, paste, and build.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Rocket className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  3. Build Your Complete App
                </h3>
                <p className="text-base text-white/60">
                  Follow the guided prompts in Cursor to build your entire application. Includes error handling, best practices, and architecture.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 5: BEFORE/AFTER (Proof It Works) */}
      <ScrollReveal>
        <section id="before-after" className="bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              See the Difference <span className="text-purple-400">Great Prompts</span> Make
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60">
              Same AI, completely different results. See why great prompts matter.
            </p>

            {/* Desktop: Side-by-side, Mobile: Tabs */}
            <div className="mt-12 hidden md:grid grid-cols-2 gap-6 lg:gap-8">
              {/* Before */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Without Great Prompts
                </h3>
                <div className="rounded-lg bg-black/40 p-4">
                  <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                </div>
              </div>

              {/* After */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  With Great Prompts
                </h3>
                <div className="rounded-lg bg-black/40 p-4">
                  <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                </div>
              </div>
            </div>

            {/* Mobile: Tabs */}
            <div className="mt-12 md:hidden">
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="mb-4 w-full h-12">
                  <TabsTrigger value="before" className="flex-1 text-base">
                    <X className="mr-2 h-4 w-4" />
                    Without Context
                  </TabsTrigger>
                  <TabsTrigger value="after" className="flex-1 text-base">
                    <Check className="mr-2 h-4 w-4" />
                    With Context
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="after" className="mt-0">
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
                    <h3 className="mb-4 text-2xl font-bold text-white">
                      With Great Prompts
                    </h3>
                    <div className="rounded-lg bg-black/40 p-4">
                      <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="before" className="mt-0">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="mb-4 text-2xl font-bold text-white">
                      Without Great Prompts
                    </h3>
                    <div className="rounded-lg bg-black/40 p-4">
                      <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* CTA Button */}
            <div className="mt-12 text-center">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-black hover:bg-white/90 transition-all duration-300"
                  onClick={() => {
                    trackEvent("before_after_cta_clicked", { button_text: "Start Building Apps" });
                    router.push("/dashboard/cursor-builder");
                  }}
                >
                  Start Building Apps
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 6: TESTIMONIALS (Langbase Style Replica) */}
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      {/* SECTION 7: FEATURES (What You Get - Benefit-Focused) */}
      <ScrollReveal>
        <section
          id="features"
          ref={featuresSectionRef}
          className="bg-[#0a0a0a]"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything You Need to Build Complete <span className="text-purple-400">Apps</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60">
              Six powerful features that help you build production-ready applications with AI.
            </p>
            <div className="mt-16">
              <BentoGrid className="max-w-4xl mx-auto">
                {featureCards.map((item, i) => (
                  <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.desc}
                    header={item.header}
                    icon={item.icon}
                    className={item.className}
                    onClick={() => trackEvent("feature_card_clicked", { feature_name: item.title })}
                  />
                ))}
              </BentoGrid>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 8: USE CASES (Who This Is For) */}
      <ScrollReveal>
        <section
          id="use-cases"
          className="bg-[#0a0a0a]"
        >
          <div className="max-w-7xl mx-auto px-4 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Perfect For Every <span className="text-purple-400">Builder</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60">
              From solo developers to teams—build apps faster with guided prompts
            </p>

            {/* Primary: Vibe Coders (40% size) */}
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-8 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Bot className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    App Builders
                  </h3>
                </div>
                <p className="mb-6 text-base text-white/70">Want to build complete apps but don't know where to start</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                    <span className="text-base text-white/80">Get step-by-step prompts for every feature</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                    <span className="text-base text-white/80">Build production-ready apps from scratch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                    <span className="text-base text-white/80">No coding experience required—just follow prompts</span>
                  </li>
                </ul>
              </div>

              {/* Secondary cards (20% each) */}
              <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
                <div className="mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Experienced Developers
                  </h3>
                </div>
                <p className="mb-4 text-sm text-white/70">Want to build apps faster with guided prompts</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Skip the planning phase—get ready-to-use prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Build multiple apps with consistent quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Focus on building, not researching</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
                <div className="mb-4 flex items-center gap-2">
                  <GitFork className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Open Source Maintainers
                  </h3>
                </div>
                <p className="mb-4 text-sm text-white/70">Want to prototype and build MVPs quickly</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Build working prototypes in hours, not weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Test ideas quickly with production-ready code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Iterate faster with guided prompts</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Teams & Agencies
                  </h3>
                </div>
                <p className="mb-4 text-sm text-white/70">Need consistent app building across projects</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Standardize app architecture across team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Onboard new developers with guided prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span className="text-white/80">Build client projects faster and consistently</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 9: THE INNOVATION (Cursor Prompt Builder) */}
      <ScrollReveal>
        <section id="innovation" className="bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Go Beyond Context Files—<span className="text-purple-400">Build Entire Apps</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
                The only tool that generates complete prompts for building full applications
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
              {/* Left: Visual/Screenshot */}
              <div className="order-2 lg:order-1">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="h-96 overflow-hidden rounded-lg bg-white">
                    <Image
                      src="/Evaluate-Performance-Employee-3--Streamline-Milano.png"
                      alt="Cursor Builder Screenshot"
                      width={400}
                      height={400}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Benefits */}
              <div className="order-1 lg:order-2">
                <h3 className="mb-6 text-2xl font-semibold text-white">
                  The Only Tool That Generates Complete Prompts
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-6 w-6 shrink-0 text-purple-400" />
                    <div>
                      <p className="text-base font-semibold text-white">Not just context—get step-by-step prompts for building features</p>
                      <p className="mt-1 text-sm text-white/60">Works for portfolio sites, e-commerce, SaaS, and more</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-6 w-6 shrink-0 text-purple-400" />
                    <div>
                      <p className="text-base font-semibold text-white">Even non-developers can build with AI</p>
                      <p className="mt-1 text-sm text-white/60">Guided prompts make complex apps accessible to everyone</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-6 w-6 shrink-0 text-purple-400" />
                    <div>
                      <p className="text-base font-semibold text-white">Includes error handling, best practices, and architecture guidance</p>
                      <p className="mt-1 text-sm text-white/60">Production-ready prompts from day one</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-6 w-6 shrink-0 text-purple-400" />
                    <div>
                      <p className="text-base font-semibold text-white">10-step wizard guides you through every aspect</p>
                      <p className="mt-1 text-sm text-white/60">From project setup to deployment—all covered</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button asChild size="lg" className="h-12 bg-white text-black hover:bg-white/90 transition-all duration-300 px-8">
                    <Link href="/dashboard/cursor-builder" onClick={() => trackEvent("cursor_builder_cta_clicked", { location: "innovation_section" })}>
                      Try Cursor Builder
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>



      {/* SECTION 11: FAQ (Objection Handling) */}
      <section id="faq" aria-labelledby="faq-heading" className="bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60">
            Everything you need to know about Cursor Builder
          </p>
          <AccordionExpandIconDemo
            items={faqItems.map((item, index) => ({
              icon: item.icon,
              title: item.title,
              content: item.content,
              onItemClick: () => trackEvent('faq_item_clicked', { question_id: item.title }),
            }))}
            defaultValue="item-1"
            className="w-full"
          />
          <div className="mt-12 text-center">
            <p className="mb-4 text-white/80">Still have questions?</p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-white text-black hover:bg-white/90 transition-all duration-300">
                <a href="mailto:support@contextwizard.com">Contact Support</a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                <a href="https://discord.gg/your-discord-link">Join Discord Community</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA (Strong Close) */}
      <ScrollReveal>
        <section className="bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Ready to Build Your First <span className="text-purple-400">App</span>?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
                Join 500+ developers building complete apps with guided prompts.
              </p>

              {/* Large CTA */}
              <div className="mt-10">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-white text-black hover:bg-white/90 transition-all duration-300 text-base sm:text-lg font-semibold"
                    onClick={() => trackEvent('final_cta_clicked', { location: 'final_cta_section' })}
                  >
                    Start Free—No Credit Card Required
                    <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SignUpButton>
              </div>

              {/* Trust Badges Row */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">500+ apps built</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">10-step guided wizard</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">847 developers building faster</span>
                </div>
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
        suppressHydrationWarning
      >
        {JSON.stringify(jsonLd)}
      </script>
    </div>
  );
}
