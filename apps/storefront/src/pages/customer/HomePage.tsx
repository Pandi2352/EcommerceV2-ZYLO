import React from 'react';
import {
  HeroSection,
  BrandPartnersRow,
  FeatureBadges,
  FeaturedProductsGrid,
} from '../../components/home';

export const CustomerHomePage: React.FC = () => {
  return (
    <div className="w-full bg-white text-slate-800 font-sans pb-16">
      {/* 1. Main Hero Grid Section (Matches design: Main Banner + Stacked Cards + Vertical Deals) */}
      <HeroSection />

      {/* 2. Brand Partners Logo Marquee Row */}
      <BrandPartnersRow />

      {/* 3. Value Proposition Guarantees */}
      <FeatureBadges />

      {/* 4. Trending & Featured Products Catalog */}
      <FeaturedProductsGrid />
    </div>
  );
};

export default CustomerHomePage;
