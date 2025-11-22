"use node";

import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateWithOpenRouter } from "../src/lib/openrouter";
import { parseLLMJson } from "./lib/utils";
import { genericFormDataValidator } from "./lib/formDataValidators";

// Create a new generation record
export const createGeneration = mutation({
  args: {
    userId: v.string(),
    projectName: v.string(),
    formData: genericFormDataValidator, // Structured validator for form data
    selectedPromptTypes: v.array(v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("security"),
      v.literal("functionality"),
      v.literal("error_fixing")
    )),
  },
  handler: async (ctx, args) => {
    // Validate project name
    if (!args.projectName || typeof args.projectName !== 'string') {
      throw new Error("INVALID_INPUT: Project name is required");
    }
    if (args.projectName.trim().length === 0) {
      throw new Error("INVALID_INPUT: Project name cannot be empty");
    }
    if (args.projectName.length > 100) {
      throw new Error("INVALID_INPUT: Project name cannot exceed 100 characters");
    }

    // formData is now validated by the validator, but we can add additional checks if needed
    // Validate formData is not null
    if (!args.formData || typeof args.formData !== 'object') {
      throw new Error("INVALID_INPUT: formData must be an object");
    }

    // Validate selectedPromptTypes
    if (!Array.isArray(args.selectedPromptTypes) || args.selectedPromptTypes.length === 0) {
      throw new Error("INVALID_INPUT: At least one prompt type must be selected");
    }

    const now = Date.now();
    const generationId = await ctx.db.insert("appBuilderGenerations", {
      ...args,
      status: "prd_pending",
      generatedPrompts: {},
      createdAt: now,
      updatedAt: now,
    });
    return generationId;
  },
});

// Get generation by ID
export const getGeneration = query({
  args: {
    generationId: v.id("appBuilderGenerations"),
    clerkId: v.string(), // Add authorization check
  },
  handler: async (ctx, { generationId, clerkId }) => {
    const generation = await ctx.db.get(generationId);
    if (!generation) {
      throw new Error("RESOURCE_NOT_FOUND: Generation not found");
    }
    // Verify user owns this generation
    if (generation.userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access this generation");
    }
    return generation;
  },
});

