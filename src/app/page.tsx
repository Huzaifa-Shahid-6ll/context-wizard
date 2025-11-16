"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initPostHog, trackEvent, trackAuth, trackGenerationEvent } from "@/lib/analytics";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AnimatedHeading } from "@/components/landing/AnimatedHeading";
import { LogoLoop } from "@/components/LogoLoop";
import { motion } from "framer-motion";
import LightRays from "@/components/LightRays";
import ShinyText from "@/components/ui/ShinyText";


export default function Home() {
  const router = useRouter();
  
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
    {
      icon: HelpCircle,
      title: "Do I need Cursor to use this?",
      content:
        "Yes, Cursor Builder generates prompts specifically designed for Cursor. However, the prompts are written in plain language and could be adapted for other AI coding assistants, though they're optimized for Cursor's workflow.",
    },
    {
      icon: DollarSign,
      title: "Can I use this for commercial projects?",
      content:
        "Yes! Both Free and Pro plans allow commercial use. The prompts you generate become part of your project and you have full rights to use, modify, and build with them. We only ask that you don't resell the prompt generation service itself.",
    },
    {
      icon: Headphones,
      title: "What if I get stuck building my app?",
      content:
        "Each prompt includes context and explanations to help you understand what's being built. If you need additional help, contact us at support@contextwizard.com or join our Discord community for support from other builders.",
    },
    {
      icon: Boxes,
      title: "Can I build multiple apps?",
      content:
        "Absolutely! You can use Cursor Builder to generate prompts for as many apps as you want. Free users get 5 builds per day, while Pro users get unlimited builds. Each app gets its own set of customized prompts.",
    },
    {
      icon: RefreshCw,
      title: "How do I cancel my Pro subscription?",
      content:
        "You can cancel anytime from your dashboard → Billing. Your Pro access continues until the end of your billing period, and you can re-subscribe anytime without losing your build history.",
    },
    {
      icon: RefreshCw,
      title: "Do you offer refunds?",
      content:
        "Yes, we offer a 30-day money-back guarantee for Pro subscriptions. If you're not satisfied, email support@contextwizard.com within 30 days of your purchase for a full refund.",
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
      <section className="relative isolate overflow-hidden depth-base pt-16">
        {/* Light Rays Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            fadeDistance={1}
            saturation={1}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
          />
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

          {/* Headline */}
          <AnimatedHeading className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-primary text-shadow-md" />

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl font-normal text-foreground/60 text-shadow-sm">
            The only tool that generates step-by-step Cursor prompts for building full applications. From portfolio sites to SaaS platforms—build anything with guided AI assistance.
          </p>

          {/* Two-column feature comparison */}
          <div className="mx-auto mt-10 max-w-5xl">
            {/* Mobile: Tabs */}
            <div className="md:hidden">
              <Tabs defaultValue="without" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="without" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Manual Building
                  </TabsTrigger>
                  <TabsTrigger value="with" className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    With Builder
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="without" className="mt-0">
                  <div className="rounded-xl depth-layer-1 shadow-inset p-6 border border-destructive/20">
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image src="/badCODE_example.png" alt="Complex manual process" width={800} height={480} className="h-auto w-full" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="with" className="mt-0">
                  <div className="rounded-xl depth-layer-3 shadow-depth-lg p-6 border border-primary/20">
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image src="/Good Code_example.png" alt="Guided app building" width={800} height={480} className="h-auto w-full" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6">
            <Button 
              asChild 
              size="lg" 
              className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-semibold shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
              onClick={() => trackEvent('hero_cta_clicked', { button_text: 'Start Building Apps' })}
            >
              <Link href="/dashboard/cursor-builder">
                Start Building Apps Now
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
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
      <ScrollReveal>
      <section id="problem" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-primary text-shadow-md">
          <ShinyText text="Why AI Coding Tools Keep Failing You" speed={3} className="text-3xl sm:text-4xl font-bold" />
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
              <h3 className="text-xl font-semibold text-shadow-sm">
                <ShinyText text="Cursor Generates Broken Code" speed={3} className="text-xl font-semibold" />
              </h3>
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
              <h3 className="text-xl font-semibold text-shadow-sm">
                <ShinyText text="Hours Wasted on Setup" speed={3} className="text-xl font-semibold" />
              </h3>
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
              <h3 className="text-xl font-semibold text-shadow-sm">
                <ShinyText text="Burning API Credits" speed={3} className="text-xl font-semibold" />
              </h3>
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
          <ShinyText text="Build Complete Apps in 3 Simple Steps" speed={3} className="text-3xl sm:text-4xl font-bold" />
        </h2>
        <p className="text-muted-foreground text-center mb-12 text-base">From idea to production-ready app with guided Cursor prompts</p>

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
              <Target className="h-14 w-14 text-muted-foreground" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Choose Your App Type" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Select from portfolio sites, e-commerce, SaaS platforms, or custom apps. Our wizard guides you through every step.
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
              <Sparkles className="h-14 w-14 text-muted-foreground animate-pulse" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Get Step-by-Step Prompts" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our AI generates complete Cursor prompts for every feature—from setup to deployment. Copy, paste, and build.
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
              <Code2 className="h-14 w-14 text-muted-foreground" />
            </div>
            <CardHeader className="pt-2">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Build Your Complete App" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Follow the guided prompts in Cursor to build your entire application. Includes error handling, best practices, and architecture.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Helper text consolidated */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Works with any Cursor setup • 10-step wizard covers everything • Production-ready prompts from day one
        </p>

        {/* Video Demo Embed */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-xl border-2 border-border bg-gradient-to-br from-muted to-muted/50 shadow-2xl overflow-hidden">
            {/* Placeholder for video - replace with actual embed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Video className="h-24 w-24 text-muted-foreground mb-4" />
              <div className="text-xl font-semibold">
                <ShinyText text="See Cursor Builder in Action" speed={3} className="text-xl font-semibold" />
              </div>
              <div className="text-sm text-muted-foreground mt-2">Watch how easy it is to build complete apps with guided prompts</div>
              
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

      {/* SECTION 5: BEFORE/AFTER (Proof It Works) */}
      <ScrollReveal>
      <section id="before-after" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-primary mb-4 text-shadow-md">
          <ShinyText text="See The Difference Context Makes" speed={3} className="text-3xl sm:text-4xl font-bold" />
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
              <CardTitle className="text-xl font-semibold text-destructive">
                <ShinyText text="Without Context Files" speed={3} className="text-xl font-semibold" />
              </CardTitle>
            </div>
            <div className="rounded-lg depth-layer-1 shadow-inset p-4 mb-4">
              <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
            <p className="text-sm text-muted-foreground text-center">32 lines of bugs, wrong dependencies, doesn{'\''}t run</p>
          </Card>

          {/* After */}
          <Card className="depth-layer-3 shadow-depth-lg border-0 p-6 hover-lift">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold text-primary">
                <ShinyText text="With Context Files" speed={3} className="text-xl font-semibold" />
              </CardTitle>
            </div>
            <div className="rounded-lg depth-layer-3 shadow-depth-sm p-4 mb-4">
              <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
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
                  <CardTitle className="text-xl font-semibold text-destructive">
                <ShinyText text="Without Context Files" speed={3} className="text-xl font-semibold" />
              </CardTitle>
                </div>
            <div className="rounded-lg depth-layer-1 shadow-inset p-4 mb-4">
              <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
                <p className="text-sm text-muted-foreground text-center">32 lines of bugs, wrong dependencies, doesn{'\''}t run</p>
              </Card>
            </TabsContent>
            <TabsContent value="after" className="mt-0">
              <Card className="depth-layer-3 shadow-depth-lg border-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl font-semibold text-primary">
                <ShinyText text="With Context Files" speed={3} className="text-xl font-semibold" />
              </CardTitle>
                </div>
                <div className="rounded-lg depth-layer-3 shadow-depth-sm p-4 mb-4">
                  <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
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
                trackEvent("before_after_cta_clicked", { button_text: "Start Building Apps" });
                router.push("/dashboard/cursor-builder");
              }}
            >
              Start Building Apps
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
              <span className="bg-primary/20 px-3 py-1 rounded">WORLD-CLASS</span> <ShinyText text="CUSTOMER SUPPORT" speed={3} className="text-3xl sm:text-4xl font-bold" />
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
          <ShinyText text="Everything You Need to Build Complete Apps" speed={3} className="text-3xl sm:text-4xl font-bold" />
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70 text-base">Six powerful features that help you build production-ready applications with Cursor.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Workflow, title: "10-Step Guided Wizard", desc: "Complete step-by-step process from app type selection to deployment. No guesswork, just follow the prompts." },
            { icon: Sparkles, title: "AI-Generated Cursor Prompts", desc: "Get production-ready prompts for every feature—authentication, database setup, API routes, and more." },
            { icon: Code2, title: "Multiple App Templates", desc: "Choose from portfolio sites, e-commerce, SaaS platforms, or build custom apps with guided prompts." },
            { icon: Shield, title: "Best Practices Built-In", desc: "Every prompt includes error handling, security considerations, and architecture patterns from day one." },
            { icon: Zap, title: "Works for Non-Developers", desc: "Even if you're new to coding, our guided prompts make building complex apps accessible to everyone." },
            { icon: Rocket, title: "From Idea to Production", desc: "Complete workflow from project setup to deployment. All prompts are production-ready and tested." },
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
            <ShinyText text="Perfect For Every Builder" speed={3} className="text-3xl sm:text-4xl font-bold" />
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-base">From solo developers to teams—build apps faster with guided Cursor prompts</p>

          {/* Primary: Vibe Coders (40% size) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <Card className="lg:col-span-2 depth-layer-2 shadow-depth-lg border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="depth-layer-3 shadow-depth-sm w-12 h-12 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary">
                  <ShinyText text="App Builders" speed={3} className="text-2xl font-bold" />
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 text-base">Want to build complete apps but don't know where to start</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">Get step-by-step prompts for every feature</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">Build production-ready apps from scratch</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">No coding experience required—just follow prompts</span>
                </li>
              </ul>
            </Card>

            {/* Secondary cards (20% each) */}
            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  <ShinyText text="Experienced Developers" speed={3} className="text-lg font-semibold" />
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Want to build apps faster with guided prompts</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Skip the planning phase—get ready-to-use prompts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Build multiple apps with consistent quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Focus on building, not researching</span>
                </li>
              </ul>
            </Card>

            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <GitFork className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  <ShinyText text="Open Source Maintainers" speed={3} className="text-lg font-semibold" />
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Want to prototype and build MVPs quickly</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Build working prototypes in hours, not weeks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Test ideas quickly with production-ready code</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Iterate faster with guided prompts</span>
                </li>
              </ul>
            </Card>

            <Card className="lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  <ShinyText text="Teams & Agencies" speed={3} className="text-lg font-semibold" />
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Need consistent app building across projects</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Standardize app architecture across team</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Onboard new developers with guided prompts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Build client projects faster and consistently</span>
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
            <ShinyText text="Go Beyond Context Files—Build Entire Apps" speed={3} className="text-3xl sm:text-4xl font-bold" />
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
            <h3 className="text-2xl font-bold mb-6 text-primary">
              <ShinyText text="The Only Tool That Generates Complete Cursor Prompts" speed={3} className="text-2xl font-bold" />
            </h3>
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
          <h2 id="faq-heading" className="text-4xl font-bold text-center mb-4 text-shadow-sm">
            <ShinyText text="Frequently Asked Questions" speed={3} className="text-4xl font-bold" />
          </h2>
          <p className="text-muted-foreground text-center mb-12">Everything you need to know about Cursor Builder</p>
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
            <ShinyText text="Ready to Build Your First App?" speed={3} className="text-3xl sm:text-4xl md:text-5xl font-bold" />
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 500+ developers building complete apps with guided Cursor prompts.
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
              <span className="font-medium">500+ apps built</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">10-step guided wizard</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">847 developers building faster</span>
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
