"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

type Prefs = {
  model: string;
  verbosity: "brief" | "normal" | "detailed";
  style: string;
  tone: string;
  format: string;
  stacks: string[];
};

const DEFAULT_PREFS: Prefs = {
  model: "anthropic/claude-3.5-sonnet",
  verbosity: "normal",
  style: "step-by-step",
  tone: "professional",
  format: "text",
  stacks: [],
};

export default function SettingsPage() {
  const { user } = useUser();
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { isPro: boolean; totalPrompts: number; promptsToday: number; remainingPrompts: number }
    | undefined;

  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = React.useState(false);
  const [showReOnboarding, setShowReOnboarding] = React.useState(false);
  const resetOnboarding = useMutation(api.onboarding.resetOnboarding);

  // Analytics tracking function
  function trackSettingsEvent(eventName: string, properties?: Record<string, unknown>) {
    try {
      window.posthog?.capture?.(eventName, properties);
    } catch (e) {
      console.warn('PostHog tracking failed:', e);
    }
  }

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("cw_settings_prefs");
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Prefs) });
    } catch {}
    trackSettingsEvent('settings_page_viewed');
  }, []);

  function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    trackSettingsEvent('preferences_updated', { preference_type: key });
  }

  function toggleStack(name: string) {
    setPrefs((p) => ({ ...p, stacks: p.stacks.includes(name) ? p.stacks.filter((s) => s !== name) : [...p.stacks, name] }));
    trackSettingsEvent('preferences_updated', { preference_type: 'stacks' });
  }

  async function save() {
    setSaving(true);
    try {
      localStorage.setItem("cw_settings_prefs", JSON.stringify(prefs));
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {/* API Preferences */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">API Preferences</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="preferred-ai-model" className="mb-2 block">Preferred AI model</Label>
            <select
              id="preferred-ai-model"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              value={prefs.model}
              onChange={(e) => update("model", e.target.value)}
            >
              {["anthropic/claude-3.5-sonnet","openai/gpt-4o-mini","google/gemini-1.5-pro","openrouter/best"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="output-verbosity" className="mb-2 block">Output verbosity</Label>
            <select
              id="output-verbosity"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              value={prefs.verbosity}
              onChange={(e) => update("verbosity", e.target.value as Prefs["verbosity"])}
            >
              <option value="brief">brief</option>
              <option value="normal">normal</option>
              <option value="detailed">detailed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Default prompt style</Label>
            <Input value={prefs.style} onChange={(e) => update("style", e.target.value)} placeholder="e.g., step-by-step with constraints" className="h-11" />
          </div>
        </div>
      </Card>

      {/* Prompt Defaults */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Prompt Defaults</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="default-tone" className="mb-2 block">Default tone</Label>
            <select
              id="default-tone"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              value={prefs.tone}
              onChange={(e) => update("tone", e.target.value)}
            >
              {["professional","casual","creative","concise","friendly","persuasive"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="default-format" className="mb-2 block">Default format</Label>
            <select
              id="default-format"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              value={prefs.format}
              onChange={(e) => update("format", e.target.value)}
            >
              {["text","list","table","code","outline","steps"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-2 block">Favorite tech stacks (quick select)</Label>
            <div className="flex flex-wrap gap-2">
              {["React","Vue","Svelte","Next.js","Node.js","Python","Go","PostgreSQL","MongoDB","Stripe","Auth","CI/CD"].map((s) => {
                const active = prefs.stacks.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStack(s)}
                    className={
                      "rounded-md border px-2 py-1 text-xs transition-colors " +
                      (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")
                    }
                  >
                    {active && <span className="mr-1">✓</span>}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Account</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Total prompts" value={String(stats?.totalPrompts ?? 0)} />
          <Stat label="Prompts today" value={String(stats?.promptsToday ?? 0)} />
          <Stat label="Remaining today" value={String(stats?.remainingPrompts ?? 0)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{stats?.isPro ? "Pro" : "Free"}</Badge>
          {!stats?.isPro && <Button className="h-11" onClick={() => { try { window.location.href = "/dashboard/billing"; } catch {} }}>Upgrade to Pro</Button>}
          <Button variant="outline" className="h-11" onClick={() => {
            trackSettingsEvent('account_deleted_clicked');
            if (confirm("Delete account? This cannot be undone.")) {
              trackSettingsEvent('account_deletion_confirmed');
              alert("Account deletion not implemented yet.");
            }
          }}>Delete account</Button>
        </div>
      </Card>

      {/* Onboarding */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Onboarding</h2>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">Retake the onboarding survey to update your preferences and get new recommendations.</p>
          <Button 
            variant="outline" 
            className="h-11" 
            onClick={async () => {
              if (user?.id) {
                trackSettingsEvent('re_onboarding_clicked');
                // Reset onboarding status first
                await resetOnboarding({ userId: user.id });
                // Then show the modal
                setShowReOnboarding(true);
              }
            }}
          >
            Retake Onboarding Survey
          </Button>
        </div>
      </Card>

      {/* Integrations */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Integrations (coming soon)</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <IntegrationCard name="Cursor" />
          <IntegrationCard name="GitHub" />
          <IntegrationCard name="Image Generators" />
        </div>
      </Card>

      {/* Tools We Use */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Tools We Use</h2>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Check out the tools we personally use and recommend to enhance your AI development workflow.
          </p>
          <a 
            href="/tools" 
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explore Recommended Tools →
          </a>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="h-11">{saving ? "Saving..." : "Save Preferences"}</Button>
      </div>
      
      {/* Re-onboarding modal */}
      {showReOnboarding && user?.id && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => {
            trackSettingsEvent('re_onboarding_completed');
            setShowReOnboarding(false);
          }}
        />
      )}
    </div>
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

function IntegrationCard({ name }: { name: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-sm font-medium">Connect to {name}</div>
      <p className="mt-1 text-xs text-foreground/60">Integration setup will appear here once available.</p>
      <div className="mt-2">
        <Button variant="outline" className="h-11" disabled>Connect</Button>
      </div>
    </div>
  );
}


