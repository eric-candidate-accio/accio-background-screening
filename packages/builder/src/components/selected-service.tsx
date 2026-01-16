"use client";

import type { Service } from "@repo/api";
import { Button, Badge, cn } from "@repo/ui";
import { X, AlertCircle, AlertTriangle } from "lucide-react";
import { formatPrice } from "../lib/pricing";

export interface SelectedServiceProps {
  service: Service;
  hasDependents: boolean;
  dependentNames?: string[];
  hasMissingDeps?: boolean;
  missingDepNames?: string[];
  hasConflict?: boolean;
  conflictingNames?: string[];
  onRemove: (serviceId: string) => void;
}

export function SelectedService({
  service,
  hasDependents,
  dependentNames = [],
  hasMissingDeps = false,
  missingDepNames = [],
  hasConflict = false,
  conflictingNames = [],
  onRemove,
}: SelectedServiceProps) {
  const isInvalid = hasMissingDeps || hasConflict;

  return (
    <div className={cn(
      "flex items-center justify-between py-3 border-b border-border last:border-0",
      isInvalid && "bg-red-500/10 -mx-4 px-4 border-red-200 dark:border-red-900"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm truncate",
            isInvalid && "text-red-700 dark:text-red-400"
          )}>{service.name}</span>
          {hasConflict && (
            <div className="group relative">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border whitespace-nowrap">
                  Conflicts with: {conflictingNames.join(", ")}
                </div>
              </div>
            </div>
          )}
          {hasMissingDeps && !hasConflict && (
            <div className="group relative">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border whitespace-nowrap">
                  Requires: {missingDepNames.join(", ")}
                </div>
              </div>
            </div>
          )}
          {hasDependents && !isInvalid && (
            <div className="group relative">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border whitespace-nowrap">
                  Required by: {dependentNames.join(", ")}
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatPrice(service.base_price)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(service.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
