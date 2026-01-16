"use client";

import type { PricingBreakdown } from "@repo/api";
import { Badge } from "@repo/ui";
import { Percent } from "lucide-react";

export interface PackageSummaryProps {
  serviceCount: number;
  pricing: PricingBreakdown;
  compact?: boolean;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function PackageSummary({
  serviceCount,
  pricing,
  compact = false,
}: PackageSummaryProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          {serviceCount} {serviceCount === 1 ? "service" : "services"}
        </span>
        <span className="font-semibold">{formatPrice(pricing.total)}</span>
        {pricing.total_discount > 0 && (
          <Badge variant="success" className="text-xs">
            Save {formatPrice(pricing.total_discount)}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {serviceCount} {serviceCount === 1 ? "service" : "services"}
        </span>
        <span className="text-muted-foreground line-through">
          {formatPrice(pricing.subtotal)}
        </span>
      </div>

      {pricing.discounts.length > 0 && (
        <div className="space-y-1">
          {pricing.discounts.map((discount, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <Percent className="h-3 w-3" />
              <span>{discount.name}</span>
              <span className="ml-auto">-{formatPrice(discount.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold">{formatPrice(pricing.total)}</span>
      </div>
    </div>
  );
}
