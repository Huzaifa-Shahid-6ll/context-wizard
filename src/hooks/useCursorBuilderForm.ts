import { useState, useCallback } from "react";
import type { CursorBuilderFormState } from "@/types/cursor-builder";

const defaultFormState: CursorBuilderFormState = {
  // Overview
  projectName: "",
  projectDescription: "",
  projectType: "web app",
  oneSentence: "",
  isNewApp: "new",
  githubUrl: "",
  timeline: "",
  budget: "",
  resourceConstraints: "",
  competitors: "",
  uploadedDocuments: [],

  // Audience
  audienceSummary: { ageRange: '', profession: '', expertiseLevel: '', industry: '', useCase: '' },
  platforms: [],

  // Problem & Goals
  problemStatement: "",
  primaryGoal: "",
  successCriteria: [],
  analyticsTracking: "",

  // Features
  features: [],
  featurePriorities: {},
  dataHandling: "",
  offlineSupport: false,
  pushNotifications: false,
  backgroundProcesses: false,
  errorHandling: "",
  thirdPartyIntegrations: "",
  realTimeFeatures: false,

  // User Experience & Design
  lookAndFeel: "",
  brandingGuidelines: "",
  uiuxPatterns: [],
  navigationStructure: "",
  keyScreens: [],
  multiLanguageSupport: false,
  themeCustomization: false,
  accessibilityFeatures: [],
  prebuiltComponents: "shadcn-ui",

  // Tech Stack - Frontend
  frontend: "React",
  frontendFrameworks: [],
  buildTools: "",
  browserCompatibility: "",
  stateManagement: "",
  uiLibraries: "",
  frontendOptimization: [],
  apiStructure: "",
  frontendTesting: "",

  // Tech Stack - Backend
  backend: "Node.js",
  database: "PostgreSQL",
  tools: [],
  backendFrameworks: [],
  hostingPreferences: "",
  cachingNeeds: "",
  apiVersioning: "",
  expectedTraffic: "",
  dataFetching: "",
  loggingMonitoring: "",

  // Security & Compliance
  securityReqs: [],
  compliance: [],
  dataRetention: "",
  backupFrequency: "",
  sensitiveData: "",
  authenticationMethods: [],
  authorizationLevels: "",
  encryptionHashing: "",
  vulnerabilityPrevention: [],
  securityAuditing: false,
  rateLimiting: "",
  dataPrivacy: [],

  // Functionality & Logic
  coreBusinessLogic: "",
  aiMlIntegrations: "",
  paymentsMonetization: "",
  customFunctionalities: "",
  externalSystems: "",
  validationRules: "",
  backgroundJobs: "",
  multiTenancy: false,
  updateMigrations: "",

  // Error-Fixing & Maintenance
  commonErrors: "",
  errorLogTemplates: false,
  debuggingStrategies: "",
  versioningUpdates: "",
  maintenanceTasks: "",
  testingTypes: [],
  cicdTools: "",
  rollbackPlans: "",
  userFeedbackLoops: "",

  // Performance & Scale
  expectedUsers: "",
  perfRequirements: [],
  performanceBenchmarks: "",
  deviceNetworkOptimization: "",
  scalabilityPlans: "",
  cachingStrategies: "",
  seoConsiderations: "",
  mobileOptimizations: "",
  loadTesting: false,
  environmentalConsiderations: "",
  successMetrics: "",

  // Dev Preferences
  codeStyle: "Clean, readable, typed where applicable",
  testingApproach: "Unit + integration with mocks",
  docsLevel: "Pragmatic with examples",
  versionControl: "",
  deploymentDetails: "",

  // Additional Context
  similarProjects: "",
  designInspiration: "",
  specialRequirements: "",
  ethicalGuidelines: "",
  legalRequirements: "",
  sustainabilityGoals: "",
  futureExpansions: "",
  uniqueAspects: "",

  // Constraints
  mvpDate: "",
  launchDate: "",
  devBudget: "",
  infraBudget: "",
  teamSize: "",

  // Prompt Type Selection
  selectedPromptTypes: {
    frontend: true,
    backend: true,
    security: true,
    functionality: true,
    errorFixing: true,
  },
};

export function useCursorBuilderForm() {
  const [formState, setFormState] = useState<CursorBuilderFormState>(defaultFormState);

  const updateField = useCallback(<K extends keyof CursorBuilderFormState>(
    field: K,
    value: CursorBuilderFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateArrayField = useCallback(<K extends keyof CursorBuilderFormState>(
    field: K,
    value: string,
    action: "add" | "remove" | "toggle"
  ) => {
    setFormState((prev) => {
      const currentValue = prev[field];
      if (!Array.isArray(currentValue)) {
        return prev;
      }
      
      const array = [...currentValue] as string[];
      if (action === "add") {
        return { ...prev, [field]: [...array, value] };
      } else if (action === "remove") {
        return { ...prev, [field]: array.filter((v) => v !== value) };
      } else {
        // toggle
        const index = array.indexOf(value);
        if (index >= 0) {
          array.splice(index, 1);
        } else {
          array.push(value);
        }
        return { ...prev, [field]: array };
      }
    });
  }, []);

  return {
    formState,
    updateField,
    updateArrayField,
    setFormState,
  };
}

