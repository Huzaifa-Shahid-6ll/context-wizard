import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Users table schema
const users = defineTable({
  clerkId: v.string(),
  email: v.string(),
  // Defaults are enforced in application logic when creating documents
  generationsToday: v.optional(v.number()),
  lastResetDate: v.string(),
  isPro: v.optional(v.boolean()),
  createdAt: v.number(),
  // New fields for prompt tracking
  promptsCreatedToday: v.optional(v.number()),
  lastPromptResetDate: v.optional(v.string()),
}).index("by_clerkId", ["clerkId"]);

// Generations table schema
const generations = defineTable({
  userId: v.string(),
  repoUrl: v.string(),
  repoName: v.string(),
  techStack: v.array(v.string()),
  files: v.array(
    v.object({
      name: v.string(),
      content: v.string(),
    })
  ),
  status: v.union(
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"]) // lookup by user
  .index("by_createdAt", ["createdAt"]); // sort/filter by creation time

// Prompts table schema
const prompts = defineTable({
  userId: v.string(),
  type: v.union(
    v.literal("cursor-app"),
    v.literal("frontend"),
    v.literal("backend"),
    v.literal("cursorrules"),
    v.literal("error-fix"),
    v.literal("generic"),
    v.literal("image")
  ),
  title: v.string(),
  content: v.string(),
  context: v.optional(v.any()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"]) // lookup by user
  .index("by_type", ["type"]) // filter by type
  .index("by_createdAt", ["createdAt"]); // sort/filter by creation time

// Prompt Analyses table schema
const promptAnalyses = defineTable({
  userId: v.string(),
  originalPrompt: v.string(),
  score: v.number(), // 0-100
  issues: v.array(v.string()),
  suggestions: v.array(v.string()),
  improvedPrompt: v.string(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"]) // lookup by user
  .index("by_createdAt", ["createdAt"]); // sort/filter by creation time

// Output Predictions table schema
const outputPredictions = defineTable({
  userId: v.string(),
  prompt: v.string(),
  predictedOutput: v.string(),
  confidence: v.number(), // 0-100
  createdAt: v.number(),
})
  .index("by_userId", ["userId"]) // lookup by user
  .index("by_createdAt", ["createdAt"]); // sort/filter by creation time

// Export the schema
export default defineSchema({
  users,
  generations,
  prompts,
  promptAnalyses,
  outputPredictions,
});

// Type helpers generated via convex codegen (imported by consumers):
//   import { Doc, Id } from "./_generated/dataModel";
// Example aliases for clarity in app code (consumers can import these types):
export type UsersDoc = import("./_generated/dataModel").Doc<"users">;
export type UsersId = import("./_generated/dataModel").Id<"users">;
export type GenerationsDoc = import("./_generated/dataModel").Doc<"generations">;
export type GenerationsId = import("./_generated/dataModel").Id<"generations">;
export type PromptsDoc = import("./_generated/dataModel").Doc<"prompts">;
export type PromptsId = import("./_generated/dataModel").Id<"prompts">;
export type PromptAnalysesDoc = import("./_generated/dataModel").Doc<"promptAnalyses">;
export type PromptAnalysesId = import("./_generated/dataModel").Id<"promptAnalyses">;
export type OutputPredictionsDoc = import("./_generated/dataModel").Doc<"outputPredictions">;
export type OutputPredictionsId = import("./_generated/dataModel").Id<"outputPredictions">;


