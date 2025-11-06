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
  // Stripe subscription fields
  stripeCustomerId: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  stripePriceId: v.optional(v.string()),
  subscriptionStatus: v.optional(v.string()),
  subscriptionCurrentPeriodEnd: v.optional(v.number()),
  subscriptionCancelAtPeriodEnd: v.optional(v.boolean()),
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
    v.literal("image"),
    v.literal("video")
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
  predictedOutput: v.any(), // Allow any type for backward compatibility
  confidence: v.number(), // 0-100
  createdAt: v.number(),
})
  .index("by_userId", ["userId"]) // lookup by user
  .index("by_createdAt", ["createdAt"]); // sort/filter by creation time

// Security Events table schema
const securityEvents = defineTable({
  type: v.string(),
  userId: v.optional(v.string()),
  ip: v.string(),
  fingerprint: v.string(),
  details: v.any(),
  severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  timestamp: v.number(),
})
  .index("by_timestamp", ["timestamp"])
  .index("by_ip", ["ip"]);

// Banned IPs table schema
const bannedIps = defineTable({
  ip: v.string(),
  reason: v.string(),
  bannedAt: v.number(),
  expiresAt: v.optional(v.number()),
  bannedBy: v.string(),
})
  .index("by_ip", ["ip"]);

// Context Memory table schema for advanced context management
const contextMemory = defineTable({
  userId: v.string(),
  sessionId: v.string(),
  contextType: v.union(
    v.literal("conversation"),
    v.literal("project"),
    v.literal("domain"),
    v.literal("preference")
  ),
  content: v.string(),
  metadata: v.optional(v.any()),
  importance: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_sessionId", ["sessionId"])
  .index("by_contextType", ["contextType"])
  .index("by_importance", ["importance"])
  .index("by_createdAt", ["createdAt"]);

// Prompt Templates table schema for reusable prompt patterns
const promptTemplates = defineTable({
  userId: v.string(),
  name: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("generic"),
    v.literal("image"),
    v.literal("video"),
    v.literal("cursor-app"),
    v.literal("analysis")
  ),
  template: v.string(),
  variables: v.array(v.string()),
  metadata: v.optional(v.any()),
  isPublic: v.boolean(),
  usageCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_category", ["category"])
  .index("by_isPublic", ["isPublic"])
  .index("by_usageCount", ["usageCount"]);

// Structured Input Templates table schema
const structuredInputTemplates = defineTable({
  featureType: v.string(), // "image", "video", "cursor-app", "generic", "analysis"
  category: v.string(),
  fields: v.array(v.object({
    fieldName: v.string(),
    fieldType: v.string(), // "dropdown", "multi-select", "slider", "textarea", "checkbox"
    options: v.optional(v.array(v.string())),
    defaultValue: v.optional(v.any()),
    tooltip: v.string(),
    required: v.boolean(),
    validation: v.optional(v.any()),
  })),
  isDefault: v.boolean(),
  usageCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_featureType", ["featureType"])
  .index("by_category", ["category"])
  .index("by_isDefault", ["isDefault"]);

// User Preferences table schema for auto-fill and personalization
const userPreferences = defineTable({
  userId: v.string(),
  featureType: v.string(),
  savedInputs: v.any(), // Structured data from previous uses
  autoFillEnabled: v.boolean(),
  preferredMode: v.union(v.literal("quick"), v.literal("standard"), v.literal("advanced")),
  customTemplates: v.array(v.string()), // Template IDs
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_featureType", ["featureType"]);

// Form Submissions table schema for tracking structured form usage
const formSubmissions = defineTable({
  userId: v.string(),
  featureType: v.string(),
  formData: v.any(), // Complete structured form data
  generatedPrompt: v.string(),
  quality: v.optional(v.number()), // User rating 1-5
  feedback: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_featureType", ["featureType"])
  .index("by_createdAt", ["createdAt"]);

// Export the schema
export default defineSchema({
  users,
  generations,
  prompts,
  promptAnalyses,
  outputPredictions,
  securityEvents,
  bannedIps,
  contextMemory,
  promptTemplates,
  structuredInputTemplates,
  userPreferences,
  formSubmissions,
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


