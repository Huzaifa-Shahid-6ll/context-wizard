/**
 * Hook for form validation using Zod schemas
 * Provides easy integration with React forms
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateSchema, validateField } from '@/lib/validation-schemas';

export interface UseFormValidationOptions<T> {
  /**
   * Zod schema for validation
   */
  schema: z.ZodSchema<T>;
  /**
   * Initial form values
   */
  initialValues?: Partial<T>;
  /**
   * Validate on change (default: false)
   */
  validateOnChange?: boolean;
  /**
   * Validate on blur (default: true)
   */
  validateOnBlur?: boolean;
}

export interface FormValidationState<T> {
  /**
   * Current form values
   */
  values: Partial<T>;
  /**
   * Validation errors
   */
  errors: Record<string, string>;
  /**
   * Whether the form is valid
   */
  isValid: boolean;
  /**
   * Whether validation has been attempted
   */
  touched: Record<string, boolean>;
}

export interface UseFormValidationReturn<T> extends FormValidationState<T> {
  /**
   * Update a field value
   */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /**
   * Set multiple field values
   */
  setValues: (values: Partial<T>) => void;
  /**
   * Validate a single field
   */
  validateField: (field: keyof T) => boolean;
  /**
   * Validate all fields
   */
  validate: () => boolean;
  /**
   * Reset form to initial values
   */
  reset: () => void;
  /**
   * Mark a field as touched
   */
  setTouched: (field: keyof T, touched?: boolean) => void;
  /**
   * Get field error
   */
  getFieldError: (field: keyof T) => string | undefined;
  /**
   * Check if field has error
   */
  hasFieldError: (field: keyof T) => boolean;
}

/**
 * Hook for form validation
 */
export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { schema, initialValues = {}, validateOnChange = false, validateOnBlur = true } = options;

  const [state, setState] = useState<FormValidationState<T>>({
    values: initialValues,
    errors: {},
    isValid: false,
    touched: {},
  });

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState((prev) => {
        const newValues = { ...prev.values, [field]: value };
        const newTouched = { ...prev.touched, [field]: true };

        // Validate on change if enabled
        let newErrors = prev.errors;
        if (validateOnChange) {
          const result = validateSchema(schema, newValues);
          if (!result.success) {
            newErrors = result.errors;
          } else {
            newErrors = {};
          }
        }

        return {
          ...prev,
          values: newValues,
          touched: newTouched,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [schema, validateOnChange]
  );

  const setValues = useCallback(
    (values: Partial<T>) => {
      setState((prev) => ({
        ...prev,
        values: { ...prev.values, ...values },
      }));
    },
    []
  );

  const validateFieldFn = useCallback(
    (field: keyof T): boolean => {
      const fieldSchema = (schema as any).shape?.[field as string];
      if (!fieldSchema) {
        return true;
      }

      const result = validateField(fieldSchema, state.values[field]);
      setState((prev) => {
        const newErrors = { ...prev.errors };
        if (result.valid) {
          delete newErrors[field as string];
        } else {
          newErrors[field as string] = result.error;
        }

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
          touched: { ...prev.touched, [field]: true },
        };
      });

      return result.valid;
    },
    [schema, state.values]
  );

  const validate = useCallback((): boolean => {
    const result = validateSchema(schema, state.values);
    setState((prev) => ({
      ...prev,
      errors: result.success ? {} : result.errors,
      isValid: result.success,
      touched: Object.keys(prev.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>
      ),
    }));

    return result.success;
  }, [schema, state.values]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      isValid: false,
      touched: {},
    });
  }, [initialValues]);

  const setTouched = useCallback((field: keyof T, touched = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));

    // Validate on blur if enabled
    if (touched && validateOnBlur) {
      validateFieldFn(field);
    }
  }, [validateOnBlur, validateFieldFn]);

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return state.errors[field as string];
    },
    [state.errors]
  );

  const hasFieldError = useCallback(
    (field: keyof T): boolean => {
      return !!state.errors[field as string] && !!state.touched[field as string];
    },
    [state.errors, state.touched]
  );

  return {
    ...state,
    setValue,
    setValues,
    validateField: validateFieldFn,
    validate,
    reset,
    setTouched,
    getFieldError,
    hasFieldError,
  };
}

