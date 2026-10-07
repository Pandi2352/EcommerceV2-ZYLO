import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import AccountMenu from '../../features/auth/components/AccountMenu';
import {
  ChevronDown,
  Menu,
  X,
  Search,
  ArrowRight,
  Loader2,
  Package,
} from 'lucide-react';
import ZyloLogo from '@shared/ui/ZyloLogo';
import { productsService } from '@shared/api/products.service';
import type { SearchSuggestion } from '@shared/types/product';
import { useCart } from '../../features/cart/context/CartContext';

export const CustomerNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{ id?: string; name: string }>({
    name: 'All categories',
  });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);

  const { pathname, search } = location;

  const isFlashDeals = pathname === '/shop' && search.includes('sortBy=price_asc');
  const isSpecial = pathname === '/shop' && search.includes('minRating=4');
  const isTopSellers = pathname === '/shop' && search.includes('sortBy=rating');

  const isWishlistActive = pathname === ROUTES.CUSTOMER.WISHLIST;
  const isCartActive = pathname === ROUTES.CUSTOMER.CART;
  const isCompareActive = pathname === ROUTES.CUSTOMER.COMPARE;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load actual catalog categories dynamically for the search department selector
  useEffect(() => {
    let isMounted = true;
    productsService
      .getFacets()
      .then((res) => {
        if (isMounted && res?.categories?.length) {
          setCategoriesList(
            res.categories.map((c) => ({
              id: c.id,
              name: c.name,
            })),
          );
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showSuggestions && !searchContainerRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showSuggestions]);

  // Debounced search suggestions fetcher
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await productsService.getSuggestions(trimmed);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to load search suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const trimmed = searchQuery.trim();
    const catParam =
      selectedCategory.id ? `&categoryIds=${selectedCategory.id}` : '';
    if (trimmed) {
      navigate(`/shop?search=${encodeURIComponent(trimmed)}${catParam}`);
    } else if (selectedCategory.id) {
      navigate(`/shop?categoryIds=${selectedCategory.id}`);
    } else {
      navigate(ROUTES.CUSTOMER.SHOP);
    }
  };

  const handleSelectCategory = (cat: { id?: string; name: string }) => {
    setSelectedCategory(cat);
    setCategoryDropdownOpen(false);
    // If no text typed in search box, immediately browse this department
    if (!searchQuery.trim()) {
      if (cat.id) {
        navigate(`/shop?categoryIds=${cat.id}`);
      } else {
        navigate(ROUTES.CUSTOMER.SHOP);
      }
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    setShowSuggestions(false);
    // Amazon style: direct jump to product details page
    navigate(`/products/${item.slug}`);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    setMobileMenuOpen(false);
    navigate(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-40 select-none">
      <div className="max-w-[1320px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to={ROUTES.CUSTOMER.HOME} className="shrink-0 flex items-center">
          <ZyloLogo variant="full" size="sm" />
        </Link>

        {/* Center: Search Box with Category Selector & Quick Deal Links */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-2 gap-4">
          <div
            ref={searchContainerRef}
            className="relative flex items-center flex-1 border border-slate-200 hover:border-slate-300 focus-within:border-amber-500 rounded-md bg-white transition-colors h-10 shadow-none"
          >
            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] text-slate-700 hover:text-slate-900 border-r border-slate-200 cursor-pointer h-full whitespace-nowrap shrink-0 font-medium"
              >
                <span className="whitespace-nowrap max-w-[120px] truncate">{selectedCategory.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {categoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-52 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-md py-1 z-50 animate-in fade-in duration-100 shadow-none">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory({ name: 'All categories' })}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer ${
                        !selectedCategory.id
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      All categories
                    </button>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer truncate ${
                          selectedCategory.id === cat.id
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center h-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search products, brands, or tech specifications..."
                className="w-full py-1.5 px-3 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="pr-3 pl-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                title="Search"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Autocomplete Typeahead Popover */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-md z-50 overflow-hidden shadow-none animate-in fade-in duration-100">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Product Suggestions</span>
                  <span>{suggestions.length} items found</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-amber-50/40 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-700 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{item.brandName}</span>
                          <span>·</span>
                          <span className="text-slate-400">{item.categoryName}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 block">
                          ${item.basePrice.toFixed(2)}
                        </span>
                        {item.salePrice && item.salePrice < item.basePrice && (
                          <span className="text-[10px] text-rose-600 block line-through">
                            ${item.salePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>See all catalog results for "{searchQuery}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Deal Tags next to Search Bar */}
          <div className="hidden xl:flex items-center gap-3 text-[12.5px] shrink-0">
            <Link
              to="/shop?sortBy=price_asc"
              className={`transition-colors rounded-md px-2 py-0.5 ${
                isFlashDeals
                  ? 'text-amber-800 bg-amber-50 font-bold border border-amber-200'
                  : 'text-slate-600 hover:text-amber-600 font-medium'
              }`}
            >
              Flash Deals
            </Link>
            <Link
              to="/shop?minRating=4"
              className={`transition-colors rounded-md px-2 py-0.5 ${
                isSpecial
                  ? 'text-amber-800 bg-amber-50 font-bold border border-amber-200'
                  : 'text-slate-600 hover:text-amber-600 font-medium'
              }`}
            >
              Special
            </Link>
            <Link
              to="/shop?sortBy=rating"
              className={`transition-colors rounded-md px-2 py-0.5 ${
                isTopSellers
                  ? 'text-amber-800 bg-amber-50 font-bold border border-amber-200'
                  : 'text-slate-600 hover:text-amber-600 font-medium'
              }`}
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
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
              isWishlistActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-amber-600'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {/* Solid Heart Icon */}
              <svg className={`w-5 h-5 transition-colors ${
                isWishlistActive
                  ? 'text-amber-600 fill-amber-600'
                  : 'text-slate-600 fill-slate-600 group-hover:fill-amber-600 group-hover:text-amber-600'
              }`} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                5
              </span>
            </div>
            <span className="hidden sm:inline">
              Wishlist
            </span>
          </Link>

          {/* Cart Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="View Shopping Cart"
              title={`Shopping Cart (${totalCount})`}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                isCartActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-amber-600'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {/* Solid Cart Icon */}
                <svg className={`w-5 h-5 transition-colors ${
                  isCartActive
                    ? 'text-amber-600 fill-amber-600'
                    : 'text-slate-600 fill-slate-600 group-hover:fill-amber-600 group-hover:text-amber-600'
                }`} viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-[10px] min-w-4 h-4 px-1 flex items-center justify-center font-bold">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                Cart
              </span>
            </button>
          </div>

          {/* Compare */}
          <Link
            to={ROUTES.CUSTOMER.COMPARE}
            className={`hidden md:flex items-center gap-1.5 transition-colors cursor-pointer group ${
              isCompareActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-amber-600'
            }`}
          >
            {/* Compare Circular Arrows with Nodes */}
            <svg className={`w-5 h-5 transition-colors shrink-0 ${
              isCompareActive ? 'text-amber-600' : 'text-slate-600 group-hover:text-amber-600'
            }`} viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="6" r="2.2" fill="currentColor" />
              <path d="M18 10v2a4 4 0 0 1-4 4H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 19l-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="2.2" fill="currentColor" />
              <path d="M6 14v-2a4 4 0 0 1 4-4h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 5l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
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
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 animate-in slide-in-from-top duration-150">
          <form onSubmit={handleMobileSearchSubmit} className="relative flex items-center border border-slate-200 rounded-md">
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search products or brands..."
              className="w-full py-2 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="pr-3 pl-1 text-slate-400 hover:text-amber-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-700">
            <Link
              to={ROUTES.CUSTOMER.HOME}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors ${
                pathname === '/' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to={ROUTES.CUSTOMER.SHOP}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors ${
                pathname === '/shop' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Shop Catalog
            </Link>
            <Link
              to={ROUTES.CUSTOMER.CART}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors flex items-center justify-between ${
                pathname === '/cart' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              <span>Shopping Cart</span>
              {totalCount > 0 && (
                <span className="bg-orange-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                  {totalCount}
                </span>
              )}
            </Link>
            <Link
              to={ROUTES.CUSTOMER.PROFILE}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors ${
                pathname.startsWith('/account') ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              My Account
            </Link>
            <Link
              to={ROUTES.CUSTOMER.VENDORS}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors ${
                pathname === '/vendors' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Brand Partners
            </Link>
            <Link
              to={ROUTES.CUSTOMER.CONTACT}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 px-2.5 rounded-md transition-colors ${
                pathname === '/contact' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/70' : 'hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Contact & Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default CustomerNavbar;
