import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import {
  LayoutGrid,
  ChevronDown,
  Flame,
  Layers,
} from 'lucide-react';
import { productsService } from '@shared/api/products.service';

export const SubNavBar: React.FC = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);

  useEffect(() => {
    let isMounted = true;
    productsService.getFacets().then((res) => {
      if (isMounted && res?.categories) {
        setCategories(res.categories);
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

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
              <div className="absolute left-0 top-full mt-1 w-72 max-h-96 overflow-y-auto bg-white rounded-md border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Browse Catalog ({categories.length} Departments)
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?categoryIds=${cat.id}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 hover:bg-amber-50/70 hover:text-amber-900 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-amber-100 text-slate-600 group-hover:text-amber-700 flex items-center justify-center transition-colors shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-800 group-hover:text-amber-950 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-amber-700 shrink-0">
                      {cat.count} items
                    </span>
                  </Link>
                ))}
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
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.SHOP} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Shop All Products
            </Link>
          </div>

          <div className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-2 group">
            <Link to={ROUTES.CUSTOMER.VENDORS} className="text-slate-700 group-hover:text-amber-600 font-medium text-[13.5px]">
              Brand Partners
            </Link>
          </div>

          <Link
            to={ROUTES.CUSTOMER.CONTACT}
            className="text-slate-700 hover:text-amber-600 font-medium text-[13.5px] transition-colors py-2"
          >
            Contact & Support
          </Link>
        </nav>

        {/* Right: Special Offer Badge */}
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.CUSTOMER.SHOP}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors font-bold text-xs group cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide uppercase">SPECIAL OFFERS</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubNavBar;
