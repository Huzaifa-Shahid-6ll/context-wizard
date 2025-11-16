import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateWithOpenRouter } from "../src/lib/openrouter";

// Create a new generation record
export const createGeneration = mutation({
  args: {
    userId: v.string(),
    projectName: v.string(),
    formData: v.any(),
    selectedPromptTypes: v.array(v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("security"),
      v.literal("functionality"),
      v.literal("error_fixing")
    )),
  },
  handler: async (ctx, args) => {
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
  args: { generationId: v.id("appBuilderGenerations") },
  handler: async (ctx, { generationId }) => {
    return await ctx.db.get(generationId);
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

// Generate PRD
export const generatePRD = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: v.any(),
  },
  handler: async (ctx, { generationId, userId, formData }) => {
    // Check prompt limit
    const limitCheck = await ctx.runMutation(api.users.checkPromptLimit, { userId });
    if (!limitCheck.canCreate) {
      throw new Error(`Daily prompt limit reached. You have ${limitCheck.remaining} prompts remaining.`);
    }

    // Get user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    // Build PRD prompt
    const prdPrompt = `You are an expert product manager and technical writer. Generate a comprehensive Product Requirements Document (PRD) based on the following project information:

${JSON.stringify(formData, null, 2)}

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

    const prd = await generateWithOpenRouter(prdPrompt, tier);

    // Update generation
    await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
      generationId,
      status: "prd_pending",
      prd,
    });

    // Increment prompt count
    await ctx.runMutation(api.users.incrementPromptCount, { userId });

    return { prd };
  },
});

// Generate User Flows
export const generateUserFlows = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: v.any(),
    prd: v.string(),
  },
  handler: async (ctx, { generationId, userId, formData, prd }) => {
    // Check prompt limit
    const limitCheck = await ctx.runMutation(api.users.checkPromptLimit, { userId });
    if (!limitCheck.canCreate) {
      throw new Error(`Daily prompt limit reached.`);
    }

    // Get user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    // Build User Flows prompt
    const flowsPrompt = `You are a UX designer and product strategist. Based on the following PRD and project information, generate comprehensive User Flow documentation:

PRD:
${prd}

Project Information:
${JSON.stringify(formData, null, 2)}

The User Flows document should include:
1. User Personas
2. User Journey Maps
3. Flow Diagrams (text-based)
4. Screen-by-Screen Navigation
5. User Actions and System Responses
6. Edge Cases and Error Flows
7. Decision Points

Format as a well-structured markdown document.`;

    const userFlows = await generateWithOpenRouter(flowsPrompt, tier);

    // Update generation
    await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
      generationId,
      status: "user_flows_pending",
      userFlows,
    });

    // Increment prompt count
    await ctx.runMutation(api.users.incrementPromptCount, { userId });

    return { userFlows };
  },
});

// Generate Task File
export const generateTaskFile = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: v.any(),
    prd: v.string(),
    userFlows: v.string(),
  },
  handler: async (ctx, { generationId, userId, formData, prd, userFlows }) => {
    // Check prompt limit
    const limitCheck = await ctx.runMutation(api.users.checkPromptLimit, { userId });
    if (!limitCheck.canCreate) {
      throw new Error(`Daily prompt limit reached.`);
    }

    // Get user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    // Build Task File prompt
    const taskPrompt = `You are a project manager and technical lead. Based on the following PRD, User Flows, and project information, generate a comprehensive Task Breakdown with milestone-based organization:

PRD:
${prd}

User Flows:
${userFlows}

Project Information:
${JSON.stringify(formData, null, 2)}

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

    const taskFile = await generateWithOpenRouter(taskPrompt, tier);

    // Update generation
    await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
      generationId,
      status: "tasks_pending",
      taskFile,
    });

    // Increment prompt count
    await ctx.runMutation(api.users.incrementPromptCount, { userId });

    return { taskFile };
  },
});

