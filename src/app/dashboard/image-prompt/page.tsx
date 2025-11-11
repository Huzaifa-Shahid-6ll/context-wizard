"use client";

import React from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { recordSubmission } from "@/lib/autofill";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TooltipWrapper } from "@/components/forms/TooltipWrapper";
import { ToneStyleSelector } from "@/components/forms/ToneStyleSelector";
import { TechnicalDetailsBuilder } from "@/components/forms/TechnicalDetailsBuilder";
import { PromptPreview } from "@/components/forms/PromptPreview";
import { NegativePromptsInput } from "@/components/forms/NegativePromptsInput";
import { PlatformTargetSelector } from "@/components/forms/PlatformTargetSelector";

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

type SubjectType = "Person" | "Landscape" | "Object" | "Animal" | "Abstract" | "Architecture";

type FormState = {
	// Step 1: Subject Definition
	subjectType: SubjectType | "";
	subjectBrief: string; // one-line overview
	// conditional fields
	person?: { gender?: string; ageRange?: string; clothingStyle?: string; expression?: string; pose?: string };
	landscape?: { locationType?: string; timeOfDay?: string; season?: string; weather?: string };
	object?: { objectType?: string; material?: string; condition?: string; context?: string };
	// Step 2: Camera & Composition
	shotType?: string;
	cameraAngle?: string;
	composition?: string;
	// Step 3: Lighting & Atmosphere
	lightingTypes: string[];
	timeOfDay?: string;
	atmosphere?: string;
	// Step 4: Style & Mood
	styleKey?: string;
	moods: string[];
	colorPalette?: string;
	// Step 5: Technical Details
	depthOfField?: "Shallow" | "Deep";
	qualityModifiers: string[];
	aspectRatio?: string;
	platformTarget?: "midjourney" | "dalle" | "sd" | "all";
	// Step 6: Negative Prompts
	negatives: string[];
};

const LOCAL_STORAGE_KEY = "imagePromptStructuredForm.v1";

