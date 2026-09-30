import React from 'react';
import { ChevronDown, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';

export const TopBar: React.FC = () => {
  return (
    <div className="w-full bg-[#081831] border-b border-[#12284b] text-xs text-slate-300 py-2 px-4 select-none">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between">
        {/* Left Utility Links */}
        <div className="flex items-center gap-3 font-medium">
          <Link
            to={ROUTES.CUSTOMER.ABOUT}
            className="hover:text-white transition-colors"
          >
            About Us
          </Link>
          <span className="text-slate-600">|</span>
          <Link
            to={ROUTES.CUSTOMER.CAREERS}
            className="hover:text-white transition-colors"
          >
            Careers
          </Link>
          <span className="text-slate-600">|</span>
          <Link
            to={ROUTES.CUSTOMER.OPEN_SHOP}
            className="hover:text-white transition-colors"
          >
            Open a shop
          </Link>
        </div>

        {/* Center Promotion Banner */}
        <div className="hidden md:flex items-center font-medium">
          <span>
            Free shipping for all orders over{' '}
            <span className="font-bold text-emerald-400">$75.00</span>
          </span>
        </div>

        {/* Right Info & Selectors */}
        <div className="flex items-center gap-4">
          {/* Help & Contact */}
          <div className="hidden sm:flex items-center gap-1.5 font-medium">
            <span className="text-slate-300">Need help? Call Us:</span>
            <a
              href="tel:+1800900"
              className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ 1800 900</span>
            </a>
          </div>

          <div className="flex items-center gap-3 font-medium">
            {/* Language dropdown */}
            <button
              type="button"
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-sm leading-none">🇬🇧</span>
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Currency dropdown */}
            <button
              type="button"
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>USD</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
