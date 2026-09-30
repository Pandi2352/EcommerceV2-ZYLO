import React from 'react';
import { Calendar, Plus, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Anna';

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          Good Morning, {displayName}!
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Date Range Picker Pill */}
        <div className="flex items-center rounded-md border border-slate-200 bg-white overflow-hidden text-xs text-slate-600">
          <span className="px-3 py-1.5 font-medium whitespace-nowrap">
            01 Jan, 2026 to 31 Jan, 2026
          </span>
          <button
            type="button"
            className="bg-[#405189] hover:bg-[#364473] text-white p-1.5 px-2 transition-colors cursor-pointer"
            aria-label="Select Date Range"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Product Button */}
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span>Add Product</span>
        </Link>

        {/* Pulse / Filter Indicator Button */}
        <button
          type="button"
          className="p-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 transition-colors cursor-pointer"
          title="Filter View"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
