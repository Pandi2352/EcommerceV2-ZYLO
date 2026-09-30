import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { getApiError, type ApiError } from '../api/client';
import type { Validator } from '../utils/validators';

type FormValues = Record<string, string | boolean>;
type FieldErrors<V> = Partial<Record<keyof V, string>>;
export type FormRules<V> = Partial<Record<keyof V, Validator<V>[]>>;

interface UseFormOptions<V extends FormValues> {
  initialValues: V;
  rules?: FormRules<V>;
  onSubmit: (values: V) => Promise<void> | void;
  /** Handle an API error yourself; return true to suppress the default form-level message. */
  onError?: (error: ApiError) => boolean | void;
}

/**
 * Form state, validation, submission and API error handling in one place.
 * `field(name)` returns the props for InputField / PasswordField.
 */
export function useForm<V extends FormValues>({ initialValues, rules = {}, onSubmit, onError }: UseFormOptions<V>) {
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<V>>({});
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Captured once so `reset` stays stable even when callers pass inline objects
  const initialRef = useRef(initialValues);

  const validateField = useCallback(
    (name: keyof V, all: V): string | undefined => {
      for (const validator of rules[name] ?? []) {
        const message = validator(String(all[name] ?? ''), all);
        if (message) return message;
      }
      return undefined;
    },
    [rules],
  );

  const setValue = useCallback(<K extends keyof V>(name: K, value: V[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    setFormError(null);
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = event.target;
      const next = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
      setValue(name as keyof V, next as V[keyof V]);
    },
    [setValue],
  );

  const validate = useCallback((): boolean => {
    const current = values;
    const nextErrors: FieldErrors<V> = {};
    for (const name of Object.keys(rules) as (keyof V)[]) {
      const message = validateField(name, current);
      if (message) nextErrors[name] = message;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values, rules, validateField]);

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (isSubmitting || !validate()) return;

      setIsSubmitting(true);
      setFormError(null);
      try {
        await onSubmit(values);
      } catch (error) {
        const apiError = getApiError(error);
        if (!onError?.(apiError)) setFormError(apiError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, isSubmitting, validate, onSubmit, onError],
  );

  const reset = useCallback((next?: V) => {
    setValues(next ?? initialRef.current);
    setErrors({});
    setFormError(null);
  }, []);

  const field = <K extends keyof V>(name: K) => ({
    name: name as string,
    value: String(values[name] ?? ''),
    onChange: handleChange,
    error: errors[name],
  });

  return {
    values,
    errors,
    formError,
    isSubmitting,
    setValue,
    setErrors,
    setFormError,
    handleChange,
    handleSubmit,
    reset,
    field,
  };
}
