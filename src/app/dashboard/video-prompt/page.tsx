"use client";
import React, { createContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { recordSubmission } from "@/lib/autofill";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";
import { Video, Play, Camera, Film } from "lucide-react";
import { TooltipWrapper } from "@/components/forms/TooltipWrapper";
import { PromptPreview } from "@/components/forms/PromptPreview";
import { PlatformTargetSelector } from "@/components/forms/PlatformTargetSelector";

type PlatformTarget = "veo3" | "runway" | "pika" | "all";
type SceneType = "Corporate" | "Cinematic" | "Documentary" | "Educational" | "Lifestyle" | "Creative";
type SubjectType = "Person" | "Object" | "Abstract" | "Nature";

type FormState = {
  sceneType: SceneType | "";
  indoorOutdoor: "Indoor" | "Outdoor" | "";
  locationType: string;
  environmentDetails: string;
  subjectType: SubjectType | "";
  person?: { role?: string; ageRange?: string };
  object?: { type?: string; material?: string };
  nature?: { element?: string };
  action: string;
  pacing: "Slow" | "Medium" | "Fast" | "";
  cameraMovement: string;
  shotType: string;
  cameraAngle: string;
  lightingSetup: string[];
  timeOfDay: string;
  colorGrading: string;
  dialogue: string;
  soundEffects: string[];
  ambientSound: string;
  musicStyle: string;
  duration: string;
  frameRate: string;
  aspectRatio: string;
  platformTarget: PlatformTarget;
};

const LOCAL_STORAGE_KEY = "videoPromptStructuredForm.v1";

export default function VideoPromptPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateVideoPrompt);
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [veo3Prompt, setVeo3Prompt] = React.useState<string | null>(null);
  const [runwayPrompt, setRunwayPrompt] = React.useState<string | null>(null);
  const [pikaPrompt, setPikaPrompt] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[] | null>(null);
  const [audioElements, setAudioElements] = React.useState<string[] | null>(null);

  const [form, setForm] = React.useState<FormState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved) as FormState;
      } catch {}
    }
    return {
      sceneType: "",
      indoorOutdoor: "",
      locationType: "",
      environmentDetails: "",
      subjectType: "",
      action: "",
      pacing: "",
      cameraMovement: "",
      shotType: "",
      cameraAngle: "",
      lightingSetup: [],
      timeOfDay: "",
      colorGrading: "",
      dialogue: "",
      soundEffects: [],
      ambientSound: "",
      musicStyle: "",
      duration: "8s",
      frameRate: "24fps",
      aspectRatio: "16:9",
      platformTarget: "all",
    };
  });

  React.useEffect(() => {
    try { window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleArray<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => {
      const arr = new Set<string>(Array.isArray(f[key]) ? (f[key] as unknown as string[]) : []);
      if (arr.has(value)) arr.delete(value); else arr.add(value);
      return { ...f, [key]: Array.from(arr) } as FormState;
    });
  }

  function validateStep(current: number): boolean {
    if (current === 1) {
      return form.sceneType !== "" && form.indoorOutdoor !== "" && form.locationType.trim().length > 0;
    }
    if (current === 2) {
      return form.subjectType !== "" && form.action.trim().length > 0 && form.pacing !== "";
    }
    return true;
  }

  function nextStep() {
    if (!validateStep(step)) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  }

  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
  }

  function buildStructuredDescription(): { description: string; style?: string; mood?: string; duration?: string; audio?: string } {
    const parts: string[] = [];
    parts.push(`Scene: ${form.sceneType} — ${form.indoorOutdoor} — ${form.locationType}`);
    if (form.environmentDetails) parts.push(`Environment: ${form.environmentDetails}`);
    parts.push(`Subject & Action: ${form.subjectType} — ${form.action} — Pacing: ${form.pacing}`);
    if (form.subjectType === "Person" && form.person) {
      const { role, ageRange } = form.person;
      parts.push(`Person details: ${[role, ageRange].filter(Boolean).join(", ")}`);
    }
    if (form.subjectType === "Object" && form.object) {
      const { type, material } = form.object;
      parts.push(`Object details: ${[type, material].filter(Boolean).join(", ")}`);
    }
    if (form.subjectType === "Nature" && form.nature) {
      const { element } = form.nature;
      parts.push(`Nature details: ${[element].filter(Boolean).join(", ")}`);
    }
    parts.push(`Camera: ${[form.cameraMovement, form.shotType, form.cameraAngle].filter(Boolean).join(", ")}`);
    parts.push(`Lighting & Style: ${[form.lightingSetup.join("/"), form.timeOfDay, form.colorGrading].filter(Boolean).join(", ")}`);
    const audioLine = [
      form.dialogue ? `Dialogue: "${form.dialogue}"` : undefined,
      form.soundEffects.length ? `SFX: ${form.soundEffects.join("/")}` : undefined,
      form.ambientSound ? `Ambience: ${form.ambientSound}` : undefined,
      form.musicStyle ? `Music: ${form.musicStyle}` : undefined,
    ].filter(Boolean).join(" | ");
    if (audioLine) parts.push(`Audio: ${audioLine}`);
    parts.push(`Technical: Duration ${form.duration}, ${form.frameRate}, AR ${form.aspectRatio}, Target ${form.platformTarget.toUpperCase()}`);

    return {
      description: parts.join("\n"),
      style: form.colorGrading || undefined,
      mood: form.sceneType.toLowerCase(),
      duration: form.duration,
      audio: audioLine || undefined,
    };
  }

  async function onGenerate() {
    if (!user?.id) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    if (!validateStep(1) || !validateStep(2)) {
      toast.error("Please complete the first two steps before generating.");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      toast.info("Generating video prompts... This might take a few seconds.");
      const built = buildStructuredDescription();
      const res = await runGenerate({
        description: built.description,
        style: built.style,
        mood: built.mood,
        duration: built.duration,
        audio: built.audio,
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
      toast.success("Video prompts generated!");
      recordSubmission("video", {
        sceneType: form.sceneType,
        subjectType: form.subjectType,
        pacing: form.pacing,
        cameraMovement: form.cameraMovement,
        timeOfDay: form.timeOfDay,
        aspectRatio: form.aspectRatio,
        platformTarget: form.platformTarget,
      }, user.id);
    } finally {
      setLoading(false);
    }
  }

  function applyTemplate(template: { description: string; duration?: string; audio?: string }) {
    update("environmentDetails", template.description);
    if (template.duration) update("duration", template.duration);
    if (template.audio) update("ambientSound", template.audio);
  }

  const wizardRegionId = "video-prompt-wizard-region";
  const previewPanelId = "video-prompt-preview-panel";
  const outputPanelId = "video-prompt-output-panel";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Video className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold tracking-tight">Video Prompt Generator</h1>
        </div>
        <p className="text-lg text-foreground/70 mb-4">Create cinematic video prompts for AI video platforms using advanced context engineering</p>
        <div className="mt-1 flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setStep(1); }}>Quick Mode</Button>
          <Button size="sm" onClick={() => { window.location.href = "/dashboard/templates"; }}>Start from Template</Button>
        </div>
        {stats && !stats.isPro && (
          <Badge variant="outline" className="mt-2">
            {stats.remainingPrompts} prompts remaining today
          </Badge>
        )}
      </div>

      <Card className="p-6 shadow-lg ring-1 ring-border" role="region" aria-label="Video prompt wizard" id={wizardRegionId}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm" id="video-prompt-wizard-h2">Step {step} of 6</div>
            <div className="flex-1 mx-3 h-2 bg-secondary/30 rounded" style={{ '--progress-width': `${(step/6)*100}%` } as React.CSSProperties}>
              <div className="h-2 bg-primary rounded" style={{ width: 'var(--progress-width)' }} />
            </div>
            <div className="text-xs text-foreground/60">Structured wizard</div>
          </div>

          {/* Live preview (shared) */}
          <PromptPreview id={previewPanelId} ariaLabel="Live video prompt preview">
              {buildStructuredDescription().description}
          </PromptPreview>

          {/* Each step: use TooltipWrapper for technical fields */}
          {step === 1 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Describes the style and tone of the video scenario." glossaryTerm="Scene Type">Scene Setup</TooltipWrapper>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                  <Label htmlFor="sceneType" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Style of story: corporate, cinematic, documentary..." glossaryTerm="Scene Type">Scene Type</TooltipWrapper>
                  </Label>
                  <select id="sceneType" title="Select Scene Type" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.sceneType} onChange={(e) => update("sceneType", e.target.value as SceneType)}>
                    <option value="">Select</option>
                    {(["Corporate","Cinematic","Documentary","Educational","Lifestyle","Creative"] as SceneType[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
            </div>
            <div>
                  <Label htmlFor="indoorOutdoor" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Indoor or outdoor?" glossaryTerm="Setting">Indoor/Outdoor</TooltipWrapper>
                  </Label>
                  <select id="indoorOutdoor" title="Select Indoor/Outdoor Setting" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.indoorOutdoor} onChange={(e) => update("indoorOutdoor", e.target.value as FormState["indoorOutdoor"])}>
                    <option value="">Select</option>
                    <option>Indoor</option>
                    <option>Outdoor</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The specific location or setting where the scene takes place." glossaryTerm="Location">Location/Setting</TooltipWrapper>
                  </Label>
                  <Input
                    className="w-full"
                    placeholder="e.g., Modern office, City street, Classroom, Studio"
                    value={form.locationType}
                    onChange={(e) => update("locationType", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Additional details about the environment, such as lighting, decor, or atmosphere." glossaryTerm="Environment">Environmental Details (optional)</TooltipWrapper>
                  </Label>
                  <Input
                className="w-full"
                    placeholder="e.g., Minimalist, Warm lighting, Plants, Glass walls"
                    value={form.environmentDetails}
                    onChange={(e) => update("environmentDetails", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-foreground/60">Required: Scene type, Indoor/Outdoor, Location</div>
                <div className="flex gap-2">
                  <Button variant="outline" tabIndex={0} onClick={onGenerate} disabled={loading || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)} className="focus-visible:ring-2 ring-primary">{loading ? "Generating..." : "Generate Now"}</Button>
                  <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
                </div>
            </div>
          </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Identifies the main subject or object in the scene." glossaryTerm="Subject">Subject & Action</TooltipWrapper>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                  <Label htmlFor="subjectType" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Type of subject: person, object, abstract, or nature." glossaryTerm="Subject">Subject Type</TooltipWrapper>
                  </Label>
                  <select id="subjectType" title="Select Subject Type" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.subjectType} onChange={(e) => update("subjectType", e.target.value as SubjectType)}>
                    <option value="">Select</option>
                    {(["Person","Object","Abstract","Nature"] as SubjectType[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
            </div>
            <div>
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The action or movement performed by the subject." glossaryTerm="Action">Action/Movement</TooltipWrapper>
                  </Label>
              <Input
                className="w-full"
                    placeholder="e.g., Walking, Talking, Gesturing, Looking at camera"
                    value={form.action}
                    onChange={(e) => update("action", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pacing" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The pace or speed of the action." glossaryTerm="Pacing">Pacing</TooltipWrapper>
                  </Label>
                  <select id="pacing" title="Select Pacing" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.pacing} onChange={(e) => update("pacing", e.target.value as FormState["pacing"])}>
                    <option value="">Select</option>
                    <option>Slow</option>
                    <option>Medium</option>
                    <option>Fast</option>
                  </select>
                </div>
                {form.subjectType === "Person" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:col-span-2">
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The role or occupation of the person." glossaryTerm="Role">Role</TooltipWrapper>
                      </Label>
                      <Input className="w-full" placeholder="e.g., Teacher, Executive, Athlete"
                        value={form.person?.role || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), role: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="personAgeRange" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The age range of the person." glossaryTerm="Age Range">Age Range</TooltipWrapper>
                      </Label>
                      <select id="personAgeRange" title="Select Person Age Range" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        value={form.person?.ageRange || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), ageRange: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option>Child</option>
                        <option>Teen</option>
                        <option>Adult</option>
                        <option>Senior</option>
                      </select>
                    </div>
                  </div>
                )}
                {form.subjectType === "Object" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:col-span-2">
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The type of object." glossaryTerm="Object Type">Object Type</TooltipWrapper>
                      </Label>
                      <Input className="w-full" placeholder="e.g., Smartphone, Chair, Book"
                        value={form.object?.type || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), type: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The material or composition of the object." glossaryTerm="Material">Material</TooltipWrapper>
                      </Label>
                      <Input className="w-full" placeholder="e.g., Metal, Wood, Glass"
                        value={form.object?.material || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), material: e.target.value })}
              />
            </div>
          </div>
                )}
                {form.subjectType === "Nature" && (
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-foreground/60">
                    <TooltipWrapper content="The natural element or phenomenon." glossaryTerm="Element">Element</TooltipWrapper>
                    </Label>
                    <Input className="w-full" placeholder="e.g., Waterfall, Forest, Ocean"
                      value={form.nature?.element || ""}
                      onChange={(e) => update("nature", { ...(form.nature||{}), element: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Describes the camera's movement, including static, pan, tilt, tracking, dolly zoom, crane, orbit, etc." glossaryTerm="Camera Movement">Camera Work</TooltipWrapper>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cameraMovement" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The movement of the camera itself." glossaryTerm="Camera Movement">Camera Movement</TooltipWrapper>
                  </Label>
                  <select id="cameraMovement" title="Select Camera Movement" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.cameraMovement} onChange={(e) => update("cameraMovement", e.target.value)}>
                    <option value="">Select</option>
                    <option>Static</option>
                    <option>Pan</option>
                    <option>Tilt</option>
                    <option>Tracking</option>
                    <option>Dolly zoom</option>
                    <option>Crane</option>
                    <option>Orbit</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="shotType" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The type of shot, such as close-up, medium shot, wide shot, establishing shot." glossaryTerm="Shot Type">Shot Type</TooltipWrapper>
                  </Label>
                  <select id="shotType" title="Select Shot Type" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.shotType} onChange={(e) => update("shotType", e.target.value)}>
                    <option value="">Select</option>
                    <option>Close-up</option>
                    <option>Medium shot</option>
                    <option>Wide shot</option>
                    <option>Establishing shot</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cameraAngle" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The angle from which the camera views the subject." glossaryTerm="Camera Angle">Camera Angle</TooltipWrapper>
                  </Label>
                  <select id="cameraAngle" title="Select Camera Angle" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.cameraAngle} onChange={(e) => update("cameraAngle", e.target.value)}>
                    <option value="">Select</option>
                    <option>Eye level</option>
                    <option>High angle</option>
                    <option>Low angle</option>
                    <option>Dutch angle</option>
                    <option>Bird{'\''}s eye</option>
                    <option>Worm{'\''}s eye</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Details the lighting setup, including natural, studio, backlighting, rim lighting, key lighting, etc." glossaryTerm="Lighting">Lighting & Visual Style</TooltipWrapper>
              </Label>
              <div>
                <Label className="mb-2 block text-xs text-foreground/60">
                <TooltipWrapper content="The primary method of lighting the scene." glossaryTerm="Lighting Setup">Lighting Setup</TooltipWrapper>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["Natural light","Studio lighting","Backlighting","Rim lighting","Key lighting"].map((l) => {
                    const active = form.lightingSetup.includes(l);
                    return (
                      <button key={l} type="button" onClick={() => toggleArray("lightingSetup", l)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
                      >{l}</button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="timeOfDay" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The time of day or period of the day." glossaryTerm="Time of Day">Time of Day</TooltipWrapper>
                  </Label>
                  <select id="timeOfDay" title="Select Time of Day" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.timeOfDay} onChange={(e) => update("timeOfDay", e.target.value)}>
                    <option value="">Select</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Golden hour</option>
                    <option>Night</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="colorGrading" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The color grading applied to the video." glossaryTerm="Color Grading">Color Grading</TooltipWrapper>
                  </Label>
                  <select id="colorGrading" title="Select Color Grading" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.colorGrading} onChange={(e) => update("colorGrading", e.target.value)}>
                    <option value="">Select</option>
                    <option>Natural</option>
                    <option>Warm tones</option>
                    <option>Cool tones</option>
                    <option>High contrast</option>
                    <option>Desaturated</option>
                    <option>Cinematic</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Details the dialogue, sound effects, ambient sound, and music style." glossaryTerm="Audio">Audio Design</TooltipWrapper>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Optional spoken words or narration." glossaryTerm="Dialogue">Dialogue (optional)</TooltipWrapper>
                  </Label>
                  <Input className="w-full" placeholder="e.g., &quot;Welcome to our product demo...&quot;"
                    value={form.dialogue}
                    onChange={(e) => update("dialogue", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Additional sound effects to enhance the scene." glossaryTerm="Sound Effects">Sound Effects</TooltipWrapper>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Footsteps","Door closing","Phone ringing","Wind","Rain"].map((s) => {
                      const active = form.soundEffects.includes(s);
                      return (
                        <button key={s} type="button" onClick={() => toggleArray("soundEffects", s)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label htmlFor="ambientSound" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="Background sounds to create atmosphere." glossaryTerm="Ambient Sound">Ambient Sound</TooltipWrapper>
                  </Label>
                  <select id="ambientSound" title="Select Ambient Sound" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.ambientSound} onChange={(e) => update("ambientSound", e.target.value)}>
                    <option value="">Select</option>
                    <option>Office ambience</option>
                    <option>City traffic</option>
                    <option>Nature sounds</option>
                    <option>Ocean waves</option>
                    <option>Forest sounds</option>
                    <option>None</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="musicStyle" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The style or genre of music to accompany the video." glossaryTerm="Music Style">Music Style</TooltipWrapper>
                  </Label>
                  <select id="musicStyle" title="Select Music Style" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.musicStyle} onChange={(e) => update("musicStyle", e.target.value)}>
                    <option value="">Select</option>
                    <option>Corporate</option>
                    <option>Upbeat</option>
                    <option>Dramatic</option>
                    <option>Ambient</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <Label className="block">
                <TooltipWrapper content="Technical details such as duration, frame rate, aspect ratio, and platform target." glossaryTerm="Technical">Technical Specifications</TooltipWrapper>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="duration" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The total length of the video." glossaryTerm="Duration">Duration</TooltipWrapper>
                  </Label>
                  <select id="duration" title="Select Video Duration" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.duration} onChange={(e) => update("duration", e.target.value)}>
                    {["5s","8s","10s","15s","30s"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="frameRate" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The number of frames per second." glossaryTerm="Frame Rate">Frame Rate</TooltipWrapper>
                  </Label>
                  <select id="frameRate" title="Select Frame Rate" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.frameRate} onChange={(e) => update("frameRate", e.target.value)}>
                    {["24fps","25fps","30fps","60fps"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="aspectRatio" className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The ratio of width to height of the video frame." glossaryTerm="Aspect Ratio">Aspect Ratio</TooltipWrapper>
                  </Label>
                  <select id="aspectRatio" title="Select Aspect Ratio" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary" value={form.aspectRatio} onChange={(e) => update("aspectRatio", e.target.value)}>
                    {["16:9","9:16","1:1","4:3","21:9"].map((ar) => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-foreground/60">
                  <TooltipWrapper content="The platform or AI model you are targeting." glossaryTerm="Platform">Platform Target</TooltipWrapper>
                  </Label>
                  <PlatformTargetSelector
                    options={["veo3","runway","pika","all"]}
                    value={form.platformTarget}
                    onChange={(p) => update("platformTarget", p as PlatformTarget)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { try { window.localStorage.removeItem(LOCAL_STORAGE_KEY); toast.success("Cleared saved form"); } catch {} }} tabIndex={0} className="focus-visible:ring-2 ring-primary">Clear Saved</Button>
                  <Button tabIndex={0} onClick={onGenerate} disabled={loading || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)} className="focus-visible:ring-2 ring-primary">{loading ? "Generating..." : "Generate Prompts"}</Button>
                </div>
          </div>
            </div>
          )}
        </div>
      </Card>

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

      {/* Output Panel - aria-live region for screen reader accessibility */}
      {veo3Prompt && (
        <Card className="p-6 shadow-xl ring-1 ring-border" role="region" aria-label="Video generation output panel" id={outputPanelId} aria-live="polite">
          <h2 className="text-xl font-semibold mb-6">Generated Video Prompts</h2>
          <div className="-mt-4 mb-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!user?.id) return;
                const combined = [
                  `Google Veo 3:\n${veo3Prompt || ""}`,
                  `Runway:\n${runwayPrompt || ""}`,
                  `Pika:\n${pikaPrompt || ""}`,
                ].join("\n\n");
                await saveTemplate({
                  userId: user.id,
                  name: `Video Template - ${new Date().toLocaleString()}`,
                  description: "Saved from Video Prompt output",
                  category: "video",
                  template: combined,
                  variables: [],
                  isPublic: false,
                });
              }}
            >Save as Template</Button>
          </div>
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