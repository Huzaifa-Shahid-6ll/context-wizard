import { action } from "./_generated/server";
import { v, JSONValue } from "convex/values";
import { api } from "./_generated/api";
import { generateWithOpenRouter } from "../src/lib/openrouter";

// Helper function for robust JSON parsing
function parseJsonSafely<T>(jsonText: string, fallback: T): T {
  try {
    return JSON.parse(jsonText);
  } catch {
    try {
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      return JSON.parse(trimmed);
    } catch {
      try {
        // Try to fix common JSON issues
        let fixedJson = jsonText
          .replace(/^```[a-zA-Z]*\n|\n```$/g, "")
          .replace(/\\"/g, '\\"')  // Fix escaped quotes
          .replace(/\\n/g, '\\n')  // Fix escaped newlines
          .replace(/\\t/g, '\\t')  // Fix escaped tabs
          .replace(/\\r/g, '\\r')  // Fix escaped carriage returns
          .replace(/\\\\/g, '\\\\'); // Fix double backslashes
        
        return JSON.parse(fixedJson);
      } catch {
        return fallback;
      }
    }
  }
}

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
  return `You are an expert software architect and context engineer specializing in generating Cursor-ready prompts using advanced prompt engineering principles.

## Core Expertise
- 15+ years experience in software architecture and AI-assisted development
- Expert in context engineering, prompt optimization, and AI agent design
- Specialized in modern web development stacks and best practices

## Your Role
Generate comprehensive, context-engineered prompts that maximize AI effectiveness through:
1. **Command Structure**: Clear, direct instructions with strong action verbs
2. **Rich Context**: Detailed background, constraints, and requirements
3. **Logic Framework**: Step-by-step reasoning and output structure
4. **Expert Persona**: Domain-specific expertise and professional tone
5. **Format Specification**: Precise output formatting and organization
6. **Iterative Refinement**: Questions to gather missing context

## Output Requirements
Always return a strict JSON object matching this TypeScript type:
{ 
  projectRequirements: string, 
  frontendPrompts: Array<{title: string, prompt: string, order: number}>, 
  backendPrompts: Array<{title: string, prompt: string, order: number}>, 
  cursorRules: string, 
  errorFixPrompts: Array<{error: string, fix: string}>, 
  estimatedComplexity: 'simple' | 'moderate' | 'complex' 
}

## Context Engineering Principles
- Structure prompts with clear sections and XML tags for better parsing
- Include comprehensive scenario coverage and edge cases
- Provide specific examples and constraints
- Use professional terminology and domain expertise
- Ensure prompts are self-contained and actionable

Do not include markdown fencing or commentary.`;
}