// Update generation status
export const updateGenerationStatus = mutation({
  args: {
    generationId: v.id("appBuilderGenerations"),
    status: v.union(
      v.literal("prd_pending"),
      v.literal("prd_approved"),
      v.literal("user_flows_pending"),
      v.literal("user_flows_approved"),
      v.literal("tasks_pending"),
      v.literal("tasks_approved"),
      v.literal("generating_prompts"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    prd: v.optional(v.string()),
    userFlows: v.optional(v.string()),
    taskFile: v.optional(v.string()),
    screenList: v.optional(v.array(v.string())),
    endpointList: v.optional(v.array(v.string())),
    securityFeatureList: v.optional(v.array(v.string())),
    functionalityFeatureList: v.optional(v.array(v.string())),
    errorScenarioList: v.optional(v.array(v.string())),
    generatedPrompts: v.optional(v.any()),
  },
  handler: async (ctx, { generationId, status, ...updates }) => {
    await ctx.db.patch(generationId, {
      status,
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Helper to sanitize formData for prompt injection
function sanitizeFormData(formData: any): string {
  try {
    // Create a safe subset of formData to avoid huge payloads or sensitive data
    const safeData = {
      projectName: formData.projectName,
      projectDescription: formData.projectDescription,
      techStack: formData.techStack,
      features: formData.features,
      audience: formData.audienceSummary,
      requirements: formData.problemStatement,
      goals: formData.primaryGoal,
    };
    return JSON.stringify(safeData, null, 2);
  } catch {
    return JSON.stringify(formData, null, 2);
  }
}

// Generic step generator to reduce duplication
async function generateStep(
  ctx: any,
  {
    generationId,
    userId,
    prompt,
    statusKey,
    statusValue,
  }: {
    generationId: any;
    userId: string;
    prompt: string;
    statusKey: string;
    statusValue: string;
  }
) {
  // Atomic rate limit check
  const reservation = await ctx.runMutation(api.users.reservePromptCount, { userId });
  if (!reservation.success) {
    throw new Error(`Daily prompt limit reached. Please upgrade to Pro.`);
  }

  // Get user tier
  const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
  const isPro = user?.isPro === true;
  const tier: "free" | "pro" = isPro ? "pro" : "free";

  // Generate content
  const content = await generateWithOpenRouter(prompt, tier);

  // Update generation
  await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
    generationId,
    status: statusValue,
    [statusKey]: content,
  });

  return { [statusKey]: content };
}

// Generate PRD
export const generatePRD = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: genericFormDataValidator,
  },
  handler: async (ctx, { generationId, userId, formData }) => {
    const prdPrompt = `You are an expert product manager and technical writer. Generate a comprehensive Product Requirements Document (PRD) based on the following project information:

${sanitizeFormData(formData)}

The PRD should include:
1. Executive Summary
2. Problem Statement
3. Target Audience
4. User Stories
5. Functional Requirements
6. Non-Functional Requirements
7. Technical Requirements
8. Success Criteria
9. Timeline and Milestones
10. Dependencies and Constraints

Format the output as a well-structured markdown document.`;

    return generateStep(ctx, {
      generationId,
      userId,
      prompt: prdPrompt,
      statusKey: "prd",
      statusValue: "prd_pending",
    });
  },
});

// Generate User Flows
export const generateUserFlows = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: genericFormDataValidator,
    prd: v.string(),
  },
  handler: async (ctx, { generationId, userId, formData, prd }) => {
    const flowsPrompt = `You are a UX designer and product strategist. Based on the following PRD and project information, generate comprehensive User Flow documentation:

PRD:
${prd}

Project Information:
${sanitizeFormData(formData)}

The User Flows document should include:
1. User Personas
2. User Journey Maps
3. Flow Diagrams (text-based)
4. Screen-by-Screen Navigation
5. User Actions and System Responses
6. Edge Cases and Error Flows
7. Decision Points

Format as a well-structured markdown document.`;

    return generateStep(ctx, {
      generationId,
      userId,
      prompt: flowsPrompt,
      statusKey: "userFlows",
      statusValue: "user_flows_pending",
    });
  },
});

// Generate Task File
export const generateTaskFile = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: genericFormDataValidator,
    prd: v.string(),
    userFlows: v.string(),
  },
  handler: async (ctx, { generationId, userId, formData, prd, userFlows }) => {
    const taskPrompt = `You are a project manager and technical lead. Based on the following PRD, User Flows, and project information, generate a comprehensive Task Breakdown with milestone-based organization:

PRD:
${prd}

User Flows:
${userFlows}

Project Information:
${sanitizeFormData(formData)}

The Task File should include:
1. Milestone 1: Foundation (Setup, Infrastructure)
2. Milestone 2: Core Features
3. Milestone 3: Advanced Features
4. Milestone 4: Polish & Optimization
5. Each milestone should have:
   - Task name
   - Description
   - Dependencies
   - Estimated effort
   - Acceptance criteria

Format as a well-structured markdown document with clear milestones and tasks.`;

    return generateStep(ctx, {
      generationId,
      userId,
      prompt: taskPrompt,
      statusKey: "taskFile",
      statusValue: "tasks_pending",
    });
  },
});

