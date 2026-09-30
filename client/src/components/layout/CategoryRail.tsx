import React from 'react';
import {
  LayoutGrid,
  Monitor,
  Smartphone,
  Gamepad2,
  Watch,
  Utensils,
  Mouse,
  Bluetooth,
  Trees,
  Plug,
  Cpu,
  Server,
  Coffee,
} from 'lucide-react';

const railItems = [
  { icon: LayoutGrid, label: 'All Categories' },
  { icon: Monitor, label: 'Computers & Office' },
  { icon: Smartphone, label: 'Smartphones & Tablets' },
  { icon: Gamepad2, label: 'Gaming & VR' },
  { icon: Watch, label: 'Wearable Tech' },
  { icon: Utensils, label: 'Home & Kitchen' },
  { icon: Mouse, label: 'Accessories' },
  { icon: Bluetooth, label: 'Audio & Wireless' },
  { icon: Trees, label: 'Outdoor & Sports' },
  { icon: Plug, label: 'Power & Cables' },
  { icon: Cpu, label: 'Components & Chips' },
  { icon: Server, label: 'Networking & Servers' },
  { icon: Coffee, label: 'Lifestyle' },
];

export const CategoryRail: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col items-center py-4 w-12 shrink-0 border-r border-slate-100 bg-white min-h-[calc(100vh-100px)]">
      <div className="flex flex-col gap-4 text-slate-400">
        {railItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              title={item.label}
              className="p-1.5 rounded hover:text-indigo-600 hover:bg-slate-50 transition-colors group relative cursor-pointer"
            >
              <Icon className="w-4 h-4 stroke-[1.75]" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoryRail;
