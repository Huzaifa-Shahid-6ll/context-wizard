/**
 * Production-safe error messages
 * Provides generic error messages for production while allowing detailed messages in development
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get a production-safe error message
 * In production, returns generic messages to avoid information disclosure
 * In development, returns detailed messages for debugging
 */
export function getErrorMessage(errorCode: string, detailedMessage: string): string {
  if (!isProduction) {
    return detailedMessage;
  }
  
  // Map error codes to generic production messages
  const productionMessages: Record<string, string> = {
    'UNAUTHORIZED': 'You are not authorized to perform this action',
    'FORBIDDEN': 'Access denied',
    'USER_NOT_FOUND': 'User not found',
    'RESOURCE_NOT_FOUND': 'Resource not found',
    'INVALID_INPUT': 'Invalid input provided',
    'MISSING_REQUIRED_FIELD': 'Required field is missing',
    'INVALID_FORMAT': 'Invalid format',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later',
    'LIMIT_EXCEEDED': 'Usage limit exceeded',
    'SUBSCRIPTION_REQUIRED': 'This feature requires a Pro subscription',
    'EXTERNAL_SERVICE_ERROR': 'External service error. Please try again later',
    'STRIPE_ERROR': 'Payment processing error. Please try again',
    'LLM_ERROR': 'AI service error. Please try again',
    'INTERNAL_ERROR': 'An internal error occurred',
    'DATABASE_ERROR': 'Database error. Please try again',
  };
  
  // Extract base error code (before colon)
  const baseCode = errorCode.split(':')[0];
  
  return productionMessages[baseCode] || 'An error occurred';
}

/**
 * Create a production-safe error response
 */
export function createSafeErrorResponse(error: unknown) {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (error instanceof Error) {
    const message = isProd 
      ? getErrorMessage(error.message, error.message)
      : error.message;
    
    return {
      error: {
        message,
        ...(isProd ? {} : { code: error.message.split(':')[0], stack: error.stack }),
      },
    };
  }
  
  return {
    error: {
      message: 'An unexpected error occurred',
    },
  };
}

