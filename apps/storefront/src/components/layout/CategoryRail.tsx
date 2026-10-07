import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
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
  { icon: LayoutGrid, label: 'All Categories', path: ROUTES.CUSTOMER.SHOP },
  { icon: Monitor, label: 'Computers & Office', path: '/shop?search=Computers' },
  { icon: Smartphone, label: 'Smartphones & Tablets', path: '/shop?search=Smartphones' },
  { icon: Gamepad2, label: 'Gaming & VR', path: '/shop?search=Gaming' },
  { icon: Watch, label: 'Wearable Tech', path: '/shop?search=Wearable' },
  { icon: Utensils, label: 'Home & Kitchen', path: '/shop?search=Home' },
  { icon: Mouse, label: 'Accessories', path: '/shop?search=Accessories' },
  { icon: Bluetooth, label: 'Audio & Wireless', path: '/shop?search=Audio' },
  { icon: Trees, label: 'Outdoor & Sports', path: '/shop?search=Outdoor' },
  { icon: Plug, label: 'Power & Cables', path: '/shop?search=Power' },
  { icon: Cpu, label: 'Components & Chips', path: '/shop?search=Components' },
  { icon: Server, label: 'Networking & Servers', path: '/shop?search=Networking' },
  { icon: Coffee, label: 'Lifestyle', path: '/shop?search=Lifestyle' },
];

export const CategoryRail: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col items-center py-4 w-12 shrink-0 border-r border-slate-100 bg-white min-h-[calc(100vh-100px)]">
      <div className="flex flex-col gap-4 text-slate-400">
        {railItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              title={item.label}
              className="p-1.5 rounded hover:text-amber-600 hover:bg-slate-50 transition-colors group relative cursor-pointer"
            >
              <Icon className="w-4 h-4 stroke-[1.75]" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoryRail;
