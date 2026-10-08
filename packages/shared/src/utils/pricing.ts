import type { VolumePricingTier } from '../types/product';

export interface VolumePriceResult {
  unitPrice: number;
  originalUnitPrice: number;
  discountPercent: number;
  isTiered: boolean;
  savingsPerUnit: number;
  totalSavings: number;
  activeTier: VolumePricingTier | null;
}

export function calculateVolumeTieredPrice(
  basePrice: number,
  quantity: number,
  tiers?: VolumePricingTier[] | null,
): VolumePriceResult {
  if (!tiers || tiers.length === 0 || quantity < 1) {
    return {
      unitPrice: basePrice,
      originalUnitPrice: basePrice,
      discountPercent: 0,
      isTiered: false,
      savingsPerUnit: 0,
      totalSavings: 0,
      activeTier: null,
    };
  }

  // Find best qualifying tier matching quantity
  const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
  const matchingTier = sortedTiers.find(
    (t) =>
      quantity >= t.minQuantity &&
      (t.maxQuantity == null || quantity <= t.maxQuantity),
  );

  if (!matchingTier) {
    return {
      unitPrice: basePrice,
      originalUnitPrice: basePrice,
      discountPercent: 0,
      isTiered: false,
      savingsPerUnit: 0,
      totalSavings: 0,
      activeTier: null,
    };
  }

  let finalPrice = basePrice;
  let discountPercent = 0;

  if (matchingTier.unitPrice != null && matchingTier.unitPrice > 0) {
    finalPrice = matchingTier.unitPrice;
    discountPercent = Math.max(
      0,
      Math.round(((basePrice - finalPrice) / basePrice) * 100),
    );
  } else if (matchingTier.discountPercent && matchingTier.discountPercent > 0) {
    discountPercent = matchingTier.discountPercent;
    finalPrice = +(basePrice * (1 - discountPercent / 100)).toFixed(2);
  }

  const savingsPerUnit = Math.max(0, +(basePrice - finalPrice).toFixed(2));
  const totalSavings = +(savingsPerUnit * quantity).toFixed(2);

  return {
    unitPrice: finalPrice,
    originalUnitPrice: basePrice,
    discountPercent,
    isTiered: discountPercent > 0 || finalPrice < basePrice,
    savingsPerUnit,
    totalSavings,
    activeTier: matchingTier,
  };
}
