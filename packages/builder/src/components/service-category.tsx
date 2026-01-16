"use client";

import { useState } from "react";
import type { Service } from "@repo/api";
import { cn } from "@repo/ui";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ServiceCard } from "./service-card";
import { getServiceStatus } from "../lib/validation";

export interface ServiceCategoryProps {
  category: string;
  services: Service[];
  selectedServiceIds: string[];
  allServices: Service[];
  onToggleService: (serviceId: string) => void;
  defaultOpen?: boolean;
}

const categoryLabels: Record<string, string> = {
  criminal: "Criminal Background",
  verification: "Verification Services",
  driving: "Driving Records",
  drug_screening: "Drug Screening",
};

export function ServiceCategory({
  category,
  services,
  selectedServiceIds,
  allServices,
  onToggleService,
  defaultOpen = true,
}: ServiceCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const selectedCount = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  ).length;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-sm group-hover:text-primary transition-colors">
          {categoryLabels[category] || category}
        </span>
        {selectedCount > 0 && (
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {selectedCount} selected
          </span>
        )}
      </button>

      <div
        className={cn(
          "space-y-2 pl-6 overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {services.map((service) => {
          const status = getServiceStatus(
            service.id,
            selectedServiceIds,
            allServices
          );
          return (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={status.isSelected}
              canAdd={status.canAdd}
              blockReason={status.addBlockReason}
              hasConflict={status.hasConflict}
              hasMissingDeps={status.hasMissingDeps}
              onToggle={onToggleService}
            />
          );
        })}
      </div>
    </div>
  );
}
