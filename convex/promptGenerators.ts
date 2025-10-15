import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateWithOpenRouter } from "../src/lib/openrouter";

type GeneratedPromptItem = { title: string; prompt: string; order: number };
type ErrorFixItem = { error: string; fix: string };

type GenerationResult = {
  projectRequirements: string;
  frontendPrompts: GeneratedPromptItem[];
  backendPrompts: GeneratedPromptItem[];
  cursorRules: string;
  errorFixPrompts: ErrorFixItem[];
  estimatedComplexity: "simple" | "moderate" | "complex";
};

function buildSystemInstruction() {
  return (
    "You are an expert software architect helping generate Cursor-ready prompts. " +
    "Always return a strict JSON object matching this TypeScript type: " +
    "{ projectRequirements: string, frontendPrompts: Array<{title: string, prompt: string, order: number}>, " +
    "backendPrompts: Array<{title: string, prompt: string, order: number}>, cursorRules: string, " +
    "errorFixPrompts: Array<{error: string, fix: string}>, estimatedComplexity: 'simple' | 'moderate' | 'complex' }. " +
    "Do not include markdown fencing or commentary."
  );
}

function buildUserPrompt(params: {
  projectDescription: string;
  techStack: string[];
  features: string[];
  targetAudience?: string;
}): string {
  const { projectDescription, techStack, features, targetAudience } = params;
  return (
    `Project Description: ${projectDescription}\n` +
    `Tech Stack: ${techStack.join(", ")}\n` +
    `Features: ${features.join(", ")}\n` +
    (targetAudience ? `Target Audience: ${targetAudience}\n` : "") +
    `\nGenerate the following structure:\n` +
    `1) projectRequirements: A comprehensive PROJECT_REQUIREMENTS.md covering PRD, user stories, technical requirements, success criteria.\n` +
    `2) frontendPrompts: 3-5 items including component structure, UI/UX design, state management, API integration.\n` +
    `3) backendPrompts: 3-5 items including database schema, API endpoints, authentication, business logic.\n` +
    `4) cursorRules: A .cursorrules content tailored to the tech stack (rules, conventions, best practices).\n` +
    `5) errorFixPrompts: 4-6 items predicting common errors for the stack with fixes.\n` +
    `6) estimatedComplexity: one of simple | moderate | complex based on scope.\n` +
    `Return only strict JSON with these exact keys.`
  );
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 800): Promise<T> {
  let delay = baseDelayMs;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("unreachable");
}

