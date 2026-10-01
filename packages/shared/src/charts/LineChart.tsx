import React, { useLayoutEffect, useRef, useState } from 'react';

export interface LineSeries {
  key: string;
  label: string;
  /** CSS color, e.g. 'var(--viz-1)'; assign slots in fixed order */
  color: string;
  values: number[];
}

export interface LineChartProps {
  series: LineSeries[];
  /** One label per x position (e.g. dates) */
  labels: string[];
  formatLabel?: (label: string) => string;
  height?: number;
  ariaLabel: string;
}

const PAD = { top: 8, right: 12, bottom: 22, left: 32 };

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) ?? 10;
  return step * magnitude * 4;
}

/**
 * Multi-series line chart on one y-axis. Hover or use ←/→ for a crosshair that
 * reads every series at that x. A legend names each series.
 */
export const LineChart: React.FC<LineChartProps> = ({ series, labels, formatLabel = (l) => l, height = 200, ariaLabel }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = labels.length;
  const max = niceMax(Math.max(0, ...series.flatMap((s) => s.values)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (count <= 1 ? innerW / 2 : (i / (count - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const labelEvery = Math.max(1, Math.ceil(count / Math.max(2, Math.floor(innerW / 64))));

  const indexAt = (clientX: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const ratio = (clientX - rect.left - PAD.left) / innerW;
    return Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActive((i) => Math.min(count - 1, Math.max(0, (i ?? count - 1) + (e.key === 'ArrowRight' ? 1 : -1))));
  };

  const tooltipLeft = active !== null ? Math.min(Math.max(x(active), 80), width - 80) : 0;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-3 rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div ref={wrapRef} className="relative" onPointerLeave={() => setActive(null)}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerMove={(e) => setActive(indexAt(e.clientX))}
          className="block touch-none outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" />
              <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-zinc-400 text-[10px] tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % labelEvery === 0 || i === count - 1 ? (
              <text key={l} x={x(i)} y={height - 6} textAnchor="middle" className="fill-zinc-400 text-[10px]">
                {formatLabel(l)}
              </text>
            ) : null,
          )}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="#d4d4d8" />}
          {series.map((s) => (
            <polyline
              key={s.key}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            />
          ))}
          {active !== null &&
            series.map((s) => (
              <circle key={s.key} cx={x(active)} cy={y(s.values[active] ?? 0)} r={4} fill={s.color} stroke="white" strokeWidth={2} />
            ))}
        </svg>

        {active !== null && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-xs shadow-md"
            style={{ left: tooltipLeft }}
          >
            <p className="mb-1 font-medium text-zinc-500">{formatLabel(labels[active])}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <span aria-hidden="true" className="h-0.5 w-2.5 rounded" style={{ background: s.color }} />
                  {s.label}
                </span>
                <strong className="font-semibold tabular-nums text-zinc-900">{s.values[active] ?? 0}</strong>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;
