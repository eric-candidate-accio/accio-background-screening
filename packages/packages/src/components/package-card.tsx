"use client";

import type { Package, PricingBreakdown, Service } from "@repo/api";
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@repo/ui";
import { Calendar, Package as PackageIcon } from "lucide-react";
import { PackageActions } from "./package-actions";
import { PackageSummary } from "./package-summary";

export interface PackageCardProps {
  package: Package & { pricing: PricingBreakdown };
  services?: Service[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  className?: string;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function PackageCard({
  package: pkg,
  services = [],
  onEdit,
  onDelete,
  isDeleting,
  className,
}: PackageCardProps) {
  // Get service names for display
  const serviceNames = pkg.service_ids
    .map((id) => services.find((s) => s.id === id)?.name || id)
    .slice(0, 3);
  const remainingCount = pkg.service_ids.length - 3;

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <PackageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <CardTitle className="text-lg truncate">{pkg.name}</CardTitle>
          </div>
          <PackageActions
            packageId={pkg.id}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Services */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {serviceNames.map((name, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount} more
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing */}
        <PackageSummary
          serviceCount={pkg.service_ids.length}
          pricing={pkg.pricing}
          compact
        />

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(pkg.created_at)}</span>
          </div>
          {pkg.updated_at !== pkg.created_at && (
            <span>Updated {formatDate(pkg.updated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
