import React from 'react';
import HeroMainSlider from './HeroMainSlider';
import HeroPromoCards from './HeroPromoCards';
import HeroVerticalBanners from './HeroVerticalBanners';

export const HeroSection: React.FC = () => {
  return (
    <section className="w-full max-w-[1320px] mx-auto px-4 pt-3 pb-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Main Interactive Slider (~50% width on lg) */}
        <div className="lg:col-span-6 xl:col-span-6">
          <HeroMainSlider />
        </div>

        {/* Middle Column: Two Stacked Feature Cards (~25% width on lg) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <HeroPromoCards />
        </div>

        {/* Right Column: Vertical Promotional Rail (~25% width on lg) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <HeroVerticalBanners />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
