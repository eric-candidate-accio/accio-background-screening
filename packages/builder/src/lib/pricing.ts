import type { Discount, Service } from "@repo/api";

/**
 * Client-side pricing calculations
 * These mirror the server-side logic for optimistic UI updates
 */

const VOLUME_THRESHOLDS = [
  { minServices: 8, discount: 0.15, name: "15% Off - Enterprise Package" },
  { minServices: 5, discount: 0.1, name: "10% Off - Large Package" },
] as const;

const BUNDLE_RULES = [
  {
    // All 4 criminal searches for $20 discount
    requiredIds: [
      "state_criminal",
      "county_criminal",
      "federal_criminal",
      "national_criminal",
    ],
    discount: 20,
    name: "Criminal Bundle",
  },
  {
    // All 3 verification services for $15 discount
    requiredIds: [
      "employment_verification",
      "education_verification",
      "professional_license",
    ],
    discount: 15,
    name: "Verification Bundle",
  },
] as const;

/**
 * Calculate subtotal from selected services
 */
export function calculateSubtotal(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.base_price, 0);
}

/**
 * Calculate volume discount based on service count
 */
export function calculateVolumeDiscount(
  serviceCount: number,
  subtotal: number
): Discount | null {
  for (const threshold of VOLUME_THRESHOLDS) {
    if (serviceCount >= threshold.minServices) {
      return {
        type: "volume",
        name: threshold.name,
        amount: Math.round(subtotal * threshold.discount * 100) / 100,
      };
    }
  }
  return null;
}

/**
 * Calculate bundle discounts based on service combinations
 */
export function calculateBundleDiscounts(serviceIds: string[]): Discount[] {
  const discounts: Discount[] = [];
  const serviceSet = new Set(serviceIds);

  for (const rule of BUNDLE_RULES) {
    if (rule.requiredIds.every((id) => serviceSet.has(id))) {
      discounts.push({
        type: "bundle",
        name: rule.name,
        amount: rule.discount,
      });
    }
  }

  return discounts;
}

/**
 * Calculate full pricing breakdown
 */
export function calculatePricingBreakdown(
  services: Service[],
  serviceIds: string[]
): {
  subtotal: number;
  discounts: Discount[];
  totalDiscount: number;
  total: number;
} {
  const subtotal = calculateSubtotal(services);
  const discounts: Discount[] = [];

  // Volume discount
  const volumeDiscount = calculateVolumeDiscount(services.length, subtotal);
  if (volumeDiscount) {
    discounts.push(volumeDiscount);
  }

  // Bundle discounts
  const bundleDiscounts = calculateBundleDiscounts(serviceIds);
  discounts.push(...bundleDiscounts);

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const total = Math.max(0, subtotal - totalDiscount);

  return {
    subtotal,
    discounts,
    totalDiscount,
    total,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
