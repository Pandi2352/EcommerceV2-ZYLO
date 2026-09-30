import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import {
  LayoutGrid,
  ChevronDown,
  Flame,
  Headphones,
  Laptop,
  Shirt,
  Watch,
  Home,
  Gamepad2,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics & Gadgets', icon: Laptop, count: '120+ items', link: '/category/electronics' },
  { name: 'Audio & Acoustics', icon: Headphones, count: '45+ items', link: '/category/audio' },
  { name: 'Apparel & Streetwear', icon: Shirt, count: '85+ items', link: '/category/apparel' },
  { name: 'Wearables & Watches', icon: Watch, count: '30+ items', link: '/category/wearables' },
  { name: 'Home & Workspace', icon: Home, count: '60+ items', link: '/category/home-workspace' },
  { name: 'Gaming & Virtual Reality', icon: Gamepad2, count: '55+ items', link: '/category/gaming' },
];

export const SubNavBar: React.FC = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <div className="w-full bg-white border-b border-slate-200 text-[13px] font-medium text-slate-700 relative z-30 select-none">
      <div className="max-w-[1320px] mx-auto px-4 flex items-center justify-between">
        {/* Left: Shop By Categories Button */}
        <div className="relative py-2">
          <button
            type="button"
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] tracking-wide transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Shop By Categories</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                categoriesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Categories Dropdown Modal */}
          {categoriesOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setCategoriesOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Browse Catalog
                </div>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      to={cat.link}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 hover:bg-amber-50/70 hover:text-amber-900 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-amber-100 text-slate-600 group-hover:text-amber-700 flex items-center justify-center transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[13px] font-medium text-slate-800 group-hover:text-amber-950">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-amber-700">
                        {cat.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Center: Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.HOME} className="text-slate-900 group-hover:text-amber-600 font-bold text-[13.5px]">
              Home
            </Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.SHOP} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Shop
            </Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.VENDORS} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Vendors
            </Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.PAGES} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Pages
            </Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.BLOG} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Blog
            </Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <Link
            to={ROUTES.CUSTOMER.CONTACT}
            className="text-slate-700 hover:text-amber-600 font-medium text-[13.5px] transition-colors py-2"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right: Special Offer Badge */}
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.CUSTOMER.SHOP}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors font-bold text-xs group cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide uppercase">SPECIAL OFFER</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubNavBar;
