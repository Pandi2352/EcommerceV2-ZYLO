import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

interface MiniCartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  total?: number;
}

export const MiniCartDropdown: React.FC<MiniCartDropdownProps> = ({
  isOpen,
  onClose,
  items = [],
  total = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-[330px] bg-white border border-slate-200 rounded-md p-4 z-50 animate-in fade-in duration-100 select-none text-left"
    >
      {items.length === 0 ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Your cart is empty</h4>
            <p className="text-[11px] text-slate-400">
              Discover premium products and add them to your cart.
            </p>
          </div>
          <Link
            to={ROUTES.CUSTOMER.SHOP}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] text-white text-xs font-bold transition-colors w-full"
          >
            <span>Explore Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 shrink-0 rounded-md bg-white border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight"
                    title={item.title}
                  >
                    {item.title}
                  </span>
                  <p className="text-xs font-bold text-amber-600 mt-0.5">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal / Total Row */}
          <div className="border-t border-slate-200 pt-3 mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Subtotal</span>
            <span className="text-sm font-black text-slate-900">
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to={ROUTES.CUSTOMER.CART}
              onClick={onClose}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors text-center"
            >
              View Cart
            </Link>

            <Link
              to={ROUTES.CUSTOMER.CHECKOUT}
              onClick={onClose}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] text-white text-xs font-bold transition-colors text-center"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniCartDropdown;
