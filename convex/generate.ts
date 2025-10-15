import { action } from "./_generated/server";
import { v } from "convex/values";

type RepoData = {
  repoStructure: { path: string; type: string }[]; // simplified structure for prompt
  techStack: string[];
  packageJson?: unknown;
  readmeContent?: string;
};

export type GeneratedFile = { name: string; content: string };

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

async function callAnthropic(prompt: string, maxTokens = 2000): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY in environment");
  }
  // Using Claude 3.5 Sonnet as default; adjust if needed
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Anthropic rate limit exceeded");
    }
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }
  const json = await res.json();
  // Claude response format: { content: [{ type: 'text', text: '...' }], ... }
  const content: unknown = json?.content?.[0]?.text ?? "";
  return String(content);
}

async function withRetries<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 800): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
      attempt += 1;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed after retries");
}

function buildPrompt(data: RepoData): string {
  const { repoStructure, techStack, packageJson, readmeContent } = data;
  const structureSample = repoStructure
    .slice(0, 500)
    .map(i => `- ${i.type}: ${i.path}`)
    .join("\n");

  const pkgPreview = packageJson ? JSON.stringify(packageJson, null, 2).slice(0, 4000) : "{}";
  const readmePreview = (readmeContent || "").slice(0, 4000);

  return [
    "You are an expert developer creating context files for AI coding assistants like Cursor.",
    "Based on this repository:",
    `- File structure: \n${structureSample}`,
    `- Tech stack: ${techStack.join(", ")}`,
    `- Package.json: \n${pkgPreview}`,
    (readmePreview ? `\nREADME (for context):\n${readmePreview}` : ""),
    "\nGenerate a comprehensive .cursorrules file that includes:",
    "- Coding style and conventions for [detected frameworks]",
    "- Best practices specific to this stack",
    "- File naming patterns",
    "- Import/export conventions",
    "- Testing approaches",
    "\nKeep it concise but detailed. Focus on what an AI needs to generate good code.",
  ].join("\n");
}

function buildOutputsFromBase(baseRules: string, data: RepoData): GeneratedFile[] {
  const { techStack, repoStructure, readmeContent } = data;
  const structureByFolders = repoStructure
    .filter(i => i.type === "tree")
    .map(i => i.path)
    .sort();
  const files: GeneratedFile[] = [];

  files.push({ name: ".cursorrules", content: baseRules.trim() });

  // PROJECT_OVERVIEW.md derives from README (fallback if missing)
  files.push({
    name: "PROJECT_OVERVIEW.md",
    content: [
      "# Project Overview",
      readmeContent?.trim() || "No README content detected. Provide a concise overview of the project's purpose, core features, and key dependencies.",
    ].join("\n\n"),
  });

  // ARCHITECTURE.md from folder structure
  files.push({
    name: "ARCHITECTURE.md",
    content: [
      "# Architecture",
      "## Folder Structure",
      structureByFolders.map(p => `- ${p}`).join("\n") || "No folder structure detected.",
      "\n## Notes",
      "Explain the responsibility of each top-level folder and how modules interact.",
    ].join("\n\n"),
  });

  // STACK.md from detected tech stack
  files.push({
    name: "STACK.md",
    content: [
      "# Tech Stack",
      techStack.length ? techStack.map(t => `- ${t}`).join("\n") : "No technologies detected.",
      "\n## Best Practices",
      "Document framework-specific conventions, performance tips, security practices, and testing recommendations for this stack.",
    ].join("\n\n"),
  });

  // CONVENTIONS.md as placeholder for patterns
  files.push({
    name: "CONVENTIONS.md",
    content: [
      "# Conventions",
      "Document naming, code style, folder/module organization, state management patterns, API conventions, and testing strategies observed in this repository.",
    ].join("\n\n"),
  });

  return files;
}

export const generateContextFiles = action({
  args: {
    repoData: v.object({
      repoStructure: v.array(v.object({ path: v.string(), type: v.string() })),
      techStack: v.array(v.string()),
      packageJson: v.optional(v.any()),
      readmeContent: v.optional(v.string()),
    }),
  },
  handler: async (_ctx, { repoData }): Promise<GeneratedFile[]> => {
    const prompt = buildPrompt(repoData);

    const baseRules = await withRetries(
      () => callAnthropic(prompt, 2200),
      2,
      800
    );

    const files = buildOutputsFromBase(baseRules, repoData);
    return files;
  },
});


