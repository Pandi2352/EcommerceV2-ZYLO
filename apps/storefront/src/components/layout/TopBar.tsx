import React from 'react';
import { PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { useSettings } from '../../features/settings/context/SettingsContext';

export const TopBar: React.FC = () => {
  const { settings, formatPrice } = useSettings();

  return (
    <div className="w-full bg-[#081831] border-b border-[#12284b] text-xs text-slate-300 py-2 px-4 select-none">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between">
        {/* Left Utility Links */}
        <div className="flex items-center gap-3 font-medium">
          <Link
            to={ROUTES.CUSTOMER.CONTACT}
            className="hover:text-amber-400 transition-colors"
          >
            Contact Us
          </Link>
          <span className="text-slate-600">|</span>
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
            {settings.announcementBarText || (
              <>
                Free shipping for all orders over{' '}
                <span className="font-bold text-emerald-400">
                  {formatPrice(settings.freeShippingThreshold || 50)}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Right Info & Selectors */}
        <div className="flex items-center gap-4">
          {/* Help & Contact */}
          {settings.phone && (
            <div className="hidden sm:flex items-center gap-1.5 font-medium">
              <span className="text-slate-300">Need help? Call Us:</span>
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.phone}</span>
              </a>
            </div>
          )}

          <div className="flex items-center gap-3 font-medium">
            {/* Language indicator */}
            <div className="flex items-center gap-1 text-slate-200">
              <span className="text-sm leading-none">🌐</span>
              <span>English</span>
            </div>

            {/* Configured Currency Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#102445] text-amber-300 font-bold border border-slate-700">
              <span>{settings.currencyCode || 'USD'}</span>
              <span>({settings.currencySymbol || '$'})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