function buildUserPrompt(params: {
  projectDescription: string;
  techStack: string[];
  features: string[];
  targetAudience?: string;
}): string {
  const { projectDescription, techStack, features, targetAudience } = params;
  return `<user_query>
${projectDescription}
</user_query>

<context>
Tech Stack: ${techStack.join(", ")}
Features: ${features.join(", ")}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
</context>

<task>
Generate comprehensive, context-engineered prompts using the 6-part framework:

1. **COMMAND**: Create clear, actionable prompts for each component
2. **CONTEXT**: Include detailed background, constraints, and requirements  
3. **LOGIC**: Define step-by-step reasoning and output structure
4. **ROLEPLAY**: Assign expert personas with domain-specific knowledge
5. **FORMATTING**: Specify precise output formats and organization
6. **QUESTIONS**: Include follow-up questions to gather missing context

Generate the following structure:
- projectRequirements: Comprehensive PROJECT_REQUIREMENTS.md with PRD, user stories, technical requirements, success criteria
- frontendPrompts: 3-5 context-engineered prompts for component structure, UI/UX design, state management, API integration
- backendPrompts: 3-5 context-engineered prompts for database schema, API endpoints, authentication, business logic  
- cursorRules: Advanced .cursorrules with context engineering principles, coding standards, and AI optimization
- errorFixPrompts: 4-6 predictive error scenarios with context-aware solutions
- estimatedComplexity: Assess as simple | moderate | complex based on scope and technical requirements

Each prompt should follow context engineering best practices:
- Use XML tags for structure and clarity
- Include comprehensive scenario coverage
- Provide specific examples and constraints
- Use professional terminology and domain expertise
- Ensure self-contained, actionable instructions
- Include escalation procedures and edge cases
</task>

<output_format>
Return only strict JSON with these exact keys. No markdown fencing or commentary.
</output_format>`;
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
    } catch {
      // As a fallback, try to trim code fences if present
      const trimmed = jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, "");
      parsed = JSON.parse(trimmed) as GenerationResult;
    }

    // Persist prompts into Convex `prompts` table
    const now = Date.now();
    const baseContext = {
      projectDescription,
      techStack,
      features,
      targetAudience,
    };

    // PROJECT_REQUIREMENTS.md prompt
    await ctx.runMutation(api.mutations.insertPrompt, {
      userId,
      type: "cursor-app",
      title: "PROJECT_REQUIREMENTS.md",
      content: parsed.projectRequirements,
      context: baseContext,
      metadata: { estimatedComplexity: parsed.estimatedComplexity } as JSONValue,
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
        context: baseContext,
        metadata: { section: "frontend", order: item.order } as JSONValue,
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
        context: baseContext,
        metadata: { section: "backend", order: item.order } as JSONValue,
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
      context: baseContext,
      metadata: { section: "cursorrules" } as JSONValue,
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
        context: baseContext,
        metadata: { section: "error-fix" } as JSONValue,
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

    const system = `You are an expert prompt engineer and context engineer specializing in the 6-part prompting framework.

## Core Expertise
- Expert in advanced prompt engineering and context optimization
- Specialized in the 6-part framework: Command, Context, Logic, Roleplay, Formatting, Questions
- 10+ years experience in AI interaction design and optimization

## Your Role
Transform user goals into optimized prompts using the complete 6-part framework:

1. **COMMAND**: Start with strong, direct action verbs (analyze, create, design, recommend, generate, evaluate)
2. **CONTEXT**: Provide comprehensive background, constraints, and requirements using the Rule of Three (Who, What, When)
3. **LOGIC**: Define clear output structure and step-by-step reasoning
4. **ROLEPLAY**: Assign specific expert personas with domain knowledge and experience
5. **FORMATTING**: Specify precise output formats and organization
6. **QUESTIONS**: Include follow-up questions to gather missing context and refine results

## Output Requirements
Return STRICT JSON only with keys: optimizedPrompt (string), explanation (string), tips (string[]), exampleOutput (string)

## Context Engineering Principles
- Use XML tags for structure and clarity
- Include comprehensive scenario coverage
- Provide specific examples and constraints
- Use professional terminology and domain expertise
- Ensure self-contained, actionable instructions
- Include escalation procedures and edge cases

No markdown fences.`;

    const userContent = `<user_query>
${userGoal}
</user_query>

<context>
${extraContext ? `Background: ${extraContext}\n` : ""}${outputFormat ? `Output Format: ${outputFormat}\n` : ""}${tone ? `Tone: ${tone}` : ""}
</context>

<task>
Apply the 6-part prompting framework to create an optimized prompt:

1. **COMMAND**: Start with a strong, direct action verb and specific goal
2. **CONTEXT**: Include comprehensive background using Rule of Three (Who, What, When)
3. **LOGIC**: Define clear output structure and step-by-step reasoning
4. **ROLEPLAY**: Assign expert persona with domain knowledge and experience
5. **FORMATTING**: Specify precise output format and organization
6. **QUESTIONS**: Include follow-up questions to gather missing context

Ensure the optimized prompt follows context engineering best practices:
- Use XML tags for structure and clarity
- Include comprehensive scenario coverage
- Provide specific examples and constraints
- Use professional terminology and domain expertise
- Ensure self-contained, actionable instructions
- Include escalation procedures and edge cases
</task>

<output_format>
Return JSON with optimizedPrompt, explanation, tips, exampleOutput
</output_format>`;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier)
    );

    const parsed = parseJsonSafely(jsonText, {
      optimizedPrompt: jsonText.replace(/^```[a-zA-Z]*\n|\n```$/g, ""),
      explanation: "Generated prompt (JSON parsing failed)",
      tips: ["Review the generated prompt for any formatting issues"],
      exampleOutput: "Example output would be generated here"
    });

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
      } as JSONValue,
      metadata: {
        explanation: parsed.explanation,
        tips: parsed.tips,
        exampleOutput: parsed.exampleOutput,
        section: "generic",
      } as JSONValue,
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

    const system = `You are an expert image prompt engineer and visual context engineer specializing in AI image generation.

## Core Expertise
- Expert in Midjourney, DALL-E 3, Stable Diffusion, and Google Veo 3 optimization
- Specialized in cinematic specificity, narrative structure, and professional film language
- 10+ years experience in visual storytelling and AI-assisted image generation

## Your Role
Generate platform-optimized image prompts using advanced techniques:

### Cinematic Specificity Principles
- Use specific camera angles and movements (wide shot, close-up, tracking shot, dolly zoom)
- Include detailed lighting setups (key lighting, rim lighting, natural window light)
- Specify film styles (cinematic, documentary, noir, vintage film grain)
- Add environmental storytelling and atmospheric details

### Professional Film Language
- Camera terminology (close-up, wide shot, tracking shot, dolly zoom)
- Lighting setups (key lighting, rim lighting, natural window light)
- Film styles (cinematic, documentary, noir, vintage film grain)
- Technical specifications (shot on RED camera, 35mm film, shallow depth of field)

### Platform Optimization
- **Midjourney**: Focus on artistic style, composition, and creative elements
- **DALL-E 3**: Emphasize clarity, realism, and descriptive accuracy
- **Stable Diffusion**: Include technical parameters, style references, and quality modifiers

## Output Requirements
Return STRICT JSON only with keys: midjourneyPrompt, dallePrompt, stableDiffusionPrompt, tips (string[]), negativePrompts (string[])

## Context Engineering Principles
- Use XML tags for structure and clarity
- Include comprehensive visual scenario coverage
- Provide specific technical and artistic constraints
- Use professional cinematography terminology
- Ensure self-contained, actionable visual instructions
- Include quality control and optimization guidelines

No markdown fences.`;

    const userContent = `<user_query>
${description}
</user_query>

<context>
${style ? `Style: ${style}\n` : ""}${mood ? `Mood: ${mood}\n` : ""}${details ? `Details: ${details}` : ""}
</context>

<task>
Generate platform-optimized image prompts using cinematic specificity and professional film language:

### For Each Platform:
1. **Midjourney**: Focus on artistic composition, style references, and creative elements
2. **DALL-E 3**: Emphasize descriptive accuracy, realism, and clear visual details
3. **Stable Diffusion**: Include technical parameters, quality modifiers, and style references

### Apply Cinematic Principles:
- Use specific camera angles and movements
- Include detailed lighting setups and atmospheric details
- Specify film styles and technical specifications
- Add environmental storytelling elements
- Include professional cinematography terminology

### Quality Control:
- Generate comprehensive negative prompts for common issues
- Include quality modifiers and technical specifications
- Provide optimization tips for each platform
- Ensure prompts are self-contained and actionable
</task>

<output_format>
Return JSON with platform-optimized prompts and negative prompts
</output_format>`;

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
      } as JSONValue,
      metadata: {
        tips: parsed.tips,
        negativePrompts: parsed.negativePrompts,
        section: "image",
      } as JSONValue,
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

    const system = `You are an expert prompt analyst and context engineer specializing in advanced prompt optimization.

## Core Expertise
- Expert in prompt engineering, context engineering, and AI interaction optimization
- Specialized in the 6-part prompting framework and context management
- 10+ years experience in AI system design and prompt optimization

## Your Role
Analyze prompts using advanced context engineering principles:

### Evaluation Criteria
1. **Command Structure**: Clear, direct action verbs and specific goals
2. **Context Richness**: Comprehensive background using Rule of Three (Who, What, When)
3. **Logic Framework**: Step-by-step reasoning and output structure
4. **Expert Persona**: Domain-specific knowledge and professional tone
5. **Format Specification**: Precise output formatting and organization
6. **Context Engineering**: XML structure, scenario coverage, constraints

### Analysis Framework
- **Clarity**: How clear and unambiguous are the instructions?
- **Specificity**: How detailed and specific are the requirements?
- **Structure**: How well-organized and logical is the prompt?
- **Completeness**: How comprehensive is the context and coverage?
- **Context Engineering**: How well does it follow advanced context principles?

## Output Requirements
Return STRICT JSON only with keys: overallScore (0-100), scores { clarity, specificity, structure, completeness }, issues (array of {severity: 'low'|'medium'|'high', description}), suggestions (string[]), improvedPrompt (string), improvementExplanation (string)

## Context Engineering Principles
- Use XML tags for structure and clarity
- Include comprehensive scenario coverage
- Provide specific examples and constraints
- Use professional terminology and domain expertise
- Ensure self-contained, actionable instructions
- Include escalation procedures and edge cases

Be concise, deterministic (temperature ~0.2), and ensure numeric fields are numbers. No markdown fences.`;

    const userContent = `<user_query>
${prompt}
</user_query>

<context>
${extraContext ? `Background: ${extraContext}` : ""}
</context>

<task>
Analyze this prompt using advanced context engineering principles:

### Apply 6-Part Framework Analysis:
1. **COMMAND**: Evaluate clarity and directness of action verbs
2. **CONTEXT**: Assess richness of background using Rule of Three (Who, What, When)
3. **LOGIC**: Review step-by-step reasoning and output structure
4. **ROLEPLAY**: Check for expert persona and domain knowledge
5. **FORMATTING**: Evaluate output format specification
6. **QUESTIONS**: Assess iterative refinement potential

### Context Engineering Evaluation:
- XML structure and clarity
- Comprehensive scenario coverage
- Specific examples and constraints
- Professional terminology and domain expertise
- Self-contained, actionable instructions
- Escalation procedures and edge cases

### Generate Improvements:
- Identify specific issues and severity levels
- Provide actionable suggestions for enhancement
- Create an improved prompt following best practices
- Explain the reasoning behind improvements
</task>

<output_format>
Return JSON with analysis scores, issues, suggestions, and improved prompt
</output_format>`;

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


