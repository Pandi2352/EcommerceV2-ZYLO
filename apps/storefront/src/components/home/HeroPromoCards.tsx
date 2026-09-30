import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { ChevronRight } from 'lucide-react';

export const HeroPromoCards: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 h-full min-h-[270px] lg:h-[280px]">
      {/* Top Card: Metaverse */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-[#fdf2f0] via-[#fef6f5] to-[#fdeeed] p-3 sm:p-3.5 flex-1 flex flex-col justify-between border border-slate-200 group">
        <div className="relative z-10 max-w-[65%]">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            Metaverse
          </h3>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            The Future of Creativity
          </p>

          <Link
            to={ROUTES.CUSTOMER.SHOP}
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-amber-600 hover:text-amber-700 tracking-wider uppercase transition-colors"
          >
            <span>LEARN MORE</span>
            <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* VR Visual Cutout */}
        <div className="absolute right-2 bottom-1.5 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=300&q=80"
            alt="Metaverse VR headset"
            className="w-full h-full object-cover rounded-md border border-white/80"
            loading="lazy"
          />
        </div>
      </div>

      {/* Bottom Card: Rockez 547 Headphone */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-[#f5f6f9] via-[#fafafa] to-[#f0f2f7] p-3 sm:p-3.5 flex-1 flex flex-col justify-between border border-slate-200 group">
        <div className="relative z-10 max-w-[65%]">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Headphone
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
            Rockez 547
          </h3>
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
            MUSIC EVERYWHERE ANYTIME
          </p>

          <Link
            to={ROUTES.CUSTOMER.SHOP}
            className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold tracking-wide transition-colors"
          >
            <span>Shop Now</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* Headphone Visual Cutout */}
        <div className="absolute right-2 bottom-1.5 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80"
            alt="Rockez 547 Headphone"
            className="w-full h-full object-cover rounded-md border border-white/80"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroPromoCards;
