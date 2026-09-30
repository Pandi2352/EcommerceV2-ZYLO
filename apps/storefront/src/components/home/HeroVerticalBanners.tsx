import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { ChevronRight } from 'lucide-react';

interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  subtitle?: string;
  badge?: string;
  bgGradient: string;
  textColor: string;
  accentBadgeColor: string;
  link: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'visa-25-off',
    tag: 'VISA EXCLUSIVE',
    title: '$25 OFF*',
    subtitle: 'When you pay with VISA',
    badge: 'VISA',
    bgGradient: 'from-amber-400 via-amber-500 to-amber-600',
    textColor: 'text-amber-950',
    accentBadgeColor: 'bg-white text-blue-700 font-extrabold',
    link: ROUTES.CUSTOMER.SHOP,
  },
  {
    id: 'grocery-sale',
    tag: 'SUPER SHIOK',
    title: 'GROCERY SALE',
    subtitle: 'Fresh Picks & Daily Essentials',
    badge: 'UP TO 50%',
    bgGradient: 'from-blue-600 via-blue-700 to-indigo-800',
    textColor: 'text-white',
    accentBadgeColor: 'bg-amber-400 text-slate-900 font-bold',
    link: ROUTES.CUSTOMER.SHOP,
  },
  {
    id: 'mooncake-fair',
    tag: 'FESTIVAL SPECIAL',
    title: 'MOONCAKE FAIR',
    subtitle: 'Celebration Treats & Hampers',
    badge: 'FAIR',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    textColor: 'text-amber-300',
    accentBadgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
    link: ROUTES.CUSTOMER.SHOP,
  },
  {
    id: 'students-tech',
    tag: 'CAMPUS DEALS',
    title: 'STUDENTS TECH SALE',
    subtitle: 'Laptops, Monitors & Gear',
    badge: 'EXTRA 15%',
    bgGradient: 'from-cyan-600 via-teal-600 to-emerald-700',
    textColor: 'text-white',
    accentBadgeColor: 'bg-white text-teal-800 font-bold',
    link: ROUTES.CUSTOMER.SHOP,
  },
  {
    id: 'super-shock-sale',
    tag: 'FLASH EVENT',
    title: 'SUPER SHOCK SALE',
    subtitle: 'Hourly Drops & Steals',
    badge: '25 JUL',
    bgGradient: 'from-rose-500 via-orange-500 to-amber-500',
    textColor: 'text-white',
    accentBadgeColor: 'bg-yellow-300 text-rose-900 font-black',
    link: ROUTES.CUSTOMER.SHOP,
  },
  {
    id: 'lockdown-essentials',
    tag: 'HOME REFRESH',
    title: 'LOCKDOWN ESSENTIALS',
    subtitle: 'Top In Essential Appliances',
    badge: 'HOT',
    bgGradient: 'from-sky-500 via-blue-600 to-sky-700',
    textColor: 'text-white',
    accentBadgeColor: 'bg-white/90 text-blue-900 font-bold',
    link: ROUTES.CUSTOMER.SHOP,
  },
];

export const HeroVerticalBanners: React.FC = () => {
  return (
    <div className="h-full min-h-[270px] lg:h-[280px] border-2 border-amber-400 rounded-md p-1 bg-white flex flex-col justify-between gap-1">
      {PROMO_BANNERS.map((banner) => (
        <Link
          key={banner.id}
          to={banner.link}
          className={`relative overflow-hidden rounded-md bg-gradient-to-r ${banner.bgGradient} p-1.5 px-2 flex items-center justify-between group transition-opacity hover:opacity-95 cursor-pointer`}
        >
          {/* Left Content */}
          <div className="relative z-10 flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-white/90 px-1 py-0.2 rounded-xs bg-black/20">
                {banner.tag}
              </span>
              {banner.badge && (
                <span
                  className={`text-[8px] px-1 py-0.2 rounded-xs uppercase tracking-wider ${banner.accentBadgeColor}`}
                >
                  {banner.badge}
                </span>
              )}
            </div>

            <h4
              className={`text-[10.5px] font-black tracking-tight leading-tight mt-0.5 truncate ${banner.textColor}`}
            >
              {banner.title}
            </h4>

            {banner.subtitle && (
              <p className="text-[8.5px] text-white/80 truncate font-medium">
                {banner.subtitle}
              </p>
            )}
          </div>

          {/* Right Indicator */}
          <div className="relative z-10 shrink-0 w-4 h-4 rounded-xs bg-white/20 text-white flex items-center justify-center transform group-hover:translate-x-0.5 transition-transform">
            <ChevronRight className="w-2.5 h-2.5" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HeroVerticalBanners;