export const generateCursorAppPrompts = action({
  args: {
    projectDescription: v.string(),
    techStack: v.array(v.string()),
    features: v.array(v.string()),
    userId: v.string(),
    targetAudience: v.optional(v.string()),
  },
  handler: async (ctx, { projectDescription, techStack, features, userId, targetAudience }): Promise<GenerationResult> => {
    // Determine user tier (fallback to free if not found)
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    // Compose prompt and call OpenRouter
    const system = buildSystemInstruction();
    const userPrompt = buildUserPrompt({ projectDescription, techStack, features, targetAudience });

    const jsonText = await withRetry(() => generateWithOpenRouter(
      `${system}\n\n${userPrompt}`,
      tier
    ));

    let parsed: GenerationResult;
    try {
      parsed = JSON.parse(jsonText) as GenerationResult;
    } catch (e) {
      // As a fallback, try to trim code fences if present
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed) as GenerationResult;
    }

    // Persist prompts into Convex `prompts` table
    const now = Date.now();
    const baseContext = { projectDescription, techStack, features, targetAudience } as const;

    // PROJECT_REQUIREMENTS.md prompt
    await ctx.runMutation(api.mutations.insertPrompt, {
      userId,
      type: "cursor-app",
      title: "PROJECT_REQUIREMENTS.md",
      content: parsed.projectRequirements,
      context: baseContext as unknown as any,
      metadata: { estimatedComplexity: parsed.estimatedComplexity },
      createdAt: now,
      updatedAt: now,
    });

    // Frontend prompts
    for (const item of parsed.frontendPrompts) {
      await ctx.runMutation(api.mutations.insertPrompt, {
        userId,
        type: "cursor-app",
        title: `Frontend: ${item.title}`,
        content: item.prompt,
        context: baseContext as unknown as any,
        metadata: { section: "frontend", order: item.order },
        createdAt: now,
        updatedAt: now,
      });
    }

    // Backend prompts
    for (const item of parsed.backendPrompts) {
      await ctx.runMutation(api.mutations.insertPrompt, {
        userId,
        type: "cursor-app",
        title: `Backend: ${item.title}`,
        content: item.prompt,
        context: baseContext as unknown as any,
        metadata: { section: "backend", order: item.order },
        createdAt: now,
        updatedAt: now,
      });
    }

    // Cursor rules
    await ctx.runMutation(api.mutations.insertPrompt, {
      userId,
      type: "cursor-app",
      title: ".cursorrules",
      content: parsed.cursorRules,
      context: baseContext as unknown as any,
      metadata: { section: "cursorrules" },
      createdAt: now,
      updatedAt: now,
    });

    // Error fixes
    for (const ef of parsed.errorFixPrompts) {
      await ctx.runMutation(api.mutations.insertPrompt, {
        userId,
        type: "cursor-app",
        title: `Error: ${ef.error}`,
        content: ef.fix,
        context: baseContext as unknown as any,
        metadata: { section: "error-fix" },
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update user's promptsCreatedToday counter (optional best-effort)
    await ctx.runMutation(api.mutations.incrementUserPromptsCreatedToday, { clerkId: userId, delta: 1 });

    return parsed;
  },
});


export const generateGenericPrompt = action({
  args: {
    userGoal: v.string(),
    context: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    tone: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { userGoal, context: extraContext, outputFormat, tone, userId }
  ): Promise<{
    optimizedPrompt: string;
    explanation: string;
    tips: string[];
    exampleOutput: string;
  }> => {
    // Determine user tier
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const isPro = user?.isPro === true;
    const tier: "free" | "pro" = isPro ? "pro" : "free";

    const system =
      "You are an expert prompt engineer. Return STRICT JSON only with keys: " +
      "optimizedPrompt (string), explanation (string), tips (string[]), exampleOutput (string). " +
      "Design optimizedPrompt using best practices: clear role, explicit instructions, constraints, step-by-step, and desired format. " +
      "If context/outputFormat/tone provided, incorporate them. No markdown fences.";

    const userContent =
      `User goal: ${userGoal}\n` +
      (extraContext ? `Context: ${extraContext}\n` : "") +
      (outputFormat ? `Desired output format: ${outputFormat}\n` : "") +
      (tone ? `Desired tone: ${tone}\n` : "") +
      `\nGenerate JSON now.`;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier)
    );

    let parsed: {
      optimizedPrompt: string;
      explanation: string;
      tips: string[];
      exampleOutput: string;
    };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed);
    }

    // Persist optimized prompt in prompts table as type "generic"
    const now = Date.now();
    await ctx.runMutation(api.mutations.insertPrompt, {
      userId,
      type: "generic",
      title: "Optimized Prompt",
      content: parsed.optimizedPrompt,
      context: {
        userGoal,
        context: extraContext,
        outputFormat,
        tone,
      } as unknown as any,
      metadata: {
        explanation: parsed.explanation,
        tips: parsed.tips,
        exampleOutput: parsed.exampleOutput,
        section: "generic",
      } as unknown as any,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(api.mutations.incrementUserPromptsCreatedToday, { clerkId: userId, delta: 1 });

    return parsed;
  },
});


export const generateImagePrompt = action({
  args: {
    description: v.string(),
    style: v.optional(v.string()),
    mood: v.optional(v.string()),
    details: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { description, style, mood, details, userId }
  ): Promise<{
    midjourneyPrompt: string;
    dallePrompt: string;
    stableDiffusionPrompt: string;
    tips: string[];
    negativePrompts: string[];
  }> => {
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const tier: "free" | "pro" = user?.isPro ? "pro" : "free";

    const system =
      "You are an expert image prompt engineer for Midjourney, DALL-E 3, and Stable Diffusion. " +
      "Return STRICT JSON only with keys: midjourneyPrompt, dallePrompt, stableDiffusionPrompt, tips (string[]), negativePrompts (string[]). " +
      "Each prompt should include descriptive keywords, optional photography terms (lens, lighting), style references, aspect ratio hints, quality modifiers. " +
      "Do not include markdown fences.";

    const userContent =
      `Description: ${description}\n` +
      (style ? `Style: ${style}\n` : "") +
      (mood ? `Mood: ${mood}\n` : "") +
      (details ? `Details: ${details}\n` : "") +
      `\nGenerate JSON with platform-optimized prompts and common negative prompts (e.g., low-res, blurry, artifacts).`;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier)
    );

    let parsed: {
      midjourneyPrompt: string;
      dallePrompt: string;
      stableDiffusionPrompt: string;
      tips: string[];
      negativePrompts: string[];
    };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed);
    }

    const now = Date.now();
    await ctx.runMutation(api.mutations.insertPrompt, {
      userId,
      type: "image",
      title: "Image Generation Prompts",
      content: [
        `Midjourney: ${parsed.midjourneyPrompt}`,
        `DALL-E 3: ${parsed.dallePrompt}`,
        `Stable Diffusion: ${parsed.stableDiffusionPrompt}`,
      ].join("\n\n"),
      context: {
        description,
        style,
        mood,
        details,
      } as unknown as any,
      metadata: {
        tips: parsed.tips,
        negativePrompts: parsed.negativePrompts,
        section: "image",
      } as unknown as any,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(api.mutations.incrementUserPromptsCreatedToday, { clerkId: userId, delta: 1 });

    return parsed;
  },
});


