"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";
import { ModeSelector, Mode } from "@/components/forms/ModeSelector";
import { TemplateLibrary, Template } from "@/components/templates/TemplateLibrary";
import { getSmartDefaults, suggestFields, recordSubmission } from "@/lib/autofill";
import { TooltipWrapper } from "@/components/forms/TooltipWrapper";
import { ToneStyleSelector } from "@/components/forms/ToneStyleSelector";
import { OutputFormatSelector } from "@/components/forms/OutputFormatSelector";
import { AudienceSelector } from "@/components/forms/AudienceSelector";
import { PromptPreview } from "@/components/forms/PromptPreview";
import { initAnalytics, identify, track } from "@/lib/analytics";

export default function GenericPromptPage() {
  const { user } = useUser();
  React.useEffect(() => {
    initAnalytics();
    if (user?.id) identify(user.id);
    track("generic_prompt_page_view");
  }, [user?.id]);
  const runGenerate = useAction(api.promptGenerators.generateGenericPrompt);
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  // Wizard state
  const [step, setStep] = React.useState(1);
  const [category, setCategory] = React.useState("Email Writing");

  // Progressive Disclosure Mode State (persisted via Convex)
  const [mode, setMode] = React.useState<Mode>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mode:genericPrompt')) as Mode || "quick";
  });

  // Shared
  const [outputConfig, setOutputConfig] = React.useState<{ format: string; length: string; structure: string[]; constraints: {} }>({
    format: "text",
    length: "standard",
    structure: [],
    constraints: {},
  });
  const [toneConfig, setToneConfig] = React.useState<{ tone: string; style: string; modifiers: string[] }>({
    tone: "professional",
    style: "concise",
    modifiers: [],
  });
  const [goal, setGoal] = React.useState("");
  const [context, setContext] = React.useState("");

  // Email fields
  const [emailRecipient, setEmailRecipient] = React.useState("");
  const [emailPurpose, setEmailPurpose] = React.useState("");
  const [emailKeyPoints, setEmailKeyPoints] = React.useState<string[]>([]);
  const [emailCta, setEmailCta] = React.useState("");

  // Code fields
  const [codeLanguage, setCodeLanguage] = React.useState("");
  const [codeFramework, setCodeFramework] = React.useState("");
  const [codeTaskType, setCodeTaskType] = React.useState("");
  const [codeComplexity, setCodeComplexity] = React.useState("");
  const [codeIncludeTests, setCodeIncludeTests] = React.useState(false);
  const [codeIncludeDocs, setCodeIncludeDocs] = React.useState(false);

  // Content fields
  const [contentType, setContentType] = React.useState("");
  const [contentTopic, setContentTopic] = React.useState("");
  const [audienceConfig, setAudienceConfig] = React.useState({
    ageRange: "",
    profession: "",
    expertiseLevel: "",
    industry: "",
    useCase: "",
  });
  const [contentWordCount, setContentWordCount] = React.useState("");
  const [contentKeyPoints, setContentKeyPoints] = React.useState<string[]>([]);
  const [contentSeo, setContentSeo] = React.useState<string[]>([]);

  // Data Analysis fields
  const [dataType, setDataType] = React.useState("");
  const [analysisGoal, setAnalysisGoal] = React.useState("");
  const [needViz, setNeedViz] = React.useState(false);
  const [statsMethods, setStatsMethods] = React.useState<string[]>([]);

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = React.useState<string | null>(null);
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[] | null>(null);
  const [example, setExample] = React.useState<string | null>(null);

  // Autofill suggestion state
  const autofillFields = React.useRef<Record<string, any> | null>(null);
  const [showAutofill, setShowAutofill] = React.useState(false);

  // Local storage persistence
  React.useEffect(() => {
    try {
      const payload = {
        step, category, outputConfig, toneConfig, goal, context,
        emailRecipient, emailPurpose, emailKeyPoints, emailCta,
        codeLanguage, codeFramework, codeTaskType, codeComplexity, codeIncludeTests, codeIncludeDocs,
        contentType, contentTopic, audienceConfig, contentWordCount, contentKeyPoints, contentSeo,
        dataType, analysisGoal, needViz, statsMethods,
      };
      localStorage.setItem("genericPrompt.v1", JSON.stringify(payload));
    } catch {}
  }, [step, category, outputConfig, toneConfig, goal, context, emailRecipient, emailPurpose, emailKeyPoints, emailCta, codeLanguage, codeFramework, codeTaskType, codeComplexity, codeIncludeTests, codeIncludeDocs, contentType, contentTopic, audienceConfig, contentWordCount, contentKeyPoints, contentSeo, dataType, analysisGoal, needViz, statsMethods]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("genericPrompt.v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      setStep(data.step || 1);
      setCategory(data.category || "Email Writing");
      setOutputConfig(data.outputConfig || { format: "text", length: "standard", structure: [], constraints: {} });
      setToneConfig(data.toneConfig || { tone: "professional", style: "concise", modifiers: [] });
      setGoal(data.goal || "");
      setContext(data.context || "");
      setEmailRecipient(data.emailRecipient || "");
      setEmailPurpose(data.emailPurpose || "");
      setEmailKeyPoints(Array.isArray(data.emailKeyPoints) ? data.emailKeyPoints : []);
      setEmailCta(data.emailCta || "");
      setCodeLanguage(data.codeLanguage || "");
      setCodeFramework(data.codeFramework || "");
      setCodeTaskType(data.codeTaskType || "");
      setCodeComplexity(data.codeComplexity || "");
      setCodeIncludeTests(!!data.codeIncludeTests);
      setCodeIncludeDocs(!!data.codeIncludeDocs);
      setContentType(data.contentType || "");
      setContentTopic(data.contentTopic || "");
      setAudienceConfig(data.audienceConfig || { ageRange: "", profession: "", expertiseLevel: "", industry: "", useCase: "" });
      setContentWordCount(data.contentWordCount || "");
      setContentKeyPoints(Array.isArray(data.contentKeyPoints) ? data.contentKeyPoints : []);
      setContentSeo(Array.isArray(data.contentSeo) ? data.contentSeo : []);
      setDataType(data.dataType || "");
      setAnalysisGoal(data.analysisGoal || "");
      setNeedViz(!!data.needViz);
      setStatsMethods(Array.isArray(data.statsMethods) ? data.statsMethods : []);
    } catch {}
  }, []);

  React.useEffect(() => {
    // Offer autofill when category changes and in Quick or Standard mode
    if (step === 1 && (mode === "quick" || mode === "standard")) {
      const defaults = getSmartDefaults(category, user?.id);
      autofillFields.current = defaults;
      setShowAutofill(!!defaults);
    } else {
      setShowAutofill(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mode, step, user?.id]);

  function applyAutofill() {
    const fields = autofillFields.current;
    if (!fields) return;
    // Pre-fill all matching fields (only those present in fields and the state)
    if (typeof fields.format === 'string') setOutputConfig(prev => ({ ...prev, format: fields.format }));
    if (typeof fields.tone === 'string') setToneConfig(prev => ({ ...prev, tone: fields.tone }));
    if (typeof fields.goal === 'string') setGoal(fields.goal);
    if (typeof fields.emailRecipient === 'string') setEmailRecipient(fields.emailRecipient);
    if (typeof fields.emailPurpose === 'string') setEmailPurpose(fields.emailPurpose);
    if (Array.isArray(fields.emailKeyPoints)) setEmailKeyPoints(fields.emailKeyPoints);
    if (typeof fields.emailCta === 'string') setEmailCta(fields.emailCta);
    if (typeof fields.codeLanguage === 'string') setCodeLanguage(fields.codeLanguage);
    if (typeof fields.codeFramework === 'string') setCodeFramework(fields.codeFramework);
    if (typeof fields.codeTaskType === 'string') setCodeTaskType(fields.codeTaskType);
    if (typeof fields.codeComplexity === 'string') setCodeComplexity(fields.codeComplexity);
    if (typeof fields.codeIncludeTests === 'boolean') setCodeIncludeTests(fields.codeIncludeTests);
    if (typeof fields.codeIncludeDocs === 'boolean') setCodeIncludeDocs(fields.codeIncludeDocs);
    if (typeof fields.contentType === 'string') setContentType(fields.contentType);
    if (typeof fields.contentTopic === 'string') setContentTopic(fields.contentTopic);
    if (typeof fields.contentAudience === 'string') setAudienceConfig(prev => ({ ...prev, profession: fields.contentAudience }));
    else if (typeof fields.contentAudience === 'object') setAudienceConfig(fields.contentAudience);
    if (typeof fields.contentWordCount === 'string') setContentWordCount(fields.contentWordCount);
    if (Array.isArray(fields.contentKeyPoints)) setContentKeyPoints(fields.contentKeyPoints);
    if (Array.isArray(fields.contentSeo)) setContentSeo(fields.contentSeo);
    if (typeof fields.dataType === 'string') setDataType(fields.dataType);
    if (typeof fields.analysisGoal === 'string') setAnalysisGoal(fields.analysisGoal);
    if (typeof fields.needViz === 'boolean') setNeedViz(fields.needViz);
    if (Array.isArray(fields.statsMethods)) setStatsMethods(fields.statsMethods);
    setShowAutofill(false);
  }

  function validateStep(cur: number): boolean {
    if (cur === 1) return !!category;
    if (cur === 2) {
      if (category === "Email Writing") return !!emailRecipient && !!emailPurpose;
      if (category === "Code Generation") return !!codeLanguage && !!codeTaskType;
      if (category === "Content Creation") return !!contentType && !!contentTopic;
      if (category === "Data Analysis") return !!dataType && !!analysisGoal;
      return !!goal.trim();
    }
    return true;
  }
  function next() {
    track("generic_prompt_step_next", { step });
    if (!validateStep(step)) {
      toast.error("Please complete required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }
  function prev() {
    track("generic_prompt_step_prev", { step });
    setStep((s) => Math.max(1, s - 1));
  }

  function addTo(list: string[], setter: (v: string[]) => void, value: string) {
    const v = value.trim();
    if (!v) return;
    setter(Array.from(new Set([...(list || []), v])));
  }
  function removeFrom(list: string[], setter: (v: string[]) => void, value: string) {
    setter((list || []).filter((x) => x !== value));
  }

  function buildInputs() {
    // Build goal/context/format/tone according to category
    let builtGoal = goal.trim();
    const parts: string[] = [];

    if (category === "Email Writing") {
      parts.push(`Email to: ${emailRecipient}`);
      parts.push(`Purpose: ${emailPurpose}`);
      if (emailKeyPoints.length) parts.push(`Key points: ${emailKeyPoints.join("; ")}`);
      if (emailCta) parts.push(`Call to action: ${emailCta}`);
      builtGoal = builtGoal || `Write an email for ${emailRecipient} to ${emailPurpose && typeof emailPurpose === 'string' ? emailPurpose.toLowerCase() : ''}`;
    } else if (category === "Code Generation") {
      parts.push(`Language: ${codeLanguage}`);
      if (codeFramework) parts.push(`Framework: ${codeFramework}`);
      parts.push(`Task: ${codeTaskType}${codeComplexity ? ` (${codeComplexity})` : ""}`);
      parts.push(`Include tests: ${codeIncludeTests ? "yes" : "no"}, docs: ${codeIncludeDocs ? "yes" : "no"}`);
      builtGoal = builtGoal || `Generate ${codeTaskType} in ${codeLanguage}${codeFramework ? ` (${codeFramework})` : ""}`;
    } else if (category === "Content Creation") {
      parts.push(`Content type: ${contentType}`);
      parts.push(`Topic: ${contentTopic}`);
      if (audienceConfig.ageRange) parts.push(`Audience Age Range: ${audienceConfig.ageRange}`);
      if (audienceConfig.profession) parts.push(`Audience Profession: ${audienceConfig.profession}`);
      if (audienceConfig.expertiseLevel) parts.push(`Audience Expertise Level: ${audienceConfig.expertiseLevel}`);
      if (audienceConfig.industry) parts.push(`Audience Industry: ${audienceConfig.industry}`);
      if (audienceConfig.useCase) parts.push(`Audience Use Case: ${audienceConfig.useCase}`);
      if (contentWordCount) parts.push(`Word count: ${contentWordCount}`);
      if (contentKeyPoints.length) parts.push(`Key points: ${contentKeyPoints.join("; ")}`);
      if (contentSeo.length) parts.push(`SEO: ${contentSeo.join(", ")}`);
      builtGoal = builtGoal || `Create a ${contentType} about ${contentTopic}`;
    } else if (category === "Data Analysis") {
      parts.push(`Data type: ${dataType}`);
      parts.push(`Analysis goal: ${analysisGoal}`);
      parts.push(`Visualization: ${needViz ? "yes" : "no"}`);
      if (statsMethods.length) parts.push(`Methods: ${statsMethods.join(", ")}`);
      builtGoal = builtGoal || `Analyze ${dataType} to ${analysisGoal && typeof analysisGoal === 'string' ? analysisGoal.toLowerCase() : ''}`;
    }

    const builtContext = [
      `Category: ${category}`,
      parts.join(" | "),
      `Output Format: ${outputConfig.format}`,
      `Output Length: ${outputConfig.length}`,
      outputConfig.structure.length > 0 ? `Output Structure: ${outputConfig.structure.join(", ")}` : "",
      `Tone: ${toneConfig.tone}`,
      `Style: ${toneConfig.style}`,
      toneConfig.modifiers.length > 0 ? `Modifiers: ${toneConfig.modifiers.join(", ")}` : "",
      context.trim(),
    ].filter(Boolean).join("\n");

    return { builtGoal, builtContext };
  }

  async function onGenerate() {
    if (!user?.id) return;
    if (stats && !stats.isPro && stats.remainingPrompts <= 0) {
      toast.error("Daily limit reached. Please upgrade to continue.");
      return;
    }
    track("generic_prompt_generate", { category, tone: toneConfig.tone, format: outputConfig.format });
    if (!validateStep(1) || !validateStep(2)) {
      toast.error("Please complete required fields first.");
      setStep(1);
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      toast.info("Generating... This might take a few seconds.");
      recordSubmission(category, {
        format: outputConfig.format, tone: toneConfig.tone, goal, emailRecipient, emailPurpose, emailKeyPoints, emailCta,
        codeLanguage, codeFramework, codeTaskType, codeComplexity, codeIncludeTests, codeIncludeDocs,
        contentType, contentTopic, audienceConfig, contentWordCount, contentKeyPoints, contentSeo,
        dataType, analysisGoal, needViz, statsMethods
      }, user?.id);
      const { builtGoal, builtContext } = buildInputs();
      const res = await runGenerate({
        userGoal: builtGoal,
        context: builtContext || undefined,
        outputFormat: outputConfig.format,
        tone: toneConfig.tone,
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
      track("generic_prompt_generated_success");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 1200);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }

  function applyTemplate(template: { goal: string; context?: string; format?: string; tone?: string }) {
    setGoal(template.goal);
    if (template.context) setContext(template.context);
    if (template.format) setOutputConfig(prev => ({ ...prev, format: template.format || prev.format }));
    if (template.tone) setToneConfig(prev => ({ ...prev, tone: template.tone || prev.tone }));
  }

  const userPrefs = useQuery(api.queries.getUserPreferences, user?.id ? { userId: user.id, featureType: "generic" } : "skip") as any;
  const savePrefs = useMutation(api.mutations.saveUserPreferences);
  React.useEffect(() => {
    if (userPrefs && userPrefs.preferredMode && (userPrefs.preferredMode === "quick" || userPrefs.preferredMode === "standard" || userPrefs.preferredMode === "advanced")) {
      setMode(userPrefs.preferredMode as Mode);
    }
  }, [userPrefs]);
  React.useEffect(() => {
    if (user?.id) {
      localStorage.setItem('mode:genericPrompt', mode);
      savePrefs({ userId: user.id, featureType: "generic", formData: {}, preferredMode: mode }).catch(() => {});
    }
  }, [mode, user?.id]);

  // Mode configs: which fields are shown in which mode
  type ModeConfig = {
    [key in Mode]: {
      step1: string[];
      step2: { [category: string]: string[] };
    };
  };

  const modeConfig: ModeConfig = {
    quick: {
      step1: ["category", "format", "tone"],
      step2: { "Email Writing": ["emailRecipient", "emailPurpose"], "Code Generation": ["codeLanguage", "codeTaskType"], "Content Creation": ["contentType", "contentTopic"], "Data Analysis": ["dataType", "analysisGoal"], "Other": ["goal"] },
    },
    standard: {
      step1: ["category", "format", "tone"],
      step2: { "Email Writing": ["emailRecipient", "emailPurpose", "emailKeyPoints", "emailCta"], "Code Generation": ["codeLanguage", "codeFramework", "codeTaskType", "codeComplexity", "codeIncludeTests"], "Content Creation": ["contentType", "contentTopic", "contentAudience", "contentWordCount", "contentKeyPoints"], "Data Analysis": ["dataType", "analysisGoal", "needViz"], "Other": ["goal"] },
    },
    advanced: {
      step1: ["category", "format", "tone", "goal"],
      step2: { "Email Writing": ["emailRecipient", "emailPurpose", "emailKeyPoints", "emailCta"], "Code Generation": ["codeLanguage", "codeFramework", "codeTaskType", "codeComplexity", "codeIncludeTests", "codeIncludeDocs"], "Content Creation": ["contentType", "contentTopic", "contentAudience", "contentWordCount", "contentKeyPoints", "contentSeo"], "Data Analysis": ["dataType", "analysisGoal", "needViz", "statsMethods"], "Other": ["goal"] },
    },
  };

  // Template previews for TemplateLibrary
  const templateData: Template[] = templates.map((tpl) => ({
    id: tpl.label,
    name: tpl.label,
    description: tpl.context || tpl.goal,
    fields: tpl,
    preview: <span className="text-xs text-foreground/60">{tpl.goal}</span>,
  }));

  // Apply template: set all matching fields
  function onTemplateApply(tpl: Template) {
    if (tpl.fields.goal) setGoal(tpl.fields.goal);
    if (tpl.fields.context) setContext(tpl.fields.context);
    if (tpl.fields.format) setOutputConfig(prev => ({ ...prev, format: tpl.fields.format || prev.format }));
    if (tpl.fields.tone) setToneConfig(prev => ({ ...prev, tone: tpl.fields.tone || prev.tone }));
    // try to guess best category
    if (typeof tpl.fields.goal === 'string' && tpl.fields.goal.toLowerCase().includes("email")) setCategory("Email Writing");
    else if (typeof tpl.fields.goal === 'string' && tpl.fields.goal.toLowerCase().includes("summarize")) setCategory("Content Creation");
  }

  // Lives-updating prompt preview block
  function PromptPreviewPanel() {
    const { builtGoal, builtContext } = buildInputs();
    return (
      <div className="mt-4 mb-2 p-3 rounded-md border border-primary/20 bg-primary/5">
        <div className="font-semibold text-xs text-primary mb-1">Live Preview</div>
        <div className="whitespace-pre-wrap text-sm">
          {builtGoal}\n\n{builtContext}
        </div>
      </div>
    );
  }

  // Key accessible IDs
  const autofillMsgId = "autofill-msg-generic";
  const previewPanelId = "prompt-preview-generic";
  const wizardRegionId = "prompt-wizard-generic";
  const outputPanelId = "prompt-output-generic";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Generic Prompt Assistant</h1>
        <p className="mt-1 text-sm text-foreground/70">We&apos;ll guide you through a few quick steps.</p>
        <div className="mt-3 flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setMode("quick"); setStep(1); track("cta_quick_mode_click", { feature: "generic" }); }}>Quick Mode</Button>
          <Button size="sm" onClick={() => { window.location.href = "/dashboard/templates"; track("cta_start_from_template_click", { feature: "generic" }); }}>Start from Template</Button>
        </div>
      </div>

      {/* Mode selector (progressive disclosure) */}
      <ModeSelector featureKey="genericPrompt" mode={mode} onChange={setMode} />

      {showAutofill && (
        <div className="my-3 flex gap-2 items-center rounded border border-accent bg-accent/10 py-3 px-4" aria-live="polite" id={autofillMsgId}>
          <span className="text-xs text-foreground/70">Recent autofill suggestions found for this category.</span>
          <Button size="sm" tabIndex={0} onClick={applyAutofill} className="focus-visible:ring-2 ring-offset-2 ring-primary">Auto-fill fields</Button>
        </div>
      )}

      {/* Template Library (visual grid, replaces quick templates) */}
      <TemplateLibrary templates={templateData} onApply={onTemplateApply} />

      {/* Import/Export Config */}
      <div className="flex justify-end gap-2 mb-2">
        <input id="import-generic-json" type="file" accept="application/json" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(String(reader.result));
              setCategory(data.category || category);
              setOutputConfig(prev => ({ ...prev, format: (typeof data.format === 'string' ? data.format : prev.format) }));
              setToneConfig(prev => ({ ...prev, tone: (typeof data.tone === 'string' ? data.tone : prev.tone) }));
              setGoal(typeof data.goal === 'string' ? data.goal : '');
              setContext(typeof data.context === 'string' ? data.context : '');
            } catch {}
          };
          reader.readAsText(file);
        }} />
        <Button size="sm" variant="outline" onClick={() => {
          const data = { category, format: outputConfig.format, tone: toneConfig.tone, goal, context };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "generic-config.json"; a.click(); URL.revokeObjectURL(url);
        }}>Export JSON</Button>
        <Button size="sm" onClick={() => document.getElementById("import-generic-json")?.click()}>Import JSON</Button>
      </div>

      {/* Wizard region - ARIA labels and roles */}
      <Card className="p-4 shadow-lg ring-1 ring-border" role="region" aria-label="Prompt generation wizard" aria-labelledby="wizard-step-heading" aria-describedby={autofillMsgId} id={wizardRegionId}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium" id="wizard-step-heading">Step {step} of 4</div>
          <div className="h-2 w-2/3 rounded bg-secondary/20">
            <div className="h-2 rounded bg-primary transition-[width] duration-300" style={{ width: `${(step/4)*100}%` }} />
          </div>
        </div>
        {/* Accessible Prompt Preview Panel (shared) */}
        <PromptPreview id={previewPanelId} ariaLabel="Prompt live preview section">
            {buildInputs().builtGoal}
            {"\n\n"}
            {buildInputs().builtContext}
        </PromptPreview>
        {step === 1 && (
          <div className="space-y-4">
            {modeConfig[mode].step1.includes("category") && (
              <>
                <Label htmlFor="category">
                  <TooltipWrapper content="What type of prompt are you creating?" glossaryTerm="Task Category">
                    Category
                  </TooltipWrapper>
                </Label>
                <select id="category" title="Select Category" className="w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {["Email Writing","Code Generation","Content Creation","Data Analysis","Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {modeConfig[mode].step1.includes("format") && (
                <OutputFormatSelector
                  value={outputConfig}
                  onChange={setOutputConfig}
                />
              )}
              {modeConfig[mode].step1.includes("tone") && (
                <ToneStyleSelector
                  value={toneConfig}
                  onChange={setToneConfig}
                />
              )}
              {/* If audience selection is relevant for this prompt mode, add AudienceSelector below */}
              {modeConfig[mode].step1.includes("audience") && (
                <AudienceSelector
                  value={audienceConfig}
                  onChange={setAudienceConfig}
                />
              )}
            </div>
            {mode === "advanced" && (
              <div>
                <Label>Your goal (optional)</Label>
                <input className="w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe your specific goal" />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Only render fields based on modeConfig[mode].step2[category] */}
            {modeConfig[mode].step2[category].includes("emailRecipient") && (
              <>
                <Label htmlFor="emailRecipient">
                  <TooltipWrapper content="Who is the email recipient?" glossaryTerm="Email Recipient">
                    Recipient
                  </TooltipWrapper>
                </Label>
                <select id="emailRecipient" title="Select Email Recipient" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={emailRecipient} onChange={(e) => setEmailRecipient(e.target.value)}>
                  {["Client","Team member","Manager","Customer","Vendor"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </>
            )}
            {modeConfig[mode].step2[category].includes("emailPurpose") && (
              <>
                <Label htmlFor="emailPurpose">
                  <TooltipWrapper content="What is the purpose of the email?" glossaryTerm="Email Purpose">
                    Purpose
                  </TooltipWrapper>
                </Label>
                <select id="emailPurpose" title="Select Email Purpose" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={emailPurpose} onChange={(e) => setEmailPurpose(e.target.value)}>
                  {["Update","Request","Apology","Announcement","Follow-up"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </>
            )}
            {modeConfig[mode].step2[category].includes("emailKeyPoints") && (
              <>
                <Label>
                  <TooltipWrapper content="Key points to include in the email?" glossaryTerm="Email Key Points">
                    Key points
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {emailKeyPoints.map((p) => (
                    <span key={p} className="rounded-full border px-2 py-1 text-xs">{p} <button className="ml-1" onClick={() => removeFrom(emailKeyPoints, setEmailKeyPoints, p)}>×</button></span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input className="flex-1 rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" placeholder="Add point and press Add" id="emailPointInput" />
                  <Button variant="outline" onClick={() => { const el = document.getElementById("emailPointInput") as HTMLInputElement | null; if (!el) return; addTo(emailKeyPoints, setEmailKeyPoints, el.value); el.value = ""; }} tabIndex={0} className="focus-visible:ring-2 ring-offset-2 ring-primary">Add</Button>
                </div>
              </>
            )}
            {modeConfig[mode].step2[category].includes("emailCta") && (
              <>
                <Label>
                  <TooltipWrapper content="What should the recipient do next?" glossaryTerm="Call to Action">
                    Call to action
                  </TooltipWrapper>
                </Label>
                <input className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={emailCta} onChange={(e) => setEmailCta(e.target.value)} placeholder="What should they do next?" />
              </>
            )}
            {/* Similar logic for code, content, data analysis, other -- show per mode */}
            {/* ... repeat pattern for other categories and fields ... */}
          </div>
        )}

        {/* Step 3: Context (always shown for all modes) */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold tracking-tight">Context & Constraints</h2>
            <div>
              <Label>
                <TooltipWrapper content="Any relevant context, examples, or constraints for the prompt?" glossaryTerm="Prompt Context">
                  Background information (optional)
                </TooltipWrapper>
              </Label>
              <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" rows={4} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Any relevant context, examples, constraints" />
            </div>
          </div>
        )}
        {/* Step 4: Review unchanged */}
        {step === 4 && (
          <div className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight">Review & Generate</h2>
            <div className="rounded-md border border-border bg-secondary/10 p-3 text-sm whitespace-pre-wrap" aria-live="polite">
              {(() => { const { builtGoal, builtContext } = buildInputs(); return `${builtGoal}\n\n${builtContext}`; })()}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:justify-between">
          <Button variant="outline" tabIndex={0} onClick={prev} disabled={step === 1} className="h-11 focus-visible:ring-2 ring-offset-2 ring-primary">Back</Button>
          {step < 4 ? (
            <Button onClick={next} tabIndex={0} className="h-11 focus-visible:ring-2 ring-offset-2 ring-primary">Next</Button>
          ) : (
            <Button onClick={onGenerate} tabIndex={0} disabled={loading || (!!stats && !stats.isPro && stats.remainingPrompts <= 0)} className="h-11 focus-visible:ring-2 ring-offset-2 ring-primary">
              {loading ? "Generating..." : "Generate Optimized Prompt"}
            </Button>
          )}
        </div>
      </Card>

      {showConfetti && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
          {/* lightweight confetti substitute (placeholder) */}
        </motion.div>
      )}

      {/* Output Panel with accessible region/label */}
      {optimizedPrompt && (
        <Card className="p-4 shadow-xl ring-1 ring-border" role="region" aria-label="Prompt output panel" id={outputPanelId}>
          <h2 className="text-base font-semibold tracking-tight">Your Optimized Prompt</h2>
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!user?.id || !optimizedPrompt) return;
                await saveTemplate({
                  userId: user.id,
                  name: `Generic Template - ${new Date().toLocaleString()}`,
                  description: "Saved from Generic Prompt output",
                  category: "generic",
                  template: optimizedPrompt,
                  variables: [],
                  isPublic: false,
                });
              }}
            >Save as Template</Button>
          </div>
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
  // Added templates based on provided phrases/examples
  {
    label: "Write my bio",
    goal: "Write a short personal bio for a profile or intro",
    context: "Constraints: Keep it casual, under 3 sentences, no buzzwords",
    format: "text",
    tone: "friendly",
  },
  {
    label: "Fix my resume",
    goal: "Improve and polish my existing resume text",
    context: "Constraints: Professional tone, concise bullet points, no fluff",
    format: "text",
    tone: "professional",
  },
  {
    label: "Summarize this article",
    goal: "Summarize the following article in plain English",
    context: "Constraints: Max 5 bullet points",
    format: "list",
    tone: "concise",
  },
  {
    label: "Make this sound professional",
    goal: "Rewrite this informal message to sound professional",
    context: "Constraints: Polite and formal, avoid robotic phrases",
    format: "text",
    tone: "professional",
  },
  {
    label: "Explain like I'm 5",
    goal: "Explain this concept like I’m 5 years old",
    context: "Constraints: Simple words, short sentences, include examples",
    format: "text",
    tone: "friendly",
  },
  {
    label: "Plan my day",
    goal: "Create a realistic time-blocked plan for my day based on tasks",
    context: "Constraints: Include breaks; keep schedule realistic",
    format: "steps",
    tone: "concise",
  },
  {
    label: "Make me a workout plan",
    goal: "Create a beginner-level 7-day workout plan for home or gym",
    context: "Constraints: 30 minutes/day, no equipment",
    format: "steps",
    tone: "friendly",
  },
  {
    label: "Help me study",
    goal: "Create a study guide or daily study schedule for a subject/exam",
    context: "Constraints: Include key topics and short summaries",
    format: "steps",
    tone: "friendly",
  },
  {
    label: "Text to my boss",
    goal: "Draft a polite text to my boss with an update or excuse",
    context: "Constraints: Polite, brief, no slang",
    format: "text",
    tone: "professional",
  },
  {
    label: "Make me a grocery list",
    goal: "Create a categorized grocery list for restocking or meal planning",
    context: "Constraints: Stay under budget; include basics",
    format: "list",
    tone: "concise",
  },
  {
    label: "Give me dinner ideas",
    goal: "Suggest easy dinner ideas I can make",
    context: "Constraints: 30 minutes or less; common ingredients",
    format: "list",
    tone: "friendly",
  },
  {
    label: "Translate this",
    goal: "Translate the following text",
    context: "Constraints: Keep meaning accurate; tone natural",
    format: "text",
    tone: "professional",
  },
  {
    label: "Note into email",
    goal: "Turn these notes into a clear, polite, short email",
    format: "text",
    tone: "professional",
  },
  {
    label: "Budget my money",
    goal: "Create a simple monthly budget summary based on income and expenses",
    context: "Constraints: Easy to track; show savings goal",
    format: "table",
    tone: "concise",
  },
  {
    label: "Draft a breakup text",
    goal: "Write a gentle breakup text message",
    context: "Constraints: Empathetic, short, avoid harsh tone",
    format: "text",
    tone: "friendly",
  },
  {
    label: "Caption for this pic",
    goal: "Write a short, catchy social caption for a photo",
    context: "Constraints: Max 10 words; casual tone",
    format: "text",
    tone: "casual",
  },
  {
    label: "YouTube title",
    goal: "Write an optimized YouTube video title",
    context: "Constraints: Under 60 characters; clicky but not clickbait",
    format: "text",
    tone: "creative",
  },
  {
    label: "Gift ideas",
    goal: "Suggest 3–5 gift ideas for a person",
    context: "Constraints: Include budget and interests",
    format: "list",
    tone: "friendly",
  },
  {
    label: "Explain this chart",
    goal: "Explain this chart or data table in plain English",
    context: "Constraints: Max 5 bullet points; verify data accuracy",
    format: "list",
    tone: "concise",
  },
  {
    label: "Morning affirmations",
    goal: "Write 5 short morning affirmations",
    context: "Constraints: Positive tone, short sentences",
    format: "list",
    tone: "friendly",
  },
];


