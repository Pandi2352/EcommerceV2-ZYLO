import React, { useState } from 'react';
import { formatPrice } from '@shared/utils/currency';
import type { SalesTimelinePoint } from '@shared/types/analytics';

interface Props {
  chartData: SalesTimelinePoint[];
  currencySymbol: string;
  loading: boolean;
}

type ChartMetric = 'revenue' | 'orders';

export const RevenueChartCard: React.FC<Props> = ({
  chartData,
  currencySymbol,
  loading,
}) => {
  const [metric, setMetric] = useState<ChartMetric>('revenue');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Summary Metrics for the current timeline
  const totalRevenue = chartData.reduce((acc, p) => acc + p.revenue, 0);
  const totalOrders = chartData.reduce((acc, p) => acc + p.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgDailySales = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  // Chart coordinate calculations
  const values = chartData.map((d) => (metric === 'revenue' ? d.revenue : d.orders));
  const rawMax = Math.max(...values, 1);
  const maxValue = Math.ceil(rawMax * 1.15); // Add 15% top headroom

  const chartHeight = 220;
  const chartWidth = 700;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const count = chartData.length;
  const getX = (index: number) =>
    count <= 1 ? padLeft + innerW / 2 : padLeft + (index / (count - 1)) * innerW;
  const getY = (val: number) => padTop + innerH - (val / maxValue) * innerH;

  // Generate SVG path for line and area fill
  const points = chartData.map((d, i) => ({
    x: getX(i),
    y: getY(metric === 'revenue' ? d.revenue : d.orders),
  }));

  const linePath = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    '',
  );

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${
          padTop + innerH
        } Z`
      : '';

  const hoveredPoint = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Sales Velocity & Order Volume</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Timeline breakdown of transactional volume across the selected timeframe
          </p>
        </div>

        {/* Metric Selector Pill */}
        <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-sm text-xs transition-colors cursor-pointer ${
              metric === 'revenue'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gross Revenue ({currencySymbol})
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1 rounded-sm text-xs transition-colors cursor-pointer ${
              metric === 'orders'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Volume (#)
          </button>
        </div>
      </div>

      {/* Sub-Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-center">
        <div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {formatPrice(totalRevenue, { currencySymbol })}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
            Period Revenue
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">
            {totalOrders.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
            Total Orders
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {formatPrice(avgOrderValue, { currencySymbol })}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
            Avg Order Value
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-600 font-mono">
            {formatPrice(avgDailySales, { currencySymbol })}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
            Daily Average
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-6 pb-2">
        {loading ? (
          <div className="w-full h-60 bg-slate-50 animate-pulse rounded-md flex items-center justify-center text-xs text-slate-400">
            Loading timeline data...
          </div>
        ) : count === 0 ? (
          <div className="w-full h-60 flex items-center justify-center text-xs text-slate-400">
            No sales data recorded for this period.
          </div>
        ) : (
          <div className="w-full relative">
            <svg
              className="w-full h-64 overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padTop + innerH - pct * innerH;
                const labelVal = Math.round(maxValue * pct);
                return (
                  <g key={pct}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {metric === 'revenue'
                        ? `${currencySymbol}${labelVal >= 1000 ? `${(labelVal / 1000).toFixed(1)}k` : labelVal}`
                        : labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {/* Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Points & Hover Triggers */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  {/* Invisible hover trigger area */}
                  <rect
                    x={pt.x - innerW / (count * 2)}
                    y={padTop}
                    width={innerW / count}
                    height={innerH}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(idx)}
                    className="cursor-pointer"
                  />

                  {/* Dot on hovered point or active end */}
                  {(hoverIndex === idx || (hoverIndex === null && idx === count - 1)) && (
                    <>
                      <line
                        x1={pt.x}
                        y1={padTop}
                        x2={pt.x}
                        y2={padTop + innerH}
                        stroke="#818cf8"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <circle cx={pt.x} cy={pt.y} r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                    </>
                  )}
                </g>
              ))}

              {/* X Axis Labels */}
              {chartData.map((d, idx) => {
                const step = Math.max(1, Math.ceil(count / 7));
                if (idx % step !== 0 && idx !== count - 1) return null;
                const x = getX(idx);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && hoverIndex !== null && (
              <div
                className="absolute pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-md text-xs shadow-lg transform -translate-x-1/2 -translate-y-full mb-3 z-20 border border-slate-700/50"
                style={{
                  left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
                  top: `${(getY(metric === 'revenue' ? hoveredPoint.revenue : hoveredPoint.orders) / chartHeight) * 100}%`,
                }}
              >
                <p className="font-semibold text-slate-300 text-[11px]">{hoveredPoint.label} ({hoveredPoint.date})</p>
                <div className="mt-1 flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Revenue</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {formatPrice(hoveredPoint.revenue, { currencySymbol })}
                    </span>
                  </div>
                  <div className="border-l border-slate-700 pl-3">
                    <span className="text-[10px] text-slate-400 block">Orders</span>
                    <span className="font-bold text-indigo-400">{hoveredPoint.orders}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChartCard;
