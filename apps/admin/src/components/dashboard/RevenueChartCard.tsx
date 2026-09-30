import React, { useState } from 'react';

type TimeFilter = 'ALL' | '1M' | '6M' | '1Y';

export const RevenueChartCard: React.FC = () => {
  const [filter, setFilter] = useState<TimeFilter>('ALL');

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800">Revenue</h3>

        <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
          {(['ALL', '1M', '6M', '1Y'] as TimeFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-sm text-xs transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#405189] text-white shadow-none font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-center">
        <div>
          <p className="text-lg font-bold text-slate-800">7,585</p>
          <p className="text-xs text-slate-500 font-medium">Orders</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">$22.89k</p>
          <p className="text-xs text-slate-500 font-medium">Earnings</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">367</p>
          <p className="text-xs text-slate-500 font-medium">Refunds</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-600">18.92%</p>
          <p className="text-xs text-slate-500 font-medium">Conversation Ratio</p>
        </div>
      </div>

      {/* Interactive Responsive SVG Bar & Area Chart */}
      <div className="pt-6 pb-2">
        <div className="w-full h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="45" y1="20" x2="590" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="60" x2="590" y2="60" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="100" x2="590" y2="100" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="140" x2="590" y2="140" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="180" x2="590" y2="180" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="220" x2="590" y2="220" stroke="#f1f5f9" strokeWidth="1" />

            {/* Y-Axis Labels */}
            <text x="5" y="24" className="text-[10px] fill-slate-400 font-sans">120.00</text>
            <text x="5" y="64" className="text-[10px] fill-slate-400 font-sans">100.00</text>
            <text x="10" y="104" className="text-[10px] fill-slate-400 font-sans">80.00</text>
            <text x="10" y="144" className="text-[10px] fill-slate-400 font-sans">60.00</text>
            <text x="10" y="184" className="text-[10px] fill-slate-400 font-sans">40.00</text>
            <text x="10" y="224" className="text-[10px] fill-slate-400 font-sans">20.00</text>

            {/* Purple Bar Columns */}
            {/* Bar 1 */}
            <rect x="75" y="90" width="38" height="130" fill="#59489f" rx="2" />
            {/* Bar 2 */}
            <rect x="180" y="140" width="38" height="80" fill="#59489f" rx="2" opacity="0.3" />
            {/* Bar 3 */}
            <rect x="285" y="70" width="38" height="150" fill="#59489f" rx="2" />
            {/* Bar 4 */}
            <rect x="390" y="130" width="38" height="90" fill="#59489f" rx="2" opacity="0.3" />
            {/* Bar 5 */}
            <rect x="495" y="110" width="38" height="110" fill="#59489f" rx="2" />

            {/* Green Filled Gradient Area */}
            <defs>
              <linearGradient id="greenArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0ab39c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0ab39c" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 50,195 Q 160,160 220,135 T 380,120 T 500,165 T 590,175 L 590,220 L 50,220 Z"
              fill="url(#greenArea)"
            />

            {/* Green Trend Line */}
            <path
              d="M 50,195 Q 160,160 220,135 T 380,120 T 500,165 T 590,175"
              fill="none"
              stroke="#0ab39c"
              strokeWidth="2"
            />

            {/* Orange Dashed Baseline */}
            <path
              d="M 50,230 Q 150,220 280,224 T 440,228 T 590,230"
              fill="none"
              stroke="#f06548"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RevenueChartCard;
