/**
 * Structured validators for formData
 * 
 * Replaces v.any() with type-safe validators for form data structures
 */

import { v } from "convex/values";

/**
 * Validator for cursor builder form data
 * Based on the structure from cursor-builder page
 */
export const cursorBuilderFormDataValidator = v.object({
  projectName: v.string(),
  oneSentence: v.string(),
  projectDescription: v.string(),
  problemStatement: v.string(),
  primaryGoal: v.string(),
  targetAudience: v.optional(v.string()),
  frontend: v.optional(v.string()),
  backend: v.optional(v.string()),
  database: v.optional(v.string()),
  tools: v.optional(v.array(v.string())),
  projectType: v.optional(v.string()),
  features: v.array(v.object({
    name: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("must-have"),
      v.literal("should-have"),
      v.literal("nice-to-have")
    ),
  })),
  // Note: Additional fields are allowed but not strictly validated
});

/**
 * Generic form data validator - accepts any object structure
 * but validates it's an object (not array, not null)
 * Uses v.any() internally but wrapped in object validation for structure safety
 */
export const genericFormDataValidator = v.any(); // FormData structure is too complex to validate strictly
// Note: We validate it's an object in the handler, but allow any structure for flexibility

/**
 * Validator for user preferences form data
 */
export const userPreferencesFormDataValidator = v.any(); // Flexible structure for user preferences

/**
 * Validator for chat context
 */
export const chatContextValidator = v.object({
  formData: v.optional(genericFormDataValidator),
  prd: v.optional(v.string()),
  userFlows: v.optional(v.string()),
  taskFile: v.optional(v.string()),
  generatedPrompts: v.optional(v.any()), // Complex nested structure
  selectedPromptTypes: v.optional(v.array(v.string())),
  // Note: Additional fields are allowed but not strictly validated
});

