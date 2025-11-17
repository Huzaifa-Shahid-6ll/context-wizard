/**
 * Standardized error handling hook
 * Provides consistent error handling across the application
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorMessages';

export interface ErrorHandlerOptions {
  /**
   * User-friendly error message to display
   */
  userMessage?: string;
  /**
   * Whether to show a toast notification
   */
  showToast?: boolean;
  /**
   * Log level for error logging
   */
  logLevel?: 'error' | 'warn' | 'info';
  /**
   * Additional context for error logging
   */
  context?: Record<string, unknown>;
  /**
   * Callback to execute after error handling
   */
  onError?: (error: Error) => void;
  /**
   * Whether to re-throw the error
   */
  rethrow?: boolean;
}

export interface UseErrorHandlerReturn {
  /**
   * Current error state
   */
  error: Error | null;
  /**
   * Whether an error occurred
   */
  hasError: boolean;
  /**
   * Handle an error with standardized logic
   */
  handleError: (error: unknown, options?: ErrorHandlerOptions) => void;
  /**
   * Clear the error state
   */
  clearError: () => void;
  /**
   * Execute an async operation with automatic error handling
   */
  execute: <T>(
    operation: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
}

/**
 * Hook for standardized error handling
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (err: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        userMessage,
        showToast = true,
        logLevel = 'error',
        context = {},
        onError,
        rethrow = false,
      } = options;

      // Convert error to Error instance
      const errorInstance =
        err instanceof Error ? err : new Error(String(err));

      // Set error state
      setError(errorInstance);

      // Log error
      const logContext = {
        message: errorInstance.message,
        stack: errorInstance.stack,
        ...context,
      };

      switch (logLevel) {
        case 'error':
          logger.error('Error occurred', logContext);
          break;
        case 'warn':
          logger.warn('Warning occurred', logContext);
          break;
        case 'info':
          logger.info('Info', logContext);
          break;
      }

      // Show toast notification
      if (showToast) {
        const message =
          userMessage ||
          getErrorMessage(
            errorInstance.name || 'INTERNAL_ERROR',
            errorInstance.message
          );
        toast.error(message);
      }

      // Execute callback
      if (onError) {
        onError(errorInstance);
      }

      // Re-throw if requested
      if (rethrow) {
        throw errorInstance;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        clearError();
        const result = await operation();
        return result;
      } catch (err) {
        handleError(err, options);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    execute,
  };
}

