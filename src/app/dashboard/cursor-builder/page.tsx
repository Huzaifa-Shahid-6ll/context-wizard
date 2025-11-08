"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import JSZip from "jszip";
import { initPostHog, trackEvent, trackPromptEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { TooltipWrapper } from "@/components/forms/TooltipWrapper";
import { recordSubmission } from "@/lib/autofill";
import { PromptPreview } from "@/components/forms/PromptPreview";
import { AudienceSelector } from "@/components/forms/AudienceSelector";
import { TechnicalDetailsBuilder } from "@/components/forms/TechnicalDetailsBuilder";
import { TemplateLibrary, type Template } from "@/components/templates/TemplateLibrary";

type GeneratedItem = { title: string; prompt: string; order: number };
type GenerationResult = {
  projectRequirements: string;
  frontendPrompts: GeneratedItem[];
  backendPrompts: GeneratedItem[];
  cursorRules: string;
  errorFixPrompts: { error: string; fix: string }[];
  estimatedComplexity?: string;
};

const steps = [
  "Overview",
  "Audience",
  "Problem & Goals",
  "Features",
  "Tech Stack",
  "Constraints",
  "Performance & Scale",
  "Security & Compliance",
  "Dev Preferences",
  "Additional Context",
] as const;

export default function CursorBuilderPage() {
  const { user } = useUser();
  const runGenerate = useAction(api.promptGenerators.generateCursorAppPrompts);
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | { remainingPrompts: number; isPro: boolean }
    | undefined;

  React.useEffect(() => {
    initPostHog();
    trackEvent('cursor_builder_opened');
  }, []);

  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<GenerationResult | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);

  // Form state
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [projectType, setProjectType] = React.useState("web app");
  const [oneSentence, setOneSentence] = React.useState("");

  // Audience
  const [audienceSummary, setAudienceSummary] = React.useState<{ ageRange: string; profession: string; expertiseLevel: string; industry: string; useCase: string; }>({ ageRange: '', profession: '', expertiseLevel: '', industry: '', useCase: '' });

  // Problem & Goals
  const [problemStatement, setProblemStatement] = React.useState("");
  const [primaryGoal, setPrimaryGoal] = React.useState("");
  const [successCriteria, setSuccessCriteria] = React.useState<string[]>([]);
  const addCriteria = () => setSuccessCriteria((arr) => [...arr, ""]);
  const updateCriteria = (i: number, v: string) => setSuccessCriteria((arr) => arr.map((c, idx) => idx === i ? v : c));
  const removeCriteria = (i: number) => setSuccessCriteria((arr) => arr.filter((_, idx) => idx !== i));

  // Tech
  const [frontend, setFrontend] = React.useState("React");
  const [backend, setBackend] = React.useState("Node.js");
  const [database, setDatabase] = React.useState("PostgreSQL");
  const [tools, setTools] = React.useState<string[]>([]);

  // Features
  const [features, setFeatures] = React.useState<Array<{ id: string; name: string; description: string }>>([]);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  // Constraints
  const [mvpDate, setMvpDate] = React.useState("");
  const [launchDate, setLaunchDate] = React.useState("");
  const [devBudget, setDevBudget] = React.useState("");
  const [infraBudget, setInfraBudget] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");

  // Performance & Scale
  const [expectedUsers, setExpectedUsers] = React.useState("");
  const [perfRequirements, setPerfRequirements] = React.useState<string[]>([]);

  // Security & Compliance
  const [securityReqs, setSecurityReqs] = React.useState<string[]>([]);
  const [compliance, setCompliance] = React.useState<string[]>([]);
  const [dataRetention, setDataRetention] = React.useState("");
  const [backupFrequency, setBackupFrequency] = React.useState("");

  // Dev Preferences (existing)
  const [codeStyle, setCodeStyle] = React.useState("Clean, readable, typed where applicable");
  const [testingApproach, setTestingApproach] = React.useState("Unit + integration with mocks");
  const [docsLevel, setDocsLevel] = React.useState("Pragmatic with examples");

  // Additional Context
  const [similarProjects, setSimilarProjects] = React.useState("");
  const [designInspiration, setDesignInspiration] = React.useState("");
  const [specialRequirements, setSpecialRequirements] = React.useState("");

  // Persist to localStorage
  React.useEffect(() => {
    try {
      const payload = {
        projectName, projectDescription, projectType, oneSentence,
        audienceSummary,
        problemStatement, primaryGoal, successCriteria,
        frontend, backend, database, tools,
        features,
        mvpDate, launchDate, devBudget, infraBudget, teamSize,
        expectedUsers, perfRequirements,
        securityReqs, compliance, dataRetention, backupFrequency,
        codeStyle, testingApproach, docsLevel,
        similarProjects, designInspiration, specialRequirements,
      };
      localStorage.setItem("cursorBuilder.v1", JSON.stringify(payload));
    } catch {}
  }, [projectName, projectDescription, projectType, oneSentence, audienceSummary, problemStatement, primaryGoal, successCriteria, frontend, backend, database, tools, features, mvpDate, launchDate, devBudget, infraBudget, teamSize, expectedUsers, perfRequirements, securityReqs, compliance, dataRetention, backupFrequency, codeStyle, testingApproach, docsLevel, similarProjects, designInspiration, specialRequirements]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("cursorBuilder.v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      setProjectName(data.projectName || "");
      setProjectDescription(data.projectDescription || "");
      setProjectType(data.projectType || "web app");
      setOneSentence(data.oneSentence || "");
      setAudienceSummary(data.audienceSummary || { ageRange: '', profession: '', expertiseLevel: '', industry: '', useCase: '' });
      setProblemStatement(data.problemStatement || "");
      setPrimaryGoal(data.primaryGoal || "");
      setSuccessCriteria(Array.isArray(data.successCriteria) ? data.successCriteria : []);
      setFrontend(data.frontend || "React");
      setBackend(data.backend || "Node.js");
      setDatabase(data.database || "PostgreSQL");
      setTools(Array.isArray(data.tools) ? data.tools : []);
      setFeatures(Array.isArray(data.features) ? data.features : []);
      setMvpDate(data.mvpDate || "");
      setLaunchDate(data.launchDate || "");
      setDevBudget(data.devBudget || "");
      setInfraBudget(data.infraBudget || "");
      setTeamSize(data.teamSize || "");
      setExpectedUsers(data.expectedUsers || "");
      setPerfRequirements(Array.isArray(data.perfRequirements) ? data.perfRequirements : []);
      setSecurityReqs(Array.isArray(data.securityReqs) ? data.securityReqs : []);
      setCompliance(Array.isArray(data.compliance) ? data.compliance : []);
      setDataRetention(data.dataRetention || "");
      setBackupFrequency(data.backupFrequency || "");
      setCodeStyle(data.codeStyle || codeStyle);
      setTestingApproach(data.testingApproach || testingApproach);
      setDocsLevel(data.docsLevel || docsLevel);
      setSimilarProjects(data.similarProjects || "");
      setDesignInspiration(data.designInspiration || "");
      setSpecialRequirements(data.specialRequirements || "");
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function next() {
    // basic validations on early steps
    if (currentStep === 0 && (!projectName.trim() || !oneSentence.trim())) {
      toast.error("Please provide a project name and one-sentence overview.");
      return;
    }
    if (currentStep === 2 && (!problemStatement.trim() || !primaryGoal.trim())) {
      toast.error("Please specify the core problem and a primary goal.");
      return;
    }
    setCurrentStep((s) => {
      const nextStep = Math.min(s + 1, steps.length - 1);
      trackEvent('cursor_builder_step_completed', { step_number: nextStep });
      return nextStep;
    });
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
      trackEvent('cursor_builder_submitted', { tech_stack: techStack.join(', '), feature_count: featureList.length });

      // Build rich projectDescription aligned to 6-part framework
      const lines: string[] = [];
      lines.push(`Name: ${projectName}`);
      lines.push(`Type: ${projectType}`);
      if (oneSentence) lines.push(`One-liner: ${oneSentence}`);
      if (projectDescription) lines.push(`Overview: ${projectDescription}`);
      if (audienceSummary) {
        const summaryString = Object.entries(audienceSummary)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (summaryString) {
          lines.push(`Audience: ${summaryString}`);
        }
      }
      if (problemStatement) lines.push(`Problem: ${problemStatement}`);
      if (primaryGoal) lines.push(`Primary Goal: ${primaryGoal}`);
      if (successCriteria.length) lines.push(`Success Criteria: ${successCriteria.filter(Boolean).join("; ")}`);
      if (featureList.length) lines.push(`Features: ${featureList.join(", ")}`);
      lines.push(`Tech Stack: ${techStack.join(", ")}`);
      if (mvpDate || launchDate) lines.push(`Timeline: MVP ${mvpDate || "TBD"}, Launch ${launchDate || "TBD"}`);
      if (devBudget || infraBudget) lines.push(`Budget: Dev ${devBudget || "-"}, Infra ${infraBudget || "-"}`);
      if (teamSize) lines.push(`Team: ${teamSize} people`);
      if (expectedUsers) lines.push(`Expected Users: ${expectedUsers}`);
      if (perfRequirements.length) lines.push(`Performance: ${perfRequirements.join(", ")}`);
      if (securityReqs.length) lines.push(`Security: ${securityReqs.join(", ")}`);
      if (compliance.length) lines.push(`Compliance: ${compliance.join(", ")}`);
      if (dataRetention || backupFrequency) lines.push(`Data: Retention ${dataRetention || "-"}, Backups ${backupFrequency || "-"}`);
      if (codeStyle) lines.push(`Code Style: ${codeStyle}`);
      if (testingApproach) lines.push(`Testing: ${testingApproach}`);
      if (docsLevel) lines.push(`Docs: ${docsLevel}`);
      if (similarProjects) lines.push(`Similar: ${similarProjects}`);
      if (designInspiration) lines.push(`Inspiration: ${designInspiration}`);
      if (specialRequirements) lines.push(`Special: ${specialRequirements}`);

      setProgress(35);
      const generated = await runGenerate({
        projectDescription: lines.join("\n"),
        techStack,
        features: featureList,
        targetAudience: audienceSummary ? Object.values(audienceSummary).filter(Boolean).join(', ') : undefined,
        userId: user.id,
      });
      setProgress(80);
      setResult(generated as unknown as GenerationResult);
      setProgress(100);
      setShowConfetti(true);
      toast.success("Prompt set generated!");
      const generatedTechStack = [frontend, backend, database, ...tools.filter(Boolean), projectType].filter(Boolean);
      const promptCount = (generated.frontendPrompts?.length || 0) + (generated.backendPrompts?.length || 0) + (generated.errorFixPrompts?.length || 0) + (generated.cursorRules ? 1 : 0);
      trackEvent('cursor_prompts_generated', { prompt_count: promptCount, tech_stack: generatedTechStack.join(', ') });
      // Save to autofill history
      recordSubmission("cursor-app", {
        projectType,
        frontend,
        backend,
        database,
        tools,
        featureCount: features.length,
      }, user.id);
    } catch (e) {
      console.error(e);
      setProgress(100);
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }

  const wizardRegionId = "cursorbuilder-wizard-region";
  const previewPanelId = "cursorbuilder-preview-panel";
  const outputPanelId = "cursorbuilder-output-panel";

  // Define type for tech details
  type TechDetails = {
    category: string;
    details: Record<string, unknown> & {
      frontend: string;
      backend: string;
      database: string;
      tools: string[];
    };
  };

  // [Define new state for best compatibility]
  const [techDetails, setTechDetails] = React.useState<TechDetails>(() => ({
    category: 'code',
    details: {
      frontend: frontend || '',
      backend: backend || '',
      database: database || '',
      tools: tools || [],
    },
  }));

  // Wrapper function to properly handle the onChange type for TechnicalDetailsBuilder
  const handleTechDetailsChange = React.useCallback((value: { category: string; details: Record<string, unknown> }) => {
    setTechDetails(prev => ({
      ...prev,
      ...value,
      details: {
        ...prev.details,
        ...value.details
      }
    }));
  }, []);

  // Keep individual fields in sync with techDetails (only in one direction)
  React.useEffect(() => {
    const details = techDetails.details;
    setFrontend(details.frontend || '');
    setBackend(details.backend || '');
    setDatabase(details.database || '');
    setTools(Array.isArray(details.tools) ? details.tools as string[] : []);
  }, [techDetails]);

  const templates = [
    {
      id: 'crm-app',
      name: 'CRM App',
      description: 'Customer Relationship Management system for sales teams.',
      fields: {
        projectName: 'Acme CRM',
        projectType: 'web app',
        oneSentence: 'Manage contacts, leads, and deals.',
        audienceSummary: { ageRange: '26-35', profession: 'Manager', expertiseLevel: 'intermediate', industry: 'Technology', useCase: 'Team collaboration' },
        problemStatement: 'Sales teams need a better way to track leads.',
        primaryGoal: 'Increase efficiency',
        features: [
          { id: 'f1', name: 'Contact Management', description: 'Store and filter contacts' },
          { id: 'f2', name: 'Deal Tracking', description: 'Visualize deal pipeline' }
        ],
        frontend: 'React',
        backend: 'Node.js',
        database: 'PostgreSQL',
        tools: ['Auth', 'Analytics'],
      },
    },
    // Add more static templates here
  ];

  function applyTemplate(template: Template) {
    try { trackEvent('generic_prompt_template_selected', { template_name: template.name }); } catch {}
    // Set state for all known fields from the template.fields
    setProjectName(String(template.fields.projectName || ''));
    setProjectType(String(template.fields.projectType || 'web app'));
    setOneSentence(String(template.fields.oneSentence || ''));
    setAudienceSummary(template.fields.audienceSummary as { ageRange: string; profession: string; expertiseLevel: string; industry: string; useCase: string; } || { ageRange: "", profession: "", expertiseLevel: "", industry: "", useCase: "" });
    setProblemStatement(String(template.fields.problemStatement || ''));
    setPrimaryGoal(String(template.fields.primaryGoal || ''));
    type FeatureItem = { id: string; name: string; description: string };
    setFeatures(Array.isArray(template.fields.features) ? (template.fields.features as FeatureItem[]) : []);
    setFrontend(String(template.fields.frontend || 'React'));
    setBackend(String(template.fields.backend || 'Node.js'));
    setDatabase(String(template.fields.database || 'PostgreSQL'));
    setTools(Array.isArray(template.fields.tools) ? template.fields.tools as string[] : []);
    // Set more as needed...
  }

  // [Track if restore happened for helper message]
  const [showRestoreHelper, setShowRestoreHelper] = React.useState(false);

  React.useEffect(() => {
    let didRestore = false;
    try {
      const raw = localStorage.getItem("cursorBuilder.v1");
      if (raw) {
        // Only show notification on initial restore, not every field update
        didRestore = true;
      }
    } catch {}
    if (didRestore) {
      setShowRestoreHelper(true);
      setTimeout(() => setShowRestoreHelper(false), 4200);
    }
  }, []);

  // Add keyboard shortcut for power users: Ctrl+Alt+R
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        try {
          const raw = localStorage.getItem("cursorBuilder.v1");
          if (raw) {
            const data = JSON.parse(raw);
            setProjectName(data.projectName || "");
            setProjectDescription(data.projectDescription || "");
            setProjectType(data.projectType || "web app");
            setAudienceSummary(data.audienceSummary || { ageRange: '', profession: '', expertiseLevel: '', industry: '', useCase: '' });
            setProblemStatement(data.problemStatement || "");
            setPrimaryGoal(data.primaryGoal || "");
            setSuccessCriteria(Array.isArray(data.successCriteria) ? data.successCriteria : []);
            setFrontend(data.frontend || "React");
            setBackend(data.backend || "Node.js");
            setDatabase(data.database || "PostgreSQL");
            setTools(Array.isArray(data.tools) ? data.tools : []);
            setFeatures(Array.isArray(data.features) ? data.features : []);
            setMvpDate(data.mvpDate || "");
            setLaunchDate(data.launchDate || "");
            setDevBudget(data.devBudget || "");
            setInfraBudget(data.infraBudget || "");
            setTeamSize(data.teamSize || "");
            setExpectedUsers(data.expectedUsers || "");
            setPerfRequirements(Array.isArray(data.perfRequirements) ? data.perfRequirements : []);
            setSecurityReqs(Array.isArray(data.securityReqs) ? data.securityReqs : []);
            setCompliance(Array.isArray(data.compliance) ? data.compliance : []);
            setDataRetention(data.dataRetention || "");
            setBackupFrequency(data.backupFrequency || "");
            setCodeStyle(data.codeStyle || "");
            setTestingApproach(data.testingApproach || "");
            setDocsLevel(data.docsLevel || "");
            setSimilarProjects(data.similarProjects || "");
            setDesignInspiration(data.designInspiration || "");
            setSpecialRequirements(data.specialRequirements || "");
          }
        } catch {}
        toast.info('Progress manually restored from autosave.');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setCurrentStep(0)}>Quick Mode</Button>
        <Button size="sm" onClick={() => { window.location.href = "/dashboard/templates"; }}>Start from Template</Button>
      </div>
      {showRestoreHelper && (
        <div className="mb-3 p-2 rounded-md bg-blue-50 text-blue-800 border border-blue-200 animate-fade-in">
          Progress restored from prior session. (Tip: Press Ctrl+Alt+R to manually restore anytime)
        </div>
      )}
      {/* Template Library */}
      <TemplateLibrary templates={templates} onApply={applyTemplate} />
      {/* Progress indicator */}
      <Card className="p-4 shadow-sm" role="region" aria-label="Cursor Builder stepper">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Sidebar Navigation (lg+) */}
        <nav role="navigation" aria-label="Wizard steps" className="hidden lg:block col-span-1 pt-2">
          <ul className="space-y-1" role="list">
            {steps.map((step, idx) => (
              <li key={step} role="listitem">
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2 ring-offset-background
                    ${currentStep === idx ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-foreground/80 hover:bg-secondary/60'}
                  `}
                  onClick={() => setCurrentStep(idx)}
                  aria-current={currentStep === idx ? 'step' : undefined}
                  aria-label={`Go to step ${idx + 1}: ${step}`}
                  tabIndex={0}
                  onKeyDown={e => {
                    if ((e.key === 'ArrowUp' || e.key === 'Up') && idx > 0) { setCurrentStep(idx - 1); }
                    if ((e.key === 'ArrowDown' || e.key === 'Down') && idx < steps.length - 1) { setCurrentStep(idx + 1); }
                  }}
                >
                  <span className={`w-4 h-4 rounded-full mt-0.5 ${currentStep === idx ? 'bg-white' : 'border border-border bg-transparent'} flex-shrink-0 inline-block`}>
                    {currentStep === idx ? <span className="block w-4 h-4 bg-primary rounded-full" /> : idx < currentStep ? <span className="block w-4 h-4 bg-green-400 rounded-full" /> : null}
                  </span>
                  <span>{step}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Left: Form steps */}
        <Card className="lg:col-span-2 p-4 shadow-lg" role="region" aria-label="Cursor Builder input steps" id={wizardRegionId}>
          {/* Step blocks */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Project Overview</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="projectName">
                    <TooltipWrapper content="What is your project called? This will be used in documentation and prompts." glossaryTerm="Project Name">Project Name</TooltipWrapper>
                  </Label>
                  <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Acme CRM" />
                </div>
                <div>
                  <Label htmlFor="projectType">
                    <TooltipWrapper content="What kind of app are you building?" glossaryTerm="Project Type">Project Type</TooltipWrapper>
                  </Label>
                  <select id="projectType" title="Select Project Type" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                    { ["web app","mobile app","API","desktop app","library","cli"].map((t) => <option key={t}>{t}</option>) }
                  </select>
                </div>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="One short sentence describing the core purpose of your app." glossaryTerm="One-liner">One-sentence description</TooltipWrapper>
                </Label>
                <Input className="mt-2" maxLength={100} value={oneSentence} onChange={(e) => setOneSentence(e.target.value)} placeholder="Describe the core purpose in one sentence" />
              </div>
              <div>
                <Label>Overview</Label>
                <Textarea className="mt-2" rows={4} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="What are you building? Who is it for? Key workflows?" />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Target Audience</h2>
              <AudienceSelector
                value={typeof audienceSummary === "object" && audienceSummary !== null ? audienceSummary : {
                  ageRange: "",
                  profession: "",
                  expertiseLevel: "",
                  industry: "",
                  useCase: ""
                }}
                onChange={(v) => setAudienceSummary(v)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Problem & Goals</h2>
              <div>
                <Label>Problem statement</Label>
                <Textarea className="mt-2" rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="What problem does this solve?" />
              </div>
              <div>
                <Label htmlFor="primaryGoal">Primary goal</Label>
                <select id="primaryGoal" title="Select Primary Goal" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)}>
                  <option value="">Select...</option>
                  {["Increase efficiency","Reduce costs","Improve user experience","Enable new capability","Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Success criteria</Label>
                <div className="mt-2 space-y-2">
                  {successCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input title="Enter Success Criteria" value={c} onChange={(e) => updateCriteria(i, e.target.value)} placeholder="Measurable outcome" />
                      <Button variant="outline" size="sm" onClick={() => removeCriteria(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" variant="outline" size="sm" onClick={addCriteria}>Add Criteria</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Key Features</h2>
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
                      <Input value={f.name} onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, name: e.target.value } : x))} className="flex-1" aria-label={`Feature ${idx + 1} name`} />
                      <Button variant="outline" size="sm" onClick={() => removeFeature(f.id)}>Remove</Button>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={f.description} onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, description: e.target.value } : x))} aria-label={`Feature ${idx + 1} description`} />
                    </div>
                  </li>
                ))}
                {!features.length && <li className="text-sm text-foreground/60">No features yet. Add at least one.</li>}
              </ul>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Tech Stack</h2>
              <TechnicalDetailsBuilder
                value={techDetails}
                onChange={handleTechDetailsChange}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Constraints & Requirements</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label>MVP Date</Label>
                  <Input type="date" className="mt-2" value={mvpDate} onChange={(e) => setMvpDate(e.target.value)} />
                </div>
                <div>
                  <Label>Launch Date</Label>
                  <Input type="date" className="mt-2" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input id="teamSize" title="Enter Team Size" className="mt-2" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="e.g., 3" />
                </div>
                <div>
                  <Label>Development Budget</Label>
                  <Input className="mt-2" value={devBudget} onChange={(e) => setDevBudget(e.target.value)} placeholder="$10k" />
                </div>
                <div>
                  <Label>Infrastructure Budget (monthly)</Label>
                  <Input className="mt-2" value={infraBudget} onChange={(e) => setInfraBudget(e.target.value)} placeholder="$200" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Performance & Scale</h2>
              <div>
                                <Label htmlFor="expectedUsers">Expected users</Label>
                                <select id="expectedUsers" title="Select Expected Users" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={expectedUsers} onChange={(e) => setExpectedUsers(e.target.value)}>
                                  {["< 100","100-1K","1K-10K","10K-100K","100K-1M","1M+"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Performance requirements</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Real-time updates","Offline support","Low latency (<200ms)","High availability (99.9%+)"]
                    .map((t) => {
                      const active = perfRequirements.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setPerfRequirements((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Security & Compliance</h2>
              <div>
                <Label>Security requirements</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Auth required","RBAC","Encrypt at rest","Encrypt in transit","2FA"]
                    .map((t) => {
                      const active = securityReqs.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setSecurityReqs((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
              </div>
              <div>
                <Label>Compliance</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["GDPR","HIPAA","SOC 2","PCI DSS","CCPA"]
                    .map((t) => {
                      const active = compliance.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setCompliance((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dataRetention">Data retention</Label>
                  <select id="dataRetention" title="Select Data Retention" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={dataRetention} onChange={(e) => setDataRetention(e.target.value)}>
                    {["30 days","90 days","1 year","7 years","Indefinite"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup frequency</Label>
                  <select id="backupFrequency" title="Select Backup Frequency" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                    {["Hourly","Daily","Weekly"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Development Preferences</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="codeStyle">Code Style</Label>
                  <textarea id="codeStyle" title="Enter Code Style Preferences" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="testingApproach">Testing Approach</Label>
                  <textarea id="testingApproach" title="Enter Testing Approach" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={testingApproach} onChange={(e) => setTestingApproach(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="docsLevel">Documentation Level</Label>
                  <textarea id="docsLevel" title="Enter Documentation Level" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={docsLevel} onChange={(e) => setDocsLevel(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-foreground/60">These preferences inform tone and completeness.</div>
                <div className="flex items-center gap-3">
                  {stats && !stats.isPro && (
                    <span className={`text-sm ${stats.remainingPrompts <= 0 ? "text-red-600" : stats.remainingPrompts <= 5 ? "text-yellow-600" : "text-foreground/70"}`}>
                      {stats.remainingPrompts <= 0 ? "Limit reached" : `${stats.remainingPrompts} remaining today`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Additional Context</h2>
              <div>
                <Label>Similar projects</Label>
                <Textarea className="mt-2" rows={3} value={similarProjects} onChange={(e) => setSimilarProjects(e.target.value)} placeholder="Name apps similar to what you're building" />
              </div>
              <div>
                <Label>Design inspiration (URLs)</Label>
                <Textarea className="mt-2" rows={3} value={designInspiration} onChange={(e) => setDesignInspiration(e.target.value)} placeholder="Links to inspiration" />
              </div>
              <div>
                <Label>Special requirements</Label>
                <Textarea className="mt-2" rows={3} value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} placeholder="Anything not covered above" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-foreground/60">Review and generate your prompts.</div>
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

          <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:justify-between">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0} className="h-11">Back</Button>
            <Button onClick={next} disabled={currentStep === steps.length - 1} className="h-11">Next</Button>
          </div>
        </Card>

        {/* Right: Preview (shared) */}
        <Card className="p-4 shadow-lg" role="region" aria-label="Project configuration preview" id={previewPanelId} aria-live="polite">
          <PromptPreview title="Preview">
            <ul className="mt-1 space-y-1 text-sm">
              <li><span className="text-foreground/60">Name:</span> {projectName || "—"}</li>
              <li><span className="text-foreground/60">Type:</span> {projectType}</li>
              <li><span className="text-foreground/60">One-liner:</span> {oneSentence || "—"}</li>
              <li><span className="text-foreground/60">Audience:</span> {Object.values(audienceSummary).filter(Boolean).join(', ') || "—"}</li>
              <li><span className="text-foreground/60">Frontend:</span> {frontend}</li>
              <li><span className="text-foreground/60">Backend:</span> {backend}</li>
              <li><span className="text-foreground/60">Database:</span> {database}</li>
              <li><span className="text-foreground/60">Tools:</span> {tools.join(", ") || "—"}</li>
              <li><span className="text-foreground/60">Features:</span> {features.map((f) => f.name).join(", ") || "—"}</li>
            </ul>
          </PromptPreview>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card className="p-4 shadow-lg" role="region" aria-label="Prompt output panel" id={outputPanelId} aria-live="polite">
          <div className="mb-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!user?.id || !result) return;
                const combined = [
                  `Project Requirements\n\n${result.projectRequirements}`,
                  `Frontend Prompts\n\n${result.frontendPrompts.map(i => `# ${i.title}\n${i.prompt}`).join("\n\n")}`,
                  `Backend Prompts\n\n${result.backendPrompts.map(i => `# ${i.title}\n${i.prompt}`).join("\n\n")}`,
                  `.cursorrules\n\n${result.cursorRules}`,
                ].join("\n\n");
                await saveTemplate({
                  userId: user.id,
                  name: `Cursor Template - ${new Date().toLocaleString()}`,
                  description: "Saved from Cursor Builder output",
                  category: "cursor-app",
                  template: combined,
                  variables: [],
                  isPublic: false,
                });
                trackEvent('prompt_saved_to_history');
              }}
            >Save as Template</Button>
          </div>
          <Tabs defaultValue="requirements">
            <TabsList>
              <TabsTrigger value="requirements">Project Requirements</TabsTrigger>
              <TabsTrigger value="frontend">Frontend Prompts</TabsTrigger>
              <TabsTrigger value="backend">Backend Prompts</TabsTrigger>
              <TabsTrigger value="rules">.cursorrules</TabsTrigger>
              <TabsTrigger value="errors">Error Fix Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-3">
              <ResultToolbar filename="PROJECT_REQUIREMENTS.md" content={result.projectRequirements} promptType="project_requirements" />
              <PreBlock>{result.projectRequirements}</PreBlock>
            </TabsContent>

            <TabsContent value="frontend" className="space-y-3">
              {result.frontendPrompts.map((item) => (
                <div key={item.title} className="rounded-md border border-border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">{item.title}</div>
                    <ResultToolbar filename={`${item.title}.md`} content={item.prompt} compact promptType="frontend_prompt" />
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
                    <ResultToolbar filename={`${item.title}.md`} content={item.prompt} compact promptType="backend_prompt" />
                  </div>
                  <PreBlock className="border-t border-border">{item.prompt}</PreBlock>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="rules" className="space-y-3">
              <ResultToolbar filename=".cursorrules" content={result.cursorRules} promptType="cursor_rules" />
              <PreBlock>{result.cursorRules}</PreBlock>
            </TabsContent>

            <TabsContent value="errors" className="space-y-3">
              {result.errorFixPrompts.map((ef) => (
                <div key={ef.error} className="rounded-md border border-border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">{ef.error}</div>
                    <ResultToolbar filename={`${ef.error}.md`} content={ef.fix} compact promptType="error_fix_prompt" />
                  </div>
                  <PreBlock className="border-t border-border">{ef.fix}</PreBlock>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Export ZIP */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={async () => {
              trackEvent('cursor_prompts_downloaded');
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />
      )}
    </div>
  );
}

function ResultToolbar({ content, filename, compact, promptType }: { content: string; filename: string; compact?: boolean; promptType: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      trackPromptEvent('prompt_copied_to_clipboard', { prompt_type: promptType, prompt_name: filename });
    } catch {
      // ignore
    }
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



