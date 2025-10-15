"use client";

import React from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type ImageResult = {
  midjourneyPrompt: string;
  dallePrompt: string;
  stableDiffusionPrompt: string;
  tips: string[];
  negativePrompts: string[];
};

const STYLE_PRESETS: Array<{ key: string; label: string; src: string }> = [
  { key: "realistic", label: "Realistic", src: "/globe.svg" },
  { key: "artistic", label: "Artistic", src: "/vercel.svg" },
  { key: "cartoon", label: "Cartoon", src: "/window.svg" },
  { key: "3d", label: "3D Render", src: "/next.svg" },
  { key: "oil", label: "Oil Painting", src: "/file.svg" },
  { key: "watercolor", label: "Watercolor", src: "/globe.svg" },
];

const MOODS = ["Bright", "Dark", "Moody", "Vibrant", "Warm", "Cool", "Dreamy", "Dramatic"]; 

export default function ImagePromptPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateImagePrompt);

  const [description, setDescription] = React.useState("");
  const [style, setStyle] = React.useState<string | undefined>(undefined);
  const [mood, setMood] = React.useState<string | undefined>(undefined);
  const [details, setDetails] = React.useState<string[]>([]);
  const [detailInput, setDetailInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImageResult | null>(null);

  async function onGenerate() {
    if (!user?.id || !description.trim()) return;
    setLoading(true);
    try {
      const res = await runGenerate({
        description: description.trim(),
        style,
        mood,
        details: details.join(", "),
        userId: user.id,
      });
      setResult(res as unknown as ImageResult);
    } finally {
      setLoading(false);
    }
  }

  function toggleMood(m: string) {
    setMood((cur) => (cur === m ? undefined : m));
  }

  function addDetailTag() {
    const value = detailInput.trim();
    if (!value) return;
    setDetails((arr) => Array.from(new Set([...arr, value])));
    setDetailInput("");
  }
  function removeDetailTag(tag: string) {
    setDetails((arr) => arr.filter((t) => t !== tag));
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <Card className="p-4 shadow-lg ring-1 ring-border">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Describe what you want to see</Label>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-background p-3 text-base"
                rows={6}
                placeholder="A cozy reading nook with warm lighting, a vintage armchair, and a sleeping cat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Style selector */}
            <div>
              <Label className="mb-2 block">Style</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STYLE_PRESETS.map((s) => {
                  const active = style === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStyle(active ? undefined : s.key)}
                      className={
                        "group overflow-hidden rounded-md border transition-all " +
                        (active ? "border-primary ring-2 ring-primary" : "border-border hover:border-foreground/30")
                      }
                    >
                      <div className="relative h-24 w-full">
                        <Image src={s.src} alt={s.label} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 text-sm">
                        <span>{s.label}</span>
                        {active && <Badge variant="secondary">Selected</Badge>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood selector */}
            <div>
              <Label className="mb-2 block">Mood</Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const active = mood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMood(m)}
                      className={
                        "rounded-full border px-3 py-1 text-xs transition-colors " +
                        (active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20")
                      }
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <Label className="mb-2 block">Additional details (tags)</Label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-border bg-background p-2 text-sm"
                  placeholder="e.g., f1.8, bokeh, golden hour, isometric, 35mm, top-down"
                  value={detailInput}
                  onChange={(e) => setDetailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDetailTag();
                    }
                  }}
                />
                <Button type="button" onClick={addDetailTag} variant="outline">Add</Button>
              </div>
              {!!details.length && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.map((t) => (
                    <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeDetailTag(t)}>
                      {t} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={onGenerate} disabled={loading || !description.trim()} className="shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                {loading ? "Generating..." : "Generate Prompts"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Panel - Output */}
        <Card className="p-4 shadow-xl ring-1 ring-border">
          <h2 className="text-base font-semibold tracking-tight">Output</h2>
          {!result ? (
            <p className="mt-2 text-sm text-foreground/60">Your prompts will appear here after generation.</p>
          ) : (
            <Tabs defaultValue="midjourney" className="mt-3">
              <TabsList>
                <TabsTrigger value="midjourney">Midjourney</TabsTrigger>
                <TabsTrigger value="dalle">DALL-E 3</TabsTrigger>
                <TabsTrigger value="sd">Stable Diffusion</TabsTrigger>
              </TabsList>

              <TabsContent value="midjourney" className="space-y-3">
                <Section title="Full prompt" text={result.midjourneyPrompt} onCopy={() => copy(result.midjourneyPrompt)} />
                <Section title="Parameters" text="--ar 16:9 --style raw --v 6.0" onCopy={() => copy("--ar 16:9 --style raw --v 6.0")} />
              </TabsContent>

              <TabsContent value="dalle" className="space-y-3">
                <Section title="Optimized prompt" text={result.dallePrompt} onCopy={() => copy(result.dallePrompt)} />
              </TabsContent>

              <TabsContent value="sd" className="space-y-3">
                <Section title="Prompt" text={result.stableDiffusionPrompt} onCopy={() => copy(result.stableDiffusionPrompt)} />
                <Section title="Negative prompt" text={(result.negativePrompts || []).join(", ") || ""} onCopy={() => copy((result.negativePrompts || []).join(", ") || "")} />
                <Section title="Settings" text="Steps: 30, CFG: 7.5, Sampler: DPM++ 2M Karras" onCopy={() => copy("Steps: 30, CFG: 7.5, Sampler: DPM++ 2M Karras")} />
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>

      {/* Bottom Panel */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 shadow-sm ring-1 ring-border">
          <h3 className="text-sm font-medium">Tips for better images</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
            <li>Be specific about subject, environment, and lighting.</li>
            <li>Include style references and aspect ratio if needed.</li>
            <li>Use negative prompts to avoid unwanted elements.</li>
          </ul>
        </Card>
        <Card className="p-4 shadow-sm ring-1 ring-border">
          <h3 className="text-sm font-medium">Quick actions</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Try this prompt</Button>
            <Button variant="outline" size="sm">Open in editor</Button>
          </div>
        </Card>
        <Card className="p-4 shadow-sm ring-1 ring-border">
          <h3 className="text-sm font-medium">Example gallery</h3>
          <p className="mt-2 text-sm text-foreground/60">Coming soon.</p>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="text-sm font-medium">{title}</div>
        <Button variant="outline" size="sm" onClick={onCopy} className="shadow-sm hover:shadow-md">Copy</Button>
      </div>
      <pre className="border-t border-border bg-secondary/10 p-3 text-sm leading-6 whitespace-pre-wrap">{text}</pre>
    </div>
  );
}


