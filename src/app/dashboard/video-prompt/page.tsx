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
import { Video, Play, Camera, Film } from "lucide-react";

export default function VideoPromptPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateVideoPrompt);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  const [description, setDescription] = React.useState("");
  const [style, setStyle] = React.useState("");
  const [mood, setMood] = React.useState("");
  const [duration, setDuration] = React.useState("8 seconds");
  const [audio, setAudio] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const [veo3Prompt, setVeo3Prompt] = React.useState<string | null>(null);
  const [runwayPrompt, setRunwayPrompt] = React.useState<string | null>(null);
  const [pikaPrompt, setPikaPrompt] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[] | null>(null);
  const [audioElements, setAudioElements] = React.useState<string[] | null>(null);

  async function onGenerate() {
    if (!user?.id || !description.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      toast.info("Generating video prompts... This might take a few seconds.");
      const res = await runGenerate({
        description: description.trim(),
        style: style.trim() || undefined,
        mood: mood.trim() || undefined,
        duration: duration.trim() || undefined,
        audio: audio.trim() || undefined,
        userId: user.id,
      });
      const r = res as unknown as { 
        veo3Prompt: string; 
        runwayPrompt: string; 
        pikaPrompt: string; 
        tips: string[]; 
        audioElements: string[] 
      };
      setVeo3Prompt(r.veo3Prompt);
      setRunwayPrompt(r.runwayPrompt);
      setPikaPrompt(r.pikaPrompt);
      setTips(r.tips);
      setAudioElements(r.audioElements);
      setSuccess(true);
      setShowConfetti(true);
      toast.success("Video prompts generated!");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 1200);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }

  function applyTemplate(template: { 
    description: string; 
    style?: string; 
    mood?: string; 
    duration?: string; 
    audio?: string 
  }) {
    setDescription(template.description);
    if (template.style) setStyle(template.style);
    if (template.mood) setMood(template.mood);
    if (template.duration) setDuration(template.duration);
    if (template.audio) setAudio(template.audio);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Video className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Video Prompt Generator</h1>
        </div>
        <p className="text-lg text-foreground/70 mb-4">
          Create cinematic video prompts for AI video generation platforms using advanced context engineering
        </p>
        {stats && !stats.isPro && (
          <Badge variant="outline" className="mt-2">
            {stats.remainingPrompts} prompts remaining today
          </Badge>
        )}
      </div>

      {/* Main Input Card */}
      <Card className="p-6 shadow-lg ring-1 ring-border">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label className="mb-3 block text-base font-medium">Video Description</Label>
            <textarea
              className="w-full rounded-md border border-border bg-background p-4 text-base"
              rows={6}
              placeholder="Describe your video concept with cinematic specificity and professional film language..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="mt-2 text-sm text-foreground/60">
              Include camera angles, lighting, movement, and visual style. Be specific about the scene and action.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Style</Label>
              <select
                className="w-full rounded-md border border-border bg-background p-3 text-sm"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="">Select style...</option>
                {["cinematic", "documentary", "noir", "vintage", "modern", "artistic", "commercial", "lifestyle"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Mood</Label>
              <select
                className="w-full rounded-md border border-border bg-background p-3 text-sm"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option value="">Select mood...</option>
                {["dramatic", "peaceful", "energetic", "mysterious", "romantic", "tense", "uplifting", "melancholic"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Duration</Label>
              <select
                className="w-full rounded-md border border-border bg-background p-3 text-sm"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                {["5 seconds", "8 seconds", "10 seconds", "15 seconds", "30 seconds"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Audio Elements</Label>
              <input
                className="w-full rounded-md border border-border bg-background p-3 text-sm"
                placeholder="Dialogue, music, sound effects..."
                value={audio}
                onChange={(e) => setAudio(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={onGenerate} 
              disabled={loading || !description.trim() || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)}
              className="h-12 px-8 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video Prompts
                </>
              )}
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
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.2 }} 
          className="pointer-events-none fixed inset-0 z-50"
        >
          {/* lightweight confetti substitute (placeholder) */}
        </motion.div>
      )}

      {/* Quick Templates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Quick Templates</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-lg border border-border bg-secondary/10 p-4 text-left transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                {t.icon}
                <span className="font-medium">{t.label}</span>
              </div>
              <p className="text-sm text-foreground/70">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Output Panel */}
      {veo3Prompt && (
        <Card className="p-6 shadow-xl ring-1 ring-border">
          <h2 className="text-xl font-semibold mb-6">Generated Video Prompts</h2>
          
          <Tabs defaultValue="veo3" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="veo3" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Google Veo 3
              </TabsTrigger>
              <TabsTrigger value="runway" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Runway ML
              </TabsTrigger>
              <TabsTrigger value="pika" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Pika Labs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="veo3" className="mt-4">
              <div className="rounded-md border border-border">
                <Toolbar content={veo3Prompt} />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {veo3Prompt}
                  </SyntaxHighlighter>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="runway" className="mt-4">
              <div className="rounded-md border border-border">
                <Toolbar content={runwayPrompt || ""} />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {runwayPrompt || ""}
                  </SyntaxHighlighter>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pika" className="mt-4">
              <div className="rounded-md border border-border">
                <Toolbar content={pikaPrompt || ""} />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {pikaPrompt || ""}
                  </SyntaxHighlighter>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4 shadow-sm ring-1 ring-border">
              <h3 className="text-sm font-medium mb-3">Optimization Tips</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                {(tips || []).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4 shadow-sm ring-1 ring-border">
              <h3 className="text-sm font-medium mb-3">Audio Elements</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                {(audioElements || []).map((element, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{element}</span>
                  </li>
                ))}
              </ul>
            </Card>
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
    a.download = "video-prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3">
      <Button variant="outline" size="sm" onClick={onCopy} className="shadow-sm hover:shadow-md">Copy</Button>
      <Button variant="outline" size="sm" onClick={onDownload} className="shadow-sm hover:shadow-md">Download</Button>
    </div>
  );
}

const templates: Array<{ 
  label: string; 
  description: string;
  icon: React.ReactNode;
  description: string; 
  style?: string; 
  mood?: string; 
  duration?: string; 
  audio?: string 
}> = [
  {
    label: "Corporate Video",
    description: "Professional business person in modern office walking toward floor-to-ceiling windows with city skyline view",
    icon: <Film className="h-4 w-4" />,
    style: "cinematic",
    mood: "confident",
    duration: "8 seconds",
    audio: "Ambient office sounds, confident footsteps"
  },
  {
    label: "Product Showcase",
    description: "Macro lens extreme close-up of sleek smartphone rotating slowly on white seamless background",
    icon: <Camera className="h-4 w-4" />,
    style: "commercial",
    mood: "premium",
    duration: "10 seconds",
    audio: "Subtle electronic music, product sounds"
  },
  {
    label: "Lifestyle Content",
    description: "Young woman walking through vibrant farmers market, natural documentary style with organic camera movement",
    icon: <Video className="h-4 w-4" />,
    style: "documentary",
    mood: "authentic",
    duration: "8 seconds",
    audio: "Market ambient sounds, casual dialogue"
  },
  {
    label: "Creative Art",
    description: "Surreal slow-motion sequence of paint splattering in mid-air against pure black background",
    icon: <Film className="h-4 w-4" />,
    style: "artistic",
    mood: "dramatic",
    duration: "8 seconds",
    audio: "Abstract electronic soundscape, whoosh effects"
  },
  {
    label: "Educational Content",
    description: "Enthusiastic teacher at whiteboard explaining complex diagram with animated gestures",
    icon: <Play className="h-4 w-4" />,
    style: "documentary",
    mood: "engaging",
    duration: "15 seconds",
    audio: "Clear speech, classroom atmosphere"
  },
  {
    label: "Social Media",
    description: "Handheld camera following young woman as she walks through vibrant farmers market",
    icon: <Video className="h-4 w-4" />,
    style: "lifestyle",
    mood: "authentic",
    duration: "8 seconds",
    audio: "Market ambient sounds, casual dialogue"
  }
];