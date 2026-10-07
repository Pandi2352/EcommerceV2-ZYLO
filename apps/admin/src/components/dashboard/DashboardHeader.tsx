import React from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';

interface Props {
  range: string;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'year', label: 'Past 12 Months' },
];

export const DashboardHeader: React.FC<Props> = ({
  range,
  onRangeChange,
  onRefresh,
  loading,
}) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Administrator';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time store performance, sales velocity, and inventory alerts overview.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Date Range Selector */}
        <div className="flex items-center rounded-md border border-slate-200 bg-white text-xs text-slate-700">
          <span className="pl-2.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
          </span>
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
            disabled={loading}
            className="px-2.5 py-1.5 text-xs bg-transparent border-none rounded-md focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Add Product Button */}
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
          <span>Add Product</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
