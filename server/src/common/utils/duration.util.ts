const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parse a duration string such as "15m", "7d" or "3600s" into milliseconds.
 * A bare number is treated as seconds (matching jsonwebtoken semantics).
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*([smhd]?)$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration "${value}". Use a number followed by s, m, h or d (e.g. 15m, 7d).`);
  }
  const amount = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  return amount * UNIT_MS[unit];
}