// Generate screen/endpoint/feature lists
export const generateLists = action({
  args: {
    generationId: v.id("appBuilderGenerations"),
    userId: v.string(),
    formData: v.any(),
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

    // Generate frontend screen list
    if (selectedPromptTypes.includes("frontend")) {
      const screenPrompt = `Based on the PRD and User Flows, generate a list of all screens/pages needed for the frontend:

PRD:
${prd}

User Flows:
${userFlows}

Return ONLY a JSON array of screen names, like: ["Hero Page", "Login Screen", "Dashboard", ...]`;

      const screenListText = await generateWithOpenRouter(screenPrompt, tier);
      try {
        lists.screenList = JSON.parse(screenListText.replace(/```json\n?|\n?```/g, ""));
      } catch {
        // Fallback: extract from text
        lists.screenList = screenListText.split("\n").filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, "").trim());
      }
    }

    // Generate backend endpoint list
    if (selectedPromptTypes.includes("backend")) {
      const endpointPrompt = `Based on the PRD and User Flows, generate a list of all API endpoints needed for the backend:

PRD:
${prd}

User Flows:
${userFlows}

Return ONLY a JSON array of endpoint names, like: ["POST /api/auth/login", "GET /api/users", ...]`;

      const endpointListText = await generateWithOpenRouter(endpointPrompt, tier);
      try {
        lists.endpointList = JSON.parse(endpointListText.replace(/```json\n?|\n?```/g, ""));
      } catch {
        lists.endpointList = endpointListText.split("\n").filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, "").trim());
      }
    }

    // Generate security feature list
    if (selectedPromptTypes.includes("security")) {
      const securityPrompt = `Based on the PRD, generate a list of security features to implement:

PRD:
${prd}

Return ONLY a JSON array of security features, like: ["JWT Authentication", "Password Hashing", ...]`;

      const securityText = await generateWithOpenRouter(securityPrompt, tier);
      try {
        lists.securityFeatureList = JSON.parse(securityText.replace(/```json\n?|\n?```/g, ""));
      } catch {
        lists.securityFeatureList = securityText.split("\n").filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, "").trim());
      }
    }

    // Generate functionality feature list
    if (selectedPromptTypes.includes("functionality")) {
      const functionalityPrompt = `Based on the PRD, generate a list of core functionality features:

PRD:
${prd}

Return ONLY a JSON array of functionality feature names as strings, like: ["Contact Management", "User Authentication", "Payment Processing"]`;

      const functionalityText = await generateWithOpenRouter(functionalityPrompt, tier);
      try {
        const parsed = JSON.parse(functionalityText.replace(/```json\n?|\n?```/g, ""));
        // Transform objects with 'feature' property to strings, or use strings as-is
        if (Array.isArray(parsed)) {
          lists.functionalityFeatureList = parsed.map((item: unknown) => {
            // If it's already a string, use it
            if (typeof item === "string") {
              return item;
            }
            // If it's an object, check for 'feature' property (case-insensitive check)
            if (typeof item === "object" && item !== null) {
              const obj = item as Record<string, unknown>;
              // Check for 'feature' property (case-sensitive first, then try different cases)
              if ("feature" in obj && typeof obj.feature === "string") {
                return obj.feature;
              }
              if ("Feature" in obj && typeof obj.Feature === "string") {
                return obj.Feature;
              }
              // Try lowercase keys
              const lowerKeys = Object.keys(obj).map(k => k.toLowerCase());
              const featureKey = lowerKeys.find(k => k === "feature" || k === "name" || k === "title");
              if (featureKey) {
                const actualKey = Object.keys(obj).find(k => k.toLowerCase() === featureKey);
                if (actualKey && typeof obj[actualKey] === "string") {
                  return obj[actualKey] as string;
                }
              }
              // If no feature property, try to stringify the object (fallback)
              return JSON.stringify(item);
            }
            // Fallback: convert to string
            return String(item);
          }).filter((item): item is string => typeof item === "string" && item.length > 0);
        } else {
          // If not an array, wrap it
          lists.functionalityFeatureList = [String(parsed)];
        }
      } catch {
        lists.functionalityFeatureList = functionalityText.split("\n").filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, "").trim()).filter(line => line.length > 0);
      }
      
      // Final safety check: ensure all items are strings and remove any that are still objects
      if (lists.functionalityFeatureList) {
        lists.functionalityFeatureList = lists.functionalityFeatureList.map(item => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            const obj = item as Record<string, unknown>;
            // Try multiple property names
            if ("feature" in obj && typeof obj.feature === "string") return obj.feature;
            if ("Feature" in obj && typeof obj.Feature === "string") return obj.Feature;
            if ("name" in obj && typeof obj.name === "string") return obj.name;
            if ("Name" in obj && typeof obj.Name === "string") return obj.Name;
            if ("title" in obj && typeof obj.title === "string") return obj.title;
            if ("Title" in obj && typeof obj.Title === "string") return obj.Title;
            // Last resort: stringify
            return JSON.stringify(item);
          }
          return String(item);
        }).filter((item): item is string => typeof item === "string" && item.length > 0);
        
        // Double-check: if any item is still an object, remove it
        lists.functionalityFeatureList = lists.functionalityFeatureList.filter(item => {
          try {
            // If it's a JSON string that parses to an object, extract the feature name
            const parsed = JSON.parse(item);
            if (typeof parsed === "object" && parsed !== null) {
              const obj = parsed as Record<string, unknown>;
              if ("feature" in obj && typeof obj.feature === "string") {
                return true; // We'll replace it below
              }
              return false; // Remove objects we can't extract a string from
            }
            return true;
          } catch {
            return true; // Not JSON, keep it
          }
        }).map(item => {
          // One more pass to extract from JSON strings
          try {
            const parsed = JSON.parse(item);
            if (typeof parsed === "object" && parsed !== null) {
              const obj = parsed as Record<string, unknown>;
              if ("feature" in obj && typeof obj.feature === "string") return obj.feature;
              if ("name" in obj && typeof obj.name === "string") return obj.name;
              if ("title" in obj && typeof obj.title === "string") return obj.title;
            }
            return item;
          } catch {
            return item;
          }
        });
      }
    }

    // Generate error scenario list
    if (selectedPromptTypes.includes("error_fixing")) {
      const errorPrompt = `Based on the PRD and tech stack, generate a list of potential error scenarios:

PRD:
${prd}

Tech Stack: ${formData.techStack?.join(", ") || "Not specified"}

Return ONLY a JSON array of error scenarios, like: ["Network timeout", "Invalid input validation", ...]`;

      const errorText = await generateWithOpenRouter(errorPrompt, tier);
      try {
        lists.errorScenarioList = JSON.parse(errorText.replace(/```json\n?|\n?```/g, ""));
      } catch {
        lists.errorScenarioList = errorText.split("\n").filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, "").trim());
      }
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
    formData: v.any(),
    prd: v.string(),
    userFlows: v.string(),
    taskFile: v.string(),
    prebuiltComponents: v.optional(v.string()),
  },
  handler: async (ctx, { generationId, userId, itemType, itemName, formData, prd, userFlows, taskFile, prebuiltComponents }) => {
    // Check prompt limit
    const limitCheck = await ctx.runMutation(api.users.checkPromptLimit, { userId });
    if (!limitCheck.canCreate) {
      const error = `Daily prompt limit reached.`;
      console.error(`[generateItemPrompt] ${error}`, { generationId, userId, itemType, itemName });
      throw new Error(error);
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
${JSON.stringify(formData, null, 2)}

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
${JSON.stringify(formData, null, 2)}

Generate a detailed prompt for this backend endpoint/feature including:
1. API specification (method, path, params, body, response)
2. Database schema requirements
3. Business logic
4. Error handling
5. Authentication/authorization
6. Validation rules

Include a 5-line explanation in simple language.`;
    } else if (itemType === "security") {
      itemPrompt = `You are a security expert. Generate a comprehensive prompt for implementing "${itemName}" security feature.

PRD:
${prd}

Project Information:
${JSON.stringify(formData, null, 2)}

Generate a detailed security implementation prompt including encryption, hashing, prevention measures, etc.

Include a 5-line explanation in simple language.`;
    } else if (itemType === "functionality") {
      itemPrompt = `You are an expert developer. Generate a comprehensive prompt for implementing "${itemName}" functionality.

PRD:
${prd}

Project Information:
${JSON.stringify(formData, null, 2)}

Generate a detailed functionality implementation prompt.

Include a 5-line explanation in simple language.`;
    } else if (itemType === "error_fixing") {
      itemPrompt = `You are a debugging expert. Generate a comprehensive error-fixing prompt for the scenario: "${itemName}".

PRD:
${prd}

Project Information:
${JSON.stringify(formData, null, 2)}

Generate a prompt that helps identify and fix this error scenario, including analysis steps and solutions.

Include a 5-line explanation in simple language.`;
    }

    try {
      const prompt = await generateWithOpenRouter(itemPrompt, tier);

      // Get current generation to update generatedPrompts
      const generation = await ctx.runQuery(api.appBuilderGenerations.getGeneration, { generationId });
      const currentPrompts = generation?.generatedPrompts || {};
      const typePrompts = currentPrompts[itemType] || [];
      
      currentPrompts[itemType] = [
        ...typePrompts,
        {
          title: itemName,
          prompt,
          itemType,
          createdAt: Date.now(),
        },
      ];

      // Update generation
      await ctx.runMutation(api.appBuilderGenerations.updateGenerationStatus, {
        generationId,
        status: "generating_prompts",
        generatedPrompts: currentPrompts,
      });

      // Increment prompt count
      await ctx.runMutation(api.users.incrementPromptCount, { userId });

      console.log(`[generateItemPrompt] Success: ${itemType}/${itemName}`, { generationId, userId });
      return { prompt };
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      const errorContext = {
        generationId,
        userId,
        itemType,
        itemName,
        error: errorMessage,
        timestamp: Date.now(),
      };
      
      console.error(`[generateItemPrompt] Error generating prompt for ${itemType}/${itemName}:`, errorContext);
      
      // Store error in generation record (could extend schema to include errorLog)
      // For now, log it and rethrow
      throw new Error(`Failed to generate prompt for ${itemName} (${itemType}): ${errorMessage}`);
    }
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

