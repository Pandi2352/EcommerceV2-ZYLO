import React from 'react';
import { Truck, Headphones, RotateCcw, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'For all orders over $75.00',
    color: 'text-amber-500 bg-amber-50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Dedicated friendly assistance',
    color: 'text-sky-500 bg-sky-50',
  },
  {
    icon: RotateCcw,
    title: '30 Days Return',
    desc: 'Money back guarantee',
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Payment',
    desc: 'Encrypted Stripe & SSL checkout',
    color: 'text-indigo-500 bg-indigo-50',
  },
];

export const FeatureBadges: React.FC = () => {
  return (
    <section className="w-full max-w-[1320px] mx-auto px-4 py-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-md ${feat.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {feat.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureBadges;
