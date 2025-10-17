"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";

export default function GenericPromptPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateGenericPrompt);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  const [goal, setGoal] = React.useState("");
  const [context, setContext] = React.useState("");
  const [format, setFormat] = React.useState("text");
  const [tone, setTone] = React.useState("professional");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const [optimizedPrompt, setOptimizedPrompt] = React.useState<string | null>(null);
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[] | null>(null);
  const [example, setExample] = React.useState<string | null>(null);

  async function onGenerate() {
    if (!user?.id || !goal.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      toast.info("Generating... This might take a few seconds.");
      const res = await runGenerate({
        userGoal: goal.trim(),
        context: context.trim() || undefined,
        outputFormat: format,
        tone,
        userId: user.id,
      });
      const r = res as unknown as { optimizedPrompt: string; explanation: string; tips: string[]; exampleOutput: string };
      setOptimizedPrompt(r.optimizedPrompt);
      setExplanation(r.explanation);
      setTips(r.tips);
      setExample(r.exampleOutput);
      setSuccess(true);
      setShowConfetti(true);
      toast.success("Prompt generated!");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 1200);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }

  function applyTemplate(template: { goal: string; context?: string; format?: string; tone?: string }) {
    setGoal(template.goal);
    if (template.context) setContext(template.context);
    if (template.format) setFormat(template.format);
    if (template.tone) setTone(template.tone);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Generic Prompt Assistant</h1>
        <p className="mt-1 text-sm text-foreground/70">We&apos;ll help you create the perfect prompt!</p>
      </div>

      {/* Main Input Card */}
      <Card className="p-4 shadow-lg ring-1 ring-border">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="mb-2 block">What do you want to create?</Label>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-background p-3 text-base"
              rows={6}
              placeholder="Describe your goal in plain language..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <p className="mt-1 text-xs text-foreground/60">Be specific. Include audience, constraints, and desired outcome if possible.</p>
          </div>
          <div>
            <Label className="mb-2 block">Context (optional)</Label>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
              rows={3}
              placeholder="Add any relevant background info, examples, or constraints"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Output format</Label>
              <select
                className="w-full rounded-md border border-border bg-background p-2 text-sm"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                {["text","list","table","code","outline","steps"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Tone</Label>
              <select
                className="w-full rounded-md border border-border bg-background p-2 text-sm"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {["professional","casual","creative","concise","friendly","persuasive"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onGenerate} disabled={loading || !goal.trim() || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)} className="h-11 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
              {loading ? "Generating..." : "Generate Optimized Prompt"}
            </Button>
            {stats && !stats.isPro && (
              <span className={`text-sm ${stats.remainingPrompts <= 0 ? "text-red-600" : stats.remainingPrompts <= 5 ? "text-yellow-600" : "text-foreground/70"}`}>
                {stats.remainingPrompts <= 0 ? "Limit reached" : `${stats.remainingPrompts} remaining today`}
              </span>
            )}
            {success && (
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-sm text-green-600"
              >
                Success!
              </motion.span>
            )}
          </div>
        </div>
      </Card>
      {showConfetti && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="pointer-events-none fixed inset-0 z-50">
          {/* lightweight confetti substitute (placeholder) */}
        </motion.div>
      )}

      {/* Quick Templates */}
      <div>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Quick Templates</h2>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-md border border-border bg-secondary/10 px-3 py-1 text-sm transition-colors hover:bg-secondary/20"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Panel */}
      {optimizedPrompt && (
        <Card className="p-4 shadow-xl ring-1 ring-border">
          <h2 className="text-base font-semibold tracking-tight">Your Optimized Prompt</h2>
          <div className="mt-3 rounded-md border border-border">
            <Toolbar content={optimizedPrompt} />
            <div className="border-t border-border">
              <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                {optimizedPrompt}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-3 shadow-sm ring-1 ring-border">
              <h3 className="text-sm font-medium">Why this works</h3>
              <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{explanation || ""}</p>
            </Card>
            <Card className="p-3 shadow-sm ring-1 ring-border">
              <h3 className="text-sm font-medium">Tips for better results</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                {(tips || []).map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-3 shadow-sm ring-1 ring-border">
              <h3 className="text-sm font-medium">Example output</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{example || ""}</pre>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="formatted">
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted">
                <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16 }}>
                  {optimizedPrompt}
                </SyntaxHighlighter>
              </TabsContent>
              <TabsContent value="raw">
                <pre className="overflow-x-auto rounded-md bg-secondary/10 p-3 text-sm ring-1 ring-border">{optimizedPrompt}</pre>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}
    </div>
  );
}

function Toolbar({ content }: { content: string }) {
  async function onCopy() {
    try { await navigator.clipboard.writeText(content); } catch {}
  }
  function onDownload() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="flex items-center justify-end gap-2 px-3 py-2">
      <Button variant="outline" size="sm" onClick={onCopy} className="shadow-sm hover:shadow-md">Copy</Button>
      <Button variant="outline" size="sm" onClick={onDownload} className="shadow-sm hover:shadow-md">Download</Button>
    </div>
  );
}

const templates: Array<{ label: string; goal: string; context?: string; format?: string; tone?: string }> = [
  {
    label: "Write an email",
    goal: "Write a professional email to a client about a project update",
    format: "text",
    tone: "professional",
  },
  {
    label: "Summarize text",
    goal: "Summarize the following article into 5 bullet points",
    format: "list",
    tone: "concise",
  },
  {
    label: "Generate ideas",
    goal: "Generate 10 creative ideas for social media content for a new product",
    format: "list",
    tone: "creative",
  },
  {
    label: "Explain a concept",
    goal: "Explain how OAuth 2.0 works to a non-technical audience",
    format: "text",
    tone: "friendly",
  },
  {
    label: "Create a plan",
    goal: "Create a step-by-step plan to launch an online course",
    format: "steps",
    tone: "professional",
  },
];


