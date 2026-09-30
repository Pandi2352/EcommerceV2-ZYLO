import React from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';

export const RecentActivityCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
        RECENT ACTIVITY
      </h3>

      <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {/* Item 1: Purchase by James Price */}
        <div className="flex items-start gap-3.5 relative">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              Purchase by James Price
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Product noise evolve smartwatch
            </p>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              02:14 PM Today
            </span>
          </div>
        </div>

        {/* Item 2: Added new style collection */}
        <div className="flex items-start gap-3.5 relative">
          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              Added new style collection
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              By Nesta Technologies
            </p>

            {/* Thumbnail Gallery Preview */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=80&q=80"
                  alt="Hoodie"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=80&q=80"
                  alt="Chair"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=80&q=80"
                  alt="Bag"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-medium block mt-1.5">
              9:47 PM Yesterday
            </span>
          </div>
        </div>

        {/* Item 3: Natasha Carey liked products */}
        <div className="flex items-start gap-3.5 relative">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 z-10 ring-4 ring-white border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
              alt="Natasha Carey"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              Natasha Carey have liked the products
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Allow users to like products in your WooCommerce store.
            </p>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              25 Dec, 2021
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCard;
