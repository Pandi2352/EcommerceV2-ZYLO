import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  User,
  Heart,
  ShoppingCart,
  ArrowLeftRight,
  Menu,
  X,
} from 'lucide-react';
import ZyloLogo from '../common/ZyloLogo';

export const CustomerNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = [
    'All categories',
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Computers',
    'Smartphones',
    'Health & Beauty',
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="shrink-0 flex items-center">
          <ZyloLogo variant="full" size="md" />
        </Link>

        {/* Search Bar with Category Dropdown */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative flex items-center w-full border border-slate-200 rounded-md bg-white hover:border-slate-300 transition-colors">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border-r border-slate-200 cursor-pointer"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-md py-1 z-50">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-2 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Search Icon */}
            <button
              type="button"
              className="px-3 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <div className="relative group flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors">
            <Link to="/">Home</Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>

          <div className="relative group flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors">
            <Link to="/shop">Shop</Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>

          <div className="relative group flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors">
            <Link to="/vendors">Vendors</Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>

          <div className="relative group flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors">
            <Link to="/pages">Pages</Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>

          <div className="relative group flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors">
            <Link to="/blog">Blog</Link>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>

          <Link to="/contact" className="hover:text-indigo-600 transition-colors">
            Contact Us
          </Link>
        </nav>

        {/* Right Customer Actions */}
        <div className="flex items-center gap-5 text-slate-700 text-xs font-semibold">
          {/* Account */}
          <Link
            to="/login"
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Account</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <div className="relative">
              <Heart className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                5
              </span>
            </div>
            <span className="hidden sm:inline ml-1">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                2
              </span>
            </div>
            <span className="hidden sm:inline ml-1">Cart</span>
          </Link>

          {/* Compare */}
          <Link
            to="/compare"
            className="hidden md:flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-600" />
            <span>Compare</span>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <input
            type="text"
            placeholder="Search for items..."
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-md"
          />
          <div className="flex flex-col gap-2.5 text-sm font-medium text-slate-700">
            <Link to="/" className="py-1">
              Home
            </Link>
            <Link to="/shop" className="py-1">
              Shop
            </Link>
            <Link to="/vendors" className="py-1">
              Vendors
            </Link>
            <Link to="/pages" className="py-1">
              Pages
            </Link>
            <Link to="/blog" className="py-1">
              Blog
            </Link>
            <Link to="/contact" className="py-1">
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default CustomerNavbar;
