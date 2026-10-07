import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useSettings } from '../../features/settings/context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#0b1a30] text-slate-300 border-t border-slate-800 text-xs">
      {/* 1. Value Proposition Features Bar */}
      <div className="border-b border-slate-800 bg-[#071324] py-6 px-4">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Fast Tracked Delivery</span>
              <span className="text-slate-400 text-[11px]">Direct express shipping to your door</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">100% Genuine Products</span>
              <span className="text-slate-400 text-[11px]">Factory-sealed with full warranties</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">30-Day Hassle-Free Returns</span>
              <span className="text-slate-400 text-[11px]">Simple exchanges and full refunds</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Dedicated 24/7 Support</span>
              <span className="text-slate-400 text-[11px]">Expert team always on standby</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Contact Columns */}
      <div className="max-w-[1320px] mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Store Identity & Contact Details */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Link to={ROUTES.CUSTOMER.HOME} className="inline-block">
                <span className="text-2xl font-black text-white tracking-tight">
                  {settings.storeName ? (
                    settings.storeName.toUpperCase()
                  ) : (
                    <>
                      ZY<span className="text-amber-400">LO</span>
                    </>
                  )}
                </span>
              </Link>
              <p className="text-slate-400 text-xs mt-1 max-w-sm leading-relaxed">
                {settings.tagline ||
                  'The premier multi-category digital marketplace for high-performance consumer technology, electronics, and lifestyle accessories.'}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  {settings.address || '5171 W Campbell Ave, San Jose, CA 95124, United States'}
                </span>
              </div>

              {settings.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="text-slate-200 hover:text-white font-semibold transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`mailto:${settings.supportEmail || 'support@zylo.com'}`}
                  className="text-slate-200 hover:text-white transition-colors"
                >
                  {settings.supportEmail || 'support@zylo.com'}
                </a>
              </div>

              {settings.operatingHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-400">{settings.operatingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore & Shop
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to={ROUTES.CUSTOMER.SHOP} className="hover:text-amber-400 transition-colors">
                  All Catalog Products
                </Link>
              </li>
              <li>
                <Link to="/shop?isFeatured=true" className="hover:text-amber-400 transition-colors">
                  Spotlight Featured
                </Link>
              </li>
              <li>
                <Link to="/shop?isNewArrival=true" className="hover:text-amber-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.WISHLIST} className="hover:text-amber-400 transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.CART} className="hover:text-amber-400 transition-colors">
                  View Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Support & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to={ROUTES.CUSTOMER.CONTACT} className="text-amber-400 font-bold hover:underline">
                  Contact Us Helpdesk
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.ORDERS} className="hover:text-amber-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.ADDRESSES} className="hover:text-amber-400 transition-colors">
                  Saved Address Book
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.ABOUT} className="hover:text-amber-400 transition-colors">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CUSTOMER.CAREERS} className="hover:text-amber-400 transition-colors">
                  Careers & Hiring
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Social Channels & Legal Entity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Connect With Us
            </h4>
            <p className="text-slate-400 text-xs">
              Stay up to date with product launches, exclusive sales, and community giveaways.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  Facebook
                </a>
              )}
              {settings.twitter && (
                <a
                  href={settings.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  Twitter / X
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings.linkedin && (
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Legal: {settings.companyLegalName || 'Zylo Global Retail Inc.'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-[#050e1a] py-4 px-4">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between flex-wrap gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.companyLegalName || settings.storeName || 'ZYLO Commerce'}. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Currency:{' '}
              <span className="font-bold text-amber-400">
                {settings.currencyCode || 'USD'} ({settings.currencySymbol || '$'})
              </span>
            </span>
            <span className="text-slate-700">|</span>
            <span>COD Available: {settings.enableCod ? 'Yes' : 'No'}</span>
            <span className="text-slate-700">|</span>
            <Link to={ROUTES.CUSTOMER.TERMS} className="hover:text-slate-300">
              Terms & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
