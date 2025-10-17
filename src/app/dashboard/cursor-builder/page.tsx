"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";
import { toast } from "sonner";

type GeneratedItem = { title: string; prompt: string; order: number };
type GenerationResult = {
  projectRequirements: string;
  frontendPrompts: GeneratedItem[];
  backendPrompts: GeneratedItem[];
  cursorRules: string;
  errorFixPrompts: { error: string; fix: string }[];
  estimatedComplexity?: string;
};

const steps = ["Project Details", "Tech Stack", "Features", "Preferences"] as const;
type Step = typeof steps[number];

export default function CursorBuilderPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateCursorAppPrompts);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<GenerationResult | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);

  // Form state
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [projectType, setProjectType] = React.useState("web app");

  const [frontend, setFrontend] = React.useState("React");
  const [backend, setBackend] = React.useState("Node.js");
  const [database, setDatabase] = React.useState("PostgreSQL");
  const [tools, setTools] = React.useState<string[]>([]);

  const [features, setFeatures] = React.useState<Array<{ id: string; name: string; description: string }>>([]);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const [codeStyle, setCodeStyle] = React.useState("Clean, readable, typed where applicable");
  const [testingApproach, setTestingApproach] = React.useState("Unit + integration with mocks");
  const [docsLevel, setDocsLevel] = React.useState("Pragmatic with examples");

  function next() {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function prev() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function addFeature() {
    const id = crypto.randomUUID();
    setFeatures((f) => [...f, { id, name: "New Feature", description: "" }]);
  }
  function removeFeature(id: string) {
    setFeatures((f) => f.filter((x) => x.id !== id));
  }
  function moveFeature(from: number, to: number) {
    setFeatures((f) => {
      const copy = [...f];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  // Prefill from sessionStorage if available (set by dashboard)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cursorBuilderPrefill");
      if (!raw) return;
      const data = JSON.parse(raw) as { projectName?: string; projectDescription?: string; techStack?: string[] };
      if (data.projectName) setProjectName(data.projectName);
      if (data.projectDescription) setProjectDescription(data.projectDescription);
      if (data.techStack && data.techStack.length) {
        const ts = data.techStack.map((s) => String(s));
        // naive mapping to primary selectors
        if (ts.find((s) => /react|next/i.test(s))) setFrontend("React");
        if (ts.find((s) => /vue|nuxt/i.test(s))) setFrontend("Vue");
        if (ts.find((s) => /svelte|kit/i.test(s))) setFrontend("Svelte");
        if (ts.find((s) => /node|express|next api/i.test(s))) setBackend("Node.js");
        if (ts.find((s) => /python|django|fastapi|flask/i.test(s))) setBackend("Python");
        if (ts.find((s) => /go|golang/i.test(s))) setBackend("Go");
        if (ts.find((s) => /postgres|pg/i.test(s))) setDatabase("PostgreSQL");
        if (ts.find((s) => /mongo/i.test(s))) setDatabase("MongoDB");
        if (ts.find((s) => /mysql/i.test(s))) setDatabase("MySQL");
        setTools((prev) => Array.from(new Set([...(prev || []), ...ts.filter((s) => !["React","Vue","Svelte","Node.js","Python","Go","PostgreSQL","MongoDB","MySQL"].includes(s))])));
      }
      // one-time use
      sessionStorage.removeItem("cursorBuilderPrefill");
    } catch {}
  }, []);

  async function submit() {
    if (!user?.id) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    setIsSubmitting(true);
    setProgress(10);
    try {
      toast.info("Generating... This might take a few seconds.");
      const techStack = [frontend, backend, database, ...tools.filter(Boolean), projectType].filter(Boolean);
      const featureList = features.map((f) => f.name);
      setProgress(35);
      const generated = await runGenerate({
        projectDescription: `${projectName ? projectName + " - " : ""}${projectDescription}`.trim(),
        techStack,
        features: featureList,
        userId: user.id,
      });
      setProgress(80);
      setResult(generated as unknown as GenerationResult);
      setProgress(100);
      setShowConfetti(true);
      toast.success("Prompt set generated!");
    } catch (e) {
      console.error(e);
      setProgress(100);
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }

  const stepVariants = {
    initial: { 
      opacity: 0, 
      x: 20 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring" as const,  // Add 'as const' here
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card className="p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">{steps[currentStep]}</div>
          <div className="text-xs text-foreground/60">Step {currentStep + 1} of {steps.length}</div>
        </div>
        <div className="h-2 w-full rounded bg-secondary/20">
          <div
            className="h-2 rounded bg-primary transition-[width] duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Form steps */}
        <Card className="lg:col-span-2 p-4 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold tracking-tight">Project Details</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Acme CRM" />
                    </div>
                    <div>
                      <Label htmlFor="projectType">Project Type</Label>
                      <select
                        id="projectType"
                        className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                      >
                        {['web app','mobile app','API','desktop app','library','cli'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="projectDescription">Description</Label>
                    <textarea
                      id="projectDescription"
                      className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                      rows={5}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="What are you building? Who is it for? Key workflows?"
                    />
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold tracking-tight">Tech Stack</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="frontend">Frontend</Label>
                      <select id="frontend" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={frontend} onChange={(e) => setFrontend(e.target.value)}>
                        {["React","Vue","Svelte","Next.js","Nuxt","Solid","Angular"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="backend">Backend</Label>
                      <select id="backend" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={backend} onChange={(e) => setBackend(e.target.value)}>
                        {["Node.js","Python","Go","Ruby","Java",".NET"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="database">Database</Label>
                      <select id="database" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={database} onChange={(e) => setDatabase(e.target.value)}>
                        {["PostgreSQL","MySQL","MongoDB","SQLite","DynamoDB","Redis"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Other Tools</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Auth","Payments","CI/CD","Messaging","Analytics","Edge"].map((t) => {
                        const active = tools.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTools((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                            className={
                              "rounded-md border px-2 py-1 text-xs transition-colors " +
                              (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")
                            }
                          >
                            {active && <span className="mr-1">✓</span>}
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold tracking-tight">Features</h2>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addFeature}>Add Feature</Button>
                  </div>
                  <ul className="space-y-2">
                    {features.map((f, idx) => (
                      <li key={f.id} className="rounded-md border border-border bg-secondary/10 p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="cursor-grab select-none"
                            onMouseDown={() => setDragIndex(idx)}
                            onMouseUp={() => setDragIndex(null)}
                            onMouseLeave={() => setDragIndex(null)}
                            onMouseMove={(e) => {
                              if (dragIndex === null) return;
                              const delta = Math.sign(e.movementY);
                              const to = Math.min(features.length - 1, Math.max(0, dragIndex + delta));
                              if (to !== dragIndex) {
                                moveFeature(dragIndex, to);
                                setDragIndex(to);
                              }
                            }}
                          >{idx + 1}</Badge>
                          <Input value={f.name} onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, name: e.target.value } : x))} className="flex-1" />
                          <Button variant="outline" size="sm" onClick={() => removeFeature(f.id)}>Remove</Button>
                        </div>
                        <div className="mt-2">
                          <Label>Description</Label>
                          <textarea
                            className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                            rows={3}
                            value={f.description}
                            onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, description: e.target.value } : x))}
                          />
                        </div>
                      </li>
                    ))}
                    {!features.length && <li className="text-sm text-foreground/60">No features yet. Add at least one.</li>}
                  </ul>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold tracking-tight">Preferences</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Code Style</Label>
                      <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} />
                    </div>
                    <div>
                      <Label>Testing Approach</Label>
                      <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={testingApproach} onChange={(e) => setTestingApproach(e.target.value)} />
                    </div>
                    <div>
                      <Label>Documentation Level</Label>
                      <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={docsLevel} onChange={(e) => setDocsLevel(e.target.value)} />
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-foreground/60">These preferences inform tone and completeness.</div>
                    <div className="flex items-center gap-3">
                      {stats && !stats.isPro && (
                        <span className={`text-sm ${stats.remainingPrompts <= 0 ? "text-red-600" : stats.remainingPrompts <= 5 ? "text-yellow-600" : "text-foreground/70"}`}>
                          {stats.remainingPrompts <= 0 ? "Limit reached" : `${stats.remainingPrompts} remaining today`}
                        </span>
                      )}
                      <Button onClick={submit} disabled={isSubmitting || !user?.id || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)} className="h-11">Generate Prompts</Button>
                    </div>
                  </div>
                  {isSubmitting && (
                    <div className="mt-2 h-2 w-full rounded bg-secondary/20">
                      <div className="h-2 rounded bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:justify-between">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0} className="h-11">Back</Button>
            <Button onClick={next} disabled={currentStep === steps.length - 1} className="h-11">Next</Button>
          </div>
        </Card>

        {/* Right: Preview */}
        <Card className="p-4 shadow-lg">
          <h3 className="text-sm font-medium">Preview</h3>
          <p className="mt-2 text-sm text-foreground/70">As you configure steps, we’ll generate prompts tailored to your stack and features.</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li><span className="text-foreground/60">Name:</span> {projectName || "—"}</li>
            <li><span className="text-foreground/60">Type:</span> {projectType}</li>
            <li><span className="text-foreground/60">Frontend:</span> {frontend}</li>
            <li><span className="text-foreground/60">Backend:</span> {backend}</li>
            <li><span className="text-foreground/60">Database:</span> {database}</li>
            <li><span className="text-foreground/60">Tools:</span> {tools.join(", ") || "—"}</li>
            <li><span className="text-foreground/60">Features:</span> {features.map((f) => f.name).join(", ") || "—"}</li>
          </ul>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card className="p-4 shadow-lg">
          <Tabs defaultValue="requirements">
            <TabsList>
              <TabsTrigger value="requirements">Project Requirements</TabsTrigger>
              <TabsTrigger value="frontend">Frontend Prompts</TabsTrigger>
              <TabsTrigger value="backend">Backend Prompts</TabsTrigger>
              <TabsTrigger value="rules">.cursorrules</TabsTrigger>
              <TabsTrigger value="errors">Error Fix Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-3">
              <ResultToolbar filename="PROJECT_REQUIREMENTS.md" content={result.projectRequirements} />
              <PreBlock>{result.projectRequirements}</PreBlock>
            </TabsContent>

            <TabsContent value="frontend" className="space-y-3">
              {result.frontendPrompts.map((item) => (
                <div key={item.title} className="rounded-md border border-border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">{item.title}</div>
                    <ResultToolbar filename={`${item.title}.md`} content={item.prompt} compact />
                  </div>
                  <PreBlock className="border-t border-border">{item.prompt}</PreBlock>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="backend" className="space-y-3">
              {result.backendPrompts.map((item) => (
                <div key={item.title} className="rounded-md border border-border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">{item.title}</div>
                    <ResultToolbar filename={`${item.title}.md`} content={item.prompt} compact />
                  </div>
                  <PreBlock className="border-t border-border">{item.prompt}</PreBlock>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="rules" className="space-y-3">
              <ResultToolbar filename=".cursorrules" content={result.cursorRules} />
              <PreBlock>{result.cursorRules}</PreBlock>
            </TabsContent>

            <TabsContent value="errors" className="space-y-3">
              {result.errorFixPrompts.map((ef) => (
                <div key={ef.error} className="rounded-md border border-border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">{ef.error}</div>
                    <ResultToolbar filename={`${ef.error}.md`} content={ef.fix} compact />
                  </div>
                  <PreBlock className="border-t border-border">{ef.fix}</PreBlock>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Export ZIP */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={async () => {
              const zip = new JSZip();
              // README
              zip.file("README.txt", "Import these prompts into your workflow. Edit as needed.\n");
              // Project requirements
              zip.folder("project-requirements")?.file("PROJECT_REQUIREMENTS.md", result.projectRequirements);
              // Frontend
              const fe = zip.folder("frontend-prompts");
              result.frontendPrompts.forEach((item) => fe?.file(`${sanitize(item.title)}.md`, item.prompt));
              // Backend
              const be = zip.folder("backend-prompts");
              result.backendPrompts.forEach((item) => be?.file(`${sanitize(item.title)}.md`, item.prompt));
              // Cursor rules
              zip.file(".cursorrules", result.cursorRules);
              // Error fixes
              const ef = zip.folder("error-fixes");
              result.errorFixPrompts.forEach((e) => ef?.file(`${sanitize(e.error)}.md`, e.fix));

              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(projectName || "prompts").replace(/[^a-z0-9-_]+/gi, "_")}.zip`;
              a.click();
              URL.revokeObjectURL(url);
            }}>Download .zip</Button>
          </div>
        </Card>
      )}
      {showConfetti && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="pointer-events-none fixed inset-0 z-50" />
      )}
    </div>
  );
}

function ResultToolbar({ content, filename, compact }: { content: string; filename: string; compact?: boolean }) {
  async function copy() {
    try { await navigator.clipboard.writeText(content); } catch {}
  }
  function download() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  function downloadMd() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function useInCursor() {
    try { await navigator.clipboard.writeText(content); } catch {}
    alert("Copied! In Cursor, paste into the chat or appropriate file.");
  }
  return (
    <div className={"flex gap-2 " + (compact ? "" : "justify-end") }>
      <Button variant="outline" size="sm" onClick={copy} className="shadow-sm hover:shadow-md">Copy</Button>
      <Button variant="outline" size="sm" onClick={download} className="shadow-sm hover:shadow-md">Download</Button>
      <Button variant="outline" size="sm" onClick={downloadMd} className="shadow-sm hover:shadow-md">Download .md</Button>
      <Button size="sm" onClick={useInCursor} className="shadow-sm hover:shadow-md">Use in Cursor</Button>
    </div>
  );
}

function PreBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre className={"overflow-x-auto rounded-md bg-secondary/10 p-3 text-sm leading-6 ring-1 ring-border " + (className ?? "") }>
      {children}
    </pre>
  );
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, "_");
}