export default function ImagePromptPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateImagePrompt);
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

	const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImageResult | null>(null);
	const [form, setForm] = React.useState<FormState>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
				if (saved) return JSON.parse(saved) as FormState;
			} catch {}
		}
		return {
			subjectType: "",
			subjectBrief: "",
			lightingTypes: [],
			moods: [],
			qualityModifiers: [],
			negatives: [],
		};
	});

	React.useEffect(() => {
		try {
			window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
		} catch {}
	}, [form]);

  function validateStep(currentStep: number): boolean {
		if (currentStep === 1) {
			return form.subjectType !== "" && form.subjectBrief.trim().length > 5;
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((f) => ({ ...f, [key]: value }));
	}

  function buildStructuredPrompt(): { description: string; style?: string; mood?: string; details?: string } {
		// Build a rich, structured description string for existing backend
		const lines: string[] = [];
		lines.push(`Subject: ${form.subjectType} — ${form.subjectBrief}`);
		if (form.subjectType === "Person" && form.person) {
			const p = form.person;
			lines.push(
				`Person details: ${[p.gender, p.ageRange, p.clothingStyle, p.expression, p.pose].filter(Boolean).join(", ")}`
			);
		}
		if (form.subjectType === "Landscape" && form.landscape) {
			const l = form.landscape;
			lines.push(
				`Landscape: ${[l.locationType, l.timeOfDay, l.season, l.weather].filter(Boolean).join(", ")}`
			);
		}
		if (form.subjectType === "Object" && form.object) {
			const o = form.object;
			lines.push(`Object: ${[o.objectType, o.material, o.condition, o.context].filter(Boolean).join(", ")}`);
		}
		if (form.shotType || form.cameraAngle || form.composition) {
			lines.push(
				`Camera & Composition: ${[form.shotType, form.cameraAngle, form.composition].filter(Boolean).join(", ")}`
			);
		}
		if (form.lightingTypes.length || form.timeOfDay || form.atmosphere) {
			lines.push(
				`Lighting & Atmosphere: ${[
					form.lightingTypes.join("/"),
					form.timeOfDay,
					form.atmosphere,
				]
					.filter(Boolean)
					.join(", ")}`
			);
		}
		if (form.moods.length || form.colorPalette) {
			lines.push(`Style & Mood: ${[form.moods.join("/"), form.colorPalette].filter(Boolean).join(", ")}`);
		}
		if (form.depthOfField || form.qualityModifiers.length || form.aspectRatio) {
			lines.push(
				`Technical: ${[
					form.depthOfField ? `${form.depthOfField} depth of field` : undefined,
					form.qualityModifiers.join("/"),
					form.aspectRatio ? `AR ${form.aspectRatio}` : undefined,
				]
					.filter(Boolean)
					.join(", ")}`
			);
		}
		if (form.negatives.length) {
			lines.push(`Negative prompts: ${form.negatives.join(", ")}`);
		}
		return {
			description: lines.join("\n"),
			style: form.styleKey,
			mood: form.moods[0],
			details: [
				form.cameraAngle,
				form.composition,
				form.lightingTypes.join("/"),
				form.colorPalette,
				form.depthOfField,
				form.aspectRatio,
			].filter(Boolean).join(", ") || undefined,
		};
	}

  async function onGenerate() {
		if (!user?.id) return;
    if (stats && !stats.isPro && stats.remainingPrompts < 10) {
      toast.error(`Daily prompt limit reached. You have ${stats.remainingPrompts} prompts remaining. Please upgrade to Pro for unlimited prompts.`, {
        action: {
          label: 'Upgrade',
          onClick: () => { try { window.location.href = '/dashboard/billing'; } catch {} },
        },
      });
      return;
    }
		if (!validateStep(1)) {
			toast.error("Please complete Step 1 before generating.");
			setStep(1);
      return;
    }
    setLoading(true);
    try {
      toast.info("Generating... This might take a few seconds.");
			const built = buildStructuredPrompt();
      const res = await runGenerate({
				description: built.description,
				style: built.style,
				mood: built.mood,
				details: built.details,
        userId: user.id,
      });
      setResult(res as unknown as ImageResult);
      toast.success("Prompts generated!");
      // Save to autofill history
      recordSubmission("image", {
        subjectType: form.subjectType,
        subjectBrief: form.subjectBrief,
        styleKey: form.styleKey,
        moods: form.moods,
        aspectRatio: form.aspectRatio,
        platformTarget: form.platformTarget,
      }, user.id);
    } finally {
      setLoading(false);
    }
  }

  function toggleArray<K extends keyof FormState>(key: K, value: string) {
		setForm((f) => {
			const arr = new Set<string>(Array.isArray(f[key]) ? (f[key] as unknown as string[]) : []);
			if (arr.has(value)) arr.delete(value); else arr.add(value);
			return { ...f, [key]: Array.from(arr) } as FormState;
		});
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  const totalSteps = 6;

  // Accessible region and field IDs
  const previewPanelId = "img-prompt-preview-panel";
  const wizardRegionId = "img-prompt-wizard";
  const outputPanelId = "img-prompt-output-panel";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-3 flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => { setStep(1); /* quick mode: we keep minimal required */ }}>Quick Mode</Button>
        <Button size="sm" onClick={() => { window.location.href = "/dashboard/templates"; }}>Start from Template</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Panel - Wizard */}
        <Card className="p-4 shadow-lg ring-1 ring-border" role="region" aria-label="Image prompt generation wizard" aria-labelledby="img-prompt-wizard-h2" id={wizardRegionId}>
          <div className="space-y-4">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="text-sm" id="img-prompt-wizard-h2">Step {step} of {totalSteps}</div>
              <div className="flex-1 mx-3 h-2 bg-secondary/30 rounded" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Progress: Step ${step} of ${totalSteps}`}>
                <div className="h-2 bg-primary rounded" style={{ width: `${(step/totalSteps)*100}%` }} />
              </div>
              <div className="text-xs text-foreground/60">Structured form</div>
            </div>

            {/* Live Prompt Preview (shared) */}
            <PromptPreview id={previewPanelId} ariaLabel="Prompt live preview section">
                {buildStructuredPrompt().description}
            </PromptPreview>

            {/* Wizard Steps - use TooltipWrapper for technical fields */}
            {step === 1 && (
              <div className="space-y-4">
                <Label>
                  <TooltipWrapper content="The main subject of your image (affects composition)" glossaryTerm="Subject Type">
                    Subject Definition
                  </TooltipWrapper>
                </Label>
                <div>
                  <Label htmlFor="subjectType" className="mb-1 block text-xs text-foreground/60">
                    <TooltipWrapper content="Pick what type of subject you're depicting" glossaryTerm="Subject Type">
                      Subject Type
                    </TooltipWrapper>
                  </Label>
                  <select 
                    id="subjectType"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                    value={form.subjectType} 
                    onChange={(e) => update("subjectType", e.target.value as SubjectType)}>
                    <option value="">Select a subject</option>
                    {(["Person","Landscape","Object","Animal","Abstract","Architecture"] as SubjectType[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-foreground/60">
                    <TooltipWrapper content="One-sentence description. e.g., 'Portrait of an elderly woman reading by a window'" glossaryTerm="Subject Overview">
                      One-line overview
                    </TooltipWrapper>
                  </Label>
                  <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                    placeholder="e.g., Portrait..." value={form.subjectBrief}
                    onChange={(e) => update("subjectBrief", e.target.value)} />
                </div>
                {/* Conditional fields already have label, add TooltipWrapper if more helpful */}
                {form.subjectType === "Person" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="person-gender" className="mb-1 block text-xs text-foreground/60">Gender</Label>
                      <select 
                        id="person-gender"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        value={form.person?.gender || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), gender: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="person-age-range" className="mb-1 block text-xs text-foreground/60">Age Range</Label>
                      <select 
                        id="person-age-range"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
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
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Clothing Style</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., vintage cardigan, reading glasses"
                        value={form.person?.clothingStyle || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), clothingStyle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Expression</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., gentle smile, focused"
                        value={form.person?.expression || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), expression: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block text-xs text-foreground/60">Pose</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., seated by window, book in hands"
                        value={form.person?.pose || ""}
                        onChange={(e) => update("person", { ...(form.person||{}), pose: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {form.subjectType === "Landscape" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Location Type</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., coastal village, forest trail"
                        value={form.landscape?.locationType || ""}
                        onChange={(e) => update("landscape", { ...(form.landscape||{}), locationType: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="landscape-time-of-day" className="mb-1 block text-xs text-foreground/60">Time of Day</Label>
                      <select 
                        id="landscape-time-of-day"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        value={form.landscape?.timeOfDay || ""}
                        onChange={(e) => update("landscape", { ...(form.landscape||{}), timeOfDay: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option>Dawn</option>
                        <option>Morning</option>
                        <option>Midday</option>
                        <option>Afternoon</option>
                        <option>Golden hour</option>
                        <option>Dusk</option>
                        <option>Night</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="landscape-season" className="mb-1 block text-xs text-foreground/60">Season</Label>
                      <select 
                        id="landscape-season"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        value={form.landscape?.season || ""}
                        onChange={(e) => update("landscape", { ...(form.landscape||{}), season: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option>Spring</option>
                        <option>Summer</option>
                        <option>Autumn</option>
                        <option>Winter</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="landscape-weather" className="mb-1 block text-xs text-foreground/60">Weather</Label>
                      <select 
                        id="landscape-weather"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        value={form.landscape?.weather || ""}
                        onChange={(e) => update("landscape", { ...(form.landscape||{}), weather: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option>Clear</option>
                        <option>Cloudy</option>
                        <option>Foggy</option>
                        <option>Rainy</option>
                        <option>Snowy</option>
                        <option>Stormy</option>
                      </select>
                    </div>
                  </div>
                )}

                {form.subjectType === "Object" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Object Type</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., vintage typewriter"
                        value={form.object?.objectType || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), objectType: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Material</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., brass, worn leather"
                        value={form.object?.material || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), material: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Condition</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., well-used, pristine"
                        value={form.object?.condition || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), condition: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-foreground/60">Context</Label>
                      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                        placeholder="e.g., on a wooden desk with sunlight"
                        value={form.object?.context || ""}
                        onChange={(e) => update("object", { ...(form.object||{}), context: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-foreground/60">Required: Subject type, Overview</div>
                  <div className="flex gap-2">
                    <Button variant="outline" tabIndex={0} onClick={onGenerate} disabled={loading || (!!stats && !stats.isPro && stats.remainingPrompts < 10)} className="focus-visible:ring-2 ring-primary">
                      {loading ? "Generating..." : "Generate Now"}
                    </Button>
                    <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label>
                  <TooltipWrapper content="How the camera is positioned and the composition of the shot" glossaryTerm="Camera & Composition">
                    Camera & Composition
                  </TooltipWrapper>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="shot-type" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The type of shot you want to capture" glossaryTerm="Shot Type">
                        Shot Type
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="shot-type"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.shotType || ""}
                      onChange={(e) => update("shotType", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Close-up</option>
                      <option>Medium shot</option>
                      <option>Wide shot</option>
                      <option>Extreme close-up</option>
                      <option>Establishing shot</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="camera-angle" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The angle from which the camera is positioned" glossaryTerm="Camera Angle">
                        Camera Angle
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="camera-angle"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.cameraAngle || ""}
                      onChange={(e) => update("cameraAngle", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Eye level</option>
                      <option>High angle</option>
                      <option>Low angle</option>
                      <option>Bird{'\''}s eye</option>
                      <option>Worm{'\''}s eye</option>
                      <option>Dutch angle</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="composition" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The arrangement of elements within the frame" glossaryTerm="Composition">
                        Composition
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="composition"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.composition || ""}
                      onChange={(e) => update("composition", e.target.value)}
                    >
                      <option value="">Optional</option>
                      <option>Rule of thirds</option>
                      <option>Centered</option>
                      <option>Symmetrical</option>
                      <option>Leading lines</option>
                      <option>Frame within frame</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                  <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Label>
                  <TooltipWrapper content="The type of lighting and its effect on the scene" glossaryTerm="Lighting & Atmosphere">
                    Lighting & Atmosphere
                  </TooltipWrapper>
                </Label>
                <div>
                  <Label className="mb-2 block text-xs text-foreground/60">
                    <TooltipWrapper content="The different types of lighting you want to include" glossaryTerm="Lighting Types">
                      Lighting Types
                    </TooltipWrapper>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Natural window light","Golden hour","Studio lighting","Rim lighting","Backlighting"].map((lt) => {
                      const active = form.lightingTypes.includes(lt);
                      return (
                        <button
                          key={lt}
                          type="button"
                          onClick={() => toggleArray("lightingTypes", lt)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
                        >
                          {lt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="time-of-day" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The time of day or weather conditions" glossaryTerm="Time of Day">
                        Time of Day
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="time-of-day"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.timeOfDay || ""}
                      onChange={(e) => update("timeOfDay", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Dawn</option>
                      <option>Morning</option>
                      <option>Midday</option>
                      <option>Afternoon</option>
                      <option>Golden hour</option>
                      <option>Dusk</option>
                      <option>Night</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="atmosphere" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The atmospheric conditions and weather" glossaryTerm="Atmosphere/Weather">
                        Atmosphere/Weather
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="atmosphere"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.atmosphere || ""}
                      onChange={(e) => update("atmosphere", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Clear</option>
                      <option>Cloudy</option>
                      <option>Foggy</option>
                      <option>Rainy</option>
                      <option>Snowy</option>
                      <option>Stormy</option>
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
                <Label>
                  <TooltipWrapper content="The visual style and emotional tone of the image" glossaryTerm="Style & Mood">
                    Style & Mood
                  </TooltipWrapper>
                </Label>
            <div>
                  <Label className="mb-2 block">
                    <TooltipWrapper content="The visual style you want to achieve" glossaryTerm="Visual Style">
                      Visual Style
                    </TooltipWrapper>
                  </Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STYLE_PRESETS.map((s) => {
                      const active = form.styleKey === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                          onClick={() => update("styleKey", active ? undefined : s.key)}
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
            <div>
              <Label className="mb-2 block">
                <TooltipWrapper content="The emotional mood you want to evoke" glossaryTerm="Mood">
                  Mood
                </TooltipWrapper>
              </Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                      const active = form.moods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                          onClick={() => toggleArray("moods", m)}
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
                <div>
                  <Label htmlFor="color-palette" className="mb-1 block text-xs text-foreground/60">
                    <TooltipWrapper content="The color scheme you want to use" glossaryTerm="Color Palette">
                      Color Palette
                    </TooltipWrapper>
                  </Label>
                  <select 
                    id="color-palette"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                    value={form.colorPalette || ""}
                    onChange={(e) => update("colorPalette", e.target.value)}
                  >
                    <option value="">Optional</option>
                    <option>Warm tones</option>
                    <option>Cool tones</option>
                    <option>Monochrome</option>
                    <option>Vibrant</option>
                    <option>Muted</option>
                    <option>Complementary</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                  <Button tabIndex={0} onClick={nextStep} className="focus-visible:ring-2 ring-primary">Next</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <Label>
                  <TooltipWrapper content="Technical details that influence image quality and style" glossaryTerm="Technical Details">
                    Technical Details
                  </TooltipWrapper>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The depth of field in your image" glossaryTerm="Depth of Field">
                        Depth of Field
                      </TooltipWrapper>
                    </Label>
                    <div className="flex gap-3">
                      {["Shallow","Deep"].map((d) => (
                        <label key={d} className="flex items-center gap-2 text-sm">
                          <input type="radio" name="dof" checked={form.depthOfField === d}
                            onChange={() => update("depthOfField", d as FormState["depthOfField"])}
                          /> {d}
                        </label>
                      ))}
                    </div>
                  </div>
            <div>
                    <Label htmlFor="aspect-ratio" className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The aspect ratio of your image" glossaryTerm="Aspect Ratio">
                        Aspect Ratio
                      </TooltipWrapper>
                    </Label>
                    <select 
                      id="aspect-ratio"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
                      value={form.aspectRatio || ""}
                      onChange={(e) => update("aspectRatio", e.target.value)}
                    >
                      <option value="">Optional</option>
                      <option>16:9</option>
                      <option>4:3</option>
                      <option>1:1</option>
                      <option>9:16</option>
                      <option>21:9</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="Modifiers that affect image quality and style" glossaryTerm="Quality Modifiers">
                        Quality Modifiers
                      </TooltipWrapper>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {["8K resolution","Highly detailed","Professional photography","Award-winning"].map((q) => {
                        const active = form.qualityModifiers.includes(q);
                        return (
                          <button key={q} type="button" onClick={() => toggleArray("qualityModifiers", q)}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
                          >{q}</button>
                        );
                      })}
                    </div>
              </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-foreground/60">
                      <TooltipWrapper content="The platform you want to generate the image on" glossaryTerm="Platform Target">
                        Platform Target
                      </TooltipWrapper>
                    </Label>
                    <PlatformTargetSelector
                      options={["midjourney","dalle","sd","all"]}
                      value={form.platformTarget}
                      onChange={(p) => update("platformTarget", p as FormState["platformTarget"])}
                    />
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
                <Label>
                  <TooltipWrapper content="Negative prompts to avoid unwanted elements in the image" glossaryTerm="Negative Prompts">
                    Negative Prompts (Optional)
                  </TooltipWrapper>
                </Label>
            <NegativePromptsInput value={form.negatives} onChange={(next) => update("negatives", next)} />
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" tabIndex={0} onClick={prevStep} className="focus-visible:ring-2 ring-primary">Back</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" tabIndex={0} onClick={() => { try { window.localStorage.removeItem(LOCAL_STORAGE_KEY); toast.success("Cleared saved form"); } catch {} }} className="focus-visible:ring-2 ring-primary">Clear Saved</Button>
                    <Button tabIndex={0} onClick={onGenerate} disabled={loading || (!!stats && !stats.isPro && stats.remainingPrompts < 10)} className="focus-visible:ring-2 ring-primary">
                {loading ? "Generating..." : "Generate Prompts"}
              </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel - Output */}
        <Card className="p-4 shadow-xl ring-1 ring-border" role="region" aria-label="Image generation output panel" id={outputPanelId}>
          <h2 className="text-base font-semibold tracking-tight">Output</h2>
          {!result ? (
            <p className="mt-2 text-sm text-foreground/60">Your prompts will appear here after generation.</p>
          ) : (
            <Tabs defaultValue="midjourney" className="mt-3">
              <div className="mb-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!user?.id || !result) return;
                    const combined = [
                      `Midjourney:\n${result.midjourneyPrompt}`,
                      `DALL-E 3:\n${result.dallePrompt}`,
                      `Stable Diffusion:\n${result.stableDiffusionPrompt}`,
                    ].join("\n\n");
                    await saveTemplate({
                      userId: user.id,
                      name: `Image Template - ${new Date().toLocaleString()}`,
                      description: "Saved from Image Prompt output",
                      category: "image",
                      template: combined,
                      variables: [],
                      isPublic: false,
                    });
                  }}
                >Save as Template</Button>
              </div>
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


