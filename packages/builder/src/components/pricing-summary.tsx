"use client";

import type { Discount } from "@repo/api";
import { Card, CardContent, CardHeader, CardTitle, Separator, Badge } from "@repo/ui";
import { Tag, Percent } from "lucide-react";
import { formatPrice } from "../lib/pricing";

export interface PricingSummaryProps {
  subtotal: number;
  discounts: Discount[];
  totalDiscount: number;
  total: number;
  serviceCount: number;
}

export function PricingSummary({
  subtotal,
  discounts,
  totalDiscount,
  total,
  serviceCount,
}: PricingSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Pricing Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({serviceCount} {serviceCount === 1 ? "service" : "services"})
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Discounts */}
        {discounts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              {discounts.map((discount, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Percent className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {discount.name}
                    </span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{formatPrice(discount.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Total */}
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <div className="text-right">
            <span className="text-xl font-bold">{formatPrice(total)}</span>
            {totalDiscount > 0 && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                You save {formatPrice(totalDiscount)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
