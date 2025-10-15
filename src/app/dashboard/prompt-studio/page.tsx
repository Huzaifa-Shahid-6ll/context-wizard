"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AppWindow,
  FileText,
  Image as ImageIcon,
  BarChart2,
  Eye,
  History,
} from "lucide-react";

type RecentPrompt = {
  _id: string;
  title?: string;
  type?: string;
  createdAt?: number;
};

export default function PromptStudioPage() {
  const { user } = useUser();
  const clerkId = user?.id;

  const recentPrompts = useQuery(api.queries.listPromptsByUser, clerkId ? { userId: clerkId, limit: 5 } : "skip") as
    | RecentPrompt[]
    | undefined;

  // Basic quick stats derived from available queries
  // If more detailed stats are needed, add/consume a dedicated stats query.
  const totalPrompts = recentPrompts?.length ?? 0;

  const actionCards = [
    {
      href: "/dashboard/cursor-builder",
      title: "Build Cursor App",
      description: "Create a new cursor-based application.",
      icon: AppWindow,
    },
    {
      href: "/dashboard/generic-prompt",
      title: "Create Generic Prompt",
      description: "Design a generic prompt for various uses.",
      icon: FileText,
    },
    {
      href: "/dashboard/image-prompt",
      title: "Generate Image Prompt",
      description: "Craft prompts for image generation.",
      icon: ImageIcon,
    },
    {
      href: "/dashboard/analyze",
      title: "Analyze Prompt",
      description: "Analyze the effectiveness of your prompts.",
      icon: BarChart2,
    },
    {
      href: "/dashboard/predict",
      title: "Predict Output",
      description: "Predict the output of a given prompt.",
      icon: Eye,
    },
    {
      href: "/dashboard/prompt-history",
      title: "View History",
      description: "Review your prompt history.",
      icon: History,
    },
  ];

  const lift = { whileHover: { y: -4, scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 20 } } };

  return (
    <div className="space-y-6">
      {/* Layered top background */}
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-['']" />
        <div className="relative">
          <QuickStatsCard
            stats={{
              today: 0, // Replace with real daily count when available
              remaining: 0, // Replace with real remaining if on free tier
              total: totalPrompts,
              mostUsedFeature: "generic", // Placeholder; compute from prompt metadata when available
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground/90">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map(({ href, title, description, icon: Icon }) => (
            <motion.div key={href} {...lift}>
              <Card className="group h-full p-4 shadow-md transition-shadow hover:shadow-lg">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium leading-none">{title}</h3>
                </div>
                <p className="mb-3 text-sm text-foreground/70">{description}</p>
                <div className="flex">
                  <Link href={href} className="ml-auto">
                    <Button size="sm" className="shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
                      Start
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground/90">Recent Activity</h2>
        <Card className="p-4 shadow-lg">
          <ul className="space-y-3">
            {(recentPrompts ?? []).map((p) => (
              <li key={p._id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{p.title || "Untitled Prompt"}</span>
                    {p.type && <Badge variant="secondary" className="capitalize">{p.type}</Badge>}
                  </div>
                  {typeof p.createdAt === "number" && (
                    <p className="text-xs text-foreground/60">{new Date(p.createdAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/dashboard/prompt/${p._id}`}>
                    <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md">View</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-sm hover:shadow-md"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(p.title || "");
                      } catch {}
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </li>
            ))}
            {!recentPrompts?.length && (
              <li className="text-sm text-foreground/60">No recent prompts yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function QuickStatsCard({
  stats,
}: {
  stats: { today: number; remaining: number; total: number; mostUsedFeature: string };
}) {
  return (
    <Card className="p-4 shadow-lg">
      <h2 className="text-base font-semibold tracking-tight">Quick Stats</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Prompts Today" value={String(stats.today)} />
        <Stat label="Remaining" value={String(stats.remaining)} />
        <Stat label="Total Prompts" value={String(stats.total)} />
        <Stat label="Most Used" value={stats.mostUsedFeature} />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/10 p-3 ring-1 ring-border">
      <div className="text-xs uppercase tracking-wide text-foreground/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}


