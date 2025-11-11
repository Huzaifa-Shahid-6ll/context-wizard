"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";
import { ToneStyleSelector } from "@/components/forms/ToneStyleSelector";
import { OutputFormatSelector } from "@/components/forms/OutputFormatSelector";
import { AudienceSelector } from "@/components/forms/AudienceSelector";

import { initPostHog, trackEvent, trackPromptEvent } from "@/lib/analytics";

export default function PromptStudioPage() {
  React.useEffect(() => {
    initPostHog();
    trackEvent('prompt_studio_viewed');
  }, []);
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
  const [results, setResults] = React.useState<{
    type: string;
    data: Record<string, unknown>;
  } | null>(null);

  // Generic prompt state
  const [goal, setGoal] = React.useState("");
  const [context, setContext] = React.useState("");
  const [outputFormatDetails, setOutputFormatDetails] = React.useState<{
    format: string;
    length: string;
    structure: string[];
    constraints: {
      wordCount?: number;
      characterLimit?: number;
      includeIntro?: boolean;
      includeSummary?: boolean;
    };
  }>({
    format: "text",
    length: "standard",
    structure: [],
    constraints: {},
  });
  const [toneStyleDetails, setToneStyleDetails] = React.useState<{
    tone: string;
    style: string;
    modifiers: string[];
  }>({
    tone: "professional",
    style: "concise",
    modifiers: [],
  });
  const [audience, setAudience] = React.useState({
    ageRange: "",
    profession: "",
    expertiseLevel: "",
    industry: "",
    useCase: ""
  });

  // Image prompt state
  const [imageDescription, setImageDescription] = React.useState("");
  const [imageStyle, setImageStyle] = React.useState("");
  const [imageMood, setImageMood] = React.useState("");
  const [imageDetails, setImageDetails] = React.useState("");


  // Analysis state
  const [analysisPrompt, setAnalysisPrompt] = React.useState("");
  const [analysisContext, setAnalysisContext] = React.useState("");
  const [analysisPurpose, setAnalysisPurpose] = React.useState("Content writing");
  const [analysisModel, setAnalysisModel] = React.useState("Generic");
  const [analysisIssues, setAnalysisIssues] = React.useState<string[]>([]);
  const [analysisImprovements, setAnalysisImprovements] = React.useState<string[]>([]);
  const [analysisFrequency, setAnalysisFrequency] = React.useState("One-time");
  const [analysisUseCase, setAnalysisUseCase] = React.useState("Personal use");
  const [analysisSuccessCriteria, setAnalysisSuccessCriteria] = React.useState("");

  function toggleIn(list: string[], setter: (v: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function handleGenericGenerate() {
    if (!user?.id || !goal.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts < 10) {
      toast.error(`Daily prompt limit reached. You have ${stats.remainingPrompts} prompts remaining. Please upgrade to Pro for unlimited prompts.`, {
        action: {
          label: 'Upgrade',
          onClick: () => { try { window.location.href = '/dashboard/billing'; } catch {} },
        },
      });
      return;
    }
    setLoading(true);
    try {
      const res = await runGenericPrompt({
        userGoal: goal.trim(),
        context: context.trim() || undefined,
        outputFormat: outputFormatDetails.format,
        tone: toneStyleDetails.tone,
        userId: user.id,
      });
      setResults({ type: "generic", data: res });
      toast.success("Generic prompt generated!");
      trackPromptEvent('generic_prompt_generated', { word_count: (res.optimizedPrompt as string).split(' ').length, tone: toneStyleDetails.tone });
    } catch {
      toast.error("Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageGenerate() {
    if (!user?.id || !imageDescription.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts < 10) {
      toast.error(`Daily prompt limit reached. You have ${stats.remainingPrompts} prompts remaining. Please upgrade to Pro for unlimited prompts.`, {
        action: {
          label: 'Upgrade',
          onClick: () => { try { window.location.href = '/dashboard/billing'; } catch {} },
        },
      });
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
      trackPromptEvent('image_prompt_generated', { platform: 'unknown', style: imageStyle });
    } catch {
      toast.error("Failed to generate image prompts");
    } finally {
      setLoading(false);
    }
  }


  async function handleAnalysis() {
    if (!user?.id || !analysisPrompt.trim()) return;
    if (stats && !stats.isPro && stats.remainingPrompts < 10) {
      toast.error(`Daily prompt limit reached. You have ${stats.remainingPrompts} prompts remaining. Please upgrade to Pro for unlimited prompts.`, {
        action: {
          label: 'Upgrade',
          onClick: () => { try { window.location.href = '/dashboard/billing'; } catch {} },
        },
      });
      return;
    }
    setLoading(true);
    try {
      const structuredContext = [
        `Purpose: ${analysisPurpose}`,
        `Target model: ${analysisModel}`,
        analysisIssues.length ? `Current issues: ${analysisIssues.join(", ")}` : "",
        analysisImprovements.length ? `Desired improvements: ${analysisImprovements.join(", ")}` : "",
        `Frequency: ${analysisFrequency}`,
        `Use case: ${analysisUseCase}`,
        analysisSuccessCriteria ? `Success criteria: ${analysisSuccessCriteria}` : "",
        analysisContext ? `Extra context: ${analysisContext}` : "",
      ].filter(Boolean).join("\n");

      const res = await runAnalysis({
        prompt: analysisPrompt.trim(),
        context: structuredContext || undefined,
        userId: user.id,
      });
      setResults({ type: "analysis", data: res });
      toast.success("Prompt analysis completed!");
    } catch {
      toast.error("Failed to analyze prompt");
    } finally {
      setLoading(false);
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

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === "generic") trackPromptEvent('generic_prompt_opened');
        else if (value === "image") trackPromptEvent('image_prompt_opened');
      }} className="w-full">
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
                  <Textarea
                    className="w-full"
                    rows={3}
                    placeholder="Background information, constraints, requirements..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-2 block">Output Format</Label>
                    <OutputFormatSelector value={outputFormatDetails} onChange={setOutputFormatDetails} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Tone</Label>
                    <ToneStyleSelector value={toneStyleDetails} onChange={setToneStyleDetails} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Audience</Label>
                    <AudienceSelector value={audience} onChange={setAudience} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleGenericGenerate} 
                disabled={loading || !goal.trim() || (!!stats && !stats.isPro && stats.remainingPrompts < 10)}
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
                    onChange={(e) => { setImageStyle(e.target.value); if (e.target.value) trackEvent('image_prompt_style_selected', { style_name: e.target.value }); }}
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
                disabled={loading || !imageDescription.trim() || (!!stats && !stats.isPro && stats.remainingPrompts < 10)}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-2 block">Prompt Purpose</Label>
                  <select className="w-full rounded-md border border-border bg-background p-2 text-sm" value={analysisPurpose} onChange={(e) => setAnalysisPurpose(e.target.value)}>
                    {["Code generation","Content writing","Data analysis","Creative writing","Business communication","Technical documentation"].map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block">Target Model</Label>
                  <select className="w-full rounded-md border border-border bg-background p-2 text-sm" value={analysisModel} onChange={(e) => setAnalysisModel(e.target.value)}>
                    {["GPT-4","Claude 3.5","Gemini 2.5","Generic"].map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block">Frequency of Use</Label>
                  <select className="w-full rounded-md border border-border bg-background p-2 text-sm" value={analysisFrequency} onChange={(e) => setAnalysisFrequency(e.target.value)}>
                    {["One-time","Weekly","Daily","Multiple times per day"].map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Use Case</Label>
                <select className="w-full rounded-md border border-border bg-background p-2 text-sm" value={analysisUseCase} onChange={(e) => setAnalysisUseCase(e.target.value)}>
                  {["Production system","Personal use","Team collaboration","Learning/experimentation"].map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Current Issues</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Inconsistent outputs","Too verbose","Too brief","Missing key information","Wrong tone","Incorrect format"].map((i) => {
                      const active = analysisIssues.includes(i);
                      return (
                        <button key={i} type="button" onClick={() => toggleIn(analysisIssues, setAnalysisIssues, i)}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{i}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Desired Improvements</Label>
                  <div className="flex flex-wrap gap-2">
                    {["More specific","Better structure","Clearer instructions","More context","Better examples"].map((i) => {
                      const active = analysisImprovements.includes(i);
                      return (
                        <button key={i} type="button" onClick={() => toggleIn(analysisImprovements, setAnalysisImprovements, i)}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{i}</button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Success Criteria (optional)</Label>
                <Textarea className="w-full" rows={3} placeholder="How do you measure if the output is good?" value={analysisSuccessCriteria} onChange={(e) => setAnalysisSuccessCriteria(e.target.value)} />
              </div>

              <div>
                <Label className="mb-2 block">Additional Context (optional)</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-2 text-sm"
                  rows={3}
                  placeholder="Provide any extra context for better analysis..."
                  value={analysisContext}
                  onChange={(e) => setAnalysisContext(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAnalysis} 
                disabled={loading || !analysisPrompt.trim() || (!!stats && !stats.isPro && stats.remainingPrompts < 10)}
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
                <Toolbar content={results.data.optimizedPrompt as string} promptType="generic" promptName="optimized_prompt" />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {results.data.optimizedPrompt as string}
                  </SyntaxHighlighter>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Why this works</h3>
                  <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{results.data.explanation as string}</p>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Tips for better results</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {(results.data.tips as string[]).map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Example output</h3>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{results.data.exampleOutput as string}</pre>
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
                    <Toolbar content={results.data.midjourneyPrompt as string} promptType="image" promptName="midjourney_prompt" />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.midjourneyPrompt as string}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dalle">
                  <div className="rounded-md border border-border">
                    <Toolbar content={results.data.dallePrompt as string} promptType="image" promptName="dalle_prompt" />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.dallePrompt as string}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stable">
                  <div className="rounded-md border border-border">
                    <Toolbar content={results.data.stableDiffusionPrompt as string} promptType="image" promptName="stable_diffusion_prompt" />
                    <div className="border-t border-border">
                      <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                        {results.data.stableDiffusionPrompt as string}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Optimization Tips</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {(results.data.tips as string[]).map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Negative Prompts</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                    {(results.data.negativePrompts as string[]).map((prompt: string, i: number) => (
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
                  <h3 className="text-sm font-medium">Overall Score: {results.data.overallScore as number}/100</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity:</span>
                      <span>{(results.data.scores as { clarity: number }).clarity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Specificity:</span>
                      <span>{(results.data.scores as { specificity: number }).specificity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Structure:</span>
                      <span>{(results.data.scores as { structure: number }).structure}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completeness:</span>
                      <span>{(results.data.scores as { completeness: number }).completeness}/100</span>
                    </div>
      </div>
    </Card>
                <Card className="p-3 shadow-sm ring-1 ring-border">
                  <h3 className="text-sm font-medium">Issues Found</h3>
                  <ul className="mt-2 space-y-1 text-sm text-foreground/70">
                    {(results.data.issues as Array<{severity: string; description: string}>).map((issue, i: number) => (
                      <li key={i} className={`${issue.severity === 'high' ? 'text-red-600' : issue.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>
                        [{issue.severity.toUpperCase()}] {issue.description}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              
              <div className="rounded-md border border-border">
                <Toolbar content={results.data.improvedPrompt as string} promptType="analysis" promptName="improved_prompt" />
                <div className="border-t border-border">
                  <SyntaxHighlighter language="markdown" style={docco} customStyle={{ margin: 0, padding: 16, background: "transparent" }}>
                    {results.data.improvedPrompt as string}
                  </SyntaxHighlighter>
                </div>
              </div>
              
              <Card className="p-3 shadow-sm ring-1 ring-border">
                <h3 className="text-sm font-medium">Improvement Explanation</h3>
                <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{results.data.improvementExplanation as string}</p>
              </Card>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Toolbar({ content, promptType, promptName }: { content: string; promptType: string; promptName?: string }) {
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(content);
      trackPromptEvent('prompt_copied_to_clipboard', { prompt_type: promptType, prompt_name: promptName });
      trackEvent('prompt_copied_to_clipboard', { prompt_type: promptType, prompt_id: promptName });
      if (promptType === 'generic') {
        trackEvent('generic_prompt_copied');
      } else if (promptType === 'image') {
        trackEvent('image_prompt_copied');
      }
    } catch {
      // ignore
    }
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