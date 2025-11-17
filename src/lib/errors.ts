/**
 * Standardized error handling for the application
 * Provides consistent error types and handling across the codebase
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  LLM_ERROR = 'LLM_ERROR',
  
  // Internal
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Business Logic
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    const base = {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
    if (this.details && typeof this.details === 'object' && this.details !== null) {
      return { ...base, details: this.details as Record<string, unknown> };
    }
    return base;
  }
}

/**
 * Handle unknown errors and convert them to AppError
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction 
      ? 'An internal error occurred'
      : error.message;
    
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      message,
      500,
      isProduction ? undefined : { originalError: error.message, stack: error.stack }
    );
  }
  
  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    'An unknown error occurred',
    500
  );
}

/**
 * Create standardized error responses for API routes
 */
export function createErrorResponse(error: unknown) {
  const appError = handleError(error);
  const errorObj: { code: ErrorCode; message: string; details?: unknown } = {
    code: appError.code,
    message: appError.message,
  };
  if (appError.details && typeof appError.details === 'object' && appError.details !== null) {
    errorObj.details = appError.details;
  }
  return {
    error: errorObj,
    statusCode: appError.statusCode,
  };
}

/**
 * Common error constructors for consistency
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized access') => 
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Access forbidden') => 
    new AppError(ErrorCode.FORBIDDEN, message, 403),
  
  notFound: (resource = 'Resource', message?: string) => 
    new AppError(
      ErrorCode.RESOURCE_NOT_FOUND, 
      message || `${resource} not found`,
      404
    ),
  
  invalidInput: (message: string, details?: unknown) => 
    new AppError(ErrorCode.INVALID_INPUT, message, 400, details),
  
  rateLimitExceeded: (message = 'Rate limit exceeded') => 
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),
  
  limitExceeded: (message: string) => 
    new AppError(ErrorCode.LIMIT_EXCEEDED, message, 403),
  
  subscriptionRequired: (message = 'Pro subscription required') => 
    new AppError(ErrorCode.SUBSCRIPTION_REQUIRED, message, 403),
};

