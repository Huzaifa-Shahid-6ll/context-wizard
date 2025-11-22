"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import type { GenerationId, GenerationResult, GeneratedLists, GeneratedPrompts, CurrentPromptIndex } from "@/types/generation";
import type { UserStats } from "@/types/convex";
import type { PromptType, PromptTypeArray } from "@/types/prompts";
import { logger } from "@/lib/logger";

// Re-export types for backward compatibility
type GeneratedItem = { title: string; prompt: string; order: number };

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

const loadingTips = [
  "💡 Tip: Review each prompt carefully - you can modify them in chat later!",
  "🚀 Your prompts are being crafted with full context of your project...",
  "✨ Each prompt includes specific implementation details for your tech stack",
  "🎯 Prompts are optimized for your selected component libraries",
  "📝 All prompts will be downloadable in multiple formats",
  "🔧 Prompts include error handling and edge cases",
  "⚡ Generation speed depends on prompt complexity",
  "🎨 Frontend prompts include responsive design considerations",
  "🔒 Security prompts include best practices and compliance",
  "🐛 Error-fixing prompts cover common scenarios",
];

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
  const updateGenerationStatus = useMutation(api.appBuilderGenerations.updateGenerationStatus);
  const createChatSession = useMutation(api.chatMutations.createChatSession);
  const batchStoreEmbeddings = useAction(api.vectorSearch.batchStoreEmbeddings);
  const stats = useQuery(api.users.getUserStats, user?.id ? { userId: user.id } : "skip") as
    | UserStats
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

  // Get generation progress (must be after generationId state declaration)
  const getGenerationProgress = useQuery(
    api.appBuilderGenerations.getGenerationProgress,
    generationId ? { generationId: generationId as GenerationId } : "skip"
  );
  const [generationStep, setGenerationStep] = React.useState<"form" | "prd" | "user_flows" | "tasks" | "lists" | "prompts" | "summary">("form");
  const [prdContent, setPrdContent] = React.useState<string | null>(null);
  const [userFlowsContent, setUserFlowsContent] = React.useState<string | null>(null);
  const [taskFileContent, setTaskFileContent] = React.useState<string | null>(null);
  const [generatedLists, setGeneratedLists] = React.useState<GeneratedLists | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = React.useState<CurrentPromptIndex>(null);
  const [generatedPrompts, setGeneratedPrompts] = React.useState<GeneratedPrompts>({});

  // Enhanced loading UI state
  const [loadingTip, setLoadingTip] = React.useState("");
  const [estimatedTime, setEstimatedTime] = React.useState(0);
  const [avgGenerationTime, setAvgGenerationTime] = React.useState(5); // Default 5 seconds per prompt
  const [generationStartTime, setGenerationStartTime] = React.useState(0);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const lastAvgUpdateRef = React.useRef<number>(0); // Track last avg update to prevent infinite loops
  const avgGenerationTimeRef = React.useRef<number>(5); // Track avg time in ref to avoid dependency issues
  const generatedListsRef = React.useRef<GeneratedLists | null>(null); // Track lists in ref to avoid state timing issues
  const isGeneratingRef = React.useRef<boolean>(false); // Prevent concurrent generation calls
  const lastGeneratedItemRef = React.useRef<{ type: string; name: string } | null>(null); // Track last item to prevent duplicate toasts
  const generatedPromptsRef = React.useRef<GeneratedPrompts>({}); // Track prompts in ref to avoid dependency issues

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

  // Helper function to calculate total prompts
  function calculateTotalPrompts(): number {
    if (!generatedLists) return 0;
    let total = 0;
    if (generatedLists.frontend) total += generatedLists.frontend.length;
    if (generatedLists.backend) total += generatedLists.backend.length;
    if (generatedLists.security) total += generatedLists.security.length;
    if (generatedLists.functionality) total += generatedLists.functionality.length;
    if (generatedLists.errorFixing) total += generatedLists.errorFixing.length;
    return total;
  }

  // Helper function to get icon/emoji for prompt type
  function getPromptTypeIcon(type: string): { icon: string; label: string } {
    switch (type) {
      case "frontend": return { icon: "🎨", label: "Frontend Component" };
      case "backend": return { icon: "⚙️", label: "Backend Endpoint" };
      case "security": return { icon: "🔒", label: "Security Feature" };
      case "functionality": return { icon: "⚡", label: "Business Logic" };
      case "error_fixing": return { icon: "🐛", label: "Error Scenario" };
      default: return { icon: "📝", label: "Prompt" };
    }
  }

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
    } catch { }
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
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tip rotation effect
  React.useEffect(() => {
    if (isSubmitting && generationStep === "prompts") {
      // Set initial tip
      setLoadingTip(loadingTips[Math.floor(Math.random() * loadingTips.length)]);

      const tipInterval = setInterval(() => {
        setLoadingTip(loadingTips[Math.floor(Math.random() * loadingTips.length)]);
      }, 3000);

      return () => clearInterval(tipInterval);
    }
  }, [isSubmitting, generationStep]);

  // Sync generatedPrompts to ref whenever it changes
  React.useEffect(() => {
    generatedPromptsRef.current = generatedPrompts;
  }, [generatedPrompts]);

  // Time estimation effect - use refs to avoid dependency issues
  React.useEffect(() => {
    // Extract dependencies to variables to avoid complex expressions in dependency array
    const currentIndex = currentPromptIndex ?? null;
    const startTime = generationStartTime ?? 0;

    // Use refs to avoid dependency on state that changes frequently
    const prompts = generatedPromptsRef.current;
    const lists = generatedListsRef.current || generatedLists;

    // Only run if we have all required data
    if (!currentIndex || !prompts || !lists) {
      return;
    }

    const completed = Object.values(prompts).flat().length;
    const total = calculateTotalPrompts();
    const remaining = total - completed;
    const estimated = remaining * avgGenerationTimeRef.current; // Use ref value
    setEstimatedTime(Math.max(0, estimated));

    // Update average generation time based on actual performance
    // Use ref to prevent infinite loops by tracking when we last updated
    if (startTime > 0 && completed > 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const newAvg = elapsed / completed;
      // Only update if the difference is significant (more than 0.1 seconds)
      // and we haven't updated recently (within 1 second) to prevent loops
      const now = Date.now();
      if (Math.abs(newAvg - avgGenerationTimeRef.current) > 0.1 && (now - lastAvgUpdateRef.current) > 1000) {
        lastAvgUpdateRef.current = now;
        avgGenerationTimeRef.current = newAvg; // Update ref
        setAvgGenerationTime(newAvg); // Also update state for display if needed
      }
    }
    // Use stable dependencies with fixed length - extract complex expressions to variables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex, generationStartTime]);

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
        setTools((prev) => Array.from(new Set([...(prev || []), ...ts.filter((s) => !["React", "Vue", "Svelte", "Node.js", "Python", "Go", "PostgreSQL", "MongoDB", "MySQL"].includes(s))])));
      }
      sessionStorage.removeItem("cursorBuilderPrefill");
    } catch { }
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
          onClick: () => { try { window.location.href = '/dashboard/billing'; } catch { } },
        },
      });
      return;
    }

    // Validate at least one prompt type selected
    const selectedTypes: PromptType[] = Object.entries(selectedPromptTypes)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => (key === "errorFixing" ? "error_fixing" : key) as PromptType);

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
      setGenerationStep("prd"); // Set step first to show loading screen
      setIsSubmitting(true);
      toast.info("Generating PRD...");
      logger.info("[submit] Starting PRD generation", { generationId: genId, userId: user.id });
      const { prd } = await generatePRD({
        generationId: genId as GenerationId,
        userId: user.id,
        formData,
      });
      
      if (!prd || prd.trim().length === 0) {
        throw new Error("PRD generation returned empty content");
      }
      
      logger.info("[submit] PRD generated successfully", {
        generationId: genId,
        prdLength: prd.length,
        hasContent: prd.trim().length > 0
      });
      
      setPrdContent(prd);
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
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Failed to generate PRD", { error: error.message });
      toast.error(error.message || "Failed to generate PRD");
      setIsSubmitting(false);
      setProgress(0);
    }
  }

  // Approve PRD and generate User Flows
  async function approvePRD() {
    if (!generationId || !prdContent || !user?.id) {
      logger.warn("[approvePRD] Missing required data", { generationId, hasPrd: !!prdContent, userId: user?.id });
      return;
    }
    
    logger.info("[approvePRD] Starting user flows generation", { generationId, userId: user.id });
    setIsSubmitting(true);
    setProgress(40);
    
    try {
      await approveStep({
        generationId: generationId as GenerationId,
        step: "prd",
      });

      toast.info("Generating User Flows...");
      setGenerationStep("user_flows"); // Set step first to show loading screen
      setProgress(40);
      setIsSubmitting(true);
      const formData = buildFormData();
      const { userFlows } = await generateUserFlows({
        generationId: generationId as GenerationId,
        userId: user.id,
        formData,
        prd: prdContent,
      });
      
      if (!userFlows || userFlows.trim().length === 0) {
        throw new Error("User flows generation returned empty content");
      }
      
      logger.info("[approvePRD] User flows generated successfully", {
        generationId,
        userId: user.id,
        userFlowsLength: userFlows.length
      });

      setUserFlowsContent(userFlows);
      setProgress(50);
      toast.success("User Flows generated! Please review and approve.");
      setIsSubmitting(false);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Failed to generate User Flows", { error: error.message });
      toast.error(error.message || "Failed to generate User Flows");
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
        generationId: generationId as GenerationId,
        step: "user_flows",
      });

      toast.info("Generating Task File...");
      setGenerationStep("tasks"); // Set step first to show loading screen
      setProgress(60);
      setIsSubmitting(true);
      const formData = buildFormData();
      const { taskFile } = await generateTaskFile({
        generationId: generationId as GenerationId,
        userId: user.id,
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
      });
      
      if (!taskFile || taskFile.trim().length === 0) {
        throw new Error("Task file generation returned empty content");
      }
      
      logger.info("[approveUserFlows] Task file generated successfully", {
        generationId,
        userId: user.id,
        taskFileLength: taskFile.length
      });

      setTaskFileContent(taskFile);
      setProgress(70);
      toast.success("Task File generated! Please review and approve.");
      setIsSubmitting(false);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Failed to generate Task File", { error: error.message });
      toast.error(error.message || "Failed to generate Task File");
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
        generationId: generationId as GenerationId,
        step: "tasks",
      });

      toast.info("Generating screen/feature lists...");
      setProgress(75);
      setIsSubmitting(true);
      const formData = buildFormData();
      const selectedTypes = Object.entries(selectedPromptTypes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => (key === "errorFixing" ? "error_fixing" : key) as PromptType);

      logger.debug("[approveTasks] Calling generateLists", {
        generationId,
        userId: user.id,
        selectedTypes
      });
      
      const lists = await generateLists({
        generationId: generationId as GenerationId,
        userId: user.id,
        formData,
        prd: prdContent,
        userFlows: userFlowsContent,
        selectedPromptTypes: selectedTypes,
      });
      
      logger.info("[approveTasks] Lists generated successfully", {
        generationId,
        userId: user.id,
        frontendCount: (lists as any).screenList?.length || 0,
        backendCount: (lists as any).endpointList?.length || 0,
        securityCount: (lists as any).securityFeatureList?.length || 0,
        functionalityCount: (lists as any).functionalityFeatureList?.length || 0,
        errorFixingCount: (lists as any).errorScenarioList?.length || 0
      });

      // Transform the result to match GeneratedLists type
      const transformedLists: GeneratedLists = {
        frontend: (lists as any).screenList?.map((name: string) => ({ name, type: "frontend" })) || [],
        backend: (lists as any).endpointList?.map((name: string) => ({ name, type: "backend" })) || [],
        security: (lists as any).securityFeatureList?.map((name: string) => ({ name, type: "security" })) || [],
        functionality: (lists as any).functionalityFeatureList?.map((name: string) => ({ name, type: "functionality" })) || [],
        errorFixing: (lists as any).errorScenarioList?.map((name: string) => ({ name, type: "errorFixing" })) || [],
      };

      setGeneratedLists(transformedLists);
      generatedListsRef.current = transformedLists; // Also update ref
      setProgress(80);
      setGenerationStartTime(Date.now());

      // Transition to prompts step
      setGenerationStep("prompts");
      setGenerationError(null);
      setIsSubmitting(true); // Set to true before starting generation

      // Start generating prompts for first item
      // Pass transformedLists directly to avoid race condition with state update
      logger.info("[approveTasks] Starting prompt generation", {
        generationId,
        userId: user.id,
        totalItems: calculateTotalPrompts()
      });
      await generateNextPrompt(transformedLists);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("[approveTasks] Failed to generate lists", {
        error: error.message,
        generationId,
        userId: user.id,
        stack: error.stack
      });
      toast.error(error.message || "Failed to generate lists");
      setIsSubmitting(false);
    }
  }

  // Utility function: Timeout wrapper
  function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  }

  // Utility function: Retry with exponential backoff
  async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on validation errors or user errors
        const errorMsg = lastError.message.toLowerCase();
        if (errorMsg.includes("validation") ||
          errorMsg.includes("limit reached") ||
          errorMsg.includes("permission") ||
          errorMsg.includes("cannot generate")) {
          throw lastError;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelayMs * Math.pow(2, attempt);
        logger.debug(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Retry failed");
  }

  // Generate next prompt in sequence
  async function generateNextPrompt(lists?: GeneratedLists) {
    // STRONG GUARD: Prevent concurrent calls - check ref first before any async operations
    if (isGeneratingRef.current) {
      logger.debug("[generateNextPrompt] Already in progress, skipping duplicate call", {
        timestamp: Date.now(),
        stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
      });
      return;
    }
    
    // Use provided lists parameter, ref, or fall back to state
    const listsToUse = lists || generatedListsRef.current || generatedLists;
    
    // Update ref when we have lists
    if (listsToUse && !generatedListsRef.current) {
      generatedListsRef.current = listsToUse;
    }
    
    // Validation with detailed error messages
    const missing: string[] = [];
    if (!generationId) missing.push("Generation ID");
    if (!taskFileContent) missing.push("Task File");
    if (!userFlowsContent) missing.push("User Flows");
    if (!prdContent) missing.push("PRD");
    if (!user?.id) missing.push("User ID");
    if (!listsToUse) missing.push("Generated Lists");
    
    if (missing.length > 0) {
      const errorMsg = `Cannot generate prompts: Missing required data (${missing.join(", ")})`;
      logger.error("[generateNextPrompt] Validation failed", { missing, generationId, hasLists: !!listsToUse });
      toast.error(errorMsg);
      setIsSubmitting(false);
      setGenerationError(errorMsg);
      return;
    }
    
    // Validate lists have actual content
    const hasValidLists = listsToUse && (
      (listsToUse.frontend && listsToUse.frontend.length > 0) ||
      (listsToUse.backend && listsToUse.backend.length > 0) ||
      (listsToUse.security && listsToUse.security.length > 0) ||
      (listsToUse.functionality && listsToUse.functionality.length > 0) ||
      (listsToUse.errorFixing && listsToUse.errorFixing.length > 0)
    );
    
    if (!hasValidLists) {
      const errorMsg = "Generated lists are empty. Please regenerate lists.";
      logger.error("[generateNextPrompt] Lists validation failed", { listsToUse });
      toast.error(errorMsg);
      setIsSubmitting(false);
      setGenerationError(errorMsg);
      return;
    }
    
    // Set lock BEFORE any async operations
    isGeneratingRef.current = true;
    setIsSubmitting(true);
    setGenerationError(null);
    
    logger.info("[generateNextPrompt] Starting generation", {
      generationId,
      timestamp: Date.now()
    });
    
    try {
      // Use local ref for duplicate detection to avoid race conditions with server state
      const syncedPrompts = generatedPromptsRef.current || generatedPrompts;

      const formData = buildFormData();
      const selectedTypes = Object.entries(selectedPromptTypes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key === "errorFixing" ? "error_fixing" : key);

      // Helper function to check if item already generated - use synced prompts and ref
      function itemAlreadyGenerated(type: string, name: string): boolean {
        const syncedPromptsList = (syncedPrompts as any)[type] || [];
        const refPromptsList = (generatedPromptsRef.current as any)[type] || [];
        // Check both synced and ref to catch all cases
        const alreadyExists = syncedPromptsList.some((p: GeneratedItem) => p.title === name) ||
          refPromptsList.some((p: GeneratedItem) => p.title === name);
        
        if (alreadyExists) {
          logger.debug("[generateNextPrompt] Item already generated, skipping", {
            type,
            name,
            syncedCount: syncedPromptsList.length,
            refCount: refPromptsList.length
          });
        }
        
        return alreadyExists;
      }

      // Determine which item to generate next
      let nextItem: { type: string; name: string; index: number } | null = null;

      if (!listsToUse) return;

      // Check frontend screens - with duplicate detection
      if (selectedTypes.includes("frontend") && listsToUse.frontend) {
        const frontendPrompts = syncedPrompts.frontend || [];
        const remainingScreens = listsToUse.frontend.filter(
          (item) => !itemAlreadyGenerated("frontend", item.name)
        );

        if (remainingScreens.length > 0) {
          const nextScreen = remainingScreens[0];
          const originalIndex = listsToUse.frontend.findIndex(item => item.name === nextScreen.name);
          nextItem = {
            type: "frontend",
            name: nextScreen.name,
            index: originalIndex,
          };
        }
      }

      // Check backend endpoints - with duplicate detection
      if (!nextItem && selectedTypes.includes("backend") && listsToUse.backend) {
        const backendPrompts = syncedPrompts.backend || [];
        const remainingEndpoints = listsToUse.backend.filter(
          (item) => !itemAlreadyGenerated("backend", item.name)
        );

        if (remainingEndpoints.length > 0) {
          const nextEndpoint = remainingEndpoints[0];
          const originalIndex = listsToUse.backend.findIndex(item => item.name === nextEndpoint.name);
          nextItem = {
            type: "backend",
            name: nextEndpoint.name,
            index: originalIndex,
          };
        }
      }

      // Check security features - with duplicate detection
      if (!nextItem && selectedTypes.includes("security") && listsToUse.security) {
        const securityPrompts = syncedPrompts.security || [];
        const remainingFeatures = listsToUse.security.filter(
          (item) => !itemAlreadyGenerated("security", item.name)
        );

        if (remainingFeatures.length > 0) {
          const nextFeature = remainingFeatures[0];
          const originalIndex = listsToUse.security.findIndex(item => item.name === nextFeature.name);
          nextItem = {
            type: "security",
            name: nextFeature.name,
            index: originalIndex,
          };
        }
      }

      // Check functionality features - with duplicate detection
      if (!nextItem && selectedTypes.includes("functionality") && listsToUse.functionality) {
        const functionalityPrompts = syncedPrompts.functionality || [];
        const remainingFeatures = listsToUse.functionality.filter(
          (item) => !itemAlreadyGenerated("functionality", item.name)
        );

        if (remainingFeatures.length > 0) {
          const nextFeature = remainingFeatures[0];
          const originalIndex = listsToUse.functionality.findIndex(item => item.name === nextFeature.name);
          nextItem = {
            type: "functionality",
            name: nextFeature.name,
            index: originalIndex,
          };
        }
      }

      // Check error scenarios - with duplicate detection
      if (!nextItem && selectedTypes.includes("error_fixing") && listsToUse.errorFixing) {
        const errorPrompts = syncedPrompts.error_fixing || [];
        const remainingScenarios = listsToUse.errorFixing.filter(
          (item) => !itemAlreadyGenerated("error_fixing", item.name)
        );

        if (remainingScenarios.length > 0) {
          const nextScenario = remainingScenarios[0];
          const originalIndex = listsToUse.errorFixing.findIndex(item => item.name === nextScenario.name);
          nextItem = {
            type: "error_fixing",
            name: nextScenario.name,
            index: originalIndex,
          };
        }
      }

      if (!nextItem) {
        // All prompts generated, show summary
        logger.info("[generateNextPrompt] All prompts generated, showing summary", {
          generationId,
          totalPrompts: Object.values(syncedPrompts).flat().length,
          timestamp: Date.now()
        });
        setGenerationStep("summary");
        setIsSubmitting(false);
        setShowConfetti(true);
        toast.success("All prompts generated!");
        isGeneratingRef.current = false;
        return;
      }
      
      logger.debug("[generateNextPrompt] Selected next item to generate", {
        type: nextItem.type,
        name: nextItem.name,
        index: nextItem.index,
        generationId
      });

      // Only show toast if this is a new item (not a retry or duplicate)
      const isRetry = currentPromptIndex?.name === nextItem.name && currentPromptIndex?.type === nextItem.type;
      const isDuplicateToast = lastGeneratedItemRef.current?.name === nextItem.name &&
        lastGeneratedItemRef.current?.type === nextItem.type;

      // Don't show toast if it's a retry, duplicate, or if item is already generated
      if (!isRetry && !isDuplicateToast && !itemAlreadyGenerated(nextItem.type, nextItem.name)) {
        logger.info("[generateNextPrompt] Showing toast for new item", {
          type: nextItem.type,
          name: nextItem.name
        });
        toast.info(`Generating prompt for ${nextItem.name}...`);
        lastGeneratedItemRef.current = { type: nextItem.type, name: nextItem.name };
      } else {
        logger.debug("[generateNextPrompt] Skipping toast", {
          isRetry,
          isDuplicateToast,
          alreadyGenerated: itemAlreadyGenerated(nextItem.type, nextItem.name)
        });
      }

      setCurrentPromptIndex(nextItem);

      // Validate required data before calling API
      if (!user?.id || !prdContent || !userFlowsContent || !taskFileContent) {
        throw new Error("Missing required data for prompt generation");
      }

      const { prompt } = await retryWithBackoff(
        () => withTimeout(
          generateItemPrompt({
            generationId: generationId as GenerationId,
            userId: user.id,
            itemType: nextItem.type as PromptType,
            itemName: nextItem.name,
            formData,
            prd: prdContent,
            userFlows: userFlowsContent,
            taskFile: taskFileContent,
          }),
          60000, // 60 second timeout
          `Timeout: Prompt generation for "${nextItem.name}" took longer than 60 seconds. Please try again.`
        ),
        3, // 3 retry attempts
        1000 // Base delay of 1 second
      );

      // Update generated prompts state - use functional update to ensure we have latest state
      setGeneratedPrompts((prev: GeneratedPrompts) => {
        // Check if already exists to prevent duplicates - use both prev and ref for safety
        const existingPrompts = prev[nextItem!.type as keyof GeneratedPrompts] || [];
        const refPrompts = generatedPromptsRef.current[nextItem!.type as keyof GeneratedPrompts] || [];
        const allExisting = [...existingPrompts, ...refPrompts];
        const alreadyExists = allExisting.some((p: GeneratedItem) => p.title === nextItem!.name);

        if (alreadyExists) {
          logger.warn(`Prompt for ${nextItem!.name} already exists, skipping duplicate`);
          return prev;
        }

        const updated = {
          ...prev,
          [nextItem!.type]: [
            ...existingPrompts,
            { title: nextItem!.name, prompt },
          ],
        };

        // Update ref immediately to prevent race conditions
        generatedPromptsRef.current = updated;

        // Persist progress to localStorage
        if (generationId) {
          try {
            localStorage.setItem(
              `cursorBuilder.progress.${generationId}`,
              JSON.stringify({
                generatedPrompts: updated,
                timestamp: Date.now(),
              })
            );
          } catch (e) {
            logger.warn("Failed to save progress to localStorage", { error: e instanceof Error ? e.message : String(e) });
          }
        }
        return updated;
      });

      setCurrentPromptIndex(null);
      setIsSubmitting(false);
      setGenerationError(null);
      lastGeneratedItemRef.current = null; // Clear last item on success
      
      // CRITICAL: Clear lock BEFORE attempting next generation to prevent infinite loops
      isGeneratingRef.current = false;
      
      logger.info("[generateNextPrompt] Successfully generated prompt", {
        itemType: nextItem.type,
        itemName: nextItem.name,
        generationId,
        timestamp: Date.now()
      });
      
      // Continue to next prompt - but only if we're not already generating
      // Use a small delay to ensure state has settled, but check guard first
      setTimeout(() => {
        // Double-check guard before calling again
        if (!isGeneratingRef.current) {
          logger.debug("[generateNextPrompt] Continuing to next prompt", {
            generationId,
            timestamp: Date.now()
          });
          generateNextPrompt(generatedListsRef.current || listsToUse);
        } else {
          logger.warn("[generateNextPrompt] Skipping continuation - already generating", {
            generationId,
            timestamp: Date.now()
          });
        }
      }, 500);
    } catch (e: any) {
      const errorMsg = e.message || "Failed to generate prompt";
      logger.error("[generateNextPrompt] Error occurred", {
        errorMsg,
        error: e instanceof Error ? e.message : String(e),
        itemName: currentPromptIndex?.name || "unknown",
        itemType: currentPromptIndex?.type || "unknown",
        generationId,
        timestamp: Date.now(),
        stack: e instanceof Error ? e.stack : undefined
      });
      toast.error(errorMsg);
      setIsSubmitting(false);
      setGenerationError(`Failed to generate prompt for ${currentPromptIndex?.name || "unknown item"}: ${errorMsg}`);
      setCurrentPromptIndex(null);
      // CRITICAL: Always clear lock on error to prevent stuck state
      isGeneratingRef.current = false;
      // Don't clear lastGeneratedItemRef on error - this prevents showing toast again on retry
      // DO NOT automatically retry - let user manually retry via button
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
      Object.entries(generatedPrompts).forEach(([type, prompts]: [string, GeneratedItem[] | undefined]) => {
        if (Array.isArray(prompts)) {
          prompts.forEach((p: GeneratedItem, idx: number) => {
            const promptType: "frontend_prompt" | "backend_prompt" | "security_prompt" | "functionality_prompt" | "error_fixing_prompt" | "chat_message" =
              type === "frontend" ? "frontend_prompt" :
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
              } as any,
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
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Failed to create chat session", { error: error.message });
      toast.error(error.message || "Failed to create chat session");
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
        // Overview
        projectName: 'Acme CRM',
        projectDescription: 'A comprehensive Customer Relationship Management system designed for sales teams to manage contacts, track leads, monitor deals, and improve sales efficiency.',
        projectType: 'web app',
        oneSentence: 'Manage contacts, leads, and deals efficiently.',
        isNewApp: 'new' as const,
        githubUrl: '',
        timeline: 'MVP in 8 weeks, full launch in 4 months',
        budget: 'Small team (2-3 developers)',
        resourceConstraints: 'Standard cloud hosting, standard development tools',
        competitors: 'Salesforce, HubSpot, Pipedrive',

        // Audience
        audienceSummary: {
          ageRange: '26-35',
          profession: 'Manager',
          expertiseLevel: 'intermediate',
          industry: 'Technology',
          useCase: 'Team collaboration'
        },
        platforms: ['Web', 'Mobile (responsive)'],

        // Problem & Goals
        problemStatement: 'Sales teams struggle with scattered customer data, lack of visibility into deal pipelines, and inefficient lead tracking processes.',
        primaryGoal: 'Increase efficiency',
        successCriteria: [
          'Reduce time spent on data entry by 40%',
          'Increase deal closure rate by 25%',
          'Improve team collaboration and visibility'
        ],

        // Features
        features: [
          { id: 'f1', name: 'Contact Management', description: 'Store, organize, and filter contacts with custom fields and tags' },
          { id: 'f2', name: 'Deal Tracking', description: 'Visualize deal pipeline with stages, probabilities, and forecasting' },
          { id: 'f3', name: 'Lead Management', description: 'Capture, qualify, and convert leads into opportunities' },
          { id: 'f4', name: 'Activity Tracking', description: 'Log calls, emails, meetings, and tasks with timeline view' },
          { id: 'f5', name: 'Reporting & Analytics', description: 'Sales performance dashboards and custom reports' }
        ],
        featurePriorities: {
          'f1': 'must-have',
          'f2': 'must-have',
          'f3': 'must-have',
          'f4': 'must-have',
          'f5': 'nice-to-have'
        },
        dataHandling: 'Customer data, contact information, deal history, communication logs',
        offlineSupport: false,
        pushNotifications: true,
        backgroundProcesses: true,
        errorHandling: 'Graceful error handling with user-friendly messages, retry mechanisms for API calls',
        thirdPartyIntegrations: 'Email providers (Gmail, Outlook), calendar systems, payment processors, analytics tools',
        realTimeFeatures: true,
        analyticsTracking: 'User engagement, feature usage, sales metrics, conversion funnels',

        // User Experience & Design
        lookAndFeel: 'Professional, clean, modern interface with emphasis on data visualization',
        brandingGuidelines: 'Corporate blue and white color scheme, professional typography',
        uiuxPatterns: ['Dashboard-first design', 'Data tables with filtering', 'Modal workflows', 'Responsive grid layouts'],
        navigationStructure: 'Sidebar navigation with main sections: Dashboard, Contacts, Deals, Activities, Reports',
        keyScreens: ['Dashboard', 'Contact List', 'Contact Detail', 'Deal Pipeline', 'Deal Detail', 'Activity Timeline', 'Reports'],
        multiLanguageSupport: false,
        themeCustomization: true,
        accessibilityFeatures: ['Keyboard navigation', 'Screen reader support', 'High contrast mode', 'ARIA labels'],
        prebuiltComponents: 'shadcn-ui',

        // Tech Stack - Frontend
        frontend: 'React',
        frontendFrameworks: ['Next.js'],
        buildTools: 'Vite',
        browserCompatibility: 'Modern browsers (Chrome, Firefox, Safari, Edge)',
        stateManagement: 'Zustand',
        uiLibraries: 'shadcn-ui, Radix UI',
        frontendOptimization: ['Code splitting', 'Lazy loading', 'Image optimization', 'Bundle size optimization'],
        apiStructure: 'RESTful API with React Query for data fetching',
        frontendTesting: 'Jest, React Testing Library, Playwright for E2E',

        // Tech Stack - Backend
        backend: 'Node.js',
        backendFrameworks: ['Express'],
        hostingPreferences: 'Cloud hosting (AWS, Vercel, or similar)',
        cachingNeeds: 'Redis for session management and frequently accessed data',
        apiVersioning: 'REST API v1',
        expectedTraffic: '100-1000 concurrent users',
        dataFetching: 'REST API with pagination, filtering, and sorting',
        loggingMonitoring: 'Winston for logging, Sentry for error tracking, DataDog for monitoring',

        // Constraints
        mvpDate: '8 weeks',
        launchDate: '4 months',
        devBudget: 'Small team (2-3 developers)',
        infraBudget: 'Standard cloud hosting costs',
        teamSize: '2-3 developers',

        // Performance & Scale
        expectedUsers: '100-1K',
        perfRequirements: [
          'Real-time updates',
          'Low latency (<200ms)',
          'High availability (99.9%+)'
        ],
        performanceBenchmarks: 'Lighthouse score > 90, Core Web Vitals in green',
        deviceNetworkOptimization: 'Optimize for both desktop and mobile, handle slow network connections',
        scalabilityPlans: 'Horizontal scaling with load balancers, database read replicas',
        cachingStrategies: 'CDN for static assets, Redis for API responses, browser caching',
        seoConsiderations: 'Public marketing pages should be SEO optimized',
        mobileOptimizations: 'Responsive design, touch-friendly interactions, mobile-first approach',
        loadTesting: true,
        environmentalConsiderations: 'Optimize bundle size, minimize API calls, efficient database queries',
        successMetrics: 'User engagement, feature adoption, sales metrics, system performance',

        // Security & Compliance
        securityReqs: [
          'Auth required',
          'RBAC',
          'Encrypt at rest',
          'Encrypt in transit',
          '2FA'
        ],
        compliance: ['GDPR', 'CCPA'],
        sensitiveData: 'Customer contact information, financial data, communication history',
        authenticationMethods: ['Email/Password', 'OAuth (Google, GitHub)'],
        authorizationLevels: 'Role-based access control (Admin, Manager, Sales Rep, Viewer)',
        encryptionHashing: 'BCrypt for passwords, TLS for data in transit, AES-256 for data at rest',
        vulnerabilityPrevention: ['SQL Injection', 'XSS', 'CSRF', 'Rate Limiting', 'Input Validation', 'Dependency Scanning'],
        securityAuditing: true,
        dataRetention: '7 years for financial records, 2 years for communication logs',
        backupFrequency: 'Daily automated backups with 30-day retention',
        rateLimiting: 'API rate limiting: 100 requests per minute per user',
        dataPrivacy: ['Right to deletion', 'Data portability', 'Consent management', 'Privacy by design', 'Data minimization'],

        // Functionality & Logic
        coreBusinessLogic: 'Contact management, deal pipeline management, activity tracking, sales forecasting, reporting',
        aiMlIntegrations: 'Optional: Lead scoring, sales forecasting predictions',
        paymentsMonetization: 'Subscription-based pricing tiers',
        customFunctionalities: 'Custom fields, workflow automation, email templates, document generation',
        externalSystems: 'Email providers, calendar systems, payment gateways, analytics platforms',
        validationRules: 'Email format validation, phone number validation, required field checks, data type validation',
        backgroundJobs: 'Scheduled reports, email notifications, data synchronization, cleanup tasks',
        multiTenancy: false,
        updateMigrations: 'Database migration scripts, backward compatibility, rollback procedures',

        // Error-Fixing & Maintenance
        commonErrors: 'API timeout errors, validation errors, authentication failures, data sync issues',
        errorLogTemplates: true,
        debuggingStrategies: 'Comprehensive logging, error tracking with stack traces, user-friendly error messages',
        versioningUpdates: 'Semantic versioning, changelog, backward compatibility',
        maintenanceTasks: 'Database optimization, cache clearing, log rotation, security updates',
        testingTypes: ['Unit tests', 'Integration tests', 'E2E tests', 'Visual regression', 'Performance tests'],
        cicdTools: 'GitHub Actions',
        rollbackPlans: 'Automated rollback on deployment failure, database migration rollback procedures',
        userFeedbackLoops: 'In-app feedback forms, user surveys, support ticket system',

        // Dev Preferences
        codeStyle: 'Clean, readable, TypeScript with strict mode, ESLint and Prettier',
        testingApproach: 'Test-driven development with unit and integration tests, 80%+ code coverage',
        docsLevel: 'Comprehensive API documentation, inline code comments, README with setup instructions',
        versionControl: 'Git with feature branches, pull request reviews, semantic commits',
        deploymentDetails: 'CI/CD pipeline, automated testing, staging environment, blue-green deployment',

        // Additional Context
        similarProjects: 'Salesforce, HubSpot, Pipedrive, Zoho CRM',
        designInspiration: 'Modern SaaS dashboards, clean data visualization, intuitive navigation',
        specialRequirements: 'Must support bulk operations, export functionality, API access for integrations',
        ethicalGuidelines: 'Respect user privacy, transparent data usage, secure data handling',
        legalRequirements: 'GDPR compliance, data protection, user consent management',
        sustainabilityGoals: 'Efficient resource usage, minimize server load, optimize database queries',
        futureExpansions: 'Mobile apps, AI-powered insights, advanced analytics, integrations marketplace',
        uniqueAspects: 'Focus on ease of use, fast performance, customizable workflows, strong reporting capabilities',

        // Tools
        tools: ['Auth', 'Analytics', 'Email Service', 'Payment Processing'],

        // Technical Details (for TechnicalDetailsBuilder component)
        techDetails: {
          category: 'code',
          details: {
            architecture: 'Microservices',
            codeStyle: 'Object-oriented',
            testing: ['Unit tests', 'Integration tests', 'E2E tests', 'Performance tests'],
            documentation: 'Comprehensive'
          }
        },
      },
    },
    // Add more static templates here
  ];

  function applyTemplate(template: Template) {
    try { trackEvent('generic_prompt_template_selected', { template_name: template.name }); } catch { }

    const fields = template.fields;

    // Overview
    setProjectName(String(fields.projectName || ''));
    setProjectDescription(String(fields.projectDescription || ''));
    setProjectType(String(fields.projectType || 'web app'));
    setOneSentence(String(fields.oneSentence || ''));
    setIsNewApp((fields.isNewApp as "new" | "enhancement" | "prototype") || 'new');
    setGithubUrl(String(fields.githubUrl || ''));
    setTimeline(String(fields.timeline || ''));
    setBudget(String(fields.budget || ''));
    setResourceConstraints(String(fields.resourceConstraints || ''));
    setCompetitors(String(fields.competitors || ''));

    // Audience
    setAudienceSummary((fields.audienceSummary as { ageRange: string; profession: string; expertiseLevel: string; industry: string; useCase: string; }) || { ageRange: "", profession: "", expertiseLevel: "", industry: "", useCase: "" });
    setPlatforms(Array.isArray(fields.platforms) ? fields.platforms as string[] : []);

    // Problem & Goals
    setProblemStatement(String(fields.problemStatement || ''));
    setPrimaryGoal(String(fields.primaryGoal || ''));
    setSuccessCriteria(Array.isArray(fields.successCriteria) ? fields.successCriteria as string[] : []);

    // Features
    type FeatureItem = { id: string; name: string; description: string };
    setFeatures(Array.isArray(fields.features) ? (fields.features as FeatureItem[]) : []);
    setFeaturePriorities((fields.featurePriorities as Record<string, "must-have" | "nice-to-have">) || {});
    setDataHandling(String(fields.dataHandling || ''));
    setOfflineSupport(Boolean(fields.offlineSupport));
    setPushNotifications(Boolean(fields.pushNotifications));
    setBackgroundProcesses(Boolean(fields.backgroundProcesses));
    setErrorHandling(String(fields.errorHandling || ''));
    setThirdPartyIntegrations(String(fields.thirdPartyIntegrations || ''));
    setRealTimeFeatures(Boolean(fields.realTimeFeatures));
    setAnalyticsTracking(String(fields.analyticsTracking || ''));

    // User Experience & Design
    setLookAndFeel(String(fields.lookAndFeel || ''));
    setBrandingGuidelines(String(fields.brandingGuidelines || ''));
    setUiuxPatterns(Array.isArray(fields.uiuxPatterns) ? fields.uiuxPatterns as string[] : []);
    setNavigationStructure(String(fields.navigationStructure || ''));
    setKeyScreens(Array.isArray(fields.keyScreens) ? fields.keyScreens as string[] : []);
    setMultiLanguageSupport(Boolean(fields.multiLanguageSupport));
    setThemeCustomization(Boolean(fields.themeCustomization));
    setAccessibilityFeatures(Array.isArray(fields.accessibilityFeatures) ? fields.accessibilityFeatures as string[] : []);
    setPrebuiltComponents(String(fields.prebuiltComponents || 'shadcn-ui'));

    // Tech Stack - Frontend
    setFrontend(String(fields.frontend || 'React'));
    setFrontendFrameworks(Array.isArray(fields.frontendFrameworks) ? fields.frontendFrameworks as string[] : []);
    setBuildTools(String(fields.buildTools || ''));
    setBrowserCompatibility(String(fields.browserCompatibility || ''));
    setStateManagement(String(fields.stateManagement || ''));
    setUiLibraries(String(fields.uiLibraries || ''));
    setFrontendOptimization(Array.isArray(fields.frontendOptimization) ? fields.frontendOptimization as string[] : []);
    setApiStructure(String(fields.apiStructure || ''));
    setFrontendTesting(String(fields.frontendTesting || ''));

    // Tech Stack - Backend
    setBackend(String(fields.backend || 'Node.js'));
    setBackendFrameworks(Array.isArray(fields.backendFrameworks) ? fields.backendFrameworks as string[] : []);
    setHostingPreferences(String(fields.hostingPreferences || ''));
    setCachingNeeds(String(fields.cachingNeeds || ''));
    setApiVersioning(String(fields.apiVersioning || ''));
    setExpectedTraffic(String(fields.expectedTraffic || ''));
    setDataFetching(String(fields.dataFetching || ''));
    setLoggingMonitoring(String(fields.loggingMonitoring || ''));

    // Constraints
    setMvpDate(String(fields.mvpDate || ''));
    setLaunchDate(String(fields.launchDate || ''));
    setDevBudget(String(fields.devBudget || ''));
    setInfraBudget(String(fields.infraBudget || ''));
    setTeamSize(String(fields.teamSize || ''));

    // Performance & Scale
    setExpectedUsers(String(fields.expectedUsers || ''));
    setPerfRequirements(Array.isArray(fields.perfRequirements) ? fields.perfRequirements as string[] : []);
    setPerformanceBenchmarks(String(fields.performanceBenchmarks || ''));
    setDeviceNetworkOptimization(String(fields.deviceNetworkOptimization || ''));
    setScalabilityPlans(String(fields.scalabilityPlans || ''));
    setCachingStrategies(String(fields.cachingStrategies || ''));
    setSeoConsiderations(String(fields.seoConsiderations || ''));
    setMobileOptimizations(String(fields.mobileOptimizations || ''));
    setLoadTesting(Boolean(fields.loadTesting));
    setEnvironmentalConsiderations(String(fields.environmentalConsiderations || ''));
    setSuccessMetrics(String(fields.successMetrics || ''));

    // Security & Compliance
    setSecurityReqs(Array.isArray(fields.securityReqs) ? fields.securityReqs as string[] : []);
    setCompliance(Array.isArray(fields.compliance) ? fields.compliance as string[] : []);
    setSensitiveData(String(fields.sensitiveData || ''));
    setAuthenticationMethods(Array.isArray(fields.authenticationMethods) ? fields.authenticationMethods as string[] : []);
    setAuthorizationLevels(String(fields.authorizationLevels || ''));
    setEncryptionHashing(String(fields.encryptionHashing || ''));
    setVulnerabilityPrevention(Array.isArray(fields.vulnerabilityPrevention) ? fields.vulnerabilityPrevention as string[] : []);
    setSecurityAuditing(Boolean(fields.securityAuditing));
    setDataRetention(String(fields.dataRetention || ''));
    setBackupFrequency(String(fields.backupFrequency || ''));
    setRateLimiting(String(fields.rateLimiting || ''));
    setDataPrivacy(Array.isArray(fields.dataPrivacy) ? fields.dataPrivacy as string[] : []);

    // Functionality & Logic
    setCoreBusinessLogic(String(fields.coreBusinessLogic || ''));
    setAiMlIntegrations(String(fields.aiMlIntegrations || ''));
    setPaymentsMonetization(String(fields.paymentsMonetization || ''));
    setCustomFunctionalities(String(fields.customFunctionalities || ''));
    setExternalSystems(String(fields.externalSystems || ''));
    setValidationRules(String(fields.validationRules || ''));
    setBackgroundJobs(String(fields.backgroundJobs || ''));
    setMultiTenancy(Boolean(fields.multiTenancy));
    setUpdateMigrations(String(fields.updateMigrations || ''));

    // Error-Fixing & Maintenance
    setCommonErrors(String(fields.commonErrors || ''));
    setErrorLogTemplates(Boolean(fields.errorLogTemplates));
    setDebuggingStrategies(String(fields.debuggingStrategies || ''));
    setVersioningUpdates(String(fields.versioningUpdates || ''));
    setMaintenanceTasks(String(fields.maintenanceTasks || ''));
    setTestingTypes(Array.isArray(fields.testingTypes) ? fields.testingTypes as string[] : []);
    setCicdTools(String(fields.cicdTools || ''));
    setRollbackPlans(String(fields.rollbackPlans || ''));
    setUserFeedbackLoops(String(fields.userFeedbackLoops || ''));

    // Dev Preferences
    setCodeStyle(String(fields.codeStyle || 'Clean, readable, typed where applicable'));
    setTestingApproach(String(fields.testingApproach || 'Unit + integration with mocks'));
    setDocsLevel(String(fields.docsLevel || 'Pragmatic with examples'));
    setVersionControl(String(fields.versionControl || ''));
    setDeploymentDetails(String(fields.deploymentDetails || ''));

    // Additional Context
    setSimilarProjects(String(fields.similarProjects || ''));
    setDesignInspiration(String(fields.designInspiration || ''));
    setSpecialRequirements(String(fields.specialRequirements || ''));
    setEthicalGuidelines(String(fields.ethicalGuidelines || ''));
    setLegalRequirements(String(fields.legalRequirements || ''));
    setSustainabilityGoals(String(fields.sustainabilityGoals || ''));
    setFutureExpansions(String(fields.futureExpansions || ''));
    setUniqueAspects(String(fields.uniqueAspects || ''));

    // Tools
    setTools(Array.isArray(fields.tools) ? fields.tools as string[] : []);

    // Technical Details (for TechnicalDetailsBuilder component)
    if (fields.techDetails && typeof fields.techDetails === 'object') {
      const techDetailsValue = fields.techDetails as { category: string; details: Record<string, unknown> };
      const detailsValue = techDetailsValue.details || {};
      setTechDetails({
        category: techDetailsValue.category || 'code',
        details: {
          frontend: (detailsValue.frontend as string) || frontend || '',
          backend: (detailsValue.backend as string) || backend || '',
          database: (detailsValue.database as string) || database || '',
          tools: Array.isArray(detailsValue.tools) ? (detailsValue.tools as string[]) : (Array.isArray(tools) ? tools : []),
        }
      });
    }

    toast.success(`Template "${template.name}" applied successfully!`);
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
    } catch { }
    if (didRestore) {
      setShowRestoreHelper(true);
      setTimeout(() => setShowRestoreHelper(false), 4200);
    }
  }, []);

  // Restore generation progress from localStorage on mount
  React.useEffect(() => {
    if (generationId && generationStep === "prompts") {
      try {
        const saved = localStorage.getItem(`cursorBuilder.progress.${generationId}`);
        if (saved) {
          const progress = JSON.parse(saved);
          // Only restore if it's recent (within 24 hours)
          const age = Date.now() - (progress.timestamp || 0);
          if (age < 24 * 60 * 60 * 1000 && progress.generatedPrompts) {
            setGeneratedPrompts(progress.generatedPrompts);
            generatedPromptsRef.current = progress.generatedPrompts; // Update ref
            logger.debug("Restored generation progress from localStorage");
          }
        }
      } catch (e) {
        logger.warn("Failed to restore progress from localStorage", { error: e instanceof Error ? e.message : String(e) });
      }
    }
  }, [generationId, generationStep]);

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
        } catch { }
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
        {/* Loading Screen for PRD Generation */}
        {generationStep === "prd" && isSubmitting && !prdContent && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="relative mb-8">
                {/* Animated spinner with pulsing effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Pulsing dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Generating Product Requirements Document</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                Analyzing your project details and creating a comprehensive PRD...
              </p>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-foreground/50">{progress}% complete</p>
              </div>
              <div className="mt-8 p-4 bg-secondary/10 rounded-lg border border-border max-w-md">
                <p className="text-sm text-foreground/80">
                  💡 This may take 30-60 seconds. We're analyzing your requirements and creating a detailed document.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* PRD Error/Empty State */}
        {generationStep === "prd" && !isSubmitting && !prdContent && (
          <Card className="p-8 border-destructive/50 bg-destructive/5">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                We couldn't generate the Product Requirements Document. This might be due to an API error or content policy.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setGenerationStep("form")}>
                  Back to Form
                </Button>
                <Button onClick={submit}>
                  Retry Generation
                </Button>
              </div>
            </div>
          </Card>
        )}

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
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </Card>
        )}

        {/* Loading Screen for User Flows Generation */}
        {generationStep === "user_flows" && isSubmitting && !userFlowsContent && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="relative mb-8">
                {/* Animated spinner with pulsing effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Pulsing dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Generating User Flows</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                Creating detailed user journey maps based on your PRD...
              </p>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-foreground/50">{progress}% complete</p>
              </div>
              <div className="mt-8 p-4 bg-secondary/10 rounded-lg border border-border max-w-md">
                <p className="text-sm text-foreground/80">
                  💡 Mapping out user interactions and navigation paths for your application.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* User Flows Error/Empty State */}
        {generationStep === "user_flows" && !isSubmitting && !userFlowsContent && (
          <Card className="p-8 border-destructive/50 bg-destructive/5">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                We couldn't generate the User Flows. Please try again.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setGenerationStep("prd")}>
                  Back to PRD
                </Button>
                <Button onClick={approvePRD}>
                  Retry Generation
                </Button>
              </div>
            </div>
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
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </Card>
        )}

        {/* Loading Screen for Tasks Generation */}
        {generationStep === "tasks" && isSubmitting && !taskFileContent && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="relative mb-8">
                {/* Animated spinner with pulsing effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Pulsing dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Generating Task Breakdown</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                Breaking down your project into actionable development tasks...
              </p>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-foreground/50">{progress}% complete</p>
              </div>
              <div className="mt-8 p-4 bg-secondary/10 rounded-lg border border-border max-w-md">
                <p className="text-sm text-foreground/80">
                  💡 Organizing tasks by priority and dependencies for efficient development.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tasks Error/Empty State */}
        {generationStep === "tasks" && !isSubmitting && !taskFileContent && (
          <Card className="p-8 border-destructive/50 bg-destructive/5">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                We couldn't generate the Task Breakdown. Please try again.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setGenerationStep("user_flows")}>
                  Back to User Flows
                </Button>
                <Button onClick={approveUserFlows}>
                  Retry Generation
                </Button>
              </div>
            </div>
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
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </Card>
        )}

        {/* Loading Screen for Lists Generation (before prompts) */}
        {generationStep === "prompts" && isSubmitting && !generatedLists && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="relative mb-8">
                {/* Animated spinner with pulsing effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Pulsing dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Generating Feature Lists</h2>
              <p className="text-foreground/60 mb-6 max-w-md">
                Creating lists of screens, endpoints, and features for prompt generation...
              </p>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-foreground/50">{progress}% complete</p>
              </div>
              <div className="mt-8 p-4 bg-secondary/10 rounded-lg border border-border max-w-md">
                <p className="text-sm text-foreground/80">
                  💡 Analyzing your project structure to identify all components that need prompts.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Prompt Generation Progress - Enhanced UI */}
        {generationStep === "prompts" && generatedLists && (
          <Card className="p-6">
            <div className="mb-6 text-center">
              {/* Resume Generation Button - if stopped but not complete */}
              {!isSubmitting && !generationError && getGenerationProgress &&
                getGenerationProgress.completedPrompts < getGenerationProgress.totalPrompts && (
                  <div className="mb-4 p-4 bg-secondary/10 border border-border rounded-lg">
                    <p className="text-sm text-foreground/80 mb-3">
                      Generation paused. {getGenerationProgress.completedPrompts} of {getGenerationProgress.totalPrompts} prompts completed.
                    </p>
                    <Button
                      onClick={() => {
                        // Sync state from backend
                        if (getGenerationProgress.generatedPrompts) {
                          setGeneratedPrompts(getGenerationProgress.generatedPrompts);
                          generatedPromptsRef.current = getGenerationProgress.generatedPrompts; // Update ref
                        }
                        if ((getGenerationProgress as any).screenList && !generatedLists?.frontend) {
                          const progressLists = getGenerationProgress as any;
                          const updatedLists: GeneratedLists = {
                            frontend: progressLists.screenList?.map((name: string) => ({ name, type: "frontend" })) || [],
                            backend: progressLists.endpointList?.map((name: string) => ({ name, type: "backend" })) || [],
                            security: progressLists.securityFeatureList?.map((name: string) => ({ name, type: "security" })) || [],
                            functionality: progressLists.functionalityFeatureList?.map((name: string) => ({ name, type: "functionality" })) || [],
                            errorFixing: progressLists.errorScenarioList?.map((name: string) => ({ name, type: "errorFixing" })) || [],
                          };
                          setGeneratedLists(updatedLists);
                          generatedListsRef.current = updatedLists; // Update ref
                        }
                        setGenerationError(null);
                        setIsSubmitting(true);
                        generateNextPrompt(generatedListsRef.current || generatedLists);
                      }}
                      variant="default"
                      size="sm"
                    >
                      Resume Generation
                    </Button>
                  </div>
                )}

              {/* Error Display */}
              {generationError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
                  <div className="flex items-start gap-2">
                    <div className="text-destructive text-lg">⚠️</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive mb-1">Generation Error</h3>
                      <p className="text-sm text-foreground/80 mb-3">{generationError}</p>
                      <Button
                        onClick={() => {
                          setGenerationError(null);
                          setIsSubmitting(true);
                          generateNextPrompt();
                        }}
                        variant="default"
                        size="sm"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!generationError && (
                <div className="mb-4">
                  {/* Enhanced animated spinner */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-12 h-12 border-4 border-primary/20 rounded-full"></div>
                      <div className="absolute w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    {/* Pulsing center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Generating Prompts</h2>
                {isSubmitting && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm("Are you sure you want to cancel generation? You can resume later.")) {
                        setIsSubmitting(false);
                        setCurrentPromptIndex(null);
                        setGenerationError(null);
                        // Update backend status to cancelled
                        if (generationId) {
                          try {
                            await updateGenerationStatus({
                              generationId: generationId as GenerationId,
                              status: "cancelled",
                            });
                          } catch (e) {
                            logger.error("Failed to update status to cancelled", { error: e instanceof Error ? e.message : String(e) });
                          }
                        }
                        toast.info("Generation cancelled. You can resume later.");
                      }
                    }}
                  >
                    Cancel Generation
                  </Button>
                )}
              </div>
              <p className="text-foreground/60 mb-4">
                {generationError
                  ? "Generation paused due to error"
                  : currentPromptIndex
                    ? `Creating prompt for: ${currentPromptIndex.name} (${currentPromptIndex.type})`
                    : "Preparing to generate prompts..."}
              </p>

              {/* Progress with stats */}
              {generatedLists && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground/70">
                      Progress: {Object.values(generatedPrompts).flat().length} / {calculateTotalPrompts()}
                    </span>
                    {estimatedTime > 0 && (
                      <span className="text-foreground/70">
                        Estimated: {Math.ceil(estimatedTime)}s remaining
                      </span>
                    )}
                  </div>
                  <Progress
                    value={calculateTotalPrompts() > 0
                      ? (Object.values(generatedPrompts).flat().length / calculateTotalPrompts()) * 100
                      : 0}
                    className="h-3"
                  />
                </div>
              )}

              {/* Rotating tips */}
              {loadingTip && (
                <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-border">
                  <p className="text-sm text-foreground/80 animate-pulse">
                    {loadingTip}
                  </p>
                </div>
              )}

              {/* Mini preview of what's being generated */}
              {currentPromptIndex && (
                <div className="mt-4 p-3 bg-background border border-border rounded text-left">
                  <p className="text-xs text-foreground/60 mb-1">Generating:</p>
                  <p className="text-sm font-medium">
                    {getPromptTypeIcon(currentPromptIndex.type).icon} {getPromptTypeIcon(currentPromptIndex.type).label}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">{currentPromptIndex.name}</p>
                </div>
              )}
            </div>
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
                  {Object.entries(generatedPrompts).map(([type, prompts]: [string, GeneratedItem[] | undefined]) => (
                    <div key={type} className="border border-border rounded p-3">
                      <div className="font-medium text-sm mb-2 capitalize">{type.replace("_", " ")}</div>
                      {Array.isArray(prompts) && prompts.map((p: GeneratedItem, idx: number) => (
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
                  <select
                    id="projectType"
                    aria-label="Select Project Type"
                    className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    required
                  >
                    {["web app", "mobile app", "API", "desktop app", "library", "cli"].map((t) => <option key={t}>{t}</option>)}
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
                <Label>
                  <TooltipWrapper content="A detailed description of what you're building, who it's for, and how it will be used. This helps us understand your project's purpose and goals.">
                    Overview / Main Purpose
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={4} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="What are you building? Who is it for? Key workflows?" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe your app's purpose, target users, and main features. The more detail, the better we can help you.
                </p>
              </div>
              <div>
                <Label htmlFor="isNewApp">
                  <TooltipWrapper content="Whether you're starting fresh, improving an existing app, or creating a prototype to test ideas.">
                    Is this a new app, enhancement, or prototype?
                  </TooltipWrapper>
                </Label>
                <select
                  id="isNewApp"
                  aria-label="Is this a new app, enhancement, or prototype?"
                  className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={isNewApp}
                  onChange={(e) => setIsNewApp(e.target.value as "new" | "enhancement" | "prototype")}
                  required
                >
                  <option value="new">New app from scratch</option>
                  <option value="enhancement">Enhancement to existing app</option>
                  <option value="prototype">Prototype</option>
                </select>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: New = starting from nothing. Enhancement = adding to existing app. Prototype = testing ideas before full build.
                </p>
              </div>
              <div>
                <Label htmlFor="githubUrl">
                  <TooltipWrapper content="If you already have code in a GitHub repository, share the link so we can analyze it and auto-fill relevant information.">
                    Existing GitHub Repository URL (optional)
                  </TooltipWrapper>
                </Label>
                <Input id="githubUrl" className="mt-2" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" />
                <p className="text-xs text-foreground/60 mt-1">We'll analyze it for auto-population</p>
              </div>
              <div>
                <Label htmlFor="timeline">
                  <TooltipWrapper content="When you want to complete different phases of your project. This helps plan the development process.">
                    Desired Timeline
                  </TooltipWrapper>
                </Label>
                <Input id="timeline" className="mt-2" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g., MVP in 2 weeks, full launch in 3 months" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Be realistic about timelines. Consider MVP (minimum viable product) first, then full launch.
                </p>
              </div>
              <div>
                <Label htmlFor="budget">
                  <TooltipWrapper content="Your available resources, team size, or budget constraints. This helps determine what's feasible for your project.">
                    Budget or Resource Constraints
                  </TooltipWrapper>
                </Label>
                <Input id="budget" className="mt-2" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., solo developer, small team, specific tools, or budget range" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe your team size, budget, or any constraints (like specific tools you must use).
                </p>
              </div>
              <div>
                <Label htmlFor="competitors">
                  <TooltipWrapper content="Apps or services similar to what you're building. This helps us understand the market and what makes your app unique.">
                    Similar Apps or Competitors
                  </TooltipWrapper>
                </Label>
                <Textarea id="competitors" className="mt-2" rows={3} value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="List them and what you'd like to differentiate (e.g., 'Like Strava but with AI coaching')" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Mention similar apps and explain how yours will be different or better. This helps define your unique value.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Upload any design files, wireframes, mockups, or inspiration images that show what you want your app to look like. These help us understand your vision.">
                    Upload Documents, Design Inspirations, Wireframes, or Mockups
                  </TooltipWrapper>
                </Label>
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
                <Label>
                  <TooltipWrapper content="Which devices and platforms should your app work on? You can select multiple platforms if your app needs to work across different devices.">
                    Platforms to Support
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Web", "iOS", "Android", "Desktop", "Cross-platform"].map((platform) => {
                    const active = platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setPlatforms((arr) => (arr.includes(platform) ? arr.filter((x) => x !== platform) : [...arr, platform]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {platform}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Web = browsers. iOS = iPhones/iPads. Android = Android phones/tablets. Desktop = Windows/Mac/Linux apps. Cross-platform = works on multiple platforms.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Problem & Goals</h2>
              <div>
                <Label>
                  <TooltipWrapper content="The specific problem or challenge your app addresses. Clearly defining the problem helps ensure your app solves a real need.">
                    Problem statement
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="What problem does this solve? (e.g., 'People struggle to find reliable local service providers')" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Be specific about the problem. Who has this problem? Why is it a problem? What makes it worth solving?
                </p>
              </div>
              <div>
                <Label htmlFor="primaryGoal">
                  <TooltipWrapper content="The main objective you want to achieve with your app. This is the primary reason you're building it.">
                    Primary goal
                  </TooltipWrapper>
                </Label>
                <select
                  id="primaryGoal"
                  aria-label="Select Primary Goal"
                  className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {["Increase efficiency", "Reduce costs", "Improve user experience", "Enable new capability", "Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Choose the main goal that drives your project. This helps prioritize features and decisions.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Measurable outcomes that define success for your app. These are specific, trackable goals that show your app is working.">
                    Success criteria
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 space-y-2">
                  {successCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Label htmlFor={`success-criteria-${i}`} className="sr-only">Success Criteria {i + 1}</Label>
                      <Input
                        id={`success-criteria-${i}`}
                        value={c}
                        onChange={(e) => updateCriteria(i, e.target.value)}
                        placeholder="Measurable outcome (e.g., '1000 users in first month')"
                        required
                      />
                      <Button variant="outline" size="sm" onClick={() => removeCriteria(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" variant="outline" size="sm" onClick={addCriteria}>Add Criteria</Button>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Make criteria specific and measurable. Examples: "1000 signups in first month" or "90% user satisfaction rating".
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="What data and metrics you want to track to understand how users interact with your app and measure its success.">
                    Analytics & Tracking Requirements
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="analyticsTracking" className="sr-only">Analytics & Tracking Requirements</Label>
                <Textarea
                  id="analyticsTracking"
                  className="mt-2"
                  rows={3}
                  value={analyticsTracking}
                  onChange={(e) => setAnalyticsTracking(e.target.value)}
                  placeholder="What metrics do you want to track? (e.g., user engagement, conversion rates, performance metrics)"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about what you want to measure: user signups, page views, feature usage, conversion rates, etc.
                </p>
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
                      <Input
                        id={`feature-name-${f.id}`}
                        value={f.name}
                        onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, name: e.target.value } : x))}
                        className="flex-1"
                        aria-label={`Feature ${idx + 1} name`}
                        required
                      />
                      <select
                        id={`feature-priority-${f.id}`}
                        aria-label={`Feature ${idx + 1} priority`}
                        className="rounded-md border border-border bg-background p-2 text-sm"
                        value={featurePriorities[f.id] || "must-have"}
                        onChange={(e) => setFeaturePriorities((prev) => ({ ...prev, [f.id]: e.target.value as "must-have" | "nice-to-have" }))}
                      >
                        <option value="must-have">Must Have</option>
                        <option value="nice-to-have">Nice to Have</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={() => removeFeature(f.id)}>Remove</Button>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <Label htmlFor={`feature-description-${f.id}`} className="sr-only">Feature {idx + 1} Description</Label>
                      <textarea
                        id={`feature-description-${f.id}`}
                        className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                        rows={3}
                        value={f.description}
                        onChange={(e) => setFeatures((arr) => arr.map((x) => x.id === f.id ? { ...x, description: e.target.value } : x))}
                        required
                      />
                    </div>
                  </li>
                ))}
                {!features.length && <li className="text-sm text-foreground/60">No features yet. Add at least one.</li>}
              </ul>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will store, process, and manage data. This includes user information, files, media, and any other data your app needs.">
                    Data Handling & Storage
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={dataHandling} onChange={(e) => setDataHandling(e.target.value)} placeholder="How will data be stored, processed, and managed? (e.g., user data, files, media)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe what data you'll store (user profiles, files, images, etc.) and how it will be organized and managed.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  <TooltipWrapper content="Additional capabilities your app might need beyond basic features. These enhance functionality and user experience.">
                    Additional Feature Capabilities
                  </TooltipWrapper>
                </Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="offlineSupport" checked={offlineSupport} onChange={(e) => setOfflineSupport(e.target.checked)} />
                  <Label htmlFor="offlineSupport" className="font-normal">
                    <TooltipWrapper content="Your app works even when users don't have internet connection. Data syncs when connection is restored.">
                      Offline Support
                    </TooltipWrapper>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pushNotifications" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
                  <Label htmlFor="pushNotifications" className="font-normal">
                    <TooltipWrapper content="Notifications sent to users' devices even when they're not using your app. Like text messages from your app.">
                      Push Notifications
                    </TooltipWrapper>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="backgroundProcesses" checked={backgroundProcesses} onChange={(e) => setBackgroundProcesses(e.target.checked)} />
                  <Label htmlFor="backgroundProcesses" className="font-normal">
                    <TooltipWrapper content="Tasks your app does automatically in the background, like syncing data or processing files, without user interaction.">
                      Background Processes
                    </TooltipWrapper>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="realTimeFeatures" checked={realTimeFeatures} onChange={(e) => setRealTimeFeatures(e.target.checked)} />
                  <Label htmlFor="realTimeFeatures" className="font-normal">
                    <TooltipWrapper content="Features that update instantly, like live chat, real-time collaboration, or live updates that appear immediately.">
                      Real-time Features
                    </TooltipWrapper>
                  </Label>
                </div>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will handle and display errors to users. Good error handling shows helpful messages instead of confusing technical errors.">
                    Error Handling Strategy
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={errorHandling} onChange={(e) => setErrorHandling(e.target.value)} placeholder="How should errors be handled and displayed to users? (e.g., friendly error messages, retry options)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about how users should see errors. Friendly messages like "Something went wrong, please try again" are better than technical error codes.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="External services or tools your app needs to connect with, like payment processors, email services, or cloud storage.">
                    Third-Party Integrations
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={thirdPartyIntegrations} onChange={(e) => setThirdPartyIntegrations(e.target.value)} placeholder="List any third-party services, APIs, or tools to integrate (e.g., Stripe, SendGrid, AWS)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: List services you need: payment (Stripe, PayPal), email (SendGrid, Mailchimp), storage (AWS, Google Cloud), etc.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">User Experience & Design</h2>
              <div>
                <Label>
                  <TooltipWrapper content="Pre-built design components and UI elements you want to use. These provide ready-made buttons, forms, and other interface elements.">
                    Pre-built Component Library
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="prebuiltComponents" className="sr-only">Pre-built Component Library</Label>
                <select
                  id="prebuiltComponents"
                  aria-label="Pre-built Component Library"
                  className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={prebuiltComponents}
                  onChange={(e) => setPrebuiltComponents(e.target.value)}
                  required
                >
                  <option value="shadcn-ui">shadcn-ui</option>
                  <option value="kero-ui">Kero UI</option>
                  <option value="tweak-cn">Tweak CN</option>
                  <option value="custom">Custom/Build from scratch</option>
                </select>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Component libraries provide ready-made UI elements. shadcn-ui is popular and customizable. Custom means building everything from scratch.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="The visual style and aesthetic you want for your app. This describes how it should look and feel to users.">
                    Look & Feel / Design Style
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={lookAndFeel} onChange={(e) => setLookAndFeel(e.target.value)} placeholder="Describe the desired look and feel (e.g., modern, minimalist, colorful, professional)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Use descriptive words like: modern, minimalist, colorful, professional, playful, elegant, bold, etc.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Your brand's visual identity including colors, fonts, logo usage, and the tone of voice used in your app.">
                    Branding Guidelines
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={brandingGuidelines} onChange={(e) => setBrandingGuidelines(e.target.value)} placeholder="Brand colors, fonts, logo usage, tone of voice (e.g., 'Blue and white, modern sans-serif font, friendly and approachable')" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe your brand colors, fonts, logo placement, and the tone (professional, friendly, playful, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Design patterns and styles that guide how your app's interface is organized and how users interact with it.">
                    UI/UX Patterns
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Material Design", "iOS Human Interface", "Custom", "Minimalist", "Card-based", "Dashboard-style"].map((pattern) => {
                    const active = uiuxPatterns.includes(pattern);
                    return (
                      <button
                        key={pattern}
                        type="button"
                        onClick={() => setUiuxPatterns((arr) => (arr.includes(pattern) ? arr.filter((x) => x !== pattern) : [...arr, pattern]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {pattern}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Material Design = Google's style. iOS Human Interface = Apple's style. Custom = your own style. Select patterns that match your vision.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How users will move around your app and access different sections. This is like the menu system of your app.">
                    Navigation Structure
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={navigationStructure} onChange={(e) => setNavigationStructure(e.target.value)} placeholder="How should users navigate? (e.g., sidebar, top nav, tabs, bottom nav)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe the navigation style: sidebar menu, top navigation bar, bottom tabs (like mobile apps), or a combination.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="The main pages or screens your app will have. These are the different views users will see as they use your app.">
                    Key Screens / Pages
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 space-y-2">
                  {keyScreens.map((screen, i) => (
                    <div key={i} className="flex gap-2">
                      <Label htmlFor={`key-screen-${i}`} className="sr-only">Key Screen {i + 1}</Label>
                      <Input
                        id={`key-screen-${i}`}
                        value={screen}
                        onChange={(e) => setKeyScreens((arr) => arr.map((s, idx) => idx === i ? e.target.value : s))}
                        placeholder="Screen name (e.g., Home, Dashboard, Profile)"
                        required
                      />
                      <Button variant="outline" size="sm" onClick={() => setKeyScreens((arr) => arr.filter((_, idx) => idx !== i))}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" variant="outline" size="sm" onClick={() => setKeyScreens((arr) => [...arr, ""])}>Add Screen</Button>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: List the main pages: Home, Login, Dashboard, Profile, Settings, etc. Think about what screens users need to accomplish their goals.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  <TooltipWrapper content="Additional user experience features that enhance how users interact with your app.">
                    Additional UX Features
                  </TooltipWrapper>
                </Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="multiLanguageSupport" checked={multiLanguageSupport} onChange={(e) => setMultiLanguageSupport(e.target.checked)} />
                  <Label htmlFor="multiLanguageSupport" className="font-normal">
                    <TooltipWrapper content="Your app can display in multiple languages, allowing users to choose their preferred language.">
                      Multi-language Support
                    </TooltipWrapper>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="themeCustomization" checked={themeCustomization} onChange={(e) => setThemeCustomization(e.target.checked)} />
                  <Label htmlFor="themeCustomization" className="font-normal">
                    <TooltipWrapper content="Users can switch between light and dark themes, or customize colors to their preference.">
                      Theme Customization (Dark/Light mode)
                    </TooltipWrapper>
                  </Label>
                </div>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Features that make your app usable by people with disabilities, ensuring everyone can use your app effectively.">
                    Accessibility Features
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Screen reader support", "Keyboard navigation", "High contrast", "ARIA labels", "Focus indicators"].map((feature) => {
                    const active = accessibilityFeatures.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => setAccessibilityFeatures((arr) => (arr.includes(feature) ? arr.filter((x) => x !== feature) : [...arr, feature]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {feature}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These make your app accessible to everyone. Screen reader = for visually impaired. Keyboard navigation = use without mouse. High contrast = easier to see. ARIA labels = help screen readers. Focus indicators = show where you are.
                </p>
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
                <Label>
                  <TooltipWrapper content="The technology framework that powers your app's user interface. These are popular tools developers use to build interactive web applications.">
                    What technology should power your app's interface?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["React", "Vue", "Angular", "Next.js", "Svelte", "Remix"].map((fw) => {
                    const active = frontendFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => setFrontendFrameworks((arr) => (arr.includes(fw) ? arr.filter((x) => x !== fw) : [...arr, fw]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {fw}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: If you're not sure, React or Next.js are popular choices. You can select multiple if needed.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Tools that package and optimize your app code so it runs efficiently in users' browsers. Think of it as preparing your app for delivery.">
                    How should your app be prepared for users?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={buildTools} onChange={(e) => setBuildTools(e.target.value)} placeholder="e.g., Vite, Webpack, Turbopack, or describe your build process needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: If you don't know, you can write "automated build process" or leave it to be determined.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Which web browsers should your app work in? Different browsers may need different support.">
                    Which browsers should your app work on?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={browserCompatibility} onChange={(e) => setBrowserCompatibility(e.target.value)} placeholder="e.g., Chrome 90+, Safari 14+, Firefox 88+, or 'all modern browsers'" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Most apps support "all modern browsers" (Chrome, Firefox, Safari, Edge from recent years).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app remembers and updates information as users interact with it. Think of it like the app's memory system that tracks what users do.">
                    How should your app remember information?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={stateManagement} onChange={(e) => setStateManagement(e.target.value)} placeholder="e.g., Redux, Zustand, Jotai, Context API, or describe what needs to be remembered" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: If you're not sure, just describe what your app needs to remember (like user preferences, shopping cart items, login status, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Design systems and styling tools that help create consistent, beautiful user interfaces. These provide pre-built components and styling.">
                    What design system should your app use?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={uiLibraries} onChange={(e) => setUiLibraries(e.target.value)} placeholder="e.g., Tailwind CSS, Material-UI, Chakra UI, or describe your design needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These help make your app look professional and consistent. Tailwind CSS is a popular choice.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Techniques to make your app load faster and run more smoothly. These help improve user experience by reducing wait times.">
                    How should your app load quickly?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Code splitting", "Lazy loading", "Image optimization", "Bundle size optimization", "CDN usage"].map((opt) => {
                    const active = frontendOptimization.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFrontendOptimization((arr) => (arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These are all good practices for making apps fast. You can select multiple options.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="The way your app sends and receives data from backend servers. This is how the user interface communicates with the server to get or save information.">
                    How should your app communicate with servers?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={apiStructure} onChange={(e) => setApiStructure(e.target.value)} placeholder="e.g., REST, GraphQL, tRPC, or describe how your app needs to exchange data with the server" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: REST is the most common approach. If you're not sure, describe what your app needs to send or receive (like user data, files, messages, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will be tested to ensure it works correctly. Testing helps catch bugs and ensures features work as expected before users see them.">
                    How should your app be tested?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={frontendTesting} onChange={(e) => setFrontendTesting(e.target.value)} placeholder="e.g., Jest, Vitest, Playwright, Cypress, or describe your testing needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Testing ensures quality. If you're not sure, describe what you want to test (like user interactions, forms, navigation, etc.).
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Tech Stack - Backend</h2>
              <div>
                <Label>
                  <TooltipWrapper content="The programming language and runtime environment that powers your app's server. This handles the business logic and data processing.">
                    What technology should power your app's server?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={backend} onChange={(e) => setBackend(e.target.value)} placeholder="e.g., Node.js, Python, or describe your server technology needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Node.js and Python are popular choices. If you're not sure, describe what your server needs to do.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Tools and libraries that help build and organize your server code. These provide structure and common functionality.">
                    What tools should handle server logic?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Express", "FastAPI", "NestJS", "Django", "Flask", "Spring Boot", "Laravel"].map((fw) => {
                    const active = backendFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => setBackendFrameworks((arr) => (arr.includes(fw) ? arr.filter((x) => x !== fw) : [...arr, fw]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {fw}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These are popular server frameworks. Express (Node.js) and FastAPI (Python) are common choices.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Where your app stores its data permanently. Think of it as the app's filing cabinet where all information is kept.">
                    How should your app store data?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="e.g., PostgreSQL, MongoDB, or describe your data storage needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: PostgreSQL is great for structured data, MongoDB for flexible data. If unsure, describe what kind of data you'll store.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Where your app will be hosted and run on the internet. This is like choosing where your app's home will be.">
                    Where should your app be hosted?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={hostingPreferences} onChange={(e) => setHostingPreferences(e.target.value)} placeholder="e.g., AWS, Vercel, Railway, Heroku, self-hosted, or describe your hosting needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Vercel and Railway are beginner-friendly. AWS offers more control. If unsure, describe your hosting requirements.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Temporary storage for frequently accessed data to make your app faster. Like keeping commonly used items on your desk instead of in a filing cabinet.">
                    How should your app store frequently used data?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={cachingNeeds} onChange={(e) => setCachingNeeds(e.target.value)} placeholder="e.g., Redis, Memcached, in-memory caching, or describe what data should be cached" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Caching speeds up your app. If you're not sure, describe what data is accessed frequently (like user sessions, product listings, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="A way to update your API without breaking existing functionality. Like versioning documents so old versions still work while new ones are added.">
                    How should your app handle API changes over time?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={apiVersioning} onChange={(e) => setApiVersioning(e.target.value)} placeholder="e.g., /v1/, /v2/, header-based, or describe your versioning needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Versioning lets you update your app without breaking existing integrations. URL-based versioning (/v1/, /v2/) is common.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="The number of users or requests you expect your app to handle. This helps determine the infrastructure needed.">
                    How many users do you expect?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={expectedTraffic} onChange={(e) => setExpectedTraffic(e.target.value)} placeholder="e.g., 1000 requests/day, 10K requests/hour, or describe your expected usage" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Be realistic about your expected usage. This helps plan for the right infrastructure size.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="The method your app uses to request and receive data from servers. This is how your app gets information it needs.">
                    How should your app get data from servers?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={dataFetching} onChange={(e) => setDataFetching(e.target.value)} placeholder="e.g., REST, GraphQL, WebSockets, Server-Sent Events, or describe your data needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: REST is most common. WebSockets are for real-time updates. If unsure, describe how your app needs to get data (one-time requests, real-time updates, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Tools to record events and monitor app performance and errors. Like a dashboard that shows what's happening in your app.">
                    How should your app track what's happening?
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="loggingMonitoring" className="sr-only">Logging & Monitoring</Label>
                <Textarea
                  id="loggingMonitoring"
                  className="mt-2"
                  rows={2}
                  value={loggingMonitoring}
                  onChange={(e) => setLoggingMonitoring(e.target.value)}
                  placeholder="e.g., Winston, Pino, Datadog, Sentry, or describe what you want to track"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Monitoring helps you understand app performance and catch errors. If unsure, describe what you want to track (errors, user activity, performance, etc.).
                </p>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Security & Compliance</h2>
              <div>
                <Label>
                  <TooltipWrapper content="Security features that protect your app and user data. These help prevent unauthorized access and keep information safe.">
                    What security features does your app need?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Auth required", "RBAC", "Encrypt at rest", "Encrypt in transit", "2FA"]
                    .map((t) => {
                      const active = securityReqs.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setSecurityReqs((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Auth required = users must log in. RBAC = different permission levels. Encrypt at rest/transit = data protection. 2FA = extra login security.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Personal or confidential information that requires special protection. This includes things like passwords, credit card numbers, health records, or personal identification.">
                    What sensitive information will your app handle?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={sensitiveData} onChange={(e) => setSensitiveData(e.target.value)} placeholder="e.g., passwords, payment info, health data, personal identification, or describe sensitive data" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Be specific about what sensitive data you'll handle. This helps determine the security measures needed.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How users will log in to your app. Different methods offer different levels of security and user convenience.">
                    How should users log in?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Email/Password", "OAuth (Google, GitHub)", "Magic Links", "Biometric", "SSO", "JWT", "Session-based"].map((method) => {
                    const active = authenticationMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setAuthenticationMethods((arr) => (arr.includes(method) ? arr.filter((x) => x !== method) : [...arr, method]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {method}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Email/Password is standard. OAuth lets users sign in with Google/GitHub. Magic Links = passwordless login. Biometric = fingerprint/face ID. SSO = single sign-on for organizations.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Defining who can access what in your app. Different users may have different permission levels (like admin vs regular user).">
                    Who can access what in your app?
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="authorizationLevels" className="sr-only">Authorization Levels</Label>
                <Textarea
                  id="authorizationLevels"
                  className="mt-2"
                  rows={2}
                  value={authorizationLevels}
                  onChange={(e) => setAuthorizationLevels(e.target.value)}
                  placeholder="e.g., Admin (full access), User (limited access), Guest (read-only), or describe user roles and permissions"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about who needs access to what features. Common roles: Admin, User, Guest, Moderator, Manager, etc.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Methods to protect sensitive data like passwords and personal information. Encryption scrambles data, hashing secures passwords.">
                    How should sensitive data be protected?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={encryptionHashing} onChange={(e) => setEncryptionHashing(e.target.value)} placeholder="e.g., bcrypt, Argon2, AES-256, or describe your data protection needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These protect passwords and sensitive data. If you're not sure, describe what needs protection (passwords, payment info, personal data, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Security threats that should be prevented. These are common ways attackers try to compromise apps, and your app should be protected against them.">
                    What security threats should be prevented?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["SQL Injection", "XSS", "CSRF", "Rate Limiting", "Input Validation", "Dependency Scanning"].map((vuln) => {
                    const active = vulnerabilityPrevention.includes(vuln);
                    return (
                      <button
                        key={vuln}
                        type="button"
                        onClick={() => setVulnerabilityPrevention((arr) => (arr.includes(vuln) ? arr.filter((x) => x !== vuln) : [...arr, vuln]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {vuln}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These are all important security protections. SQL Injection/XSS/CSRF = attack prevention. Rate Limiting = prevent abuse. Input Validation = check user input. Dependency Scanning = check for vulnerabilities.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="securityAuditing" checked={securityAuditing} onChange={(e) => setSecurityAuditing(e.target.checked)} />
                <Label htmlFor="securityAuditing" className="font-normal">
                  <TooltipWrapper content="Regular security reviews to check for vulnerabilities and ensure your app stays secure over time.">
                    Regular Security Auditing Required
                  </TooltipWrapper>
                </Label>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Limiting how many requests users can make to prevent abuse and protect your app from being overwhelmed.">
                    How should your app prevent abuse?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={rateLimiting} onChange={(e) => setRateLimiting(e.target.value)} placeholder="e.g., 100 requests/minute per IP, token bucket, or describe your abuse prevention needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: This prevents users from making too many requests too quickly, which could slow down or crash your app.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Regulations and standards your app must follow based on your industry or location. These ensure legal compliance and data protection.">
                    What regulations must your app follow?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["GDPR", "HIPAA", "SOC 2", "PCI DSS", "CCPA"]
                    .map((t) => {
                      const active = compliance.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setCompliance((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: GDPR = EU data protection. HIPAA = US health data. SOC 2 = security standards. PCI DSS = payment card data. CCPA = California privacy. Select based on your industry/location.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Privacy features that protect user data and give users control over their information. These are often required by law.">
                    What privacy features are needed?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Right to deletion", "Data portability", "Consent management", "Privacy by design", "Data minimization"].map((req) => {
                    const active = dataPrivacy.includes(req);
                    return (
                      <button
                        key={req}
                        type="button"
                        onClick={() => setDataPrivacy((arr) => (arr.includes(req) ? arr.filter((x) => x !== req) : [...arr, req]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {req}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Right to deletion = users can delete their data. Data portability = users can export their data. Consent management = ask permission before collecting data. Privacy by design = build privacy in from the start. Data minimization = only collect what's needed.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dataRetention">
                    <TooltipWrapper content="How long user data should be kept before being automatically deleted. This helps with privacy and compliance.">
                      How long should data be kept?
                    </TooltipWrapper>
                  </Label>
                  <select
                    id="dataRetention"
                    aria-label="Select Data Retention"
                    className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    required
                  >
                    {["30 days", "90 days", "1 year", "7 years", "Indefinite"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">
                    <TooltipWrapper content="How often your app's data should be backed up to prevent data loss. Regular backups protect against accidents or failures.">
                      How often should data be backed up?
                    </TooltipWrapper>
                  </Label>
                  <select
                    id="backupFrequency"
                    aria-label="Select Backup Frequency"
                    className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={backupFrequency}
                    onChange={(e) => setBackupFrequency(e.target.value)}
                    required
                  >
                    {["Hourly", "Daily", "Weekly"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Functionality & Logic</h2>
              <div>
                <Label>
                  <TooltipWrapper content="The main rules and processes your app follows to accomplish its purpose. These are the core operations that make your app work.">
                    What are the main rules and processes your app follows?
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="coreBusinessLogic" className="sr-only">Core Business Logic</Label>
                <Textarea
                  id="coreBusinessLogic"
                  className="mt-2"
                  rows={4}
                  value={coreBusinessLogic}
                  onChange={(e) => setCoreBusinessLogic(e.target.value)}
                  placeholder="Describe the main processes, rules, and workflows your app needs to handle..."
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about what your app does step-by-step. For example: "Users can create accounts, upload files, share with others, and receive notifications."
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Artificial intelligence or machine learning features that make your app smarter, like recommendations, predictions, or automated responses.">
                    Does your app use artificial intelligence?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={aiMlIntegrations} onChange={(e) => setAiMlIntegrations(e.target.value)} placeholder="e.g., recommendations, predictions, automated responses, image recognition, or describe AI features" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: AI features include things like product recommendations, smart search, chatbots, image recognition, or automated content generation.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will handle payments, subscriptions, or other ways to make money. This includes processing transactions and managing billing.">
                    How will your app handle payments?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={paymentsMonetization} onChange={(e) => setPaymentsMonetization(e.target.value)} placeholder="e.g., one-time payments, subscriptions, pricing models, or describe your payment needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe how users will pay (credit cards, subscriptions, one-time purchases, etc.) and what pricing model you'll use.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Special features that make your app unique or different from competitors. These are custom capabilities specific to your app.">
                    What unique features does your app have?
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="customFunctionalities" className="sr-only">Custom Functionalities</Label>
                <Textarea
                  id="customFunctionalities"
                  className="mt-2"
                  rows={3}
                  value={customFunctionalities}
                  onChange={(e) => setCustomFunctionalities(e.target.value)}
                  placeholder="Describe any unique or custom features specific to your app"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about what makes your app special. What features set it apart from similar apps?
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Other services or systems your app needs to connect with, like customer management tools, email services, or business software.">
                    What other services should your app connect to?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={externalSystems} onChange={(e) => setExternalSystems(e.target.value)} placeholder="e.g., CRM, ERP, email services, payment processors, or describe external integrations" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: List any third-party services you need (like Stripe for payments, SendGrid for emails, Salesforce for CRM, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Rules that check if user input is correct and valid. These ensure data quality and prevent errors.">
                    What rules should your app enforce?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={validationRules} onChange={(e) => setValidationRules(e.target.value)} placeholder="e.g., email format checks, required fields, data format validation, or describe validation needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about what needs to be checked (email formats, password strength, required fields, number ranges, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Tasks your app should do automatically in the background, like sending emails, processing data, or generating reports.">
                    What tasks should your app do automatically?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={backgroundJobs} onChange={(e) => setBackgroundJobs(e.target.value)} placeholder="e.g., email sending, data processing, report generation, or describe automated tasks" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: These are tasks that happen without user interaction, like sending welcome emails, processing uploads, or generating daily reports.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="multiTenancy" checked={multiTenancy} onChange={(e) => setMultiTenancy(e.target.checked)} />
                <Label htmlFor="multiTenancy" className="font-normal">
                  <TooltipWrapper content="Support for multiple organizations or companies using the same app instance, where each organization's data is kept separate.">
                    Multi-tenancy Support Required
                  </TooltipWrapper>
                </Label>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will handle updates and changes to the database structure over time without losing data.">
                    How should your app handle updates?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={updateMigrations} onChange={(e) => setUpdateMigrations(e.target.value)} placeholder="e.g., database migrations, version updates, or describe your update process needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: This is about safely updating your app and database structure without breaking existing functionality or losing data.
                </p>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Error-Fixing & Maintenance</h2>
              <div>
                <Label>
                  <TooltipWrapper content="Problems or errors your app might encounter during normal operation. Thinking about these helps plan how to handle them gracefully.">
                    What errors might your app encounter?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={4} value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} placeholder="e.g., network failures, validation errors, API timeouts, or describe potential issues" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Common issues include network problems, invalid user input, server errors, or timeouts. Describe what could go wrong.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="errorLogTemplates" checked={errorLogTemplates} onChange={(e) => setErrorLogTemplates(e.target.checked)} />
                <Label htmlFor="errorLogTemplates" className="font-normal">
                  <TooltipWrapper content="Generate templates for logging errors in a consistent format, making it easier to track and fix problems.">
                    Generate Error Log Templates
                  </TooltipWrapper>
                </Label>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How problems will be identified and fixed. This includes tools and processes for finding and resolving issues.">
                    How should problems be identified and fixed?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={debuggingStrategies} onChange={(e) => setDebuggingStrategies(e.target.value)} placeholder="e.g., error tracking tools, logging systems, or describe your debugging approach" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Describe how you'll track errors (tools like Sentry), log important events, and investigate problems when they occur.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will handle version changes over time. This ensures updates don't break existing functionality.">
                    How should your app handle version changes?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={versioningUpdates} onChange={(e) => setVersioningUpdates(e.target.value)} placeholder="e.g., semantic versioning, feature flags, or describe your versioning approach" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Versioning helps track changes and roll out updates safely. Semantic versioning (1.0.0, 1.1.0, 2.0.0) is common.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Regular tasks needed to keep your app running smoothly, like cleaning up old data, updating dependencies, or clearing caches.">
                    What regular maintenance is needed?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={maintenanceTasks} onChange={(e) => setMaintenanceTasks(e.target.value)} placeholder="e.g., database cleanup, cache clearing, dependency updates, or describe maintenance needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about ongoing tasks like removing old data, updating libraries, clearing temporary files, or optimizing performance.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Different ways to test your app to ensure it works correctly. Each type tests different aspects of functionality.">
                    What types of testing should be done?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Unit tests", "Integration tests", "E2E tests", "Performance tests", "Security tests", "Load tests"].map((type) => {
                    const active = testingTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTestingTypes((arr) => (arr.includes(type) ? arr.filter((x) => x !== type) : [...arr, type]))}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {type}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Unit = test individual pieces. Integration = test how pieces work together. E2E = test full user flows. Performance = test speed. Security = test safety. Load = test under heavy usage.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Tools that automatically test and deploy your app when you make changes. This automates the process of releasing updates.">
                    How should updates be automatically deployed?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={cicdTools} onChange={(e) => setCicdTools(e.target.value)} placeholder="e.g., GitHub Actions, GitLab CI, Jenkins, CircleCI, or describe your deployment automation needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: CI/CD automates testing and deployment. GitHub Actions is popular and beginner-friendly. If unsure, describe your deployment needs.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How to undo a deployment if something goes wrong. This is like having an emergency backup plan.">
                    How should failed updates be handled?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={rollbackPlans} onChange={(e) => setRollbackPlans(e.target.value)} placeholder="e.g., automatic rollback, manual revert process, or describe your rollback strategy" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: This is your safety net if a new version breaks something. Describe how you'll quickly revert to the previous working version.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How you'll collect feedback from users about bugs and improvements, and how you'll act on that feedback.">
                    How will you collect and act on user feedback?
                  </TooltipWrapper>
                </Label>
                <Label htmlFor="userFeedbackLoops" className="sr-only">User Feedback Loops</Label>
                <Textarea
                  id="userFeedbackLoops"
                  className="mt-2"
                  rows={2}
                  value={userFeedbackLoops}
                  onChange={(e) => setUserFeedbackLoops(e.target.value)}
                  placeholder="e.g., in-app feedback forms, email support, bug reporting, or describe your feedback process"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about how users will report bugs or suggest improvements, and how you'll prioritize and implement those changes.
                </p>
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Performance & Scale</h2>
              <div>
                <Label htmlFor="expectedUsers">
                  <TooltipWrapper content="The approximate number of users you expect to use your app. This helps plan for the right infrastructure size.">
                    How many users do you expect?
                  </TooltipWrapper>
                </Label>
                <select id="expectedUsers" title="Select Expected Users" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" value={expectedUsers} onChange={(e) => setExpectedUsers(e.target.value)} required>
                  {["< 100", "100-1K", "1K-10K", "10K-100K", "100K-1M", "1M+"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Be realistic about your expected user count. This helps determine server capacity and infrastructure needs.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Performance features that are important for your app, like speed, reliability, or real-time capabilities.">
                    What performance features are important?
                  </TooltipWrapper>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Real-time updates", "Offline support", "Low latency (<200ms)", "High availability (99.9%+)"]
                    .map((t) => {
                      const active = perfRequirements.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setPerfRequirements((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}
                          className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                        >{active && <span className="mr-1">✓</span>}{t}</button>
                      );
                    })}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Real-time = instant updates. Offline = works without internet. Low latency = fast responses. High availability = rarely goes down.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Specific speed and performance goals for your app, like how fast pages should load or how quickly the app should respond.">
                    What are your speed and performance goals?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={performanceBenchmarks} onChange={(e) => setPerformanceBenchmarks(e.target.value)} placeholder="e.g., page load < 2s, API response < 500ms, or describe your performance targets" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Set realistic targets. For example: "Pages should load in under 2 seconds" or "Search results should appear instantly."
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Optimizations to make your app work well on slow internet connections, older devices, or limited mobile data plans.">
                    How should your app work on slow connections?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={deviceNetworkOptimization} onChange={(e) => setDeviceNetworkOptimization(e.target.value)} placeholder="e.g., optimize for slow networks, low-end devices, mobile data constraints, or describe optimization needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about users on slow WiFi or limited mobile data. Describe how your app should handle these situations.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will handle growth and increased usage over time. This ensures your app can grow without problems.">
                    How should your app handle growth?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={scalabilityPlans} onChange={(e) => setScalabilityPlans(e.target.value)} placeholder="e.g., horizontal scaling, vertical scaling, auto-scaling, or describe your scaling needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Scaling means handling more users. Horizontal = add more servers. Vertical = make servers more powerful. Auto-scaling = automatic adjustment.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will store frequently accessed data temporarily to improve speed and reduce server load.">
                    How should your app store data for speed?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={cachingStrategies} onChange={(e) => setCachingStrategies(e.target.value)} placeholder="e.g., browser cache, CDN, server-side cache, or describe your caching needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Caching stores data temporarily to make your app faster. Browser cache = user's device. CDN = global network. Server cache = server memory.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will be found in search engines like Google. This helps users discover your app through search.">
                    How should your app be found in search engines?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={seoConsiderations} onChange={(e) => setSeoConsiderations(e.target.value)} placeholder="e.g., meta tags, structured data, sitemap, or describe your SEO needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: SEO helps your app appear in search results. If you want users to find your app via Google, describe your SEO needs.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Mobile-specific features and optimizations to ensure your app works well on phones and tablets.">
                    What mobile-specific features are needed?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={mobileOptimizations} onChange={(e) => setMobileOptimizations(e.target.value)} placeholder="e.g., responsive design, touch interactions, mobile performance, or describe mobile needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Mobile optimization includes touch-friendly buttons, fast loading on mobile networks, and working well on small screens.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="loadTesting" checked={loadTesting} onChange={(e) => setLoadTesting(e.target.checked)} />
                <Label htmlFor="loadTesting" className="font-normal">
                  <TooltipWrapper content="Testing your app under heavy load to ensure it can handle many users at once without crashing or slowing down.">
                    Load Testing Required
                  </TooltipWrapper>
                </Label>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Environmental impact considerations, like energy efficiency or carbon footprint. This is about making your app more sustainable.">
                    What environmental impact considerations are important?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={environmentalConsiderations} onChange={(e) => setEnvironmentalConsiderations(e.target.value)} placeholder="e.g., energy efficiency, carbon footprint, green hosting, or describe environmental goals" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: This is about making your app more environmentally friendly, like using green hosting or optimizing for energy efficiency.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How you'll measure if your app is successful. These are the metrics and indicators that show your app is working well.">
                    How will you measure success?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., user engagement, conversion rates, performance metrics, or describe your success indicators" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about what success looks like (user signups, daily active users, sales, engagement, etc.). These are your key performance indicators.
                </p>
              </div>
            </div>
          )}

          {currentStep === 11 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Development Preferences</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="codeStyle">
                    <TooltipWrapper content="How code should be written and organized. This includes coding standards, formatting, and structure preferences.">
                      How should code be written and organized?
                    </TooltipWrapper>
                  </Label>
                  <textarea id="codeStyle" title="Enter Code Style Preferences" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} placeholder="e.g., clean code, consistent formatting, or describe code style preferences" required />
                </div>
                <div>
                  <Label htmlFor="testingApproach">
                    <TooltipWrapper content="How code should be tested to ensure it works correctly. This includes testing methods and strategies.">
                      How should code be tested?
                    </TooltipWrapper>
                  </Label>
                  <textarea id="testingApproach" title="Enter Testing Approach" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={testingApproach} onChange={(e) => setTestingApproach(e.target.value)} placeholder="e.g., comprehensive testing, test-driven development, or describe testing approach" required />
                </div>
                <div>
                  <Label htmlFor="docsLevel">
                    <TooltipWrapper content="How much documentation is needed to explain how the code works. This helps future developers understand the codebase.">
                      How much documentation is needed?
                    </TooltipWrapper>
                  </Label>
                  <textarea id="docsLevel" title="Enter Documentation Level" className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" rows={3} value={docsLevel} onChange={(e) => setDocsLevel(e.target.value)} placeholder="e.g., minimal, comprehensive, or describe documentation needs" required />
                </div>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How code changes will be managed and tracked over time. This includes workflows for making and reviewing changes.">
                    How should code changes be managed?
                  </TooltipWrapper>
                </Label>
                <Input className="mt-2" value={versionControl} onChange={(e) => setVersionControl(e.target.value)} placeholder="e.g., Git workflow, branching strategy, commit conventions, or describe version control needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Version control tracks code changes. Git is standard. If unsure, describe how you want to manage code updates.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="How your app will be released and updated. This includes the process of deploying changes to users.">
                    How should your app be released?
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={deploymentDetails} onChange={(e) => setDeploymentDetails(e.target.value)} placeholder="e.g., deployment process, environments (dev, staging, prod), deployment frequency, or describe deployment needs" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Deployment is how updates reach users. Common approach: test in dev, then staging, then production. Describe your release process.
                </p>
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
                <Label>
                  <TooltipWrapper content="Apps or projects similar to what you're building. This helps understand your vision and what already exists in the market.">
                    Similar projects
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={similarProjects} onChange={(e) => setSimilarProjects(e.target.value)} placeholder="Name apps similar to what you're building (e.g., 'Like Instagram but for pets')" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Listing similar apps helps us understand your vision and what features users might expect.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Links to design inspiration, like websites, apps, or designs you like. These help guide the visual style of your app.">
                    Design inspiration (URLs)
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={designInspiration} onChange={(e) => setDesignInspiration(e.target.value)} placeholder="Links to design inspiration (e.g., https://example.com, Figma links, Dribbble, etc.)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Share URLs of designs, websites, or apps you like. This helps create a visual style that matches your vision.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Any special requirements or considerations not covered in the previous steps. This is your chance to add anything important.">
                    Special requirements
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={3} value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} placeholder="Anything not covered above (special constraints, unique needs, etc.)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Use this space for anything important that wasn't covered in previous steps.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Ethical principles your app should follow, like fairness, preventing bias, protecting user privacy, and being transparent.">
                    Ethical Guidelines
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={ethicalGuidelines} onChange={(e) => setEthicalGuidelines(e.target.value)} placeholder="e.g., fairness, bias prevention, user privacy, transparency, or describe ethical considerations" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about how your app should treat users fairly, avoid discrimination, protect privacy, and be transparent about how it works.
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Legal obligations your app must meet, like terms of service, privacy policies, data protection laws, and licensing requirements.">
                    Legal Requirements
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={legalRequirements} onChange={(e) => setLegalRequirements(e.target.value)} placeholder="e.g., terms of service, privacy policy, data protection, licensing, or describe legal obligations" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Consider what legal documents and compliance requirements your app needs (terms, privacy policy, data protection, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Environmental and sustainability goals for your project, like reducing energy consumption or carbon footprint.">
                    Sustainability Goals
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={sustainabilityGoals} onChange={(e) => setSustainabilityGoals(e.target.value)} placeholder="e.g., energy efficiency, carbon footprint reduction, green hosting, or describe sustainability goals" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: If environmental impact is important, describe your sustainability goals (green hosting, energy efficiency, etc.).
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="Features or capabilities you plan to add in the future. This helps plan for future growth and expansion.">
                    Future Expansions
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={futureExpansions} onChange={(e) => setFutureExpansions(e.target.value)} placeholder="Planned future features or expansions (e.g., mobile app, new integrations, additional features)" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: Think about where you want your app to be in the future. What features might you add later?
                </p>
              </div>
              <div>
                <Label>
                  <TooltipWrapper content="What makes your app unique or different from competitors. This helps highlight your app's unique value proposition.">
                    Unique Aspects
                  </TooltipWrapper>
                </Label>
                <Textarea className="mt-2" rows={2} value={uniqueAspects} onChange={(e) => setUniqueAspects(e.target.value)} placeholder="What makes this project unique or different from competitors?" required />
                <p className="text-xs text-foreground/60 mt-1">
                  💡 Tip: What sets your app apart? What unique value does it provide that competitors don't?
                </p>
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
    try { await navigator.clipboard.writeText(content); } catch { }
    alert("Copied! In Cursor, paste into the chat or appropriate file.");
  }
  return (
    <div className={"flex gap-2 " + (compact ? "" : "justify-end")}>
      <Button variant="outline" size="sm" onClick={copy} className="shadow-sm hover:shadow-md">Copy</Button>
      <Button variant="outline" size="sm" onClick={download} className="shadow-sm hover:shadow-md">Download</Button>
      <Button variant="outline" size="sm" onClick={downloadMd} className="shadow-sm hover:shadow-md">Download .md</Button>
      <Button size="sm" onClick={useInCursor} className="shadow-sm hover:shadow-md">Use in Cursor</Button>
    </div>
  );
}

function PreBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre className={"overflow-x-auto rounded-md bg-secondary/10 p-3 text-sm leading-6 ring-1 ring-border " + (className ?? "")}>
      {children}
    </pre>
  );
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, "_");
}



