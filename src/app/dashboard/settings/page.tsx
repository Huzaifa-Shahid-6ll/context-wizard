"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DebugPanel from "@/components/DebugPanel";

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
    | { totalGenerations: number; generationsToday: number; remaining: number; isPro: boolean; totalPrompts: number; promptsToday: number; remainingPrompts: number }
    | undefined;

  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = React.useState(false);
  const [debugEnabled, setDebugEnabled] = React.useState<boolean>(false);
  const [debugInfo, setDebugInfo] = React.useState<unknown>(null);

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

  async function runDebugCheck() {
    try {
      const res = await fetch("/api/debug", { cache: "no-store" });
      const json = await res.json();
      setDebugInfo(json);
    } catch (e) {
      setDebugInfo({ error: (e as Error).message });
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
            <Label className="mb-2 block">Preferred AI model</Label>
            <select
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
            <Label className="mb-2 block">Output verbosity</Label>
            <select
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
            <Label className="mb-2 block">Default tone</Label>
            <select
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
            <Label className="mb-2 block">Default format</Label>
            <select
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
          {!stats?.isPro && <Button className="h-11">Upgrade to Pro</Button>}
          <Button variant="outline" className="h-11" onClick={() => {
            trackSettingsEvent('account_deleted_clicked');
            if (confirm("Delete account? This cannot be undone.")) {
              trackSettingsEvent('account_deletion_confirmed');
              alert("Account deletion not implemented yet.");
            }
          }}>Delete account</Button>
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

      {/* Debug */}
      <Card className="p-4 shadow-sm ring-1 ring-border">
        <h2 className="text-base font-semibold">Debug Mode</h2>
        <div className="mt-4 flex items-center gap-3">
          <Button variant={debugEnabled ? "default" : "outline"} onClick={() => setDebugEnabled((v) => !v)} className="h-11">
            {debugEnabled ? "Disable" : "Enable"} Debug Mode
          </Button>
          <Button variant="secondary" onClick={runDebugCheck} className="h-11">Run Debug Check</Button>
        </div>
        <div className="mt-4">
          <pre className="overflow-auto rounded-md bg-secondary/10 p-3 text-xs">
{JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="h-11">{saving ? "Saving..." : "Save Preferences"}</Button>
      </div>
      <DebugPanel enabled={debugEnabled} />
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


