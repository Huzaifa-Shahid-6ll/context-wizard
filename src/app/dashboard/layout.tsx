"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  AppWindow,
  FileText,
  Image,
  Video,
  BarChart2,
  Eye,
  Clock,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Crown,
  CreditCard,
  Sparkles,
  Wrench,
  Shield,
  MessageSquare,
  Bell,
  HelpCircle,
  Rocket,
} from "@/lib/icons";
import { useUser } from "@clerk/nextjs";
import { initPostHog, trackEvent, identify } from "@/lib/analytics";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";
import { Badge } from "@/components/ui/badge";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import UserInitialization from "@/components/auth/UserInitialization";
import { Card } from "@/components/ui/card";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { user, isSignedIn } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  
  // We'll fetch stats after user initialization to avoid race conditions
  const convexUser = useQuery(
    api.queries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Fetch stats only after user is confirmed to exist
  const stats = useQuery(
    api.users.getUserStats, 
    isSignedIn && user?.id && convexUser ? { userId: user.id } : "skip"
  ) as
    | {
        remainingPrompts: number;
        promptsToday: number;
        isPro: boolean;
        promptsTodayByType?: Record<string, number>;
      }
    | undefined;

  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    // Show onboarding if:
    // 1. User is authenticated
    // 2. User exists in our system
    // 3. User hasn't completed onboarding
    if (convexUser && !convexUser.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [convexUser]);
  const remainingPrompts = stats?.remainingPrompts ?? 0;

  // Initialize PostHog and user creation separately, only when needed
  React.useEffect(() => {
    initPostHog();
    if (isSignedIn && user?.id && user?.primaryEmailAddress?.emailAddress && !convexUser) {
      // Only create user if they don't already exist in our system
      getOrCreateUser({ clerkId: user.id, email: user.primaryEmailAddress.emailAddress }).catch(() => {});
      try {
        identify(user.id, { email: user.primaryEmailAddress.emailAddress });
      } catch {}
    }
  }, [isSignedIn, user?.id, user?.primaryEmailAddress?.emailAddress, convexUser, getOrCreateUser]);

  React.useEffect(() => {
    if (!isSignedIn) return;
    try {
      const intent = localStorage.getItem('auth_flow');
      if (intent === 'signin') {
        trackEvent('signin_completed');
        localStorage.removeItem('auth_flow');
      } else if (intent === 'signup') {
        trackEvent('signup_completed');
        localStorage.removeItem('auth_flow');
      }
    } catch {}
    try {
      if (!sessionStorage.getItem('first_session_started')) {
        trackEvent('first_session_started');
        sessionStorage.setItem('first_session_started', '1');
      }
    } catch {}
  }, [isSignedIn]);

  // Determine if user is admin (for now based on email, can be updated later)
  const isAdmin = user?.primaryEmailAddress?.emailAddress?.includes('admin') || 
                 user?.primaryEmailAddress?.emailAddress === 'james@contextwizard.com';

  const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    // @dashboard/
    { href: "/dashboard", label: "Dashboard", icon: Home },
    // @cursor-builder/
    { href: "/dashboard/cursor-builder", label: "App Builder Prompts", icon: AppWindow },
    // @generic-prompt/
    { href: "/dashboard/generic-prompt", label: "Generic Prompts", icon: FileText },
    // @image-prompt/
    { href: "/dashboard/image-prompt", label: "Image Prompts", icon: Image },
    // @video-prompt/
    { href: "/dashboard/video-prompt", label: "Video Prompts", icon: Video },
    // @predict/
    { href: "/dashboard/predict", label: "Output Predictor", icon: Eye },
    // @history/
    { href: "/dashboard/history", label: "Generation History", icon: Clock },
    // @prompt-history/
    { href: "/dashboard/prompt-history", label: "Prompt History", icon: Clock },
    // @chat-history/
    { href: "/dashboard/chat-history", label: "Chat History", icon: MessageSquare },
    // @prompt-studio/
    { href: "/dashboard/prompt-studio", label: "Prompt Studio", icon: BarChart2 },
    // @tools/
    { href: "/dashboard/tools", label: "Recommended Tools", icon: Wrench },
    // @billing/
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    // @settings/
    { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  ];

  // Add admin items for admin users only
  if (isAdmin) {
    navItems.push({ href: "/dashboard/admin/onboarding-stats", label: "Admin Stats", icon: BarChart2 });
    navItems.push({ href: "/dashboard/admin/security", label: "Security", icon: Shield });
  }

  function isActive(href: string) {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const Sidebar = (
    <aside
      className={
        "flex h-full flex-col bg-dark text-foreground ring-1 ring-border transition-[width] duration-300 ease-in-out " +
        (isCollapsed ? "w-20" : "w-64 md:w-56 lg:w-64")
      }
    >
      {/* Top Section: Brand */}
      <div className="p-4 border-b border-border">
        <div className="mb-3 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-primary">
              Conard
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((v) => !v)}
            className="h-8 w-8 text-foreground/70 hover:text-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Middle Section: Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav>
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      "group flex items-center rounded-md px-3 py-2 text-sm transition-all " +
                      (isCollapsed ? "justify-center" : "gap-3") +
                      " " +
                      (active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/70 hover:bg-secondary/10 hover:text-foreground")
                    }
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-foreground/60"}`} />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section: Help, Notifications, User, Promotional Card */}
      <div className="border-t border-border p-4 space-y-3">
        {/* Help Center */}
        {!isCollapsed && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-secondary/10 hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-foreground/60" />
            <span>Help center</span>
          </Link>
        )}
        {isCollapsed && (
          <Link
            href="/dashboard/settings"
            className="flex justify-center rounded-md p-2 text-foreground/70 hover:bg-secondary/10 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-foreground/60" />
          </Link>
        )}

        {/* Notifications */}
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-secondary/10 hover:text-foreground transition-colors relative"
          >
            <Bell className="h-4 w-4 text-foreground/60" />
            <span>Notifications</span>
            <Badge className="ml-auto h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              3
            </Badge>
          </Link>
        )}
        {isCollapsed && (
          <Link
            href="/dashboard"
            className="flex justify-center rounded-md p-2 text-foreground/70 hover:bg-secondary/10 transition-colors relative"
          >
            <Bell className="h-4 w-4 text-foreground/60" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              3
            </Badge>
          </Link>
        )}

        {/* User Profile */}
        {!isCollapsed && isSignedIn && (
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <UserButton />
            <span className="text-sm font-medium text-foreground">{user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}</span>
          </div>
        )}
        {isCollapsed && isSignedIn && (
          <div className="flex justify-center">
            <UserButton />
          </div>
        )}

        {/* Promotional Card */}
        {!isCollapsed && (
          <Card className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                {stats?.isPro ? "Pro plan active" : "Starter plan overview"}
              </h3>
              <p className="text-xs text-foreground/60 mt-1">
                {stats?.isPro 
                  ? "Unlimited prompts available" 
                  : `${remainingPrompts} of 50 prompts remaining today`}
              </p>
            </div>
            {!stats?.isPro && (
              <>
                {/* Visual progress indicator */}
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 flex-1 rounded border ${
                        i < Math.ceil((50 - remainingPrompts) / 10)
                          ? "bg-primary/20 border-primary/30"
                          : "bg-secondary/50 border-border"
                      }`}
                    />
                  ))}
                </div>
                <Link href="/dashboard/billing">
                  <Button className="w-full gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                    <Rocket className="h-3 w-3" />
                    Get full access
                  </Button>
                </Link>
              </>
            )}
            {stats?.isPro && (
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <Crown className="h-3 w-3 text-primary" />
                <span>Pro features enabled</span>
              </div>
            )}
          </Card>
        )}
        {isCollapsed && !stats?.isPro && (
          <Link href="/dashboard/billing" className="flex justify-center">
            <Button size="icon" className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              <Rocket className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );

  return (
    <UserInitialization>
      <div className="flex min-h-screen w-full">
        {/* Desktop / Tablet Sidebar - Hide during onboarding */}
        {!showOnboarding && (
          <div className="hidden md:block">{Sidebar}</div>
        )}

        {/* Main Column */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Top Navigation Bar - Hide during onboarding */}
          {!showOnboarding && (
            <header className="sticky top-0 z-40 bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-base/80 ring-1 ring-border shine-top">
            <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <div className="h-full w-64">{Sidebar}</div>
                </SheetContent>
              </Sheet>
            </div>
          </header>
          )}

          {/* Layered background main area */}
          <div className="relative isolate flex-1 bg-gradient-to-b from-background to-card">
            <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-24 after:bg-black/20 after:blur-3xl after:content-['']" />
            <main className="relative mx-auto w-full max-w-7xl px-4 py-6">
              {children}
              {showOnboarding && user?.id && (
                <OnboardingModal
                  userId={user.id}
                  onComplete={() => setShowOnboarding(false)}
                />
              )}
            </main>
          </div>

          {/* Mobile bottom tab bar - Hide during onboarding */}
          {!showOnboarding && (
            <nav className="sticky bottom-0 z-40 block border-t border-border bg-base/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-base/80 md:hidden">
            <div className="grid grid-cols-4 gap-2">
              {[
                { href: "/dashboard", label: "Home", Icon: Home },
                { href: "/dashboard/cursor-builder", label: "App Builder", Icon: AppWindow },
                { href: "/dashboard/generic-prompt", label: "Generic", Icon: FileText },
                { href: "/dashboard/image-prompt", label: "Image", Icon: Image },
                { href: "/dashboard/video-prompt", label: "Video", Icon: Video },
                { href: "/dashboard/predict", label: "Predict", Icon: Eye },
                { href: "/dashboard/history", label: "History", Icon: Clock },
                { href: "/dashboard/prompt-history", label: "Prompts", Icon: Clock },
                { href: "/dashboard/prompt-studio", label: "Studio", Icon: BarChart2 },
                { href: "/dashboard/tools", label: "Tools", Icon: Wrench },
                { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
              ].map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>
          )}
        </div>
      </div>
    </UserInitialization>
  );
}

function UsageIndicator({ remaining, breakdown, isPro }: { remaining: number; breakdown: Record<string, number>; isPro: boolean }) {
  const [open, setOpen] = React.useState(false);
  let color = "text-green-600";
  if (!isPro) {
    if (remaining < 10) color = "text-red-600";
    else if (remaining <= 20) color = "text-yellow-600";
  }
  React.useEffect(() => {
    try {
      if (isPro) {
        window.posthog?.capture('pro_unlimited_accessed');
      } else if (remaining <= 10) {
        window.posthog?.capture('free_limit_warning_shown', { remaining_count: remaining });
      }
    } catch {}
  }, [isPro, remaining]);
  return (
    <>
      <button
        onClick={() => { try { window.posthog?.capture('quota_viewed', { used: (breakdown.generic||0)+(breakdown.image||0), remaining, limit: isPro ? Number.MAX_SAFE_INTEGER : 50 }); } catch {}; setOpen(true); }}
        className={`min-h-11 min-w-11 rounded-md border border-border px-3 py-2 text-sm ${color}`}
        title="Daily prompt usage"
      >
        {isPro ? "Pro: Unlimited" : `${remaining} prompts/day`}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-lg bg-base p-4 ring-1 ring-border">
            <div className="mb-2 text-base font-semibold">Daily usage</div>
            <div className="text-sm text-foreground/70">{isPro ? "Unlimited for Pro users" : `${remaining} prompts remaining today (50 prompts/day)`}</div>
            {!isPro && (
              <div className="mt-3">
                <div className="text-xs font-medium text-foreground/60">Today{'\''}s prompts by type</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {Object.keys(breakdown).length === 0 && <li className="text-foreground/60">No prompts yet today.</li>}
                  {Object.entries(breakdown).map(([k, v]) => (
                    <li key={k} className="flex justify-between"><span className="capitalize">{k}</span><span>{v}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {!isPro && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                <Button className="bg-primary text-primary-foreground">Upgrade</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
