export function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it in .env (see .env.example).`);
  }
  if (value.length < minLength) {
    throw new Error(`Environment variable ${name} must be at least ${minLength} characters long.`);
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
