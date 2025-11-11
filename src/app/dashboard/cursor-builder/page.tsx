"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useRouter } from "next/navigation";
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
  "User Experience & Design",
  "Tech Stack - Frontend",
  "Tech Stack - Backend",
  "Security & Compliance",
  "Functionality & Logic",
  "Error-Fixing & Maintenance",
  "Performance & Scale",
  "Dev Preferences",
  "Additional Context",
  "Prompt Types",
] as const;

export default function CursorBuilderPage() {
  const { user } = useUser();
  const router = useRouter();
  const runGenerate = useAction(api.promptGenerators.generateCursorAppPrompts);
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);
  const createGeneration = useMutation(api.appBuilderGenerations.createGeneration);
  const generatePRD = useAction(api.appBuilderGenerations.generatePRD);
  const generateUserFlows = useAction(api.appBuilderGenerations.generateUserFlows);
  const generateTaskFile = useAction(api.appBuilderGenerations.generateTaskFile);
  const generateLists = useAction(api.appBuilderGenerations.generateLists);
  const generateItemPrompt = useAction(api.appBuilderGenerations.generateItemPrompt);
  const approveStep = useMutation(api.appBuilderGenerations.approveStep);
  const createChatSession = useMutation(api.chatMutations.createChatSession);
  const batchStoreEmbeddings = useAction(api.vectorSearch.batchStoreEmbeddings);
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

  // Sequential generation state
  const [generationId, setGenerationId] = React.useState<string | null>(null);
  const [generationStep, setGenerationStep] = React.useState<"form" | "prd" | "user_flows" | "tasks" | "lists" | "prompts" | "summary">("form");
  const [prdContent, setPrdContent] = React.useState<string | null>(null);
  const [userFlowsContent, setUserFlowsContent] = React.useState<string | null>(null);
  const [taskFileContent, setTaskFileContent] = React.useState<string | null>(null);
  const [generatedLists, setGeneratedLists] = React.useState<any>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = React.useState<{ type: string; index: number } | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = React.useState<any>({});

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

  // Overview - Additional fields
  const [isNewApp, setIsNewApp] = React.useState<"new" | "enhancement" | "prototype">("new");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [timeline, setTimeline] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [resourceConstraints, setResourceConstraints] = React.useState("");
  const [competitors, setCompetitors] = React.useState("");
  const [uploadedDocuments, setUploadedDocuments] = React.useState<File[]>([]);

  // Audience - Additional fields
  const [platforms, setPlatforms] = React.useState<string[]>([]);

  // Features - Additional fields
  const [featurePriorities, setFeaturePriorities] = React.useState<Record<string, "must-have" | "nice-to-have">>({});
  const [dataHandling, setDataHandling] = React.useState("");
  const [offlineSupport, setOfflineSupport] = React.useState(false);
  const [pushNotifications, setPushNotifications] = React.useState(false);
  const [backgroundProcesses, setBackgroundProcesses] = React.useState(false);
  const [errorHandling, setErrorHandling] = React.useState("");
  const [thirdPartyIntegrations, setThirdPartyIntegrations] = React.useState("");
  const [realTimeFeatures, setRealTimeFeatures] = React.useState(false);
  const [analyticsTracking, setAnalyticsTracking] = React.useState("");

  // User Experience & Design
  const [lookAndFeel, setLookAndFeel] = React.useState("");
  const [brandingGuidelines, setBrandingGuidelines] = React.useState("");
  const [uiuxPatterns, setUiuxPatterns] = React.useState<string[]>([]);
  const [navigationStructure, setNavigationStructure] = React.useState("");
  const [keyScreens, setKeyScreens] = React.useState<string[]>([]);
  const [multiLanguageSupport, setMultiLanguageSupport] = React.useState(false);
  const [themeCustomization, setThemeCustomization] = React.useState(false);
  const [accessibilityFeatures, setAccessibilityFeatures] = React.useState<string[]>([]);
  const [prebuiltComponents, setPrebuiltComponents] = React.useState("shadcn-ui");

  // Tech Stack - Frontend
  const [frontendFrameworks, setFrontendFrameworks] = React.useState<string[]>([]);
  const [buildTools, setBuildTools] = React.useState("");
  const [browserCompatibility, setBrowserCompatibility] = React.useState("");
  const [stateManagement, setStateManagement] = React.useState("");
  const [uiLibraries, setUiLibraries] = React.useState("");
  const [frontendOptimization, setFrontendOptimization] = React.useState<string[]>([]);
  const [apiStructure, setApiStructure] = React.useState("");
  const [frontendTesting, setFrontendTesting] = React.useState("");

  // Tech Stack - Backend
  const [backendFrameworks, setBackendFrameworks] = React.useState<string[]>([]);
  const [hostingPreferences, setHostingPreferences] = React.useState("");
  const [cachingNeeds, setCachingNeeds] = React.useState("");
  const [apiVersioning, setApiVersioning] = React.useState("");
  const [expectedTraffic, setExpectedTraffic] = React.useState("");
  const [dataFetching, setDataFetching] = React.useState("");
  const [loggingMonitoring, setLoggingMonitoring] = React.useState("");

  // Security & Compliance - Additional fields
  const [sensitiveData, setSensitiveData] = React.useState("");
  const [authenticationMethods, setAuthenticationMethods] = React.useState<string[]>([]);
  const [authorizationLevels, setAuthorizationLevels] = React.useState("");
  const [encryptionHashing, setEncryptionHashing] = React.useState("");
  const [vulnerabilityPrevention, setVulnerabilityPrevention] = React.useState<string[]>([]);
  const [securityAuditing, setSecurityAuditing] = React.useState(false);
  const [rateLimiting, setRateLimiting] = React.useState("");
  const [dataPrivacy, setDataPrivacy] = React.useState<string[]>([]);

  // Functionality & Logic
  const [coreBusinessLogic, setCoreBusinessLogic] = React.useState("");
  const [aiMlIntegrations, setAiMlIntegrations] = React.useState("");
  const [paymentsMonetization, setPaymentsMonetization] = React.useState("");
  const [customFunctionalities, setCustomFunctionalities] = React.useState("");
  const [externalSystems, setExternalSystems] = React.useState("");
  const [validationRules, setValidationRules] = React.useState("");
  const [backgroundJobs, setBackgroundJobs] = React.useState("");
  const [multiTenancy, setMultiTenancy] = React.useState(false);
  const [updateMigrations, setUpdateMigrations] = React.useState("");

  // Error-Fixing & Maintenance
  const [commonErrors, setCommonErrors] = React.useState("");
  const [errorLogTemplates, setErrorLogTemplates] = React.useState(false);
  const [debuggingStrategies, setDebuggingStrategies] = React.useState("");
  const [versioningUpdates, setVersioningUpdates] = React.useState("");
  const [maintenanceTasks, setMaintenanceTasks] = React.useState("");
  const [testingTypes, setTestingTypes] = React.useState<string[]>([]);
  const [cicdTools, setCicdTools] = React.useState("");
  const [rollbackPlans, setRollbackPlans] = React.useState("");
  const [userFeedbackLoops, setUserFeedbackLoops] = React.useState("");

  // Performance & Scale - Additional fields
  const [performanceBenchmarks, setPerformanceBenchmarks] = React.useState("");
  const [deviceNetworkOptimization, setDeviceNetworkOptimization] = React.useState("");
  const [scalabilityPlans, setScalabilityPlans] = React.useState("");
  const [cachingStrategies, setCachingStrategies] = React.useState("");
  const [seoConsiderations, setSeoConsiderations] = React.useState("");
  const [mobileOptimizations, setMobileOptimizations] = React.useState("");
  const [loadTesting, setLoadTesting] = React.useState(false);
  const [environmentalConsiderations, setEnvironmentalConsiderations] = React.useState("");
  const [successMetrics, setSuccessMetrics] = React.useState("");

  // Dev Preferences - Additional fields
  const [versionControl, setVersionControl] = React.useState("");
  const [deploymentDetails, setDeploymentDetails] = React.useState("");

  // Additional Context - Additional fields
  const [ethicalGuidelines, setEthicalGuidelines] = React.useState("");
  const [legalRequirements, setLegalRequirements] = React.useState("");
  const [sustainabilityGoals, setSustainabilityGoals] = React.useState("");
  const [futureExpansions, setFutureExpansions] = React.useState("");
  const [uniqueAspects, setUniqueAspects] = React.useState("");

  // Prompt Type Selection
  const [selectedPromptTypes, setSelectedPromptTypes] = React.useState({
    frontend: true,
    backend: true,
    security: true,
    functionality: true,
    errorFixing: true,
  });

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

  // Build form data object
  function buildFormData() {
    const techStack = [frontend, backend, database, ...tools.filter(Boolean), projectType].filter(Boolean);
    const featureList = features.map((f) => ({ name: f.name, description: f.description, priority: featurePriorities[f.id] || "must-have" }));
    
    return {
      projectName,
      projectDescription,
      projectType,
      oneSentence,
      isNewApp,
      githubUrl,
      timeline,
      budget,
      resourceConstraints,
      competitors,
      audienceSummary,
      platforms,
      problemStatement,
      primaryGoal,
      successCriteria,
      analyticsTracking,
      features: featureList,
      dataHandling,
      offlineSupport,
      pushNotifications,
      backgroundProcesses,
      errorHandling,
      thirdPartyIntegrations,
      realTimeFeatures,
      techStack,
      frontend,
      backend,
      database,
      tools,
      lookAndFeel,
      brandingGuidelines,
      uiuxPatterns,
      navigationStructure,
      keyScreens,
      multiLanguageSupport,
      themeCustomization,
      accessibilityFeatures,
      prebuiltComponents,
      frontendFrameworks,
      buildTools,
      browserCompatibility,
      stateManagement,
      uiLibraries,
      frontendOptimization,
      apiStructure,
      frontendTesting,
      backendFrameworks,
      hostingPreferences,
      cachingNeeds,
      apiVersioning,
      expectedTraffic,
      dataFetching,
      loggingMonitoring,
      mvpDate,
      launchDate,
      devBudget,
      infraBudget,
      teamSize,
      expectedUsers,
      perfRequirements,
      securityReqs,
      compliance,
      sensitiveData,
      authenticationMethods,
      authorizationLevels,
      encryptionHashing,
      vulnerabilityPrevention,
      securityAuditing,
      dataRetention,
      backupFrequency,
      rateLimiting,
      dataPrivacy,
      coreBusinessLogic,
      aiMlIntegrations,
      paymentsMonetization,
      customFunctionalities,
      externalSystems,
      validationRules,
      backgroundJobs,
      multiTenancy,
      updateMigrations,
      commonErrors,
      errorLogTemplates,
      debuggingStrategies,
      versioningUpdates,
      maintenanceTasks,
      testingTypes,
      cicdTools,
      rollbackPlans,
      userFeedbackLoops,
      performanceBenchmarks,
      deviceNetworkOptimization,
      scalabilityPlans,
      cachingStrategies,
      seoConsiderations,
      mobileOptimizations,
      loadTesting,
      environmentalConsiderations,
      successMetrics,
      codeStyle,
      testingApproach,
      docsLevel,
      versionControl,
      deploymentDetails,
      similarProjects,
      designInspiration,
      specialRequirements,
      ethicalGuidelines,
      legalRequirements,
      sustainabilityGoals,
      futureExpansions,
      uniqueAspects,
    };
  }

  async function submit() {
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

    // Validate at least one prompt type selected
    const selectedTypes = Object.entries(selectedPromptTypes)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key === "errorFixing" ? "error_fixing" : key) as any[];

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one prompt type to generate.");
      return;
    }

    setIsSubmitting(true);
    setProgress(5);
    
    try {
      toast.info("Starting generation...");
      const formData = buildFormData();
      const techStack = [frontend, backend, database, ...tools.filter(Boolean), projectType].filter(Boolean);
      const featureList = features.map((f) => f.name);
      
      trackEvent('cursor_builder_submitted', { tech_stack: techStack.join(', '), feature_count: featureList.length });

      // Create generation record
      setProgress(10);
      const genId = await createGeneration({
        userId: user.id,
        projectName: projectName || "Untitled Project",
        formData,
        selectedPromptTypes: selectedTypes,
      });
      setGenerationId(genId);

      // Generate PRD
      setProgress(20);
      toast.info("Generating PRD...");
      const { prd } = await generatePRD({
        generationId: genId as any,
        userId: user.id,
        formData,
      });
      setPrdContent(prd);
      setGenerationStep("prd");
      setProgress(30);
      toast.success("PRD generated! Please review and approve.");
      setIsSubmitting(false);
      
      // Save to autofill history
      recordSubmission("cursor-app", {
        projectType,
        frontend,
        backend,
        database,
        tools,
        featureCount: features.length,
      }, user.id);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate PRD");
      setIsSubmitting(false);
      setProgress(0);
    }
  }

  // Approve PRD and generate User Flows
  async function approvePRD() {
    if (!generationId || !prdContent || !user?.id) return;
    
    setIsSubmitting(true);
    setProgress(40);
    
    try {
      await approveStep({
        generationId: generationId as any,
        step: "prd",
      });

      toast.info("Generating User Flows...");
      const formData = buildFormData();
      const { userFlows } = await generateUserFlows({
        generationId: generationId as any,
        userId: user.id,
        formData,
        prd: prdContent,
      });
      
      setUserFlowsContent(userFlows);
      setGenerationStep("user_flows");
      setProgress(50);
      toast.success("User Flows generated! Please review and approve.");
      setIsSubmitting(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate User Flows");
      setIsSubmitting(false);
    }
  }

  // Approve User Flows and generate Tasks
  async function approveUserFlows() {
    if (!generationId || !userFlowsContent || !prdContent || !user?.id) return;
    
    setIsSubmitting(true);
    setProgress(60);
    
    try {
      await approveStep({
        generationId: generationId as any,
        step: "user_flows",
      });

      toast.info("Generating Task File...");
      const formData = buildFormData();
      const { taskFile } = await generateTaskFile({
        generationId: generationId as any,
        userId: user.id,
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
      });
      
      setTaskFileContent(taskFile);
      setGenerationStep("tasks");
      setProgress(70);
      toast.success("Task File generated! Please review and approve.");
      setIsSubmitting(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate Task File");
      setIsSubmitting(false);
    }
  }

  // Approve Tasks and generate lists
  async function approveTasks() {
    if (!generationId || !taskFileContent || !userFlowsContent || !prdContent || !user?.id) return;
    
    setIsSubmitting(true);
    setProgress(75);
    
    try {
      await approveStep({
        generationId: generationId as any,
        step: "tasks",
      });

      toast.info("Generating screen/feature lists...");
      const formData = buildFormData();
      const selectedTypes = Object.entries(selectedPromptTypes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key === "errorFixing" ? "error_fixing" : key) as any[];

      const lists = await generateLists({
        generationId: generationId as any,
        userId: user.id,
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
        selectedPromptTypes: selectedTypes,
      });
      
      setGeneratedLists(lists);
      setGenerationStep("prompts");
      setProgress(80);
      
      // Start generating prompts for first item
      await generateNextPrompt();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate lists");
      setIsSubmitting(false);
    }
  }

  // Generate next prompt in sequence
  async function generateNextPrompt() {
    if (!generationId || !taskFileContent || !userFlowsContent || !prdContent || !user?.id || !generatedLists) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = buildFormData();
      const selectedTypes = Object.entries(selectedPromptTypes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key === "errorFixing" ? "error_fixing" : key);

      // Determine which item to generate next
      let nextItem: { type: string; name: string; index: number } | null = null;
      
      // Check frontend screens
      if (selectedTypes.includes("frontend") && generatedLists.screenList) {
        const frontendPrompts = generatedPrompts.frontend || [];
        if (frontendPrompts.length < generatedLists.screenList.length) {
          nextItem = {
            type: "frontend",
            name: generatedLists.screenList[frontendPrompts.length],
            index: frontendPrompts.length,
          };
        }
      }
      
      // Check backend endpoints
      if (!nextItem && selectedTypes.includes("backend") && generatedLists.endpointList) {
        const backendPrompts = generatedPrompts.backend || [];
        if (backendPrompts.length < generatedLists.endpointList.length) {
          nextItem = {
            type: "backend",
            name: generatedLists.endpointList[backendPrompts.length],
            index: backendPrompts.length,
          };
        }
      }
      
      // Check security features
      if (!nextItem && selectedTypes.includes("security") && generatedLists.securityFeatureList) {
        const securityPrompts = generatedPrompts.security || [];
        if (securityPrompts.length < generatedLists.securityFeatureList.length) {
          nextItem = {
            type: "security",
            name: generatedLists.securityFeatureList[securityPrompts.length],
            index: securityPrompts.length,
          };
        }
      }
      
      // Check functionality features
      if (!nextItem && selectedTypes.includes("functionality") && generatedLists.functionalityFeatureList) {
        const functionalityPrompts = generatedPrompts.functionality || [];
        if (functionalityPrompts.length < generatedLists.functionalityFeatureList.length) {
          nextItem = {
            type: "functionality",
            name: generatedLists.functionalityFeatureList[functionalityPrompts.length],
            index: functionalityPrompts.length,
          };
        }
      }
      
      // Check error scenarios
      if (!nextItem && selectedTypes.includes("error_fixing") && generatedLists.errorScenarioList) {
        const errorPrompts = generatedPrompts.error_fixing || [];
        if (errorPrompts.length < generatedLists.errorScenarioList.length) {
          nextItem = {
            type: "error_fixing",
            name: generatedLists.errorScenarioList[errorPrompts.length],
            index: errorPrompts.length,
          };
        }
      }

      if (!nextItem) {
        // All prompts generated, show summary
        setGenerationStep("summary");
        setIsSubmitting(false);
        setShowConfetti(true);
        toast.success("All prompts generated!");
        return;
      }

      setCurrentPromptIndex(nextItem);
      toast.info(`Generating prompt for ${nextItem.name}...`);
      
      const { prompt } = await generateItemPrompt({
        generationId: generationId as any,
        userId: user.id,
        itemType: nextItem.type as any,
        itemName: nextItem.name,
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
        taskFile: taskFileContent,
      });

      // Update generated prompts state
      setGeneratedPrompts((prev: any) => ({
        ...prev,
        [nextItem!.type]: [
          ...(prev[nextItem!.type] || []),
          { title: nextItem!.name, prompt },
        ],
      }));

      setCurrentPromptIndex(null);
      setIsSubmitting(false);
      
      // Continue to next prompt
      setTimeout(() => generateNextPrompt(), 500);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate prompt");
      setIsSubmitting(false);
    }
  }

  // Continue to chat
  async function continueToChat() {
    if (!generationId || !user?.id) return;
    
    try {
      const formData = buildFormData();
      const context = {
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
        taskFile: taskFileContent,
        generatedPrompts,
        selectedPromptTypes: Object.entries(selectedPromptTypes)
          .filter(([_, selected]) => selected)
          .map(([key, _]) => key === "errorFixing" ? "error_fixing" : key),
      };

      // Create chat session
      const sessionId = await createChatSession({
        userId: user.id,
        generationId,
        projectName: projectName || "Untitled Project",
        context,
      });

      // Store embeddings for RAG
      const embeddingItems = [
        { content: JSON.stringify(formData), metadata: { type: "form_data" as const } },
        { content: prdContent || "", metadata: { type: "prd" as const } },
        { content: userFlowsContent || "", metadata: { type: "user_flow" as const } },
        { content: taskFileContent || "", metadata: { type: "task" as const } },
      ];

      // Add prompt embeddings
      Object.entries(generatedPrompts).forEach(([type, prompts]: [string, any]) => {
        if (Array.isArray(prompts)) {
          prompts.forEach((p: any, idx: number) => {
            const promptType = type === "frontend" ? "frontend_prompt" :
                             type === "backend" ? "backend_prompt" :
                             type === "security" ? "security_prompt" :
                             type === "functionality" ? "functionality_prompt" :
                             type === "error_fixing" ? "error_fixing_prompt" : "chat_message";
            embeddingItems.push({
              content: p.prompt,
              metadata: {
                type: promptType as any,
                section: p.title,
                promptId: `${type}_${idx}`,
              },
            });
          });
        }
      });

      await batchStoreEmbeddings({
        sessionId,
        userId: user.id,
        items: embeddingItems,
      });

      // Navigate to chat
      router.push(`/dashboard/appbuilder-chat/${sessionId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create chat session");
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

  // Show review screens during sequential generation
  if (generationStep !== "form") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* PRD Review */}
        {generationStep === "prd" && prdContent && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Product Requirements Document</h2>
              <p className="text-foreground/60">Please review the generated PRD</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-secondary/10 max-h-[60vh] overflow-y-auto mb-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">{prdContent}</pre>
            </div>
            <div className="flex gap-4">
              <Button onClick={approvePRD} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Generating User Flows..." : "Approve & Continue"}
              </Button>
              <Button variant="outline" onClick={() => setGenerationStep("form")}>
                Back to Form
              </Button>
            </div>
            {isSubmitting && (
              <div className="mt-4 h-2 w-full rounded bg-secondary/20">
                <div className="h-2 rounded bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </Card>
        )}

        {/* User Flows Review */}
        {generationStep === "user_flows" && userFlowsContent && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">User Flows</h2>
              <p className="text-foreground/60">Please review the generated User Flows</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-secondary/10 max-h-[60vh] overflow-y-auto mb-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">{userFlowsContent}</pre>
            </div>
            <div className="flex gap-4">
              <Button onClick={approveUserFlows} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Generating Tasks..." : "Approve & Continue"}
              </Button>
              <Button variant="outline" onClick={() => setGenerationStep("prd")}>
                Back to PRD
              </Button>
            </div>
            {isSubmitting && (
              <div className="mt-4 h-2 w-full rounded bg-secondary/20">
                <div className="h-2 rounded bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </Card>
        )}

        {/* Tasks Review */}
        {generationStep === "tasks" && taskFileContent && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Task File</h2>
              <p className="text-foreground/60">Please review the generated Task Breakdown</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-secondary/10 max-h-[60vh] overflow-y-auto mb-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">{taskFileContent}</pre>
            </div>
            <div className="flex gap-4">
              <Button onClick={approveTasks} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Generating Lists..." : "Approve & Continue"}
              </Button>
              <Button variant="outline" onClick={() => setGenerationStep("user_flows")}>
                Back to User Flows
              </Button>
            </div>
            {isSubmitting && (
              <div className="mt-4 h-2 w-full rounded bg-secondary/20">
                <div className="h-2 rounded bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </Card>
        )}

        {/* Prompt Generation Progress */}
        {generationStep === "prompts" && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Generating Prompts</h2>
              <p className="text-foreground/60">
                {currentPromptIndex 
                  ? `Generating prompt for: ${currentPromptIndex.name} (${currentPromptIndex.type})`
                  : "Preparing to generate prompts..."}
              </p>
            </div>
            {isSubmitting && (
              <div className="mt-4 h-2 w-full rounded bg-secondary/20">
                <div className="h-2 rounded bg-primary transition-[width] duration-300 animate-pulse" style={{ width: `${progress}%` }} />
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        {generationStep === "summary" && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Generation Complete!</h2>
              <p className="text-foreground/60">All prompts have been generated successfully</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-foreground/60">Frontend Prompts:</span>{" "}
                    <span className="font-medium">{generatedPrompts.frontend?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-foreground/60">Backend Prompts:</span>{" "}
                    <span className="font-medium">{generatedPrompts.backend?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-foreground/60">Security Prompts:</span>{" "}
                    <span className="font-medium">{generatedPrompts.security?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-foreground/60">Functionality Prompts:</span>{" "}
                    <span className="font-medium">{generatedPrompts.functionality?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-foreground/60">Error-Fixing Prompts:</span>{" "}
                    <span className="font-medium">{generatedPrompts.error_fixing?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Generated Prompts</h3>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {Object.entries(generatedPrompts).map(([type, prompts]: [string, any]) => (
                    <div key={type} className="border border-border rounded p-3">
                      <div className="font-medium text-sm mb-2 capitalize">{type.replace("_", " ")}</div>
                      {Array.isArray(prompts) && prompts.map((p: any, idx: number) => (
                        <div key={idx} className="text-xs text-foreground/70 mb-1">
                          {idx + 1}. {p.title}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={continueToChat} className="flex-1" size="lg">
                Continue to Chat
              </Button>
              <Button variant="outline" onClick={() => setGenerationStep("form")}>
                Start New Generation
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setCurrentStep(0)}>Quick Mode</Button>
        <Button size="sm" onClick={() => { window.location.href = "/dashboard/templates"; }}>Start from Template</Button>
        <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/chat-history")}>
          Chat History
        </Button>
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
                  <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Acme CRM" required />
                </div>
                <div>
                  <Label htmlFor="projectType">
                    <TooltipWrapper content="What kind of app are you building?" glossaryTerm="Project Type">Project Type</TooltipWrapper>
                  </Label>
                  <select id="projectType" title="Select Project Type" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" value={projectType} onChange={(e) => setProjectType(e.target.value)} required>
                    { ["web app","mobile app","API","desktop app","library","cli"].map((t) => <option key={t}>{t}</option>) }
                  </select>
                </div>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="One short sentence describing the core purpose of your app." glossaryTerm="One-liner">One-sentence description</TooltipWrapper>
                </Label>
                <Input className="mt-2" maxLength={100} value={oneSentence} onChange={(e) => setOneSentence(e.target.value)} placeholder="Describe the core purpose in one sentence" required />
              </div>
              <div>
                <Label>Overview / Main Purpose</Label>
                <Textarea className="mt-2" rows={4} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="What are you building? Who is it for? Key workflows?" required />
              </div>
              <div>
                <Label htmlFor="isNewApp">Is this a new app, enhancement, or prototype?</Label>
                <select id="isNewApp" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={isNewApp} onChange={(e) => setIsNewApp(e.target.value as any)} required>
                  <option value="new">New app from scratch</option>
                  <option value="enhancement">Enhancement to existing app</option>
                  <option value="prototype">Prototype</option>
                </select>
              </div>
              <div>
                <Label htmlFor="githubUrl">Existing GitHub Repository URL (optional)</Label>
                <Input id="githubUrl" className="mt-2" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" />
                <p className="text-xs text-foreground/60 mt-1">We'll analyze it for auto-population</p>
              </div>
              <div>
                <Label htmlFor="timeline">Desired Timeline</Label>
                <Input id="timeline" className="mt-2" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g., MVP in 2 weeks, full launch in 3 months" required />
              </div>
              <div>
                <Label htmlFor="budget">Budget or Resource Constraints</Label>
                <Input id="budget" className="mt-2" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., solo developer, small team, specific tools" required />
              </div>
              <div>
                <Label htmlFor="competitors">Similar Apps or Competitors</Label>
                <Textarea id="competitors" className="mt-2" rows={3} value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="List them and what you'd like to differentiate (e.g., 'Like Strava but with AI coaching')" required />
              </div>
              <div>
                <Label>Upload Documents, Design Inspirations, Wireframes, or Mockups</Label>
                <Input 
                  type="file" 
                  className="mt-2" 
                  multiple 
                  accept=".pdf,.png,.jpg,.jpeg,.fig,.sketch,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedDocuments(files);
                  }}
                />
                <p className="text-xs text-foreground/60 mt-1">Supports PDF, images, Figma links, wireframes, mockups</p>
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
              <div>
                <Label>Platforms to Support</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Web", "iOS", "Android", "Desktop", "Cross-platform"].map((platform) => {
                    const active = platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setPlatforms((arr) => (arr.includes(platform) ? arr.filter((x) => x !== platform) : [...arr, platform]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Problem & Goals</h2>
              <div>
                <Label>Problem statement</Label>
                <Textarea className="mt-2" rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="What problem does this solve?" required />
              </div>
              <div>
                <Label htmlFor="primaryGoal">Primary goal</Label>
                <select id="primaryGoal" title="Select Primary Goal" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} required>
                  <option value="">Select...</option>
                  {["Increase efficiency","Reduce costs","Improve user experience","Enable new capability","Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Success criteria</Label>
                <div className="mt-2 space-y-2">
                  {successCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input title="Enter Success Criteria" value={c} onChange={(e) => updateCriteria(i, e.target.value)} placeholder="Measurable outcome" required />
                      <Button variant="outline" size="sm" onClick={() => removeCriteria(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" variant="outline" size="sm" onClick={addCriteria}>Add Criteria</Button>
              </div>
              <div>
                <Label>Analytics & Tracking Requirements</Label>
                <Textarea className="mt-2" rows={3} value={analyticsTracking} onChange={(e) => setAnalyticsTracking(e.target.value)} placeholder="What metrics do you want to track? (e.g., user engagement, conversion rates, performance metrics)" required />
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
                      <Input value={f.name} onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, name: e.target.value } : x))} className="flex-1" aria-label={`Feature ${idx + 1} name`} required />
                      <select 
                        className="rounded-md border border-border bg-background p-2 text-sm"
                        value={featurePriorities[f.id] || "must-have"}
                        onChange={(e) => setFeaturePriorities((prev) => ({ ...prev, [f.id]: e.target.value as any }))}
                      >
                        <option value="must-have">Must Have</option>
                        <option value="nice-to-have">Nice to Have</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={() => removeFeature(f.id)}>Remove</Button>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <textarea className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={f.description} onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, description: e.target.value } : x))} aria-label={`Feature ${idx + 1} description`} required />
                    </div>
                  </li>
                ))}
                {!features.length && <li className="text-sm text-foreground/60">No features yet. Add at least one.</li>}
              </ul>
              <div>
                <Label>Data Handling & Storage</Label>
                <Textarea className="mt-2" rows={3} value={dataHandling} onChange={(e) => setDataHandling(e.target.value)} placeholder="How will data be stored, processed, and managed? (e.g., user data, files, media)" required />
              </div>
              <div className="space-y-2">
                <Label>Additional Feature Capabilities</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="offlineSupport" checked={offlineSupport} onChange={(e) => setOfflineSupport(e.target.checked)} />
                  <Label htmlFor="offlineSupport" className="font-normal">Offline Support</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pushNotifications" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
                  <Label htmlFor="pushNotifications" className="font-normal">Push Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="backgroundProcesses" checked={backgroundProcesses} onChange={(e) => setBackgroundProcesses(e.target.checked)} />
                  <Label htmlFor="backgroundProcesses" className="font-normal">Background Processes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="realTimeFeatures" checked={realTimeFeatures} onChange={(e) => setRealTimeFeatures(e.target.checked)} />
                  <Label htmlFor="realTimeFeatures" className="font-normal">Real-time Features</Label>
                </div>
              </div>
              <div>
                <Label>Error Handling Strategy</Label>
                <Textarea className="mt-2" rows={3} value={errorHandling} onChange={(e) => setErrorHandling(e.target.value)} placeholder="How should errors be handled and displayed to users?" required />
              </div>
              <div>
                <Label>Third-Party Integrations</Label>
                <Textarea className="mt-2" rows={3} value={thirdPartyIntegrations} onChange={(e) => setThirdPartyIntegrations(e.target.value)} placeholder="List any third-party services, APIs, or tools to integrate (e.g., Stripe, SendGrid, AWS)" required />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">User Experience & Design</h2>
              <div>
                <Label>Pre-built Component Library</Label>
                <select className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={prebuiltComponents} onChange={(e) => setPrebuiltComponents(e.target.value)} required>
                  <option value="shadcn-ui">shadcn-ui</option>
                  <option value="kero-ui">Kero UI</option>
                  <option value="tweak-cn">Tweak CN</option>
                  <option value="custom">Custom/Build from scratch</option>
                </select>
              </div>
              <div>
                <Label>Look & Feel / Design Style</Label>
                <Textarea className="mt-2" rows={3} value={lookAndFeel} onChange={(e) => setLookAndFeel(e.target.value)} placeholder="Describe the desired look and feel (e.g., modern, minimalist, colorful, professional)" required />
              </div>
              <div>
                <Label>Branding Guidelines</Label>
                <Textarea className="mt-2" rows={3} value={brandingGuidelines} onChange={(e) => setBrandingGuidelines(e.target.value)} placeholder="Brand colors, fonts, logo usage, tone of voice" required />
              </div>
              <div>
                <Label>UI/UX Patterns</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Material Design", "iOS Human Interface", "Custom", "Minimalist", "Card-based", "Dashboard-style"].map((pattern) => {
                    const active = uiuxPatterns.includes(pattern);
                    return (
                      <button
                        key={pattern}
                        type="button"
                        onClick={() => setUiuxPatterns((arr) => (arr.includes(pattern) ? arr.filter((x) => x !== pattern) : [...arr, pattern]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {pattern}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Navigation Structure</Label>
                <Textarea className="mt-2" rows={3} value={navigationStructure} onChange={(e) => setNavigationStructure(e.target.value)} placeholder="How should users navigate? (e.g., sidebar, top nav, tabs, bottom nav)" required />
              </div>
              <div>
                <Label>Key Screens / Pages</Label>
                <div className="mt-2 space-y-2">
                  {keyScreens.map((screen, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={screen} onChange={(e) => setKeyScreens((arr) => arr.map((s, idx) => idx === i ? e.target.value : s))} placeholder="Screen name (e.g., Home, Dashboard, Profile)" required />
                      <Button variant="outline" size="sm" onClick={() => setKeyScreens((arr) => arr.filter((_, idx) => idx !== i))}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" variant="outline" size="sm" onClick={() => setKeyScreens((arr) => [...arr, ""])}>Add Screen</Button>
              </div>
              <div className="space-y-2">
                <Label>Additional UX Features</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="multiLanguageSupport" checked={multiLanguageSupport} onChange={(e) => setMultiLanguageSupport(e.target.checked)} />
                  <Label htmlFor="multiLanguageSupport" className="font-normal">Multi-language Support</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="themeCustomization" checked={themeCustomization} onChange={(e) => setThemeCustomization(e.target.checked)} />
                  <Label htmlFor="themeCustomization" className="font-normal">Theme Customization (Dark/Light mode)</Label>
                </div>
              </div>
              <div>
                <Label>Accessibility Features</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Screen reader support", "Keyboard navigation", "High contrast", "ARIA labels", "Focus indicators"].map((feature) => {
                    const active = accessibilityFeatures.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => setAccessibilityFeatures((arr) => (arr.includes(feature) ? arr.filter((x) => x !== feature) : [...arr, feature]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {feature}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Tech Stack - Frontend</h2>
              <TechnicalDetailsBuilder
                value={techDetails}
                onChange={handleTechDetailsChange}
              />
              <div>
                <Label>Frontend Frameworks</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["React", "Vue", "Angular", "Next.js", "Svelte", "Remix"].map((fw) => {
                    const active = frontendFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => setFrontendFrameworks((arr) => (arr.includes(fw) ? arr.filter((x) => x !== fw) : [...arr, fw]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {fw}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Build Tools</Label>
                <Input className="mt-2" value={buildTools} onChange={(e) => setBuildTools(e.target.value)} placeholder="Vite, Webpack, Turbopack, etc." required />
              </div>
              <div>
                <Label>Browser Compatibility</Label>
                <Input className="mt-2" value={browserCompatibility} onChange={(e) => setBrowserCompatibility(e.target.value)} placeholder="e.g., Chrome 90+, Safari 14+, Firefox 88+" required />
              </div>
              <div>
                <Label>State Management</Label>
                <Input className="mt-2" value={stateManagement} onChange={(e) => setStateManagement(e.target.value)} placeholder="Redux, Zustand, Jotai, Context API, etc." required />
              </div>
              <div>
                <Label>UI Libraries</Label>
                <Input className="mt-2" value={uiLibraries} onChange={(e) => setUiLibraries(e.target.value)} placeholder="Tailwind CSS, Material-UI, Chakra UI, etc." required />
              </div>
              <div>
                <Label>Frontend Optimizations</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Code splitting", "Lazy loading", "Image optimization", "Bundle size optimization", "CDN usage"].map((opt) => {
                    const active = frontendOptimization.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFrontendOptimization((arr) => (arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>API Structure & Integration</Label>
                <Textarea className="mt-2" rows={3} value={apiStructure} onChange={(e) => setApiStructure(e.target.value)} placeholder="How will frontend interact with backend? (REST, GraphQL, tRPC, etc.)" required />
              </div>
              <div>
                <Label>Frontend Testing Strategy</Label>
                <Textarea className="mt-2" rows={3} value={frontendTesting} onChange={(e) => setFrontendTesting(e.target.value)} placeholder="Testing frameworks and approach (Jest, Vitest, Playwright, Cypress, etc.)" required />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Tech Stack - Backend</h2>
              <div>
                <Label>Backend Framework</Label>
                <Input className="mt-2" value={backend} onChange={(e) => setBackend(e.target.value)} placeholder="Node.js, Python, etc." required />
              </div>
              <div>
                <Label>Backend Frameworks</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Express", "FastAPI", "NestJS", "Django", "Flask", "Spring Boot", "Laravel"].map((fw) => {
                    const active = backendFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => setBackendFrameworks((arr) => (arr.includes(fw) ? arr.filter((x) => x !== fw) : [...arr, fw]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {fw}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Database</Label>
                <Input className="mt-2" value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="PostgreSQL, MongoDB, etc." required />
              </div>
              <div>
                <Label>Hosting Preferences</Label>
                <Input className="mt-2" value={hostingPreferences} onChange={(e) => setHostingPreferences(e.target.value)} placeholder="AWS, Vercel, Railway, Heroku, self-hosted, etc." required />
              </div>
              <div>
                <Label>Caching Needs</Label>
                <Textarea className="mt-2" rows={2} value={cachingNeeds} onChange={(e) => setCachingNeeds(e.target.value)} placeholder="Redis, Memcached, in-memory caching, etc." required />
              </div>
              <div>
                <Label>API Versioning Strategy</Label>
                <Input className="mt-2" value={apiVersioning} onChange={(e) => setApiVersioning(e.target.value)} placeholder="e.g., /v1/, /v2/, header-based, etc." required />
              </div>
              <div>
                <Label>Expected Traffic Volume</Label>
                <Input className="mt-2" value={expectedTraffic} onChange={(e) => setExpectedTraffic(e.target.value)} placeholder="e.g., 1000 requests/day, 10K requests/hour" required />
              </div>
              <div>
                <Label>Data Fetching Patterns</Label>
                <Textarea className="mt-2" rows={2} value={dataFetching} onChange={(e) => setDataFetching(e.target.value)} placeholder="REST, GraphQL, WebSockets, Server-Sent Events, etc." required />
              </div>
              <div>
                <Label>Logging & Monitoring</Label>
                <Textarea className="mt-2" rows={2} value={loggingMonitoring} onChange={(e) => setLoggingMonitoring(e.target.value)} placeholder="Tools and approach (e.g., Winston, Pino, Datadog, Sentry)" required />
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
                <Label>Sensitive Data Handling</Label>
                <Textarea className="mt-2" rows={3} value={sensitiveData} onChange={(e) => setSensitiveData(e.target.value)} placeholder="What sensitive data will be handled? (PII, payment info, health data, etc.)" required />
              </div>
              <div>
                <Label>Authentication Methods</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Email/Password", "OAuth (Google, GitHub)", "Magic Links", "Biometric", "SSO", "JWT", "Session-based"].map((method) => {
                    const active = authenticationMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setAuthenticationMethods((arr) => (arr.includes(method) ? arr.filter((x) => x !== method) : [...arr, method]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Authorization Levels</Label>
                <Textarea className="mt-2" rows={2} value={authorizationLevels} onChange={(e) => setAuthorizationLevels(e.target.value)} placeholder="User roles and permissions (e.g., Admin, User, Guest, Moderator)" required />
              </div>
              <div>
                <Label>Encryption & Hashing</Label>
                <Textarea className="mt-2" rows={2} value={encryptionHashing} onChange={(e) => setEncryptionHashing(e.target.value)} placeholder="Encryption algorithms, hashing methods (e.g., bcrypt, Argon2, AES-256)" required />
              </div>
              <div>
                <Label>Vulnerability Prevention</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["SQL Injection", "XSS", "CSRF", "Rate Limiting", "Input Validation", "Dependency Scanning"].map((vuln) => {
                    const active = vulnerabilityPrevention.includes(vuln);
                    return (
                      <button
                        key={vuln}
                        type="button"
                        onClick={() => setVulnerabilityPrevention((arr) => (arr.includes(vuln) ? arr.filter((x) => x !== vuln) : [...arr, vuln]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {vuln}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="securityAuditing" checked={securityAuditing} onChange={(e) => setSecurityAuditing(e.target.checked)} />
                <Label htmlFor="securityAuditing" className="font-normal">Regular Security Auditing Required</Label>
              </div>
              <div>
                <Label>Rate Limiting Strategy</Label>
                <Textarea className="mt-2" rows={2} value={rateLimiting} onChange={(e) => setRateLimiting(e.target.value)} placeholder="Rate limiting approach (e.g., 100 requests/minute per IP, token bucket)" required />
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
              <div>
                <Label>Data Privacy Requirements</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Right to deletion", "Data portability", "Consent management", "Privacy by design", "Data minimization"].map((req) => {
                    const active = dataPrivacy.includes(req);
                    return (
                      <button
                        key={req}
                        type="button"
                        onClick={() => setDataPrivacy((arr) => (arr.includes(req) ? arr.filter((x) => x !== req) : [...arr, req]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {req}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dataRetention">Data retention</Label>
                  <select id="dataRetention" title="Select Data Retention" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={dataRetention} onChange={(e) => setDataRetention(e.target.value)} required>
                    {["30 days","90 days","1 year","7 years","Indefinite"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup frequency</Label>
                  <select id="backupFrequency" title="Select Backup Frequency" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)} required>
                    {["Hourly","Daily","Weekly"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Functionality & Logic</h2>
              <div>
                <Label>Core Business Logic</Label>
                <Textarea className="mt-2" rows={4} value={coreBusinessLogic} onChange={(e) => setCoreBusinessLogic(e.target.value)} placeholder="Describe the core business logic and algorithms..." required />
              </div>
              <div>
                <Label>AI/ML Integrations</Label>
                <Textarea className="mt-2" rows={3} value={aiMlIntegrations} onChange={(e) => setAiMlIntegrations(e.target.value)} placeholder="Any AI/ML features? (e.g., recommendations, predictions, NLP, computer vision)" required />
              </div>
              <div>
                <Label>Payment/Monetization</Label>
                <Textarea className="mt-2" rows={3} value={paymentsMonetization} onChange={(e) => setPaymentsMonetization(e.target.value)} placeholder="Describe payment processing, subscriptions, pricing models, etc." required />
              </div>
              <div>
                <Label>Custom Functionalities</Label>
                <Textarea className="mt-2" rows={3} value={customFunctionalities} onChange={(e) => setCustomFunctionalities(e.target.value)} placeholder="Any unique or custom features specific to your app?" required />
              </div>
              <div>
                <Label>External Systems Integration</Label>
                <Textarea className="mt-2" rows={3} value={externalSystems} onChange={(e) => setExternalSystems(e.target.value)} placeholder="Integrations with external systems (CRM, ERP, email services, etc.)" required />
              </div>
              <div>
                <Label>Validation Rules</Label>
                <Textarea className="mt-2" rows={3} value={validationRules} onChange={(e) => setValidationRules(e.target.value)} placeholder="Input validation, business rule validation, data integrity checks" required />
              </div>
              <div>
                <Label>Background Jobs & Scheduled Tasks</Label>
                <Textarea className="mt-2" rows={2} value={backgroundJobs} onChange={(e) => setBackgroundJobs(e.target.value)} placeholder="Cron jobs, queue workers, scheduled tasks (e.g., email sending, data processing)" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="multiTenancy" checked={multiTenancy} onChange={(e) => setMultiTenancy(e.target.checked)} />
                <Label htmlFor="multiTenancy" className="font-normal">Multi-tenancy Support Required</Label>
              </div>
              <div>
                <Label>Updates & Migrations</Label>
                <Textarea className="mt-2" rows={2} value={updateMigrations} onChange={(e) => setUpdateMigrations(e.target.value)} placeholder="How should database migrations and updates be handled?" required />
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Error-Fixing & Maintenance</h2>
              <div>
                <Label>Anticipated Common Errors</Label>
                <Textarea className="mt-2" rows={4} value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} placeholder="List common errors you expect to encounter (e.g., network failures, validation errors, API timeouts)" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="errorLogTemplates" checked={errorLogTemplates} onChange={(e) => setErrorLogTemplates(e.target.checked)} />
                <Label htmlFor="errorLogTemplates" className="font-normal">Generate Error Log Templates</Label>
              </div>
              <div>
                <Label>Debugging Strategy</Label>
                <Textarea className="mt-2" rows={3} value={debuggingStrategies} onChange={(e) => setDebuggingStrategies(e.target.value)} placeholder="Describe your debugging approach (logging levels, error tracking tools, debugging workflows)" required />
              </div>
              <div>
                <Label>Versioning & Updates</Label>
                <Textarea className="mt-2" rows={2} value={versioningUpdates} onChange={(e) => setVersioningUpdates(e.target.value)} placeholder="How should versioning be handled? (Semantic versioning, feature flags, etc.)" required />
              </div>
              <div>
                <Label>Maintenance Tasks</Label>
                <Textarea className="mt-2" rows={3} value={maintenanceTasks} onChange={(e) => setMaintenanceTasks(e.target.value)} placeholder="Regular maintenance needs (database cleanup, cache invalidation, dependency updates)" required />
              </div>
              <div>
                <Label>Testing Types</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Unit tests", "Integration tests", "E2E tests", "Performance tests", "Security tests", "Load tests"].map((type) => {
                    const active = testingTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTestingTypes((arr) => (arr.includes(type) ? arr.filter((x) => x !== type) : [...arr, type]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>CI/CD Tools</Label>
                <Input className="mt-2" value={cicdTools} onChange={(e) => setCicdTools(e.target.value)} placeholder="GitHub Actions, GitLab CI, Jenkins, CircleCI, etc." required />
              </div>
              <div>
                <Label>Rollback Plans</Label>
                <Textarea className="mt-2" rows={2} value={rollbackPlans} onChange={(e) => setRollbackPlans(e.target.value)} placeholder="How should rollbacks be handled in case of deployment failures?" required />
              </div>
              <div>
                <Label>User Feedback Loops</Label>
                <Textarea className="mt-2" rows={2} value={userFeedbackLoops} onChange={(e) => setUserFeedbackLoops(e.target.value)} placeholder="How will you collect and act on user feedback for bug reports and improvements?" required />
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Performance & Scale</h2>
              <div>
                <Label htmlFor="expectedUsers">Expected users</Label>
                <select id="expectedUsers" title="Select Expected Users" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={expectedUsers} onChange={(e) => setExpectedUsers(e.target.value)} required>
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
              <div>
                <Label>Performance Benchmarks</Label>
                <Textarea className="mt-2" rows={2} value={performanceBenchmarks} onChange={(e) => setPerformanceBenchmarks(e.target.value)} placeholder="Specific performance targets (e.g., page load < 2s, API response < 500ms)" required />
              </div>
              <div>
                <Label>Device & Network Optimization</Label>
                <Textarea className="mt-2" rows={2} value={deviceNetworkOptimization} onChange={(e) => setDeviceNetworkOptimization(e.target.value)} placeholder="Optimizations for slow networks, low-end devices, mobile data constraints" required />
              </div>
              <div>
                <Label>Scalability Plans</Label>
                <Textarea className="mt-2" rows={3} value={scalabilityPlans} onChange={(e) => setScalabilityPlans(e.target.value)} placeholder="How should the system scale? (horizontal scaling, vertical scaling, auto-scaling)" required />
              </div>
              <div>
                <Label>Caching Strategies</Label>
                <Textarea className="mt-2" rows={2} value={cachingStrategies} onChange={(e) => setCachingStrategies(e.target.value)} placeholder="Caching approach (browser cache, CDN, server-side cache, database query cache)" required />
              </div>
              <div>
                <Label>SEO Considerations</Label>
                <Textarea className="mt-2" rows={2} value={seoConsiderations} onChange={(e) => setSeoConsiderations(e.target.value)} placeholder="SEO requirements (meta tags, structured data, sitemap, etc.)" required />
              </div>
              <div>
                <Label>Mobile Optimizations</Label>
                <Textarea className="mt-2" rows={2} value={mobileOptimizations} onChange={(e) => setMobileOptimizations(e.target.value)} placeholder="Mobile-specific optimizations (responsive design, touch interactions, mobile performance)" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="loadTesting" checked={loadTesting} onChange={(e) => setLoadTesting(e.target.checked)} />
                <Label htmlFor="loadTesting" className="font-normal">Load Testing Required</Label>
              </div>
              <div>
                <Label>Environmental Considerations</Label>
                <Textarea className="mt-2" rows={2} value={environmentalConsiderations} onChange={(e) => setEnvironmentalConsiderations(e.target.value)} placeholder="Energy efficiency, carbon footprint, green hosting considerations" required />
              </div>
              <div>
                <Label>Success Metrics</Label>
                <Textarea className="mt-2" rows={2} value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="How will you measure success? (KPIs, metrics, analytics)" required />
              </div>
            </div>
          )}

          {currentStep === 11 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Development Preferences</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="codeStyle">Code Style</Label>
                  <textarea id="codeStyle" title="Enter Code Style Preferences" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="testingApproach">Testing Approach</Label>
                  <textarea id="testingApproach" title="Enter Testing Approach" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={testingApproach} onChange={(e) => setTestingApproach(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="docsLevel">Documentation Level</Label>
                  <textarea id="docsLevel" title="Enter Documentation Level" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={docsLevel} onChange={(e) => setDocsLevel(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Version Control</Label>
                <Input className="mt-2" value={versionControl} onChange={(e) => setVersionControl(e.target.value)} placeholder="Git workflow, branching strategy, commit conventions" required />
              </div>
              <div>
                <Label>Deployment Details</Label>
                <Textarea className="mt-2" rows={2} value={deploymentDetails} onChange={(e) => setDeploymentDetails(e.target.value)} placeholder="Deployment process, environments (dev, staging, prod), deployment frequency" required />
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

          {currentStep === 12 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Additional Context</h2>
              <div>
                <Label>Similar projects</Label>
                <Textarea className="mt-2" rows={3} value={similarProjects} onChange={(e) => setSimilarProjects(e.target.value)} placeholder="Name apps similar to what you're building" required />
              </div>
              <div>
                <Label>Design inspiration (URLs)</Label>
                <Textarea className="mt-2" rows={3} value={designInspiration} onChange={(e) => setDesignInspiration(e.target.value)} placeholder="Links to inspiration" required />
              </div>
              <div>
                <Label>Special requirements</Label>
                <Textarea className="mt-2" rows={3} value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} placeholder="Anything not covered above" required />
              </div>
              <div>
                <Label>Ethical Guidelines</Label>
                <Textarea className="mt-2" rows={2} value={ethicalGuidelines} onChange={(e) => setEthicalGuidelines(e.target.value)} placeholder="Ethical considerations (fairness, bias prevention, user privacy, transparency)" required />
              </div>
              <div>
                <Label>Legal Requirements</Label>
                <Textarea className="mt-2" rows={2} value={legalRequirements} onChange={(e) => setLegalRequirements(e.target.value)} placeholder="Legal obligations (terms of service, privacy policy, data protection, licensing)" required />
              </div>
              <div>
                <Label>Sustainability Goals</Label>
                <Textarea className="mt-2" rows={2} value={sustainabilityGoals} onChange={(e) => setSustainabilityGoals(e.target.value)} placeholder="Sustainability and environmental goals for the project" required />
              </div>
              <div>
                <Label>Future Expansions</Label>
                <Textarea className="mt-2" rows={2} value={futureExpansions} onChange={(e) => setFutureExpansions(e.target.value)} placeholder="Planned future features or expansions" required />
              </div>
              <div>
                <Label>Unique Aspects</Label>
                <Textarea className="mt-2" rows={2} value={uniqueAspects} onChange={(e) => setUniqueAspects(e.target.value)} placeholder="What makes this project unique or different from competitors?" required />
              </div>
            </div>
          )}

          {currentStep === 13 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Select Prompt Types</h2>
              <p className="text-sm text-foreground/60">
                Choose which types of prompts you want to generate. At least one must be selected.
              </p>
              <div className="space-y-3">
                {[
                  { key: "frontend", label: "Frontend Prompts", description: "UI components, screens, and frontend implementation" },
                  { key: "backend", label: "Backend Prompts", description: "API endpoints, database, and server logic" },
                  { key: "security", label: "Security Prompts", description: "Authentication, authorization, and security features" },
                  { key: "functionality", label: "Functionality Prompts", description: "Business logic and core functionality" },
                  { key: "errorFixing", label: "Error-Fixing Prompts", description: "Common errors and debugging scenarios" },
                ].map((type) => (
                  <label
                    key={type.key}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPromptTypes[type.key as keyof typeof selectedPromptTypes]}
                      onChange={(e) =>
                        setSelectedPromptTypes({
                          ...selectedPromptTypes,
                          [type.key]: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-foreground/60">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {Object.values(selectedPromptTypes).every((v) => !v) && (
                <p className="text-sm text-red-600">
                  Please select at least one prompt type, or we'll only generate PRD, User Flows, and Tasks.
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="text-xs text-foreground/60">Review and generate your prompts.</div>
                <div className="flex items-center gap-3">
                  {stats && !stats.isPro && (
                    <span className={`text-sm ${stats.remainingPrompts <= 0 ? "text-red-600" : stats.remainingPrompts <= 5 ? "text-yellow-600" : "text-foreground/70"}`}>
                      {stats.remainingPrompts <= 0 ? "Limit reached" : `${stats.remainingPrompts} remaining today`}
                    </span>
                  )}
                  <Button 
                    onClick={submit} 
                    disabled={
                      isSubmitting || 
                      !user?.id || 
                      (!!stats && !stats.isPro && stats.remainingPrompts < 10)
                    } 
                    className="h-11"
                  >
                    Generate Prompts
                  </Button>
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
            <div className="mt-1 space-y-2 text-sm max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Overview */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Overview</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">Name:</span> {projectName || "—"}</li>
                  <li><span className="text-foreground/60">Type:</span> {projectType}</li>
                  <li><span className="text-foreground/60">App Type:</span> {isNewApp === "new" ? "New App" : isNewApp === "enhancement" ? "Enhancement" : "Prototype"}</li>
                  <li><span className="text-foreground/60">One-liner:</span> {oneSentence || "—"}</li>
                  {githubUrl && <li><span className="text-foreground/60">GitHub:</span> {githubUrl}</li>}
                  {timeline && <li><span className="text-foreground/60">Timeline:</span> {timeline}</li>}
                  {budget && <li><span className="text-foreground/60">Budget:</span> {budget}</li>}
                </ul>
              </div>

              {/* Audience */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Audience</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">Demographics:</span> {Object.values(audienceSummary).filter(Boolean).join(', ') || "—"}</li>
                  {platforms.length > 0 && <li><span className="text-foreground/60">Platforms:</span> {platforms.join(", ")}</li>}
                </ul>
              </div>

              {/* Goals */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Goals</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">Problem:</span> {problemStatement || "—"}</li>
                  <li><span className="text-foreground/60">Primary Goal:</span> {primaryGoal || "—"}</li>
                  {successCriteria.length > 0 && <li><span className="text-foreground/60">Success Criteria:</span> {successCriteria.filter(Boolean).join("; ")}</li>}
                  {analyticsTracking && <li><span className="text-foreground/60">Analytics:</span> {analyticsTracking.substring(0, 50)}{analyticsTracking.length > 50 ? "..." : ""}</li>}
                </ul>
              </div>

              {/* Features */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Features</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">List:</span> {features.map((f) => f.name).join(", ") || "—"}</li>
                  {dataHandling && <li><span className="text-foreground/60">Data Handling:</span> {dataHandling.substring(0, 50)}{dataHandling.length > 50 ? "..." : ""}</li>}
                  {(offlineSupport || pushNotifications || backgroundProcesses || realTimeFeatures) && (
                    <li><span className="text-foreground/60">Capabilities:</span> {[
                      offlineSupport && "Offline",
                      pushNotifications && "Push Notifications",
                      backgroundProcesses && "Background",
                      realTimeFeatures && "Real-time"
                    ].filter(Boolean).join(", ")}</li>
                  )}
                  {thirdPartyIntegrations && <li><span className="text-foreground/60">Integrations:</span> {thirdPartyIntegrations.substring(0, 50)}{thirdPartyIntegrations.length > 50 ? "..." : ""}</li>}
                </ul>
              </div>

              {/* Design */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Design</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">Components:</span> {prebuiltComponents}</li>
                  {lookAndFeel && <li><span className="text-foreground/60">Look & Feel:</span> {lookAndFeel.substring(0, 50)}{lookAndFeel.length > 50 ? "..." : ""}</li>}
                  {uiuxPatterns.length > 0 && <li><span className="text-foreground/60">UI/UX Patterns:</span> {uiuxPatterns.join(", ")}</li>}
                  {keyScreens.length > 0 && <li><span className="text-foreground/60">Key Screens:</span> {keyScreens.filter(Boolean).join(", ")}</li>}
                  {(multiLanguageSupport || themeCustomization) && (
                    <li><span className="text-foreground/60">UX Features:</span> {[
                      multiLanguageSupport && "Multi-language",
                      themeCustomization && "Theme Customization"
                    ].filter(Boolean).join(", ")}</li>
                  )}
                  {accessibilityFeatures.length > 0 && <li><span className="text-foreground/60">Accessibility:</span> {accessibilityFeatures.join(", ")}</li>}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="border-b border-border/50 pb-2">
                <div className="font-semibold text-xs text-foreground/80 mb-1">Tech Stack</div>
                <ul className="space-y-1">
                  <li><span className="text-foreground/60">Frontend:</span> {frontend}</li>
                  {frontendFrameworks.length > 0 && <li><span className="text-foreground/60">Frontend Frameworks:</span> {frontendFrameworks.join(", ")}</li>}
                  {buildTools && <li><span className="text-foreground/60">Build Tools:</span> {buildTools}</li>}
                  {stateManagement && <li><span className="text-foreground/60">State Management:</span> {stateManagement}</li>}
                  <li><span className="text-foreground/60">Backend:</span> {backend}</li>
                  {backendFrameworks.length > 0 && <li><span className="text-foreground/60">Backend Frameworks:</span> {backendFrameworks.join(", ")}</li>}
                  <li><span className="text-foreground/60">Database:</span> {database}</li>
                  {hostingPreferences && <li><span className="text-foreground/60">Hosting:</span> {hostingPreferences}</li>}
                  {tools.length > 0 && <li><span className="text-foreground/60">Tools:</span> {tools.join(", ")}</li>}
                </ul>
              </div>

              {/* Security */}
              {(securityReqs.length > 0 || compliance.length > 0 || authenticationMethods.length > 0) && (
                <div className="border-b border-border/50 pb-2">
                  <div className="font-semibold text-xs text-foreground/80 mb-1">Security</div>
                  <ul className="space-y-1">
                    {securityReqs.length > 0 && <li><span className="text-foreground/60">Requirements:</span> {securityReqs.join(", ")}</li>}
                    {authenticationMethods.length > 0 && <li><span className="text-foreground/60">Auth Methods:</span> {authenticationMethods.join(", ")}</li>}
                    {compliance.length > 0 && <li><span className="text-foreground/60">Compliance:</span> {compliance.join(", ")}</li>}
                  </ul>
                </div>
              )}

              {/* Functionality */}
              {(coreBusinessLogic || aiMlIntegrations || paymentsMonetization) && (
                <div className="border-b border-border/50 pb-2">
                  <div className="font-semibold text-xs text-foreground/80 mb-1">Functionality</div>
                  <ul className="space-y-1">
                    {coreBusinessLogic && <li><span className="text-foreground/60">Business Logic:</span> {coreBusinessLogic.substring(0, 50)}{coreBusinessLogic.length > 50 ? "..." : ""}</li>}
                    {aiMlIntegrations && <li><span className="text-foreground/60">AI/ML:</span> {aiMlIntegrations.substring(0, 50)}{aiMlIntegrations.length > 50 ? "..." : ""}</li>}
                    {paymentsMonetization && <li><span className="text-foreground/60">Payments:</span> {paymentsMonetization.substring(0, 50)}{paymentsMonetization.length > 50 ? "..." : ""}</li>}
                    {multiTenancy && <li><span className="text-foreground/60">Multi-tenancy:</span> Yes</li>}
                  </ul>
                </div>
              )}

              {/* Performance */}
              {(expectedUsers || perfRequirements.length > 0 || performanceBenchmarks) && (
                <div className="border-b border-border/50 pb-2">
                  <div className="font-semibold text-xs text-foreground/80 mb-1">Performance</div>
                  <ul className="space-y-1">
                    {expectedUsers && <li><span className="text-foreground/60">Expected Users:</span> {expectedUsers}</li>}
                    {perfRequirements.length > 0 && <li><span className="text-foreground/60">Requirements:</span> {perfRequirements.join(", ")}</li>}
                    {performanceBenchmarks && <li><span className="text-foreground/60">Benchmarks:</span> {performanceBenchmarks.substring(0, 50)}{performanceBenchmarks.length > 50 ? "..." : ""}</li>}
                    {loadTesting && <li><span className="text-foreground/60">Load Testing:</span> Yes</li>}
                  </ul>
                </div>
              )}

              {/* Error-Fixing */}
              {(commonErrors || testingTypes.length > 0 || cicdTools) && (
                <div className="border-b border-border/50 pb-2">
                  <div className="font-semibold text-xs text-foreground/80 mb-1">Error-Fixing & Testing</div>
                  <ul className="space-y-1">
                    {commonErrors && <li><span className="text-foreground/60">Common Errors:</span> {commonErrors.substring(0, 50)}{commonErrors.length > 50 ? "..." : ""}</li>}
                    {testingTypes.length > 0 && <li><span className="text-foreground/60">Testing Types:</span> {testingTypes.join(", ")}</li>}
                    {cicdTools && <li><span className="text-foreground/60">CI/CD:</span> {cicdTools}</li>}
                  </ul>
                </div>
              )}

              {/* Additional Context */}
              {(competitors || similarProjects || designInspiration) && (
                <div className="pb-2">
                  <div className="font-semibold text-xs text-foreground/80 mb-1">Additional Context</div>
                  <ul className="space-y-1">
                    {competitors && <li><span className="text-foreground/60">Competitors:</span> {competitors.substring(0, 50)}{competitors.length > 50 ? "..." : ""}</li>}
                    {similarProjects && <li><span className="text-foreground/60">Similar Projects:</span> {similarProjects.substring(0, 50)}{similarProjects.length > 50 ? "..." : ""}</li>}
                    {designInspiration && <li><span className="text-foreground/60">Design Inspiration:</span> {designInspiration.substring(0, 50)}{designInspiration.length > 50 ? "..." : ""}</li>}
                  </ul>
                </div>
              )}
            </div>
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



