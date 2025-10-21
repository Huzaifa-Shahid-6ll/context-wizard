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

export default function PromptStudioPage() {
  const { user } = useUser();
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  // Actions for different prompt types
  const runGenericPrompt = useAction(api.promptGenerators.generateGenericPrompt);
  const runImagePrompt = useAction(api.promptGenerators.generateImagePrompt);
  const runAnalysis = useAction(api.promptGenerators.analyzeAndImprovePrompt);

  const [activeTab, setActiveTab] = React.useState("generic");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);

  // Generic prompt state
  const [goal, setGoal] = React.useState("");
  const [context, setContext] = React.useState("");
  const [format, setFormat] = React.useState("text");
  const [tone, setTone] = React.useState("professional");

  // Image prompt state
  const [imageDescription, setImageDescription] = React.useState("");
  const [imageStyle, setImageStyle] = React.useState("");
  const [imageMood, setImageMood] = React.useState("");
  const [imageDetails, setImageDetails] = React.useState("");


  // Analysis state
  const [analysisPrompt, setAnalysisPrompt] = React.useState("");
  const [analysisContext, setAnalysisContext] = React.useState("");

  async function handleGenericGenerate() {
    if (!user?.id || !goal.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await runGenericPrompt({
        userGoal: goal.trim(),
        context: context.trim() || undefined,
        outputFormat: format,
        tone,
        userId: user.id,
      });
      setResults({ type: "generic", data: res });
      toast.success("Generic prompt generated!");
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageGenerate() {
    if (!user?.id || !imageDescription.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await runImagePrompt({
        description: imageDescription.trim(),
        style: imageStyle.trim() || undefined,
        mood: imageMood.trim() || undefined,
        details: imageDetails.trim() || undefined,
        userId: user.id,
      });
      setResults({ type: "image", data: res });
      toast.success("Image prompts generated!");
    } catch (error) {
      toast.error("Failed to generate image prompts");
    } finally {
      setLoading(false);
    }
  }


  async function handleAnalysis() {
    if (!user?.id || !analysisPrompt.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await runAnalysis({
        prompt: analysisPrompt.trim(),
        context: analysisContext.trim() || undefined,
        userId: user.id,
      });
      setResults({ type: "analysis", data: res });
      toast.success("Prompt analysis completed!");
    } catch (error) {
      toast.error("Failed to analyze prompt");
    } finally {
      setLoading(false);
    }
  }

  function applyTemplate(template: any) {
    if (activeTab === "generic") {
      setGoal(template.goal || "");
      setContext(template.context || "");
      setFormat(template.format || "text");
      setTone(template.tone || "professional");
    } else if (activeTab === "image") {
      setImageDescription(template.description || "");
      setImageStyle(template.style || "");
      setImageMood(template.mood || "");
      setImageDetails(template.details || "");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Prompt Studio</h1>
        <p className="mt-2 text-lg text-foreground/70">
          Professional prompt engineering with 6-part framework and context engineering
        </p>
        {stats && !stats.isPro && (
          <Badge variant="outline" className="mt-2">
            {stats.remainingPrompts} prompts remaining today
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generic">Generic</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Generic Prompt Tab */}
        <TabsContent value="generic" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generic Prompt Generator</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-2 block">What do you want to create?</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-3 text-base"
                  rows={4}
                  placeholder="Describe your goal using the 6-part framework..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Context (optional)</Label>
                  <textarea
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    rows={3}
                    placeholder="Background information, constraints, requirements..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-2 block">Format</Label>
                    <select
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      {["text", "list", "table", "code", "outline", "steps"].map((opt) => (
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
                      {["professional", "casual", "creative", "concise", "friendly", "persuasive"].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleGenericGenerate} 
                disabled={loading || !goal.trim() || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate Optimized Prompt"}
                    </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Image Prompt Tab */}
        <TabsContent value="image" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Image Prompt Generator</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-2 block">Image Description</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-3 text-base"
                  rows={4}
                  placeholder="Describe your image with cinematic specificity..."
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-2 block">Style</Label>
                  <select
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
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
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={imageMood}
                    onChange={(e) => setImageMood(e.target.value)}
                  >
                    <option value="">Select mood...</option>
                    {["dramatic", "peaceful", "energetic", "mysterious", "romantic", "tense", "uplifting", "melancholic"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block">Details</Label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    placeholder="Technical details, lighting, camera..."
                    value={imageDetails}
                    onChange={(e) => setImageDetails(e.target.value)}
                  />
        </div>
      </div>
              <Button 
                onClick={handleImageGenerate} 
                disabled={loading || !imageDescription.trim() || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate Image Prompts"}
              </Button>
            </div>
          </Card>
        </TabsContent>


        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Prompt Analysis & Improvement</h2>
            <div className="grid grid-cols-1 gap-4">
      <div>
                <Label className="mb-2 block">Prompt to Analyze</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-3 text-base"
                  rows={6}
                  placeholder="Paste your prompt here for analysis and improvement..."
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                />
                  </div>
              <div>
                <Label className="mb-2 block">Context (optional)</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-2 text-sm"
                  rows={3}
                  placeholder="Additional context for better analysis..."
                  value={analysisContext}
                  onChange={(e) => setAnalysisContext(e.target.value)}
                />
                </div>
                  <Button
                onClick={handleAnalysis} 
                disabled={loading || !analysisPrompt.trim() || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)}
                className="w-full"
              >
                {loading ? "Analyzing..." : "Analyze & Improve Prompt"}
                  </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {results && (
        <Card className="p-6 shadow-xl ring-1 ring-border">
          <h2 className="text-xl font-semibold mb-4">Generated Results</h2>
          
          {results.type === "generic" && (
            <div className="space-y-4">
              <div className="rounded-md border border-border">
                <Toolbar content={results.data.optimizedPrompt} />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {results.data.optimizedPrompt}
                  </SyntaxHighlighter>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Why this works</h3>
                  <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{results.data.explanation}</p>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Tips for better results</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {results.data.tips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Example output</h3>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{results.data.exampleOutput}</pre>
                </Card>
              </div>
            </div>
          )}

          {results.type === "image" && (
            <div className="space-y-4">
              <Tabs defaultValue="midjourney" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="midjourney">Midjourney</TabsTrigger>
                  <TabsTrigger value="dalle">DALL-E 3</TabsTrigger>
                  <TabsTrigger value="stable">Stable Diffusion</TabsTrigger>
                </TabsList>
                
                <TabsContent value="midjourney">
                  <div className="rounded-md border border-border">
                    <Toolbar content={results.data.midjourneyPrompt} />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.midjourneyPrompt}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dalle">
                  <div className="rounded-md border border-border">
                    <Toolbar content={results.data.dallePrompt} />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.dallePrompt}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stable">
                  <div className="rounded-md border border-border">
                    <Toolbar content={results.data.stableDiffusionPrompt} />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.stableDiffusionPrompt}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Optimization Tips</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {results.data.tips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Negative Prompts</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {results.data.negativePrompts.map((prompt: string, i: number) => (
                      <li key={i}>{prompt}</li>
                    ))}
          </ul>
        </Card>
      </div>
    </div>
          )}


          {results.type === "analysis" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Overall Score: {results.data.overallScore}/100</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity:</span>
                      <span>{results.data.scores.clarity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Specificity:</span>
                      <span>{results.data.scores.specificity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Structure:</span>
                      <span>{results.data.scores.structure}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completeness:</span>
                      <span>{results.data.scores.completeness}/100</span>
                    </div>
      </div>
    </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Issues Found</h3>
                  <ul className="mt-2 space-y-1 text-sm text-foreground/70">
                    {results.data.issues.map((issue: any, i: number) => (
                      <li key={i} className={`${issue.severity === 'high' ? 'text-red-600' : issue.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>
                        [{issue.severity.toUpperCase()}] {issue.description}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              
              <div className="rounded-md border border-border">
                <Toolbar content={results.data.improvedPrompt} />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {results.data.improvedPrompt}
                  </SyntaxHighlighter>
                </div>
              </div>
              
              <Card className="p-3 shadow-sm ring-1 ring-border">
                <h3 className="text-sm font-medium">Improvement Explanation</h3>
                <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{results.data.improvementExplanation}</p>
              </Card>
            </div>
          )}
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
    a.download = "prompt.txt";
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