// Generate screen/endpoint/feature lists
export const generateLists = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: genericFormDataValidator,
    prd: v.string(),
    userFlows: v.string(),
    selectedPromptTypes: v.array(v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("security"),
      v.literal("functionality"),
      v.literal("error_fixing")
    )),
  },
  handler: async (ctx, { generationId, userId, formData, prd, userFlows, selectedPromptTypes }) => {
    // Get user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    const lists: {
      screenList?: string[];
      endpointList?: string[];
      securityFeatureList?: string[];
      functionalityFeatureList?: string[];
      errorScenarioList?: string[];
    } = {};

    // Helper to generate and parse list
    const generateList = async (prompt: string, fallbackError: string) => {
      try {
        const text = await generateWithOpenRouter(prompt, tier);
        if (!text || text.trim().length === 0) throw new Error("Empty response");

        const parsed = parseLLMJson<string[]>(text, []);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          // Try splitting by newline if JSON parse returned empty or invalid
          return text.split("\n")
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*]\s*/, "").trim())
            .filter(line => line.length > 0);
        }
        return parsed.filter(item => typeof item === "string" && item.trim().length > 0);
      } catch (error: any) {
        console.error(`[generateLists] ${fallbackError}`, { error: error.message });
        throw new Error(`${fallbackError}: ${error.message}`);
      }
    };

    // Generate frontend screen list
    if (selectedPromptTypes.includes("frontend")) {
      const screenPrompt = `Based on the PRD and User Flows, generate a list of all screens/pages needed for the frontend:

PRD:
${prd}

User Flows:
${userFlows}

Return ONLY a JSON array of screen names, like: ["Hero Page", "Login Screen", "Dashboard", ...]`;

      lists.screenList = await generateList(screenPrompt, "Failed to generate screen list");
    }

    // Generate backend endpoint list
    if (selectedPromptTypes.includes("backend")) {
      const endpointPrompt = `Based on the PRD and User Flows, generate a list of all API endpoints needed for the backend:

PRD:
${prd}

User Flows:
${userFlows}

Return ONLY a JSON array of endpoint names, like: ["POST /api/auth/login", "GET /api/users", ...]`;

      lists.endpointList = await generateList(endpointPrompt, "Failed to generate endpoint list");
    }

    // Generate security feature list
    if (selectedPromptTypes.includes("security")) {
      const securityPrompt = `Based on the PRD, generate a list of security features to implement:

PRD:
${prd}

Return ONLY a JSON array of security features, like: ["JWT Authentication", "Password Hashing", ...]`;

      lists.securityFeatureList = await generateList(securityPrompt, "Failed to generate security feature list");
    }

    // Generate functionality feature list
    if (selectedPromptTypes.includes("functionality")) {
      const functionalityPrompt = `Based on the PRD, generate a list of core functionality features:

PRD:
${prd}

Return ONLY a JSON array of functionality feature names as strings, like: ["Contact Management", "User Authentication", "Payment Processing"]`;

      lists.functionalityFeatureList = await generateList(functionalityPrompt, "Failed to generate functionality feature list");
    }

    // Generate error scenario list
    if (selectedPromptTypes.includes("error_fixing")) {
      const errorPrompt = `Based on the PRD and tech stack, generate a list of potential error scenarios:

PRD:
${prd}

Tech Stack: ${(formData as any)?.techStack?.join(", ") || "Not specified"}

Return ONLY a JSON array of error scenarios, like: ["Network timeout", "Invalid input validation", ...]`;

      lists.errorScenarioList = await generateList(errorPrompt, "Failed to generate error scenario list");
    }

    // Final transformation: ensure all list items are strings before saving
    const sanitizedLists: typeof lists = {};
    if (lists.screenList) {
      sanitizedLists.screenList = lists.screenList.map(item =>
        typeof item === "string" ? item : String(item)
      ).filter((item): item is string => typeof item === "string" && item.length > 0);
    }
    if (lists.endpointList) {
      sanitizedLists.endpointList = lists.endpointList.map(item =>
        typeof item === "string" ? item : String(item)
      ).filter((item): item is string => typeof item === "string" && item.length > 0);
    }
    if (lists.securityFeatureList) {
      sanitizedLists.securityFeatureList = lists.securityFeatureList.map(item =>
        typeof item === "string" ? item : String(item)
      ).filter((item): item is string => typeof item === "string" && item.length > 0);
    }
    if (lists.functionalityFeatureList) {
      sanitizedLists.functionalityFeatureList = lists.functionalityFeatureList.map(item => {
        // If it's already a string, return it
        if (typeof item === "string") return item;
        // If it's an object, try to extract the feature name
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          if ("feature" in obj && typeof obj.feature === "string") return obj.feature;
          if ("Feature" in obj && typeof obj.Feature === "string") return obj.Feature;
          if ("name" in obj && typeof obj.name === "string") return obj.name;
          if ("Name" in obj && typeof obj.Name === "string") return obj.Name;
          if ("title" in obj && typeof obj.title === "string") return obj.title;
          if ("Title" in obj && typeof obj.Title === "string") return obj.Title;
        }
        // Last resort: stringify
        return String(item);
      }).filter((item): item is string => typeof item === "string" && item.length > 0);
    }
    if (lists.errorScenarioList) {
      sanitizedLists.errorScenarioList = lists.errorScenarioList.map(item =>
        typeof item === "string" ? item : String(item)
      ).filter((item): item is string => typeof item === "string" && item.length > 0);
    }

    // Validate at least one list was generated
    const totalItems =
      (sanitizedLists.screenList?.length || 0) +
      (sanitizedLists.endpointList?.length || 0) +
      (sanitizedLists.securityFeatureList?.length || 0) +
      (sanitizedLists.functionalityFeatureList?.length || 0) +
      (sanitizedLists.errorScenarioList?.length || 0);

    if (totalItems === 0) {
      console.error(`[generateLists] No items generated in any list`, {
        generationId,
        userId,
        sanitizedLists
      });
      throw new Error("Failed to generate any lists. All list generations returned empty results.");
    }

    console.log(`[generateLists] Successfully generated all lists`, {
      generationId,
      userId,
      totalItems,
      screenListCount: sanitizedLists.screenList?.length || 0,
      endpointListCount: sanitizedLists.endpointList?.length || 0,
      securityListCount: sanitizedLists.securityFeatureList?.length || 0,
      functionalityListCount: sanitizedLists.functionalityFeatureList?.length || 0,
      errorListCount: sanitizedLists.errorScenarioList?.length || 0
    });

    // Update generation with sanitized lists
    await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
      generationId,
      status: "generating_prompts",
      ...sanitizedLists,
    });

    return sanitizedLists;
  },
});