export const generateVideoPrompt = action({
  args: {
    description: v.string(),
    style: v.optional(v.string()),
    mood: v.optional(v.string()),
    duration: v.optional(v.string()),
    audio: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { description, style, mood, duration, audio, userId }
  ): Promise<{
    veo3Prompt: string;
    runwayPrompt: string;
    pikaPrompt: string;
    tips: string[];
    audioElements: string[];
  }> => {
    const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
    const tier: "free" | "pro" = user?.isPro ? "pro" : "free";

    const system = `You are an expert video prompt engineer and cinematic context engineer specializing in AI video generation.

## Core Expertise
- Expert in Google Veo 3, Runway ML, Pika Labs, and Stable Video Diffusion
- Specialized in cinematic specificity, narrative structure, and professional film language
- 10+ years experience in video production and AI-assisted content creation

## Your Role
Generate platform-optimized video prompts using advanced cinematic techniques:

### Cinematic Specificity Principles
- Use specific camera movements and angles (wide shot, close-up, tracking shot, dolly zoom)
- Include detailed lighting setups (key lighting, rim lighting, natural window light)
- Specify film styles (cinematic, documentary, noir, vintage film grain)
- Add environmental storytelling and atmospheric details

### Professional Film Language
- Camera terminology (close-up, wide shot, tracking shot, dolly zoom)
- Lighting setups (key lighting, rim lighting, natural window light)
- Film styles (cinematic, documentary, noir, vintage film grain)
- Technical specifications (shot on RED camera, 35mm film, shallow depth of field)

### Audio Design Elements
- Dialogue with quotation marks for specific speech
- Sound effects (footsteps, door closing, wind)
- Ambient audio (city traffic, ocean waves, forest sounds)
- Music style and mood specifications

### Platform Optimization
- **Google Veo 3**: Focus on cinematic storytelling, synchronized audio, and 8-second duration optimization
- **Runway ML**: Emphasize motion and movement, artistic style
- **Pika Labs**: Include creative elements and style references

## Output Requirements
Return STRICT JSON only with keys: veo3Prompt, runwayPrompt, pikaPrompt, tips (string[]), audioElements (string[])

## Context Engineering Principles
- Use XML tags for structure and clarity
- Include comprehensive visual and audio scenario coverage
- Provide specific technical and artistic constraints
- Use professional cinematography and audio terminology
- Ensure self-contained, actionable video instructions
- Include quality control and optimization guidelines

No markdown fences.`;

    const userContent = `<user_query>
${description}
</user_query>

<context>
${style ? `Style: ${style}\n` : ""}${mood ? `Mood: ${mood}\n` : ""}${duration ? `Duration: ${duration}\n` : ""}${audio ? `Audio: ${audio}` : ""}
</context>

<task>
Generate platform-optimized video prompts using cinematic specificity and professional film language:

### For Each Platform:
1. **Google Veo 3**: Focus on cinematic storytelling, synchronized audio, 8-second optimization
2. **Runway ML**: Emphasize motion, movement, and artistic style
3. **Pika Labs**: Include creative elements and style references

### Apply Cinematic Principles:
- Use specific camera angles and movements
- Include detailed lighting setups and atmospheric details
- Specify film styles and technical specifications
- Add environmental storytelling elements
- Include professional cinematography terminology

### Audio Design:
- Generate comprehensive audio elements (dialogue, SFX, ambient, music)
- Use quotation marks for specific speech
- Include ambient and atmospheric sounds
- Specify music style and mood

### Quality Control:
- Optimize for 8-second duration (Veo 3 constraint)
- Include quality modifiers and technical specifications
- Provide optimization tips for each platform
- Ensure prompts are self-contained and actionable
</task>

<output_format>
Return JSON with platform-optimized video prompts and audio elements
</output_format>`;

    const jsonText = await withRetry(() =>
      generateWithOpenRouter(`${system}\n\n${userContent}`, tier)
    );

    let parsed: {
      veo3Prompt: string;
      runwayPrompt: string;
      pikaPrompt: string;
      tips: string[];
      audioElements: string[];
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
      type: "video",
      title: "Video Generation Prompts",
      content: [
        `Google Veo 3: ${parsed.veo3Prompt}`,
        `Runway ML: ${parsed.runwayPrompt}`,
        `Pika Labs: ${parsed.pikaPrompt}`,
      ].join("\n\n"),
      context: {
        description,
        style,
        mood,
        duration,
        audio,
      } as JSONValue,
      metadata: {
        tips: parsed.tips,
        audioElements: parsed.audioElements,
        section: "video",
      } as JSONValue,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(api.mutations.incrementUserPromptsCreatedToday, { clerkId: userId, delta: 1 });

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
    await ctx.runMutation(api.mutations.insertOutputPrediction, {
      userId,
      prompt,
      predictedOutput: parsed,
      confidence: Number(parsed.confidence) || 0,
      createdAt: now,
    });

    return parsed;
  },
});


