import React from 'react';
import { ChevronDown, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  return (
    <div className="w-full bg-white border-b border-slate-100 text-xs text-slate-500 py-1.5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Links */}
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-slate-800 transition-colors">
            About Us
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/careers" className="hover:text-slate-800 transition-colors">
            Careers
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/open-shop" className="hover:text-slate-800 transition-colors">
            Open a shop
          </Link>
        </div>

        {/* Center Promotion Banner */}
        <div className="hidden md:flex items-center">
          <span className="text-emerald-600 font-medium">
            Free shipping for all orders over <span className="font-bold">$75.00</span>
          </span>
        </div>

        {/* Right Info & Selectors */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
            <span>Need help? Call Us:</span>
            <a
              href="tel:+1800900"
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              + 1800 900
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Language dropdown */}
            <button
              type="button"
              className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="text-sm">🇬🇧</span>
              <span>English</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Currency dropdown */}
            <button
              type="button"
              className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span>USD</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
