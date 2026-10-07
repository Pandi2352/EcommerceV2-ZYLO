import React, { useState, useRef } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  isNewArrival?: boolean;
  isFeatured?: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedIndex,
  onSelectIndex,
  productName,
  hasDiscount,
  discountPercent,
  isNewArrival,
  isFeatured,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const currentImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    onSelectIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    onSelectIndex((selectedIndex + 1) % images.length);
  };

  return (
    <div className="flex flex-col gap-3.5 select-none w-full max-w-[400px] mx-auto">
      {/* 1. Main Stage / Zoom Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-square w-full rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center cursor-crosshair"
      >
        {/* Main Image with Zoom effect */}
        <div className="w-full h-full p-4 flex items-center justify-center overflow-hidden">
          <img
            src={currentImage}
            alt={productName}
            className={`w-full h-full object-contain transition-transform duration-100 ease-out ${
              isZoomed ? 'scale-175' : 'scale-100'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Promotional / Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {hasDiscount && discountPercent && discountPercent > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
              -{discountPercent}% OFF
            </span>
          )}
          {isNewArrival && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-600 text-white">
              NEW
            </span>
          )}
          {isFeatured && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-600 text-white">
              FEATURED
            </span>
          )}
        </div>

        {/* Zoom Hint Indicator */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-white/90 border border-slate-200 text-slate-500 text-[11px] font-medium flex items-center gap-1 pointer-events-none z-10 backdrop-blur-xs">
          <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
          <span>{isZoomed ? 'Pan to explore' : 'Hover to zoom'}</span>
        </div>

        {/* Counter Pill */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/60 text-white text-[10px] font-semibold pointer-events-none z-10">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Quick Nav Arrows on hover */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 z-20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 z-20 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 2. Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {images.map((imgUrl, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative w-14 h-14 rounded-md border bg-white p-1 shrink-0 overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Angle thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
