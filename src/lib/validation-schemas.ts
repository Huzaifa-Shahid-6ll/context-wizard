/**
 * Zod validation schemas for common form inputs
 * Provides type-safe validation across the application
 */

import { z } from 'zod';

// ============================================================================
// Common Field Schemas
// ============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

/**
 * Optional email validation schema
 */
export const optionalEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .optional()
  .or(z.literal(''));

/**
 * User ID validation (Clerk ID format)
 */
export const userIdSchema = z
  .string()
  .min(1, 'User ID is required')
  .max(100, 'User ID must be less than 100 characters')
  .regex(/^user_[a-zA-Z0-9]+$/, 'Invalid user ID format');

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'This field is required')
  .trim();

/**
 * Text content schema with length limits
 */
export const textContentSchema = (minLength = 1, maxLength = 10000) =>
  z
    .string()
    .min(minLength, `Content must be at least ${minLength} characters`)
    .max(maxLength, `Content must be less than ${maxLength} characters`)
    .trim();

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Feedback form schema
 */
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'docs', 'confusion'], {
    errorMap: () => ({ message: 'Please select a feedback type' }),
  }),
  message: textContentSchema(10, 1000),
  email: optionalEmailSchema,
  rating: z.number().min(1).max(5).optional(),
  page: z.string().optional(),
  userAgent: z.string().optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

/**
 * Generic prompt form schema
 */
export const genericPromptSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  goal: textContentSchema(5, 500),
  context: textContentSchema(0, 2000).optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  format: z.string().optional(),
  length: z.string().optional(),
});

export type GenericPromptFormData = z.infer<typeof genericPromptSchema>;

/**
 * Project name schema
 */
export const projectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(100, 'Project name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores');

/**
 * Prompt content schema
 */
export const promptContentSchema = textContentSchema(10, 50000);

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters')
  .optional()
  .or(z.literal(''));

/**
 * Phone number schema (basic validation)
 */
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters')
  .optional()
  .or(z.literal(''));

/**
 * Array of strings schema
 */
export const stringArraySchema = (minItems = 0, maxItems = 100, itemMaxLength = 100) =>
  z
    .array(z.string().max(itemMaxLength, `Each item must be less than ${itemMaxLength} characters`))
    .min(minItems, `At least ${minItems} item(s) required`)
    .max(maxItems, `Maximum ${maxItems} items allowed`);

/**
 * Date string schema (ISO format)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    },
    { message: 'Please enter a valid date' }
  );

/**
 * Number schema with range
 */
export const numberRangeSchema = (min = 0, max = Number.MAX_SAFE_INTEGER) =>
  z
    .number()
    .min(min, `Value must be at least ${min}`)
    .max(max, `Value must be at most ${max}`);

/**
 * Positive integer schema
 */
export const positiveIntegerSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate data against a schema and return formatted errors
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });

    return { success: false, errors };
  } catch (error) {
    return {
      success: false,
      errors: { _root: error instanceof Error ? error.message : 'Validation failed' },
    };
  }
}

/**
 * Validate a single field against a schema
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: true; data: T } | { valid: false; error: string } {
  try {
    const result = schema.safeParse(value);
    if (result.success) {
      return { valid: true, data: result.data };
    }
    return { valid: false, error: result.error.errors[0]?.message || 'Invalid value' };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Create a partial schema (all fields optional)
 */
export function partialSchema<T extends z.ZodTypeAny>(schema: T) {
  return (schema as any).partial();
}