// Generate prompt for a single item (screen, endpoint, etc.)
export const generateItemPrompt = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    itemType: v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("security"),
      v.literal("functionality"),
      v.literal("error_fixing")
    ),
    itemName: v.string(),
    formData: genericFormDataValidator,
    prd: v.string(),
    userFlows: v.string(),
    taskFile: v.string(),
    prebuiltComponents: v.optional(v.string()),
  },
  handler: async (ctx, { generationId, userId, itemType, itemName, formData, prd, userFlows, taskFile, prebuiltComponents }) => {
    // Atomic rate limit check
    const reservation = await ctx.runMutation(api.users.reservePromptCount, { userId });
    if (!reservation.success) {
      throw new Error(`Daily prompt limit reached. Please upgrade to Pro.`);
    }

    // Get user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    // Build item-specific prompt
    let itemPrompt = "";

    if (itemType === "frontend") {
      const componentInstruction = prebuiltComponents && prebuiltComponents !== "custom"
        ? `Use ${prebuiltComponents} components. Specifically reference which components to use (e.g., Button from shadcn-ui, Card from shadcn-ui).`
        : "Build custom components from scratch.";

      itemPrompt = `You are an expert frontend developer. Generate a comprehensive prompt for building the "${itemName}" screen/component.

PRD:
${prd}

User Flows:
${userFlows}

Task File:
${taskFile}

Project Information:
${sanitizeFormData(formData)}

Component Library: ${componentInstruction}

Generate a detailed, context-engineered prompt that includes:
1. Clear command for what to build
2. Full context from PRD and User Flows
3. Step-by-step logic
4. Expert persona (senior frontend developer)
5. Precise formatting requirements
6. Component specifications
7. State management approach
8. API integration points

The prompt should be self-contained and ready to paste into a coding AI. Include a 5-line explanation in simple language at the end explaining what this prompt will generate.`;
    } else if (itemType === "backend") {
      itemPrompt = `You are an expert backend developer. Generate a comprehensive prompt for implementing the "${itemName}" endpoint/feature.

PRD:
${prd}

User Flows:
${userFlows}

Task File:
${taskFile}

Project Information:
${sanitizeFormData(formData)}

Generate a detailed, context-engineered prompt that includes:
1. Clear command for what to build
2. Full context from PRD and User Flows
3. Step-by-step logic
4. Expert persona (senior backend developer)
5. Precise formatting requirements
6. API specifications (method, route, params, response)
7. Database interactions
8. Error handling

The prompt should be self-contained and ready to paste into a coding AI. Include a 5-line explanation in simple language at the end explaining what this prompt will generate.`;
    } else if (itemType === "security") {
      itemPrompt = `You are an expert security engineer. Generate a comprehensive prompt for implementing the "${itemName}" security feature.

PRD:
${prd}

Project Information:
${sanitizeFormData(formData)}

Generate a detailed, context-engineered prompt that includes:
1. Clear command for what to build
2. Full context from PRD
3. Step-by-step logic
4. Expert persona (senior security engineer)
5. Precise formatting requirements
6. Implementation details
7. Best practices and compliance
8. Testing and verification

The prompt should be self-contained and ready to paste into a coding AI. Include a 5-line explanation in simple language at the end explaining what this prompt will generate.`;
    } else if (itemType === "functionality") {
      itemPrompt = `You are an expert full-stack developer. Generate a comprehensive prompt for implementing the "${itemName}" functionality.

PRD:
${prd}

Project Information:
${sanitizeFormData(formData)}

Generate a detailed, context-engineered prompt that includes:
1. Clear command for what to build
2. Full context from PRD
3. Step-by-step logic
4. Expert persona (senior developer)
5. Precise formatting requirements
6. Business logic details
7. Data flow and state management
8. Integration points

The prompt should be self-contained and ready to paste into a coding AI. Include a 5-line explanation in simple language at the end explaining what this prompt will generate.`;
    } else if (itemType === "error_fixing") {
      itemPrompt = `You are an expert QA engineer and developer. Generate a comprehensive prompt for handling the "${itemName}" error scenario.

PRD:
${prd}

Project Information:
${sanitizeFormData(formData)}

Generate a detailed, context-engineered prompt that includes:
1. Clear command for what to build/fix
2. Full context from PRD
3. Step-by-step logic
4. Expert persona (senior QA engineer)
5. Precise formatting requirements
6. Error reproduction steps
7. Fix implementation details
8. Prevention strategies

The prompt should be self-contained and ready to paste into a coding AI. Include a 5-line explanation in simple language at the end explaining what this prompt will generate.`;
    }

    const generatedPrompt = await generateWithOpenRouter(itemPrompt, tier);

    // Store in database (optional, but good for history)
    // We don't have a specific table for individual item prompts yet, 
    // but we could store them in 'prompts' table or just return them.
    // For now, we just return it to the frontend.

    return { prompt: generatedPrompt };
  },
});

