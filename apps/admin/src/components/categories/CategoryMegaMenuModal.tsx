import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Search,
} from 'lucide-react';
import Button from '@shared/ui/Button';
import type { CategoryTreeNode } from '@shared/types/catalog';

interface CategoryMegaMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryTreeNode[];
}

export const CategoryMegaMenuModal: React.FC<CategoryMegaMenuModalProps> = ({
  isOpen,
  onClose,
  categories,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeRootId, setActiveRootId] = useState<string>(
    categories[0]?._id || ''
  );

  if (!isOpen) return null;

  // Filter root categories that are marked includeInMenu
  const menuRoots = categories.filter((c) => c.includeInMenu && c.status === 'ACTIVE');
  const activeRoot = menuRoots.find((c) => c._id === activeRootId) || menuRoots[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-md shadow-none flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Simulator Control Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Storefront Mega-Menu Simulator
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300">
              Live Customer Shopper Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded border border-slate-700">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  device === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  device === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulator Viewport Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex items-start justify-center">
          {device === 'desktop' ? (
            /* ─── DESKTOP SIMULATOR ───────────────────────────────────────── */
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-md shadow-none overflow-hidden">
              {/* Simulated Browser Bar */}
              <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[11px] ml-2 text-slate-600">
                    https://zylo.com/shop
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">100% Live Sync</span>
              </div>

              {/* Simulated Customer Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    ZYLO<span className="text-indigo-600">.</span>
                  </span>
                </div>
                <div className="w-72 bg-slate-100 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search across 35 catalog categories...</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>Sign In</span>
                  <div className="p-1.5 rounded-full bg-slate-100 text-slate-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Customer Navbar with Root Category Tabs */}
              <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-6 overflow-x-auto no-scrollbar">
                {menuRoots.map((root) => {
                  const isActive = root._id === (activeRoot?._id || '');
                  return (
                    <button
                      key={root._id}
                      type="button"
                      onClick={() => setActiveRootId(root._id)}
                      className={`py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {root.iconUrl && (
                        <img
                          src={root.iconUrl}
                          alt=""
                          className="w-3.5 h-3.5 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span>{root.name}</span>
                      {root.badge && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                          {root.badge.text}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mega Dropdown Panel for Active Root */}
              {activeRoot && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white min-h-[300px]">
                  {/* Left 2 Columns: Subcategories (L2) and Leaves (L3) */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-6">
                    {activeRoot.children && activeRoot.children.length > 0 ? (
                      activeRoot.children.map((child) => (
                        <div key={child._id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {child.thumbnailUrl && (
                              <img
                                src={child.thumbnailUrl}
                                alt=""
                                className="w-7 h-7 rounded object-cover border border-slate-200"
                              />
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer">
                                {child.name}
                              </div>
                              {child.badge && (
                                <span className="inline-block text-[9px] font-semibold text-indigo-600 uppercase">
                                  {child.badge.text}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Level 3 Leaves */}
                          {child.children && child.children.length > 0 ? (
                            <ul className="space-y-1 pl-9 text-xs text-slate-500">
                              {child.children.map((grand) => (
                                <li
                                  key={grand._id}
                                  className="hover:text-indigo-600 cursor-pointer flex items-center gap-1.5 transition-colors"
                                >
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{grand.name}</span>
                                  {grand.badge && (
                                    <span className="text-[9px] px-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                      {grand.badge.text}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-slate-400 pl-9">
                              {child.description || 'Collection items available'}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                        No subcategories under {activeRoot.name}.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Featured Banner Card */}
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50 flex flex-col justify-between overflow-hidden relative">
                    {activeRoot.bannerDesktopUrl ? (
                      <div className="h-32 -mx-4 -mt-4 mb-3 overflow-hidden relative">
                        <img
                          src={activeRoot.bannerDesktopUrl}
                          alt={activeRoot.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-3">
                          <span className="text-xs font-bold text-white drop-shadow-xs">
                            {activeRoot.name}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                        Curated Department
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {activeRoot.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {activeRoot.description || 'Explore top rated items and premium collections.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 cursor-pointer">
                        Shop Department
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      {activeRoot.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ─── MOBILE SIMULATOR ────────────────────────────────────────── */
            <div className="w-[340px] bg-white border-4 border-slate-800 rounded-2xl shadow-none overflow-hidden">
              {/* Mobile Status Bar */}
              <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-[11px] font-medium">
                <span>9:41</span>
                <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto" />
                <span>5G · 100%</span>
              </div>

              {/* Mobile Header */}
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="font-black text-slate-900">ZYLO.</span>
                <span className="text-xs font-bold text-indigo-600">Categories</span>
              </div>

              {/* Mobile Drawer Menu List */}
              <div className="p-3 divide-y divide-slate-100 max-h-[480px] overflow-y-auto text-xs">
                {menuRoots.map((root) => (
                  <div key={root._id} className="py-2.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800 py-1">
                      <div className="flex items-center gap-2">
                        {root.iconUrl && (
                          <img
                            src={root.iconUrl}
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span>{root.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {root.children && root.children.length > 0 && (
                      <div className="pl-6 space-y-1.5 pt-1.5">
                        {root.children.slice(0, 3).map((child) => (
                          <div
                            key={child._id}
                            className="text-slate-500 hover:text-indigo-600 flex items-center justify-between text-[11px]"
                          >
                            <span>{child.name}</span>
                            {child.badge && (
                              <span className="text-[9px] px-1 rounded bg-indigo-50 text-indigo-700">
                                {child.badge.text}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>
            Displaying <b>{menuRoots.length}</b> live storefront navigation departments.
          </span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryMegaMenuModal;
