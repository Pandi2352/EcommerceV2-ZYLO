import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { ArrowRight } from 'lucide-react';

interface Slide {
  id: string;
  tagline: string;
  titlePrimary: string;
  titleSecondary: string;
  bullets: string[];
  ctaLabel: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
  bgGradient: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 'music-girl',
    tagline: 'FEEL THE BEAT',
    titlePrimary: 'ENJOY',
    titleSecondary: 'THE MUSIC',
    bullets: [
      'Free Shipping. Secure Payment',
      'Contact us 24hrs a day',
      'Support gift service',
    ],
    ctaLabel: 'Shop now',
    ctaLink: ROUTES.CUSTOMER.SHOP,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Woman listening to music with headphones',
    bgGradient: 'from-[#dcf5fc] via-[#e7f8fc] to-[#fff6dc]',
    accentColor: '#0ea5e9',
  },
  {
    id: 'studio-audio',
    tagline: 'PREMIUM ACOUSTICS',
    titlePrimary: 'STUDIO',
    titleSecondary: 'PRO SOUND',
    bullets: [
      'Active Noise Cancellation 45dB',
      'Lossless Hi-Res Wireless Audio',
      '45-Hour Long Battery Life',
    ],
    ctaLabel: 'Explore Audio',
    ctaLink: ROUTES.CUSTOMER.SHOP,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Studio grade ANC headphones',
    bgGradient: 'from-[#e0f2fe] via-[#f0f9ff] to-[#fef3c7]',
    accentColor: '#6366f1',
  },
  {
    id: 'smart-lifestyle',
    tagline: 'NEXT-GEN WEARABLES',
    titlePrimary: 'SMART',
    titleSecondary: 'EVERYWHERE',
    bullets: [
      'Titanium Aerospace Chassis',
      'Sapphire Crystal Touch Display',
      'Instant Sync with iOS & Android',
    ],
    ctaLabel: 'View Wearables',
    ctaLink: ROUTES.CUSTOMER.SHOP,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Smartwatch and tech wearables',
    bgGradient: 'from-[#ecfdf5] via-[#f0fdf4] to-[#fef9c3]',
    accentColor: '#10b981',
  },
];

export const HeroMainSlider: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlideIndex];

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gradient-to-br ${slide.bgGradient} h-full min-h-[270px] lg:h-[280px] flex flex-col justify-between p-4 sm:p-5 transition-colors duration-700 select-none border border-slate-200`}
    >
      {/* Decorative organic background curves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <svg
          className="absolute -top-12 -left-12 w-64 h-64 text-amber-300/30"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.6,81.2,29.1,72.7,41.9C64.2,54.7,52.9,65.8,39.7,72.4C26.5,79,11.4,81.1,-3.2,85.6C-17.8,90.1,-31.9,97,-44.6,92.5C-57.3,88,-68.6,72.1,-75.4,56.7C-82.2,41.3,-84.5,26.4,-85.4,11.5C-86.3,-3.4,-85.8,-18.3,-80.4,-31.6C-75,-44.9,-64.7,-56.8,-52,-64.8C-39.3,-72.8,-24.2,-76.9,-8.9,-78.3C6.4,-79.7,21.5,-78.4,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>
        <div className="absolute top-10 right-28 w-8 h-20 bg-amber-300/25 rounded-full rotate-45 transform" />
        <div className="absolute top-16 right-20 w-5 h-16 bg-amber-400/20 rounded-full rotate-45 transform" />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2 items-center flex-1">
        {/* Left Column: Text & CTAs */}
        <div className="md:col-span-7 flex flex-col justify-center">
          {/* Main Stylized Headline */}
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {slide.titlePrimary}
            </h2>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight mt-0.5">
              {slide.titleSecondary}
            </h3>
          </div>

          {/* Bullet points */}
          <ul className="mt-2.5 space-y-1 text-[11px] font-medium text-slate-600">
            {slide.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Action buttons */}
          <div className="mt-3.5 flex items-center gap-3">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer"
            >
              <span>{slide.ctaLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <Link
              to={ROUTES.CUSTOMER.SHOP}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual Cutout */}
        <div className="md:col-span-5 flex items-center justify-center md:justify-end relative">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className="relative z-10 w-full h-full object-cover rounded-md border border-white/90"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Bottom Carousel Navigation Dots */}
      <div className="relative z-10 flex items-center gap-1.5 pt-1">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlideIndex(idx)}
            className={`transition-all duration-300 rounded-sm cursor-pointer ${
              currentSlideIndex === idx
                ? 'w-4 h-1 bg-amber-500'
                : 'w-1.5 h-1 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroMainSlider;