// Get generation progress for state sync
export const getGenerationProgress = query({
  args: {
    generationId: v.id("appBuilderGenerations"),
  },
  handler: async (ctx, { generationId }) => {
    const generation = await ctx.db.get(generationId);
    if (!generation) {
      return null;
    }

    const generatedPrompts = generation.generatedPrompts || {};
    const totalPrompts =
      (generation.screenList?.length || 0) +
      (generation.endpointList?.length || 0) +
      (generation.securityFeatureList?.length || 0) +
      (generation.functionalityFeatureList?.length || 0) +
      (generation.errorScenarioList?.length || 0);

    const completedPrompts = Object.values(generatedPrompts).flat().length;

    return {
      generationId,
      status: generation.status,
      completedPrompts,
      totalPrompts,
      progress: totalPrompts > 0 ? (completedPrompts / totalPrompts) * 100 : 0,
      generatedPrompts,
      screenList: generation.screenList || [],
      endpointList: generation.endpointList || [],
      securityFeatureList: generation.securityFeatureList || [],
      functionalityFeatureList: generation.functionalityFeatureList || [],
      errorScenarioList: generation.errorScenarioList || [],
      lastError: null, // Could be extended to store last error
    };
  },
});

// Approve PRD/User Flows/Tasks
export const approveStep = mutation({
  args: {
    generationId: v.id("appBuilderGenerations"),
    step: v.union(v.literal("prd"), v.literal("user_flows"), v.literal("tasks")),
  },
  handler: async (ctx, { generationId, step }) => {
    const statusMap = {
      prd: "prd_approved" as const,
      user_flows: "user_flows_approved" as const,
      tasks: "tasks_approved" as const,
    };

    await ctx.db.patch(generationId, {
      status: statusMap[step],
      updatedAt: Date.now(),
    });
  },
});
