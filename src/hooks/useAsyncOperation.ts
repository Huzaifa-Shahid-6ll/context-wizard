/**
 * Hook for managing async operations with loading, error, and success states
 * Provides standardized pattern for handling async operations across the app
 */

import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface AsyncOperationOptions<T> {
  /**
   * Callback executed on success
   */
  onSuccess?: (data: T) => void;
  /**
   * Callback executed on error
   */
  onError?: (error: Error) => void;
  /**
   * Whether to reset loading state immediately after operation
   */
  resetOnComplete?: boolean;
  /**
   * User-friendly success message
   */
  successMessage?: string;
  /**
   * Whether to show error toast
   */
  showErrorToast?: boolean;
  /**
   * Whether to show success toast
   */
  showSuccessToast?: boolean;
}

export interface AsyncOperationState {
  /**
   * Whether the operation is currently in progress
   */
  isLoading: boolean;
  /**
   * Whether the operation completed successfully
   */
  isSuccess: boolean;
  /**
   * Whether the operation failed
   */
  isError: boolean;
  /**
   * Error object if operation failed
   */
  error: Error | null;
}

export interface UseAsyncOperationReturn<T> extends AsyncOperationState {
  /**
   * Execute the async operation
   */
  execute: (operation: () => Promise<T>, options?: AsyncOperationOptions<T>) => Promise<T | null>;
  /**
   * Reset the operation state
   */
  reset: () => void;
  /**
   * Set loading state manually
   */
  setLoading: (loading: boolean) => void;
}

/**
 * Hook for managing async operations
 */
export function useAsyncOperation<T = unknown>(): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const { handleError } = useErrorHandler();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      options: AsyncOperationOptions<T> = {}
    ): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        resetOnComplete = false,
        successMessage,
        showErrorToast = true,
        showSuccessToast = false,
      } = options;

      // Cancel previous operation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Reset error state and set loading
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      try {
        const result = await operation();

        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        // Success
        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        // Show success message if provided
        if (showSuccessToast && successMessage) {
          const { toast } = await import('sonner');
          toast.success(successMessage);
        }

        // Execute success callback
        if (onSuccess) {
          onSuccess(result);
        }

        // Reset state if requested
        if (resetOnComplete) {
          setTimeout(() => {
            setState({
              isLoading: false,
              isSuccess: false,
              isError: false,
              error: null,
            });
          }, 1000);
        }

        return result;
      } catch (error) {
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const errorInstance = error instanceof Error ? error : new Error(String(error));

        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: errorInstance,
        });

        // Handle error
        handleError(errorInstance, {
          showToast: showErrorToast,
          onError,
        });

        return null;
      }
    },
    [handleError]
  );

  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setLoading,
  };
}

/**
 * Hook for managing async operations with automatic retry
 */
export function useAsyncOperationWithRetry<T = unknown>(
  maxRetries = 3,
  retryDelay = 1000
): UseAsyncOperationReturn<T> & { retryCount: number } {
  const [retryCount, setRetryCount] = useState(0);
  const baseHook = useAsyncOperation<T>();

  const executeWithRetry = useCallback(
    async (
      operation: () => Promise<T>,
      options: AsyncOperationOptions<T> = {}
    ): Promise<T | null> => {
      let attempts = 0;

      const attemptOperation = async (): Promise<T | null> => {
        attempts++;
        setRetryCount(attempts - 1);

        const result = await baseHook.execute(operation, {
          ...options,
          onError: (error) => {
            if (attempts < maxRetries) {
              // Retry after delay
              setTimeout(() => {
                attemptOperation();
              }, retryDelay * attempts); // Exponential backoff
            } else {
              // Max retries reached, call original onError
              if (options.onError) {
                options.onError(error);
              }
            }
          },
        });

        if (result !== null) {
          setRetryCount(0);
          return result;
        }

        return null;
      };

      return attemptOperation();
    },
    [baseHook, maxRetries, retryDelay]
  );

  return {
    ...baseHook,
    execute: executeWithRetry,
    retryCount,
  };
}

