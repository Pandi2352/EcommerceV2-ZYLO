import React from 'react';
import { Download } from 'lucide-react';

interface LocationStat {
  country: string;
  percentage: number;
}

const LOCATIONS: LocationStat[] = [
  { country: 'Canada', percentage: 75 },
  { country: 'Greenland', percentage: 47 },
  { country: 'Russia', percentage: 82 },
  { country: 'Palestine', percentage: 64 },
];

export const SalesByLocationCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Sales by Locations</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#405189]/10 hover:bg-[#405189]/20 text-[#405189] text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Export Report</span>
          </button>
        </div>

        {/* World Map Vector Graphic with Pin Markers */}
        <div className="py-4 relative flex items-center justify-center">
          <div className="w-full h-44 relative bg-slate-50/50 rounded-md border border-slate-100 flex items-center justify-center overflow-hidden">
            {/* Stylized Minimal Vector Map Outline */}
            <svg
              viewBox="0 0 450 200"
              className="w-full h-full text-slate-200 fill-current opacity-80"
            >
              {/* North America */}
              <path d="M 50,40 Q 90,30 110,60 T 90,110 T 60,90 Z" />
              {/* Greenland */}
              <path d="M 140,25 Q 165,20 160,45 T 135,40 Z" />
              {/* South America */}
              <path d="M 100,120 Q 125,130 115,170 T 95,150 Z" />
              {/* Europe */}
              <path d="M 190,50 Q 230,45 225,80 T 185,75 Z" />
              {/* Africa */}
              <path d="M 195,95 Q 235,100 220,150 T 185,125 Z" />
              {/* Asia & Russia */}
              <path d="M 235,40 Q 350,30 360,90 T 260,95 Z" />
              {/* Australia */}
              <path d="M 330,135 Q 375,135 365,170 T 325,160 Z" />
            </svg>

            {/* Canada Location Dot */}
            <div className="absolute left-[22%] top-[38%] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ab39c] ring-4 ring-[#0ab39c]/20 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded shadow-xs">
                Canada
              </span>
            </div>

            {/* Greenland Location Dot */}
            <div className="absolute left-[36%] top-[22%] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ab39c] ring-4 ring-[#0ab39c]/20" />
              <span className="text-[11px] font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded shadow-xs">
                Greenland
              </span>
            </div>

            {/* Russia Location Dot */}
            <div className="absolute left-[66%] top-[34%] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ab39c] ring-4 ring-[#0ab39c]/20" />
              <span className="text-[11px] font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded shadow-xs">
                Russia
              </span>
            </div>

            {/* Palestine Location Dot */}
            <div className="absolute left-[54%] top-[48%] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#405189] ring-4 ring-[#405189]/20" />
              <span className="text-[11px] font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded shadow-xs">
                Palestine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Country Progress Bars matching screenshot */}
      <div className="space-y-3 pt-2">
        {LOCATIONS.map((loc) => (
          <div key={loc.country} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{loc.country}</span>
              <span className="font-bold text-slate-800">{loc.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#405189] h-full rounded-full transition-all duration-500"
                style={{ width: `${loc.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesByLocationCard;
