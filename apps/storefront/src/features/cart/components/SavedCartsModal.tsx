import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Trash2, ArrowRight, FolderPlus, Clock } from 'lucide-react';
import type { CartItem } from '@shared/types/cart';
import { useCart } from '../context/CartContext';
import { useSettings } from '../../settings/context/SettingsContext';
import { toast } from '@shared/ui/Toast';

const NAMED_CARTS_STORAGE_KEY = 'zylo_named_saved_carts';

export interface SavedCartFolder {
  id: string;
  name: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
}

interface SavedCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedCartsModal: React.FC<SavedCartsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { items, subtotal, clearCart, addToCart } = useCart();
  const { formatPrice } = useSettings();

  const [savedCarts, setSavedCarts] = useState<SavedCartFolder[]>([]);
  const [newCartName, setNewCartName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(NAMED_CARTS_STORAGE_KEY);
      if (stored) {
        setSavedCarts(JSON.parse(stored));
      }
    } catch {
      setSavedCarts([]);
    }
  }, [isOpen]);

  const persistCarts = (carts: SavedCartFolder[]) => {
    setSavedCarts(carts);
    localStorage.setItem(NAMED_CARTS_STORAGE_KEY, JSON.stringify(carts));
  };

  const handleSaveCurrentCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCartName.trim()) {
      toast.error('Please enter a name for this cart');
      return;
    }
    if (items.length === 0) {
      toast.error('Your current cart is empty');
      return;
    }

    const newCart: SavedCartFolder = {
      id: `cart_${Date.now()}`,
      name: newCartName.trim(),
      createdAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [...items],
      subtotal,
    };

    const updated = [newCart, ...savedCarts];
    persistCarts(updated);
    setNewCartName('');
    setIsCreating(false);
    toast.success(`Saved "${newCart.name}" successfully!`);
  };

  const handleDeleteCart = (id: string, name: string) => {
    const updated = savedCarts.filter((c) => c.id !== id);
    persistCarts(updated);
    toast.success(`Deleted "${name}"`);
  };

  const handleRestoreCart = async (cart: SavedCartFolder) => {
    try {
      await clearCart();
      for (const item of cart.items) {
        await addToCart(
          {
            _id: item.productId,
            title: item.name,
            price: item.price,
            images: [{ url: item.image }],
          },
          item.variantSku,
          item.quantity,
        );
      }
      toast.success(`Loaded "${cart.name}" into your active cart!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to restore cart');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Saved Carts</h3>
                <p className="text-xs text-slate-500">
                  Save separate named shopping carts to load anytime
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Save Current Cart Section */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            {isCreating ? (
              <form onSubmit={handleSaveCurrentCart} className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Save current cart ({items.length} items • {formatPrice(subtotal)})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Office Tech Setup, Monthly Supplies..."
                    value={newCartName}
                    onChange={(e) => setNewCartName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Save active items as a named cart</span>
                  <p className="text-[11px] text-slate-500">Current cart has {items.length} items ({formatPrice(subtotal)})</p>
                </div>
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Cart</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Saved Carts */}
          <div className="mt-4 max-h-72 overflow-y-auto space-y-2.5">
            {savedCarts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <FolderPlus className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">No saved carts yet. Save your current items above.</p>
              </div>
            ) : (
              savedCarts.map((cart) => (
                <div
                  key={cart.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{cart.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{cart.createdAt}</span>
                      </span>
                      <span>•</span>
                      <span>{cart.items.length} items</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800">{formatPrice(cart.subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreCart(cart)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCart(cart.id, cart.name)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete saved cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedCartsModal;
