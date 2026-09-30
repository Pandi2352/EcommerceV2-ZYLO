import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import AccountMenu from '../../features/auth/components/AccountMenu';
import MiniCartDropdown from './MiniCartDropdown';
import {
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import ZyloLogo from '@shared/ui/ZyloLogo';

export const CustomerNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = React.useRef<HTMLDivElement>(null);

  // Close cart dropdown on click outside or escape
  React.useEffect(() => {
    if (!cartOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!cartRef.current?.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [cartOpen]);

  const categories = [
    'All categories',
    'Electronics',
    'Audio & Acoustics',
    'Apparel & Streetwear',
    'Wearables & Watches',
    'Home & Workspace',
    'Computers',
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-40 select-none">
      <div className="max-w-[1320px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to={ROUTES.CUSTOMER.HOME} className="shrink-0 flex items-center">
          <ZyloLogo variant="full" size="sm" />
        </Link>

        {/* Center: Search Box with Category Selector & Quick Deal Links */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-2 gap-4">
          <div className="relative flex items-center flex-1 border border-slate-200 hover:border-slate-300 rounded-md bg-white transition-colors h-10">
            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] text-slate-700 hover:text-slate-900 border-r border-slate-200 cursor-pointer h-full whitespace-nowrap shrink-0 font-medium"
              >
                <span className="whitespace-nowrap">{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {categoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md py-1 z-50 animate-in fade-in duration-100">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for items"
              className="w-full py-1.5 px-3 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Quick Deal Tags next to Search Bar (matches screenshot) */}
          <div className="hidden xl:flex items-center gap-4 text-[12.5px] font-medium text-slate-600 shrink-0">
            <Link
              to={ROUTES.CUSTOMER.SHOP}
              className="hover:text-amber-600 transition-colors"
            >
              Flash Deals
            </Link>
            <Link
              to={ROUTES.CUSTOMER.SHOP}
              className="hover:text-amber-600 transition-colors"
            >
              Special
            </Link>
            <Link
              to={ROUTES.CUSTOMER.SHOP}
              className="hover:text-amber-600 transition-colors"
            >
              Top Sellers
            </Link>
          </div>
        </div>

        {/* Right: Customer Actions (Account, Wishlist, Cart, Compare) */}
        <div className="flex items-center gap-6 sm:gap-7 text-slate-700 text-[13.5px] font-medium">
          {/* Account */}
          <AccountMenu />

          {/* Wishlist */}
          <Link
            to={ROUTES.CUSTOMER.WISHLIST}
            className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              {/* Solid Heart Icon */}
              <svg className="w-5 h-5 text-slate-600 fill-slate-600 group-hover:fill-amber-600 group-hover:text-amber-600 transition-colors" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                5
              </span>
            </div>
            <span className="hidden sm:inline text-slate-700 group-hover:text-amber-600 transition-colors">
              Wishlist
            </span>
          </Link>

          {/* Cart with Mini-Cart Dropdown */}
          <div className="relative" ref={cartRef}>
            <button
              type="button"
              onClick={() => setCartOpen((prev) => !prev)}
              aria-label="View Shopping Cart"
              aria-expanded={cartOpen}
              className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                {/* Solid Cart Icon */}
                <svg className="w-5 h-5 text-slate-600 fill-slate-600 group-hover:fill-amber-600 group-hover:text-amber-600 transition-colors" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  2
                </span>
              </div>
              <span className="hidden sm:inline text-slate-700 group-hover:text-amber-600 transition-colors">
                Cart
              </span>
            </button>

            {/* Dropdown Menu */}
            <MiniCartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </div>

          {/* Compare */}
          <Link
            to={ROUTES.CUSTOMER.COMPARE}
            className="hidden md:flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            {/* Compare Circular Arrows with Nodes */}
            <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-600 transition-colors shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="6" r="2.2" fill="currentColor" />
              <path d="M18 10v2a4 4 0 0 1-4 4H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 19l-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="2.2" fill="currentColor" />
              <path d="M6 14v-2a4 4 0 0 1 4-4h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 5l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-slate-700 group-hover:text-amber-600 transition-colors">
              Compare
            </span>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2.5 animate-in slide-in-from-top duration-150">
          <div className="relative flex items-center border border-slate-200 rounded-md">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-1.5 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2 text-xs font-medium text-slate-700">
            <Link to={ROUTES.CUSTOMER.HOME} className="py-1">Home</Link>
            <Link to={ROUTES.CUSTOMER.SHOP} className="py-1">Shop</Link>
            <Link to={ROUTES.CUSTOMER.VENDORS} className="py-1">Vendors</Link>
            <Link to={ROUTES.CUSTOMER.PAGES} className="py-1">Pages</Link>
            <Link to={ROUTES.CUSTOMER.BLOG} className="py-1">Blog</Link>
            <Link to={ROUTES.CUSTOMER.CONTACT} className="py-1">Contact Us</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default CustomerNavbar;
