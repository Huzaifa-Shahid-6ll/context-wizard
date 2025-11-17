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
import LightRays from "@/components/LightRays";
import ShinyText from "@/components/ui/ShinyText";
import { ScrollLockedCards } from "@/components/landing/ScrollLockedCards";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";


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
  ];

  const featureCards = [
    {
      icon: Workflow,
      title: "10-Step Guided Wizard",
      desc: "Complete step-by-step process from app type selection to deployment. Our comprehensive wizard walks you through every stage of development—from choosing your app architecture to setting up authentication, database connections, API endpoints, and deployment configurations. No guesswork, no missing steps—just follow the prompts and build with confidence.",
    },
    {
      icon: Sparkles,
      title: "AI-Generated Cursor Prompts",
      desc: "Get production-ready prompts for every feature you need—authentication systems, database setup and migrations, API routes with proper error handling, frontend components with state management, testing configurations, and deployment strategies. Each prompt is carefully crafted to work seamlessly with Cursor's AI, ensuring you get code that matches your project structure and follows industry best practices.",
    },
    {
      icon: Code2,
      title: "Multiple App Templates",
      desc: "Choose from a wide variety of app templates including portfolio sites, e-commerce platforms, SaaS applications, blog systems, dashboards, or build completely custom apps with our guided prompts. Each template comes with pre-configured prompts for common features, saving you hours of setup time and ensuring consistency across your project.",
    },
    {
      icon: Shield,
      title: "Best Practices Built-In",
      desc: "Every prompt includes comprehensive error handling, security considerations, input validation, proper authentication flows, and architecture patterns from day one. We've learned from thousands of projects to ensure your code is secure, maintainable, and scalable from the very first line. No technical debt, no shortcuts—just production-ready code.",
    },
    {
      icon: Zap,
      title: "Works for Non-Developers",
      desc: "Even if you're new to coding, our guided prompts make building complex apps accessible to everyone. Each step is explained in plain language, with clear instructions on what to do and why. The AI handles the complex parts while you learn and understand the process. Perfect for entrepreneurs, designers, or anyone who wants to build without years of coding experience.",
    },
    {
      icon: Rocket,
      title: "From Idea to Production",
      desc: "Complete workflow from project setup to deployment. All prompts are production-ready and tested, covering everything from initial project scaffolding to database migrations, API development, frontend implementation, testing, and final deployment. Follow the guided process and go from concept to live application faster than ever before, with confidence that your code is ready for real users.",
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
            The only tool that generates step-by-step prompts for building full applications. From portfolio sites to SaaS platforms—build anything with guided AI assistance.
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
              className="light-shine h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-semibold shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
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
      <section id="problem" className="relative">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-primary text-shadow-md">
            <ShinyText
              text="Why AI Coding Tools Keep Failing You"
              speed={3}
              className="text-4xl sm:text-5xl font-extrabold"
              highlightWord="Failing"
              highlightClassName="text-red-500 font-extrabold"
            />
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg sm:text-xl font-semibold">
            Every developer knows the frustration. Here{'\''}s what{'\''}s really going wrong.
          </p>
        </div>
        <ScrollLockedCards />
      </section>

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
            className="light-shine
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden
              p-0"
          >
            <div
              className="bg-white
                h-48
                flex items-center justify-center
                overflow-hidden relative"
            >
              <Image 
                src="/Consult-Experts--Streamline-Milano.png" 
                alt="Choose Your App Type" 
                width={160} 
                height={160} 
                className="w-full h-full object-contain"
              />
            </div>
            <CardHeader className="pt-4 px-6">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Choose Your App Type" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6 px-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Select from portfolio sites, e-commerce, SaaS platforms, or custom apps. Our wizard guides you through every step.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card 
            className="light-shine
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden
              p-0"
          >
            <div
              className="bg-white
                h-48
                flex items-center justify-center
                overflow-hidden relative"
            >
              <Image 
                src="/Being-Creative-2--Streamline-Milano.png" 
                alt="Get Step-by-Step Prompts" 
                width={160} 
                height={160} 
                className="w-full h-full object-contain"
              />
            </div>
            <CardHeader className="pt-4 px-6">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Get Step-by-Step Prompts" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6 px-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our AI generates complete Cursor prompts for every feature—from setup to deployment. Copy, paste, and build.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card 
            className="light-shine
              border-0
              hover-lift
              transition-all duration-300
              overflow-hidden
              p-0"
          >
            <div
              className="bg-white
                h-48
                flex items-center justify-center
                overflow-hidden relative"
            >
              <Image 
                src="/Analyze-Data-5--Streamline-Milano.png" 
                alt="Build Your Complete App" 
                width={160} 
                height={160} 
                className="w-full h-full object-contain"
              />
            </div>
            <CardHeader className="pt-4 px-6">
              <CardTitle className="text-lg font-semibold">
                <ShinyText text="Build Your Complete App" speed={3} className="text-lg font-semibold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6 px-6">
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
            <div className="absolute inset-0">
              <Image 
                src="/Digital-Nomad-Working-In-Coffee-Shop-3--Streamline-Milano.png" 
                alt="See Cursor Builder in Action" 
                fill
                className="object-cover"
              />
            </div>
            {/* Overlay with text and play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
              <div className="text-xl font-semibold text-white">
                <ShinyText text="See Cursor Builder in Action" speed={3} className="text-xl font-semibold" />
              </div>
              <div className="text-sm text-white/90 mt-2">Watch how easy it is to build complete apps with guided prompts</div>
              
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
        <h2 className="text-center mb-4 text-shadow-md">
          <div className="text-[#b5b5b5a4] bg-clip-text inline-block animate-shine text-3xl sm:text-4xl md:text-5xl font-black" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', animationDuration: '3s' }}>
            See the Difference <span className="text-[#fafafa]">Great Prompts</span> Make
          </div>
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-base max-w-2xl mx-auto">
          Same AI, completely different results. See why GREAT PROMPTS matter.
        </p>
        
        {/* Desktop: Side-by-side, Mobile: Tabs */}
        <div className="hidden md:grid grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Before */}
          <Card className="light-shine border-0 p-6">
            <div className="mb-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-destructive">
                <ShinyText text="Without Great Prompts" speed={3} className="text-2xl sm:text-3xl font-bold" />
              </CardTitle>
            </div>
            <div className="rounded-lg p-4 mb-4">
              <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
          </Card>

          {/* After */}
          <Card className="light-shine border-0 p-6 hover-lift">
            <div className="mb-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
                <ShinyText text="With Great Prompts" speed={3} className="text-2xl sm:text-3xl font-bold" />
              </CardTitle>
            </div>
            <div className="rounded-lg p-4 mb-4">
              <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
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
              <Card className="light-shine border-0 p-6">
                <div className="mb-4">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-destructive">
                <ShinyText text="Without Great Prompts" speed={3} className="text-2xl sm:text-3xl font-bold" />
              </CardTitle>
                </div>
            <div className="rounded-lg p-4 mb-4">
              <Image src="/badCODE_example.png" alt="Messy AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
            </div>
              </Card>
            </TabsContent>
            <TabsContent value="after" className="mt-0">
              <Card className="light-shine border-0 p-6">
                <div className="mb-4">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
                <ShinyText text="With Great Prompts" speed={3} className="text-2xl sm:text-3xl font-bold" />
              </CardTitle>
                </div>
                <div className="rounded-lg p-4 mb-4">
                  <Image src="/Good Code_example.png" alt="Clean AI-generated code" width={600} height={360} className="h-auto w-full rounded" />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <SignUpButton mode="modal">
            <Button 
              size="lg" 
              className="light-shine h-12 px-8 text-base font-semibold shadow-depth-lg hover:shadow-elevated"
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

      {/* SECTION 6: TESTIMONIALS (Langbase Style Replica) */}
      <ScrollReveal>
      <section id="testimonials" className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Section Header - Langbase Style */}
          <div className="text-center mb-16">
            <p className="text-emerald-500 text-sm sm:text-base font-medium mb-4">
              Trusted by the world's top innovative organizations
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              What developers and founders are saying about Context Wizard
            </h2>
          </div>

          {/* Testimonials Grid - Langbase Style with Varied Card Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {[
              { 
                initials: "ZB", 
                bg: "bg-blue-500", 
                quote: "Context Wizard is transforming how AI coding tools are managed. From easy integrations, and seamless control of context files. What else could we ask for?",
                name: "Zane Burke", 
                title: "CTO & Co-founder",
                company: "Context Wizard"
              },
              { 
                initials: "SD", 
                bg: "bg-green-500", 
                quote: "The real breakthrough here is how easily we can test context files via Context Wizard – actually seeing which patterns get recognized for specific codebases. That kind of visibility just isn't available with other providers. Typically, you'd need specialized knowledge, framework-centric coding, or custom configurations to get the same result. But with Context Wizard, there's next-to-no-overhead or prior expertise needed. The straightforward setup, developer experience, out-of-the-box features, and built-in version control instantly give it a huge plus for anyone building AI-driven apps. Context Wizard basically saved me from an AI engineer overnight. The learning curve is practically zero thanks to the clear explanations and clean UI. And being able to talk directly with real engineers on their support team makes the entire experience even smoother.",
                name: "Stephen Degnan", 
                title: "AI & Internal Tooling Lead",
                company: "Liquid Web",
                span: 2,
                customerStory: "Customer story: Liquid Web's 300% productivity boost with Context Wizard",
                logo: "Liquid Web"
              },
              { 
                initials: "LK", 
                bg: "bg-purple-500", 
                quote: "Context Wizard uniquely positioned to dramatically improve the AI developer experience. We have done exactly that with Context Wizard, building an OpenAI-agnostic context routing product for developers.",
                name: "Logan Kilpatrick", 
                title: "Google - OpenAI - Harvard"
              },
              { 
                initials: "AC", 
                bg: "bg-amber-500", 
                quote: "Context Wizard lets us manage all our context-related infrastructure in one place. Quick iteration, real-time analytics, version controlled prompts, and real-time testing of different LLM models. Need more in context engineering? Context Wizard has it!",
                name: "Anand Chaudhary", 
                title: "CTO - Product & AI",
                company: "Census.com - Former AWS/DO"
              },
              { 
                initials: "ST", 
                bg: "bg-indigo-500", 
                quote: "We wrote ChatGPT v3 with our own context engine using Context Wizard. Why? Control and accuracy. Each step from prompt to answer is a Context Wizard pipe. This means prompt testing, prompt and model refinement. Want to add an OpenAI-agnostic routing layer? Context Wizard. It's not just about better answers – it's about building a system we can trust.",
                name: "Sharo Tojo", 
                title: "Founder",
                company: "DevGPT"
              },
              { 
                initials: "RH", 
                bg: "bg-teal-500", 
                quote: "Trusted to use Context Wizard. World Context Wizard is transforming AI development with its context infrastructure, making it easy for any developer to build, collaborate, and deploy AI apps. Think flexible workflows, but for AI context! Proud to have supported them from the beginning!",
                name: "Ramon Hernandez", 
                title: "CEO & Co-founder",
                company: "Context Wizard"
              },
              { 
                initials: "RR", 
                bg: "bg-pink-500", 
                quote: "Context Wizard uniquely solves for the hard parts of AI. It does the context models. Unlike an LLM, Context Wizard is the easiest way to build AI features. You can actually use build, ship, and iterate with zero config, nothing to happen.",
                name: "Raf Radish", 
                title: "Founding Designer",
                company: "Vercel",
                logo: "Vercel"
              },
              { 
                initials: "JG", 
                bg: "bg-cyan-500", 
                quote: "LLMs are redefining the meaning of an application. Context Wizard is the easiest way to build AI features. It empowers every developer to build AI features in building this new world.",
                name: "Jan Ghinger", 
                title: "CTO",
                company: "Monorepo"
              },
              { 
                initials: "RP", 
                bg: "bg-orange-500", 
                quote: "Get an early beta. Context Wizard is shipping groundbreaking AI features for optimal control. We've worked for months. This means we're building AI powered projects and we're there!",
                name: "Rahul Parekh", 
                title: "Head of Product",
                company: "Census.com - Former AWS/DO"
              },
              { 
                initials: "KS", 
                bg: "bg-emerald-500", 
                quote: "Really impressed with Context Wizard over OpenAI's GPT-3.5. One of the most 'no-brainer' tools I've seen in the past decade. It's creating a new way to use custom composable context files to easily build/deploy new models as they are trained. It's the fastest way for anyone to stay on the bleeding edge without without under-resourcing. Context Wizard is simplifying the complexity of AI.",
                name: "Kin Singh", 
                title: "Founder",
                company: "Ideas - Gitcoin"
              },
              { 
                initials: "RS", 
                bg: "bg-blue-600", 
                quote: "Excellent product. Just added to the AI Development Tools list!",
                name: "Robert Smith", 
                title: "AI Engineer",
                company: "Microsoft"
              },
              { 
                initials: "CG", 
                bg: "bg-violet-500", 
                quote: "I had an opportunity to take an early look at Context Wizard is doing is groundbreaking to help manage context files for AI agents and resources for myself. The team allows me to build AI powered projects and we're there!",
                name: "Corbin Godfrey", 
                title: "Founding Designer",
                company: "Vercel"
              },
              { 
                initials: "BG", 
                bg: "bg-rose-500", 
                quote: "Good developers tools... Context Wizard is shipping the OpenAI-agnostic routing and pipelines that developers love to use. It ensures repetition, high-fidelity, inference routing, and allows leveraging the best models to build one more that scales. With AI pipes, developers can build and iterate AI features at high velocity.",
                name: "Benjamin Godfrey", 
                title: "CEO",
                company: "Flowman - Persistent"
              },
              { 
                initials: "AA", 
                bg: "bg-sky-500", 
                quote: "Composability - building complex systems from simple, interchangeable parts - can transform development processes. At npm, we made package management composable. Context Wizard brings this same spirit of modularity and flexibility into the AI domain.",
                name: "Ahmad Awais", 
                title: "CTO",
                company: "npm - Google - Texas"
              },
              { 
                initials: "GG", 
                bg: "bg-lime-500", 
                quote: "Context Wizard AI serves an easy day experience is powerful and unique. Truly designed to meet the needs of developers building and operating LLM apps.",
                name: "Guy Godfrey", 
                title: "Founder",
                company: "Envy"
              },
              { 
                initials: "JA", 
                bg: "bg-fuchsia-500", 
                quote: "If you're a developer and you're looking to do, you should be using Context Wizard. It's easy to use, extensible, and configurable. You can focus on your product and business rather than all the plumbing. Great work Ahmad and team!",
                name: "James Andrade", 
                title: "Staff Engineer",
                company: "Vercel"
              },
              { 
                initials: "MG", 
                bg: "bg-yellow-500", 
                quote: "We use OpenAI's GPT-3.5. I've been playing with Context Wizard since early 2023. I've got working with AI, this has 10/10 platform, 10/10 landing page.",
                name: "Mike Giles", 
                title: "Founder",
                company: "RapidAPI"
              },
              { 
                initials: "WM", 
                bg: "bg-red-500", 
                quote: "Really impressive launch of Context Wizard! It makes it easy for developers to build complex AI agents in a more modular and scalable manner. Context Wizard is an early supporter of Ahmad on his founder journey.",
                name: "Walter Marshall", 
                title: "Founder",
                company: "Flowman"
              },
            ].map((t, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-lg bg-card border border-border/40 hover:border-border transition-colors ${t.span === 2 ? 'md:col-span-2 lg:col-span-2' : ''} flex flex-col w-full`}
                style={{ height: 'fit-content' }}
              >
                <p className="text-sm sm:text-base leading-relaxed text-foreground">
                  {t.quote}
                </p>
                <div className="border-t border-border/40 mt-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-full ${t.bg} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {t.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.title}{t.company && `, ${t.company}`}
                      </div>
                      {t.customerStory && (
                        <p className="text-emerald-500 text-xs font-medium mt-3">
                          {t.customerStory}
                        </p>
                      )}
                      {t.logo && (
                        <div className="mt-3 text-xs text-muted-foreground font-medium">
                          {t.logo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 7: FEATURES (What You Get - Benefit-Focused) */}
      <ScrollReveal>
      <section 
        id="features" 
        className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24
          bg-black
          border-y border-border/20"
      >
        <h2 
          className="text-center text-3xl sm:text-4xl font-bold text-primary
            text-shadow-md
            tracking-tight"
        >
          <div
            className="text-[#b5b5b5a4] bg-clip-text inline-block animate-shine text-3xl sm:text-4xl font-bold"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              animationDuration: "3s"
            }}
          >
            Everything You Need to Build Complete <span className="text-[#fafafa]">Apps</span>
          </div>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70 text-base">Six powerful features that help you build production-ready applications with AI.</p>
        <div className="mt-10">
          <ScrollStack
            className="max-h-[80vh]"
            itemDistance={200}
            itemStackDistance={30}
            stackPosition="20%"
            baseScale={0.85}
            rotationAmount={0}
            blurAmount={0}
          >
            {featureCards.map(({ title, desc }) => (
              <ScrollStackItem
                key={title}
                itemClassName="bg-transparent !p-0 !shadow-none !rounded-none !h-auto"
              >
                <Card
                  className="light-shine depth-layer-2
                    shadow-depth-md
                    border-0
                    hover:depth-layer-3
                    hover:shadow-elevated
                    transition-all duration-300
                    overflow-hidden
                    h-full gap-4
                    min-h-[280px]
                    group"
                  onClick={() => trackEvent("feature_card_clicked", { feature_name: title })}
                >
                  <CardHeader className="gap-1 pb-0">
                    <CardTitle
                      className="text-xl font-semibold
                        text-shadow-sm
                        group-hover:text-primary
                        transition-colors"
                    >
                      {title}
                    </CardTitle>
                    <div className="h-[2px] w-full bg-foreground/30 rounded-full"></div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-foreground/80 text-base leading-relaxed">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>
      </ScrollReveal>

      {/* SECTION 8: USE CASES (Who This Is For) */}
      <ScrollReveal>
      <section 
        id="use-cases"
        className="bg-black"
      >
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-center mb-4 text-primary
              text-shadow-md"
          >
            <div
              className="text-[#b5b5b5a4] bg-clip-text inline-block animate-shine text-3xl sm:text-4xl font-bold"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: "3s"
              }}
            >
              Perfect For Every <span className="text-[#fafafa]">Builder</span>
            </div>
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-base">From solo developers to teams—build apps faster with guided Great prompts</p>

          {/* Primary: Vibe Coders (40% size) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <Card className="light-shine lg:col-span-2 depth-layer-2 shadow-depth-lg border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
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
            <Card className="light-shine lg:col-span-1 depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-6">
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
            <div
              className="text-[#b5b5b5a4] bg-clip-text inline-block animate-shine text-3xl sm:text-4xl font-bold"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: "3s"
              }}
            >
              Go Beyond Context Files—<span className="text-[#fafafa]">Build Entire Apps</span>
            </div>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            The only tool that generates complete prompts for building full applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Visual/Screenshot */}
          <div className="order-2 lg:order-1">
            <Card className="light-shine depth-layer-2 shadow-depth-lg border-0 p-6">
              <div className="rounded-lg depth-layer-1 shadow-inset h-96 flex items-center justify-center bg-white overflow-hidden relative force-bg-white">
                <Image 
                  src="/Evaluate-Performance-Employee-3--Streamline-Milano.png" 
                  alt="Cursor Builder Screenshot" 
                  width={400} 
                  height={400} 
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          </div>

          {/* Right: Benefits */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-6 text-primary">
              <ShinyText text="The Only Tool That Generates Complete Prompts" speed={3} className="text-2xl font-bold" />
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
              <Button asChild size="lg" className="light-shine h-12 px-8 text-base font-semibold">
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
              <Button asChild className="light-shine">
                <a href="mailto:support@contextwizard.com">Contact Support</a>
              </Button>
              <Button asChild variant="outline" className="light-shine">
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
            Join 500+ developers building complete apps with guided prompts.
          </p>

          {/* Large CTA */}
          <div className="mb-8">
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="light-shine h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-semibold shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-200"
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
        suppressHydrationWarning
      >
        {JSON.stringify(jsonLd)}
      </script>
    </div>
  );
}