export const analyzeAndImprovePrompt = action({
  args: {
    prompt: v.string(),
    context: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { prompt, context: extraContext, userId }
  ): Promise<{
    overallScore: number;
    scores: {
      clarity: number;
      specificity: number;
      structure: number;
      completeness: number;
    };
    issues: Array<{ severity: "low" | "medium" | "high"; description: string }>;
    suggestions: string[];
    improvedPrompt: string;
    improvementExplanation: string;
  }> => {
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const tier: "free" | "pro" = user?.isPro ? "pro" : "free";

    const system =
      "You are an expert prompt analyst. Return STRICT JSON only with keys: overallScore (0-100), scores { clarity, specificity, structure, completeness }, issues (array of {severity: 'low'|'medium'|'high', description}), suggestions (string[]), improvedPrompt (string), improvementExplanation (string). " +
      "Be concise, deterministic (temperature ~0.2), and ensure numeric fields are numbers. No markdown fences.";

    const userContent =
      `Original prompt: ${prompt}\n` +
      (extraContext ? `Context: ${extraContext}\n` : "") +
      `\nAnalyze for clarity, specificity, structure, completeness. Identify issues and produce an improved prompt with explanation. Return JSON only.`;

    // Prefer a reasoning-capable model default on pro tier
    const reasoningModel = tier === "pro" ? "anthropic/claude-3.5-sonnet" : undefined;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier, reasoningModel)
    );

    let parsed: {
      overallScore: number;
      scores: { clarity: number; specificity: number; structure: number; completeness: number };
      issues: Array<{ severity: "low" | "medium" | "high"; description: string }>;
      suggestions: string[];
      improvedPrompt: string;
      improvementExplanation: string;
    };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed);
    }

    const now = Date.now();
    // Also store a summary row in promptAnalyses (scores/suggestions)
    await ctx.runMutation(api.mutations.insertPromptAnalysis, {
      userId,
      originalPrompt: prompt,
      score: Number(parsed.overallScore) || 0,
      issues: parsed.issues.map((i) => i.description),
      suggestions: parsed.suggestions,
      improvedPrompt: parsed.improvedPrompt,
      createdAt: now,
    });

    return parsed;
  },
});


export const predictPromptOutput = action({
  args: {
    prompt: v.string(),
    targetAI: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { prompt, targetAI, userId }
  ): Promise<{
    predictedOutput: string;
    confidence: number;
    reasoning: string;
    warnings: string[];
    alternatives: Array<{ modifiedPrompt: string; expectedChange: string }>;
  }> => {
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const tier: "free" | "pro" = user?.isPro ? "pro" : "free";

    const system =
      "You are an AI that predicts how another AI will respond. Return STRICT JSON only with keys: predictedOutput (string), confidence (0-100), reasoning (string), warnings (string[]), alternatives (Array<{modifiedPrompt:string, expectedChange:string}>). " +
      "Analyze the prompt structure, how it will be interpreted, produce a concise mock output, list potential issues, and propose 2-4 alternative prompts with expected deltas. No markdown fences.";

    const userContent =
      `Prompt: ${prompt}\n` +
      (targetAI ? `Target AI: ${targetAI}\n` : "") +
      `\nReturn JSON only.`;

    // Prefer a reliable general model; pro users may default to a stronger model
    const preferredModel = tier === "pro" ? "anthropic/claude-3.5-sonnet" : undefined;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier, preferredModel)
    );

    let parsed: {
      predictedOutput: string;
      confidence: number;
      reasoning: string;
      warnings: string[];
      alternatives: Array<{ modifiedPrompt: string; expectedChange: string }>;
    };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed);
    }

    const now = Date.now();
    const apiAny = api as unknown as any;
    await ctx.runMutation(apiAny.mutations.insertOutputPrediction, {
      userId,
      prompt,
      predictedOutput: parsed.predictedOutput,
      confidence: Number(parsed.confidence) || 0,
      createdAt: now,
    });

    return parsed;
  },
});


