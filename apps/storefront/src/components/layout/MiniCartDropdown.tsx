import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';

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

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'imac-2022',
    title: '2022 Apple iMac with Retina 5K Display 8GB RAM, 256GB SSD',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80',
    quantity: 1,
    price: 2856.4,
  },
  {
    id: 'sage-headphones',
    title: '2022 Apple iMac with Retina 5K Display 8GB RAM, 256GB SSD',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
    quantity: 1,
    price: 2856.4,
  },
];

export const MiniCartDropdown: React.FC<MiniCartDropdownProps> = ({
  isOpen,
  onClose,
  items = DEFAULT_CART_ITEMS,
  total = 2586.3,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-[330px] bg-white border border-slate-200 rounded-md p-4 z-50 animate-in fade-in duration-100 select-none text-left"
    >
      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-14 h-14 shrink-0 rounded-md bg-white border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link
                to={ROUTES.CUSTOMER.SHOP}
                onClick={onClose}
                className="text-[13px] font-semibold text-[#1e3a8a] hover:text-amber-600 line-clamp-2 leading-tight transition-colors"
                title={item.title}
              >
                {item.title}
              </Link>
              <p className="text-[13px] font-bold text-amber-500 mt-1">
                {item.quantity} x ${item.price.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal / Total Row */}
      <div className="border-t border-slate-200/90 pt-3 mt-4 flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#1e293b]">Total</span>
        <span className="text-[17px] font-bold text-[#0284c7]">
          ${total.toFixed(1)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 grid grid-cols-2 gap-3">
        <Link
          to={ROUTES.CUSTOMER.CART}
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#3b5998] hover:bg-slate-50 text-[#3b5998] text-[13px] font-bold transition-colors cursor-pointer text-center"
        >
          View cart
        </Link>

        <Link
          to={ROUTES.CUSTOMER.CHECKOUT}
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#425a8b] hover:bg-[#32466f] text-white text-[13px] font-bold transition-colors cursor-pointer text-center"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default MiniCartDropdown;
