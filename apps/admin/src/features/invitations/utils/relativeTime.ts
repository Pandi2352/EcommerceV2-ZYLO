const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "in 3 days", "2 hours ago", "now": relative to the current time. */
export function formatRelative(value: string | Date, now: number = Date.now()): string {
  const diff = new Date(value).getTime() - now;
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'now';
}

/** Expiry wording for an invitation: "in 3 days" or "expired 2 days ago". */
export function describeExpiry(expiresAt: string): { label: string; expired: boolean } {
  const expired = new Date(expiresAt).getTime() <= Date.now();
  const relative = formatRelative(expiresAt);
  if (relative === 'now') return { label: expired ? 'expired just now' : 'in under a minute', expired };
  return { label: expired ? `expired ${relative}` : relative, expired };
}
