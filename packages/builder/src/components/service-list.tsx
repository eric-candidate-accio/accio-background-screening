"use client";

import type { Service, ServiceCategory } from "@repo/api";
import {
  ScrollArea,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { getServiceStatus } from "../lib/validation";
import { ServiceCard } from "./service-card";

export interface ServiceListProps {
  services: Service[];
  servicesByCategory?: Partial<Record<ServiceCategory, Service[]>>;
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  isLoading?: boolean;
}

const categoryOrder: ServiceCategory[] = [
  "criminal",
  "verification",
  "driving",
  "drug_screening",
];

const categoryLabels: Record<string, string> = {
  all: "All Services",
  criminal: "Criminal",
  verification: "Verification",
  driving: "Driving",
  drug_screening: "Drug Screening",
};

export function ServiceList({
  services,
  servicesByCategory = {},
  selectedServiceIds,
  onToggleService,
  isLoading,
}: ServiceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const renderServiceCards = (servicesToRender: Service[]) => (
    <div className="space-y-3">
      {servicesToRender.map((service) => {
        const status = getServiceStatus(
          service.id,
          selectedServiceIds,
          services
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
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">Available Services</h3>
        <p className="text-sm text-muted-foreground">
          Click to add services to your package
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="inline-flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">
            {categoryLabels.all}
          </TabsTrigger>
          {categoryOrder.map((category) => {
            const categoryServices = servicesByCategory[category];
            if (!categoryServices || categoryServices.length === 0) return null;

            const selectedCount = categoryServices.filter((s) =>
              selectedServiceIds.includes(s.id)
            ).length;

            return (
              <TabsTrigger key={category} value={category} className="text-xs">
                {categoryLabels[category]}
                {selectedCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {selectedCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="relative mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)] rounded-md">
            <div className="p-1 pr-4 pb-8">
              <TabsContent value="all" className="mt-0">
                {renderServiceCards(services)}
              </TabsContent>

              {categoryOrder.map((category) => {
                const categoryServices = servicesByCategory[category];
                if (!categoryServices || categoryServices.length === 0)
                  return null;

                return (
                  <TabsContent key={category} value={category} className="mt-0">
                    {renderServiceCards(categoryServices)}
                  </TabsContent>
                );
              })}
            </div>
          </ScrollArea>
          {/* Scroll indicator shadow */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        </div>
      </Tabs>
    </div>
  );
}
