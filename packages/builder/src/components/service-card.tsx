"use client";

import type { Service } from "@repo/api";
import { Card, CardContent, Badge, Button, cn } from "@repo/ui";
import { Plus, Check, AlertTriangle, Lock } from "lucide-react";
import { formatPrice } from "../lib/pricing";

export interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  canAdd: boolean;
  blockReason?: string;
  hasConflict: boolean;
  hasMissingDeps: boolean;
  onToggle: (serviceId: string) => void;
}

const categoryColors: Record<string, string> = {
  criminal: "bg-red-500/10 text-red-700 dark:text-red-400",
  verification: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  driving: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  drug_screening: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

export function ServiceCard({
  service,
  isSelected,
  canAdd,
  blockReason,
  hasConflict,
  hasMissingDeps,
  onToggle,
}: ServiceCardProps) {
  const handleClick = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/645ba571-33d3-4e09-8730-cae21d88d07c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'service-card.tsx:handleClick',message:'Card clicked',data:{serviceId:service.id,canAdd,isSelected,hasMissingDeps,willToggle:canAdd||isSelected},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (canAdd || isSelected) {
      onToggle(service.id);
    }
  };

  // Invalid state: selected but has missing dependencies OR has conflict with another selected service
  const isInvalidSelection = isSelected && (hasMissingDeps || hasConflict);

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200",
        isSelected && !isInvalidSelection && "ring-2 ring-primary bg-primary/5",
        isInvalidSelection && "ring-2 ring-red-500 bg-red-500/10",
        !canAdd && !isSelected && "cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{service.name}</h4>
              <Badge
                variant="secondary"
                className={cn("text-xs", categoryColors[service.category])}
              >
                {service.category.replace("_", " ")}
              </Badge>
            </div>

            <p className="text-lg font-semibold text-foreground">
              {formatPrice(service.base_price)}
            </p>

            {/* Block reason - show for unselected or invalid selections */}
            {blockReason && (!isSelected || isInvalidSelection) && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs",
                isInvalidSelection ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
              )}>
                <AlertTriangle className="h-3 w-3" />
                <span>{blockReason}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {isSelected ? (
              <Button
                size="icon"
                variant="default"
                className={cn(
                  "h-8 w-8 rounded-full",
                  isInvalidSelection && "bg-red-500 hover:bg-red-600"
                )}
              >
                {isInvalidSelection ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            ) : canAdd ? (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                disabled
              >
                <Lock className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
