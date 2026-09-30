/** Password rules, mirroring the server's IsStrongPassword validator. */
export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: '8+ characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Uppercase (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Lowercase (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'Symbol (@$!%*?&#_)', test: (p) => /[@$!%*?&#_]/.test(p) },
];

const ALLOWED_CHARACTERS = /^[A-Za-z\d@$!%*?&#_]*$/;

export const PASSWORD_POLICY_MESSAGE =
  'Use 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol (@$!%*?&#_).';

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordEvaluation {
  results: { rule: PasswordRule; passed: boolean }[];
  passedCount: number;
  strength: PasswordStrength;
  isValid: boolean;
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const results = PASSWORD_RULES.map((rule) => ({ rule, passed: rule.test(password) }));
  const passedCount = results.filter((r) => r.passed).length;
  const isValid = passedCount === PASSWORD_RULES.length && ALLOWED_CHARACTERS.test(password);

  let strength: PasswordStrength = 'empty';
  if (password) {
    if (passedCount <= 2) strength = 'weak';
    else if (passedCount === 3) strength = 'fair';
    else if (passedCount === 4) strength = 'good';
    else strength = 'strong';
  }

  return { results, passedCount, strength, isValid };
}
