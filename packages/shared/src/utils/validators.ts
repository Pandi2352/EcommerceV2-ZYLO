import { evaluatePassword, PASSWORD_POLICY_MESSAGE } from './passwordPolicy';

/**
 * Composable field validators for useForm. Each returns an error message or
 * undefined. They receive all form values so cross-field rules are possible.
 */
export type Validator<V> = (value: string, values: V) => string | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required =
  <V>(message = 'This field is required'): Validator<V> =>
  (value) =>
    value.trim() ? undefined : message;

export const email =
  <V>(message = 'Please enter a valid email address'): Validator<V> =>
  (value) =>
    !value.trim() || EMAIL_PATTERN.test(value.trim()) ? undefined : message;

export const minLength =
  <V>(length: number, message?: string): Validator<V> =>
  (value) =>
    !value || value.trim().length >= length ? undefined : message ?? `Must be at least ${length} characters`;

export const strongPassword =
  <V>(message = PASSWORD_POLICY_MESSAGE): Validator<V> =>
  (value) =>
    !value || evaluatePassword(value).isValid ? undefined : message;

export const matchesField =
  <V>(field: keyof V, message = 'Values do not match'): Validator<V> =>
  (value, values) =>
    value === String(values[field] ?? '') ? undefined : message;

export const differsFromField =
  <V>(field: keyof V, message = 'Must be different'): Validator<V> =>
  (value, values) =>
    !value || value !== String(values[field] ?? '') ? undefined : message;

export const pattern =
  <V>(regex: RegExp, message: string): Validator<V> =>
  (value) =>
    !value || regex.test(value) ? undefined : message;
