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
  BarChart2,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { user, isSignedIn } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  React.useEffect(() => {
    if (isSignedIn && user?.id && user?.primaryEmailAddress?.emailAddress) {
      // Best-effort create to avoid missing user records
      getOrCreateUser({ clerkId: user.id, email: user.primaryEmailAddress.emailAddress }).catch(() => {});
    }
  }, [isSignedIn, user?.id, user?.primaryEmailAddress?.emailAddress]);

  const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { href: "/dashboard", label: "Prompt Studio", icon: Home },
    { href: "/dashboard/cursor-app-builder", label: "Cursor App Builder", icon: AppWindow },
    { href: "/dashboard/generic-prompts", label: "Generic Prompts", icon: FileText },
    { href: "/dashboard/image-prompts", label: "Image Prompts", icon: Image },
    { href: "/dashboard/analyze-improve", label: "Analyze & Improve", icon: BarChart2 },
    { href: "/dashboard/output-predictor", label: "Output Predictor", icon: Eye },
    { href: "/dashboard/history", label: "History", icon: Clock },
  ];

  function isActive(href: string) {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const Sidebar = (
    <aside
      className={
        "flex h-full flex-col justify-between bg-dark p-4 text-foreground ring-1 ring-border transition-[width] duration-300 ease-in-out " +
        (isCollapsed ? "w-20" : "w-64 md:w-56 lg:w-64")
      }
    >
      <div>
        <div className="mb-2 flex justify-end">
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
        <nav>
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      "group flex rounded-md px-3 py-2 text-sm transition-all " +
                      (isCollapsed ? "justify-center" : "items-center gap-2") +
                      " " +
                      (active
                        ? "bg-light shadow-sm ring-1 ring-border"
                        : "hover:bg-secondary/10 hover:shadow-sm")
                    }
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {!isCollapsed && <span className="font-medium">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="pt-4">
        <Button className="w-full gap-2 rounded-md bg-primary text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <Crown className="h-4 w-4" /> Upgrade to Pro
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:block">{Sidebar}</div>

      {/* Main Column */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-base/80 ring-1 ring-border shine-top">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
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
              <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-primary">
                Context Wizard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/70">X/5 generations today</span>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Layered background main area */}
        <div className="relative isolate flex-1 bg-gradient-to-b from-background to-card">
          <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-24 after:bg-black/20 after:blur-3xl after:content-['']" />
          <main className="relative mx-auto w-full max-w-7xl px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


