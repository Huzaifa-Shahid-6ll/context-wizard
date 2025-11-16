import type { GeneratedLists, GeneratedPrompts, CurrentPromptIndex } from "./generation";

export type AppType = "new" | "enhancement" | "prototype";
export type FeaturePriority = "must-have" | "nice-to-have";

export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface AudienceSummary {
  ageRange: string;
  profession: string;
  expertiseLevel: string;
  industry: string;
  useCase: string;
}

export interface CursorBuilderFormState {
  // Overview
  projectName: string;
  projectDescription: string;
  projectType: string;
  oneSentence: string;
  isNewApp: AppType;
  githubUrl: string;
  timeline: string;
  budget: string;
  resourceConstraints: string;
  competitors: string;
  uploadedDocuments: File[];

  // Audience
  audienceSummary: AudienceSummary;
  platforms: string[];

  // Problem & Goals
  problemStatement: string;
  primaryGoal: string;
  successCriteria: string[];
  analyticsTracking: string;

  // Features
  features: Feature[];
  featurePriorities: Record<string, FeaturePriority>;
  dataHandling: string;
  offlineSupport: boolean;
  pushNotifications: boolean;
  backgroundProcesses: boolean;
  errorHandling: string;
  thirdPartyIntegrations: string;
  realTimeFeatures: boolean;

  // User Experience & Design
  lookAndFeel: string;
  brandingGuidelines: string;
  uiuxPatterns: string[];
  navigationStructure: string;
  keyScreens: string[];
  multiLanguageSupport: boolean;
  themeCustomization: boolean;
  accessibilityFeatures: string[];
  prebuiltComponents: string;

  // Tech Stack - Frontend
  frontend: string;
  frontendFrameworks: string[];
  buildTools: string;
  browserCompatibility: string;
  stateManagement: string;
  uiLibraries: string;
  frontendOptimization: string[];
  apiStructure: string;
  frontendTesting: string;

  // Tech Stack - Backend
  backend: string;
  database: string;
  tools: string[];
  backendFrameworks: string[];
  hostingPreferences: string;
  cachingNeeds: string;
  apiVersioning: string;
  expectedTraffic: string;
  dataFetching: string;
  loggingMonitoring: string;

  // Security & Compliance
  securityReqs: string[];
  compliance: string[];
  dataRetention: string;
  backupFrequency: string;
  sensitiveData: string;
  authenticationMethods: string[];
  authorizationLevels: string;
  encryptionHashing: string;
  vulnerabilityPrevention: string[];
  securityAuditing: boolean;
  rateLimiting: string;
  dataPrivacy: string[];

  // Functionality & Logic
  coreBusinessLogic: string;
  aiMlIntegrations: string;
  paymentsMonetization: string;
  customFunctionalities: string;
  externalSystems: string;
  validationRules: string;
  backgroundJobs: string;
  multiTenancy: boolean;
  updateMigrations: string;

  // Error-Fixing & Maintenance
  commonErrors: string;
  errorLogTemplates: boolean;
  debuggingStrategies: string;
  versioningUpdates: string;
  maintenanceTasks: string;
  testingTypes: string[];
  cicdTools: string;
  rollbackPlans: string;
  userFeedbackLoops: string;

  // Performance & Scale
  expectedUsers: string;
  perfRequirements: string[];
  performanceBenchmarks: string;
  deviceNetworkOptimization: string;
  scalabilityPlans: string;
  cachingStrategies: string;
  seoConsiderations: string;
  mobileOptimizations: string;
  loadTesting: boolean;
  environmentalConsiderations: string;
  successMetrics: string;

  // Dev Preferences
  codeStyle: string;
  testingApproach: string;
  docsLevel: string;
  versionControl: string;
  deploymentDetails: string;

  // Additional Context
  similarProjects: string;
  designInspiration: string;
  specialRequirements: string;
  ethicalGuidelines: string;
  legalRequirements: string;
  sustainabilityGoals: string;
  futureExpansions: string;
  uniqueAspects: string;

  // Constraints
  mvpDate: string;
  launchDate: string;
  devBudget: string;
  infraBudget: string;
  teamSize: string;

  // Prompt Type Selection
  selectedPromptTypes: {
    frontend: boolean;
    backend: boolean;
    security: boolean;
    functionality: boolean;
    errorFixing: boolean;
  };
}

export interface CursorBuilderGenerationState {
  generationId: string | null;
  generationStep: "form" | "prd" | "user_flows" | "tasks" | "lists" | "prompts" | "summary";
  prdContent: string | null;
  userFlowsContent: string | null;
  taskFileContent: string | null;
  generatedLists: GeneratedLists | null;
  currentPromptIndex: CurrentPromptIndex;
  generatedPrompts: GeneratedPrompts;
  isSubmitting: boolean;
  progress: number;
  result: import("./generation").GenerationResult | null;
  showConfetti: boolean;
  loadingTip: string;
  estimatedTime: number;
  avgGenerationTime: number;
  generationStartTime: number;
  generationError: string | null;
}

