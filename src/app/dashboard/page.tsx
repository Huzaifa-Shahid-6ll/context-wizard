"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { initPostHog, trackEvent, trackGenerationEvent, updateUserStage, USER_STAGES, trackMilestone } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Github, X } from "lucide-react";
import GenerationPreview from "@/components/landing/GenerationPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type GenerationItem = {
  _id: string;
  repoUrl: string;
  repoName?: string;
  techStack?: string[];
  files?: { name: string; content: string }[];
  status: "processing" | "completed" | "failed";
  createdAt: number;
  errorMessage?: string;
};

function isValidGithubUrl(url: string): boolean {
  return /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i.test(url.trim());
}

export default function DashboardHome() {
  const { user, isSignedIn } = useUser();
  const userId = user?.id;
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    initPostHog();
    trackEvent("dashboard_viewed");
    inputRef.current?.focus();
  }, []);

  const [repoUrl, setRepoUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<0 | 1 | 2 | 3>(0);

  const [showTechStackModal, setShowTechStackModal] = useState(false);
  const [correctedTechStack, setCorrectedTechStack] = useState<string[]>([]);
  const [techStackInput, setTechStackInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getTechStack = useAction(api.actions.getTechStack);
  const createGeneration = useMutation(api.mutations.createGeneration);
  const processGeneration = useAction(api.actions.processGeneration);
  const recent = useQuery(api.queries.listGenerationsByUser, userId ? { userId, limit: 12 } : "skip") as GenerationItem[] | undefined;
  const stats = useQuery(api.users.getUserStats, userId ? { userId } : "skip");

  const remaining = stats?.remaining ?? 0;
  const latestCompleted = (recent || []).find((g) => g.status === "completed");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (latestCompleted) {
      setShowPreview(true);
    }
  }, [latestCompleted]);

  useEffect(() => {
    if (loadingStep > 0 && loadingStep < 4) {
      trackGenerationEvent('generation_processing', { step: loadingStep });
    }
  }, [loadingStep]);

  function validateOnBlur() {
    setTouched(true);
    if (!repoUrl) {
      setError("Enter a GitHub repository URL");
      return;
    }
    if (!isValidGithubUrl(repoUrl)) {
      setError("Invalid GitHub URL. Expected: github.com/owner/repo");
    } else {
      setError(null);
    }
  }

  async function onAnalyze() {
    setTouched(true);
    trackGenerationEvent("analyze_button_clicked");
    if (!isSignedIn || !userId) {
      setError("Please sign in to generate context files");
      return;
    }
    if (!isValidGithubUrl(repoUrl)) {
      setError("Invalid GitHub URL. Expected: github.com/owner/repo");
      trackGenerationEvent("github_url_invalid", { error_type: "validation" });
      return;
    }
    trackGenerationEvent("github_url_validated");
    setError(null);
    setIsAnalyzing(true);
    try {
      const { techStack } = await getTechStack({ repoUrl: repoUrl.trim() });
      trackGenerationEvent("tech_stack_detected", { frameworks_found: techStack });
      setCorrectedTechStack(techStack);
      setShowTechStackModal(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      if (/not found/i.test(message)) setError("Repository not found");
      else if (/private/i.test(message)) setError("Private repository not supported");
      else if (/rate limit/i.test(message)) setError("Rate limit exceeded");
      else setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function onConfirmTechStack() {
    setShowTechStackModal(false);
    if (!isSignedIn || !userId) return;

    try {
      const start = Date.now();
      trackGenerationEvent("tech_stack_confirmed");
      trackGenerationEvent("generation_started", { repo_name: repoUrl, is_private: false, tech_stack: correctedTechStack });
      setLoadingStep(1); // Analyzing repository...
      const generationId = await createGeneration({ userId, repoUrl: repoUrl.trim() });
      setLoadingStep(2); // Detecting tech stack...
      await processGeneration({ generationId, techStack: correctedTechStack });
      setLoadingStep(3); // Generating context files...
      const duration_seconds = Math.round((Date.now() - start) / 1000);
      trackGenerationEvent("generation_completed", { repo_name: repoUrl, tech_stack: correctedTechStack, duration_seconds });
      try {
        // Best-effort stage updates based on totalGenerations after completion
        const total = (stats as any)?.totalGenerations as number | undefined;
        if (isSignedIn && userId) {
          if (total === 0) {
            updateUserStage(userId, USER_STAGES.ACTIVATED, { activated_at: new Date().toISOString() });
            trackMilestone('first_generation_completed', { repo_name: repoUrl });
          } else if (total === 1) {
            updateUserStage(userId, USER_STAGES.REPEAT, { became_repeat_at: new Date().toISOString() });
          } else if (total === 9) {
            updateUserStage(userId, USER_STAGES.POWER_USER, { became_power_at: new Date().toISOString() });
          }
        }
      } catch {}
      // Convex realtime will update the list automatically
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      trackGenerationEvent("generation_failed", { error_type: message, repo_name: repoUrl });
      try {
        if (/Daily generation limit/i.test(message)) {
          trackEvent('free_limit_reached', { context: 'dashboard_generation' });
        }
      } catch {}
      if (/Daily generation limit/i.test(message)) setError("Daily generation limit reached");
      else setError(message);
      setLoadingStep(0);
    } finally {
      // Small delay for smoothness
      setTimeout(() => setLoadingStep(0), 900);
    }
  }

  const loadingText = useMemo(() => {
    if (isAnalyzing) return "Detecting tech stack...";
    if (loadingStep === 1) return "Analyzing repository...";
    if (loadingStep === 2) return "Processing...";
    if (loadingStep === 3) return "Generating context files...";
    return null;
  }, [isAnalyzing, loadingStep]);

  const progress = loadingStep === 0 ? 0 : loadingStep === 1 ? 33 : loadingStep === 2 ? 66 : 95;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Main Card */}
      <Card className="mx-auto max-w-3xl bg-base shadow-xl ring-1 ring-border shine-top">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Generate Context Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-light p-2 ring-1 ring-border">
                <Github className="h-5 w-5 text-primary" />
              </div>
              <Input
                ref={inputRef}
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onBlur={validateOnBlur}
                                onPaste={() => trackGenerationEvent('github_url_pasted')}
                placeholder="https://github.com/username/repository"
                className="h-12 flex-1 rounded-md border border-transparent bg-light px-4 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus-visible:border-ring"
              />
              <Button
                onClick={onAnalyze}
                disabled={!!loadingText || !repoUrl}
                className="h-12 rounded-md px-5 shadow-lg transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl"
              >
                {loadingText ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {loadingText}</span>
                ) : (
                  "Analyze Repository"
                )}
              </Button>
            </div>

            {/* Validation status */}
            <div className="min-h-[1.25rem]">
              {touched && repoUrl && isValidGithubUrl(repoUrl) && !error && (
                <div className="inline-flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Looks good</div>
              )}
              {touched && error && (
                <div className="inline-flex items-center gap-2 text-sm text-red-600"><XCircle className="h-4 w-4" /> {error}</div>
              )}
            </div>

            {/* Remaining quota */}
            {isSignedIn && (
              <div className="text-xs text-foreground/60">{remaining === Number.MAX_SAFE_INTEGER ? "Unlimited generations for Pro users" : `${remaining}/5 generations remaining today`}</div>
            )}

            {/* Progress bar */}
            {loadingText && !isAnalyzing && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary/40">
                <div className="h-full w-0 animate-[progressGrow_0.3s_ease_out_forwards] rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTechStackModal} onOpenChange={setShowTechStackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review and Correct Tech Stack</DialogTitle>
            <DialogDescription>
              We&apos;ve detected the following technologies. Please add or remove any to ensure accuracy.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {correctedTechStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                {tech}
                <button onClick={() => setCorrectedTechStack(correctedTechStack.filter((t) => t !== tech))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && techStackInput.trim()) {
                  setCorrectedTechStack([...correctedTechStack, techStackInput.trim()]);
                  setTechStackInput('');
                }
              }}
              placeholder="Add a technology..."
            />
            <Button
              onClick={() => {
                if (techStackInput.trim()) {
                  setCorrectedTechStack([...correctedTechStack, techStackInput.trim()]);
                  setTechStackInput('');
                }
              }}
            >
              Add
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTechStackModal(false)}>Cancel</Button>
            <Button onClick={onConfirmTechStack}>Confirm and Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Quick Action: Cursor App Builder */}
      <div className="mt-6">
        <Card className="p-4 shadow-sm ring-1 ring-border">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">Analyzed a repo? Generate prompts to build similar apps</div>
              <div className="text-xs text-foreground/60">Jump into the Cursor App Builder to create development prompts.</div>
            </div>
            <Button onClick={() => router.push("/dashboard/cursor-builder")}>Open Cursor App Builder</Button>
          </div>
        </Card>
      </div>

      {/* Recent Generations */}
      {recent && recent.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-primary">Recent Generations</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((g) => (
              <Card key={g._id} className="relative overflow-hidden bg-card shadow-[inset_0_16px_24px_rgba(0,0,0,0.08),inset_0_-10px_20px_rgba(255,255,255,0.35)] ring-1 ring-border transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/5" />
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {g.repoName || g.repoUrl}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {(g.techStack || []).slice(0, 6).map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-foreground/60">{new Date(g.createdAt).toLocaleString()}</div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={g.status !== "completed"} onClick={() => downloadFiles((g.files || []).map(f => ({ name: f.name, content: f.content || "" })), g.repoName || "context")}>
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/dashboard/history?id=${g._id}`}>View Details</a>
                    </Button>
                  </div>

                  {/* Status */}
                  {g.status !== "completed" && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-foreground/60">
                      {g.status === "processing" ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing</>
                      ) : (
                        <span className="text-red-600">{g.errorMessage || "Failed"}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Post-analysis: Generate Cursor Prompts from this Repo */}
      {latestCompleted && (
        <section className="mt-8">
          <Card className="p-4 shadow-lg ring-1 ring-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">Generate Cursor Prompts from This Repo</h3>
                <p className="text-sm text-foreground/70">We&apos;ll pre-fill the builder with the detected tech stack, project structure, and existing patterns.</p>
              </div>
              <Button
                onClick={() => {
                  const techStack = latestCompleted.techStack || [];
                  const files = (latestCompleted.files || []).map((f) => f.name);
                  const prefill = {
                    projectName: latestCompleted.repoName || latestCompleted.repoUrl,
                    projectDescription: `Derived from ${latestCompleted.repoName || latestCompleted.repoUrl}. Detected stack: ${techStack.join(", ")}.`,
                    techStack,
                    files,
                  };
                  try { sessionStorage.setItem("cursorBuilderPrefill", JSON.stringify(prefill)); } catch {}
                  router.push("/dashboard/cursor-builder");
                }}
                className="shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Create Development Prompts
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Full-screen Preview */}
      {latestCompleted && (
        <GenerationPreview
          open={showPreview}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              trackGenerationEvent('preview_opened');
            } else {
              trackGenerationEvent('preview_closed');
            }
            setShowPreview(isOpen);
          }}
          repoName={latestCompleted.repoName || latestCompleted.repoUrl}
          techStack={latestCompleted.techStack || []}
          files={latestCompleted.files || []}
          onGenerateAgain={() => setShowPreview(false)}
          onSaveToHistory={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

const downloadFiles = async (files: Array<{ name: string; content: string }>, repoName: string) => {
  try {
    trackGenerationEvent("download_clicked", { repo_name: repoName, file_count: files.length });
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    // Create folder with repo name
    const folder = zip.folder(repoName) || zip;
    // Add all files to folder
    files.forEach(file => {
      folder.file(file.name, file.content);
    });
    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoName}-context-files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Files downloaded successfully!');
    trackGenerationEvent("download_completed");
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download files');
    trackGenerationEvent("download_failed");
  }
};
