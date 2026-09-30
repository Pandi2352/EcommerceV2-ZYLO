import React from 'react';

interface Brand {
  name: string;
  fontClass: string;
}

const BRANDS: Brand[] = [
  { name: 'Microsoft', fontClass: 'font-semibold tracking-tight text-slate-400 text-sm sm:text-base' },
  { name: 'SONY', fontClass: 'font-black tracking-widest text-slate-400 text-xs sm:text-sm font-serif' },
  { name: 'acer', fontClass: 'font-bold lowercase tracking-wider text-slate-400 text-sm sm:text-base' },
  { name: 'NOKIA', fontClass: 'font-black tracking-widest text-slate-400 text-xs sm:text-sm' },
  { name: 'ASUS', fontClass: 'font-black tracking-wider text-slate-400 text-xs sm:text-sm italic' },
  { name: 'CASIO', fontClass: 'font-black tracking-wider text-slate-400 text-xs sm:text-sm font-mono' },
  { name: 'DELL', fontClass: 'font-black tracking-widest text-slate-400 text-xs sm:text-sm' },
  { name: 'Panasonic', fontClass: 'font-bold tracking-tight text-slate-400 text-xs sm:text-sm' },
  { name: 'VAIO', fontClass: 'font-black italic tracking-widest text-slate-400 text-xs sm:text-sm' },
  { name: 'SHARP', fontClass: 'font-black tracking-widest text-slate-400 text-xs sm:text-sm' },
];

export const BrandPartnersRow: React.FC = () => {
  return (
    <section className="w-full border-t border-b border-slate-100 bg-white py-2 my-1 select-none">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between gap-5 overflow-x-auto no-scrollbar py-1 opacity-60 hover:opacity-100 transition-opacity">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center shrink-0 px-2 cursor-pointer hover:text-slate-800 transition-colors"
            >
              <span className={`${brand.fontClass} hover:text-slate-700 transition-colors`}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartnersRow;
