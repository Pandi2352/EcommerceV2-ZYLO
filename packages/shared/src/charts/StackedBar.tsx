import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface StackedSegment {
  key: string;
  label: string;
  value: number;
  /** CSS color; use categorical slots in fixed order */
  color: string;
  to?: string;
}

/**
 * Part-to-whole as one horizontal bar, with a legend that always shows each
 * count and share (so identity and values never depend on colour alone).
 */
export const StackedBar: React.FC<{ segments: StackedSegment[]; ariaLabel: string }> = ({ segments, ariaLabel }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const [hovered, setHovered] = useState<string | null>(null);
  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));

  return (
    <div>
      <div role="img" aria-label={ariaLabel} className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100">
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <span
                key={s.key}
                title={`${s.label}: ${s.value} (${pct(s.value)}%)`}
                onPointerEnter={() => setHovered(s.key)}
                onPointerLeave={() => setHovered(null)}
                className="h-full transition-opacity"
                style={{ width: `${(s.value / total) * 100}%`, background: s.color, opacity: hovered && hovered !== s.key ? 0.45 : 1 }}
              />
            ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {segments.map((s) => {
          const label = (
            <>
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="truncate text-zinc-600">{s.label}</span>
            </>
          );
          return (
            <li
              key={s.key}
              onPointerEnter={() => setHovered(s.key)}
              onPointerLeave={() => setHovered(null)}
              className="flex items-center justify-between gap-2 text-[13px]"
            >
              {s.to ? (
                <Link to={s.to} className="inline-flex min-w-0 items-center gap-1.5 hover:underline">
                  {label}
                </Link>
              ) : (
                <span className="inline-flex min-w-0 items-center gap-1.5">{label}</span>
              )}
              <span className="shrink-0 tabular-nums text-zinc-900">
                {s.value}
                <span className="ml-1 text-xs text-zinc-400">{pct(s.value)}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StackedBar;
