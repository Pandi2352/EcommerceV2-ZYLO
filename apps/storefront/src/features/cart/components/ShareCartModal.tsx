import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, MessageCircle } from 'lucide-react';
import type { CartItem } from '@shared/types/cart';
import { toast } from '@shared/ui/Toast';

interface ShareCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
}

export const ShareCartModal: React.FC<ShareCartModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Encode cart payload
  const compactPayload = items.map((i) => ({
    p: i.productId,
    v: i.variantSku || undefined,
    q: i.quantity,
  }));

  const encodedStr = encodeURIComponent(
    btoa(unescape(encodeURIComponent(JSON.stringify(compactPayload)))),
  );
  const shareUrl = `${window.location.origin}/cart?share=${encodedStr}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Shareable cart link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareText = `Check out my cart on ZYLO (${items.length} items, $${subtotal}):`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`,
  )}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    'Shared ZYLO Shopping Cart',
  )}&body=${encodeURIComponent(
    `Hi,\n\nI wanted to share my shopping cart with you:\n${shareUrl}\n\nTotal: $${subtotal} (${items.length} items)`,
  )}`;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Share Shopping Cart</h3>
                <p className="text-xs text-slate-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'} ready to share
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Anyone with this link will instantly have these {items.length} products loaded into their cart on any browser or device.
          </p>

          {/* Share Link Input */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none select-all font-mono"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Social / Direct Share Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <a
              href={mailtoUrl}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-slate-700 hover:text-sky-700 text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCartModal;
