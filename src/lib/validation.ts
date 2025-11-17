/**
 * Input validation utilities
 * Provides consistent validation across the application
 */

import { Errors, ErrorCode } from './errors';

// Validation constants
export const VALIDATION_LIMITS = {
  PROMPT_CONTENT_MAX_LENGTH: 100000,
  PROMPT_CONTENT_MIN_LENGTH: 1,
  PROMPT_TITLE_MAX_LENGTH: 200,
  PROMPT_TITLE_MIN_LENGTH: 1,
  FEEDBACK_MESSAGE_MIN_LENGTH: 10,
  FEEDBACK_MESSAGE_MAX_LENGTH: 5000,
  EMAIL_MAX_LENGTH: 255,
  USER_ID_MAX_LENGTH: 100,
  PROJECT_NAME_MAX_LENGTH: 100,
  PROJECT_NAME_MIN_LENGTH: 1,
} as const;

/**
 * Validate prompt content
 */
export function validatePromptContent(content: string): void {
  if (!content || typeof content !== 'string') {
    throw Errors.invalidInput('Prompt content is required');
  }
  
  const trimmed = content.trim();
  if (trimmed.length < VALIDATION_LIMITS.PROMPT_CONTENT_MIN_LENGTH) {
    throw Errors.invalidInput(
      `Prompt content must be at least ${VALIDATION_LIMITS.PROMPT_CONTENT_MIN_LENGTH} character(s)`
    );
  }
  
  if (trimmed.length > VALIDATION_LIMITS.PROMPT_CONTENT_MAX_LENGTH) {
    throw Errors.invalidInput(
      `Prompt content cannot exceed ${VALIDATION_LIMITS.PROMPT_CONTENT_MAX_LENGTH} characters`
    );
  }
}

/**
 * Validate prompt title
 */
export function validatePromptTitle(title: string): void {
  if (!title || typeof title !== 'string') {
    throw Errors.invalidInput('Prompt title is required');
  }
  
  const trimmed = title.trim();
  if (trimmed.length < VALIDATION_LIMITS.PROMPT_TITLE_MIN_LENGTH) {
    throw Errors.invalidInput(
      `Prompt title must be at least ${VALIDATION_LIMITS.PROMPT_TITLE_MIN_LENGTH} character(s)`
    );
  }
  
  if (trimmed.length > VALIDATION_LIMITS.PROMPT_TITLE_MAX_LENGTH) {
    throw Errors.invalidInput(
      `Prompt title cannot exceed ${VALIDATION_LIMITS.PROMPT_TITLE_MAX_LENGTH} characters`
    );
  }
}

/**
 * Validate user ID (Clerk ID)
 */
export function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string') {
    throw Errors.invalidInput('User ID is required');
  }
  
  if (userId.length > VALIDATION_LIMITS.USER_ID_MAX_LENGTH) {
    throw Errors.invalidInput('User ID is too long');
  }
  
  // Basic format validation for Clerk IDs
  if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
    throw Errors.invalidInput('Invalid user ID format');
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw Errors.invalidInput('Email is required');
  }
  
  if (email.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) {
    throw Errors.invalidInput('Email is too long');
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw Errors.invalidInput('Invalid email format');
  }
}

/**
 * Validate feedback message
 */
export function validateFeedbackMessage(message: string): void {
  if (!message || typeof message !== 'string') {
    throw Errors.invalidInput('Feedback message is required');
  }
  
  const trimmed = message.trim();
  if (trimmed.length < VALIDATION_LIMITS.FEEDBACK_MESSAGE_MIN_LENGTH) {
    throw Errors.invalidInput(
      `Feedback must be at least ${VALIDATION_LIMITS.FEEDBACK_MESSAGE_MIN_LENGTH} characters`
    );
  }
  
  if (trimmed.length > VALIDATION_LIMITS.FEEDBACK_MESSAGE_MAX_LENGTH) {
    throw Errors.invalidInput(
      `Feedback cannot exceed ${VALIDATION_LIMITS.FEEDBACK_MESSAGE_MAX_LENGTH} characters`
    );
  }
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw Errors.invalidInput('Project name is required');
  }
  
  const trimmed = name.trim();
  if (trimmed.length < VALIDATION_LIMITS.PROJECT_NAME_MIN_LENGTH) {
    throw Errors.invalidInput(
      `Project name must be at least ${VALIDATION_LIMITS.PROJECT_NAME_MIN_LENGTH} character(s)`
    );
  }
  
  if (trimmed.length > VALIDATION_LIMITS.PROJECT_NAME_MAX_LENGTH) {
    throw Errors.invalidInput(
      `Project name cannot exceed ${VALIDATION_LIMITS.PROJECT_NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate array of strings
 */
export function validateStringArray(arr: unknown, maxLength = 100, itemMaxLength = 100): string[] {
  if (!Array.isArray(arr)) {
    throw Errors.invalidInput('Expected an array');
  }
  
  if (arr.length > maxLength) {
    throw Errors.invalidInput(`Array cannot exceed ${maxLength} items`);
  }
  
  return arr.map((item, index) => {
    if (typeof item !== 'string') {
      throw Errors.invalidInput(`Array item at index ${index} must be a string`);
    }
    if (item.length > itemMaxLength) {
      throw Errors.invalidInput(`Array item at index ${index} exceeds maximum length`);
    }
    return sanitizeString(item);
  });
}

/**
 * Validate and sanitize object structure
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<keyof T, (value: unknown) => unknown>
): T {
  if (typeof obj !== 'object' || obj === null) {
    throw Errors.invalidInput('Expected an object');
  }
  
  const result = {} as T;
  const input = obj as Record<string, unknown>;
  
  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in input)) {
      throw Errors.invalidInput(`Missing required field: ${key}`);
    }
    result[key as keyof T] = validator(input[key]) as T[keyof T];
  }
  
  return result;
}
