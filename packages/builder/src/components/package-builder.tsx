"use client";

import {
  useCreatePackage,
  usePackage,
  useServices,
  useUpdatePackage,
  validatePackage,
  type Service,
} from "@repo/api";
import {
  PageAlert,
  PageHeader,
  PageLayout,
  SplitLayout,
  SplitLeft,
  SplitRight,
} from "@repo/layout";
import { Button, Skeleton } from "@repo/ui";
import { List } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useBuilderState } from "../hooks/use-builder-state";
import { calculatePricingBreakdown } from "../lib/pricing";
import { ConflictAlert } from "./conflict-alert";
import { CurrentPackage } from "./current-package";
import { ServiceList } from "./service-list";

export interface PackageBuilderProps {
  /** Callback when package is saved successfully */
  onPackageSaved?: (packageId: string) => void;
  /** Callback to navigate to packages list */
  onViewPackages?: () => void;
  /** Package ID to edit (if editing existing package) */
  editPackageId?: string | null;
}

export function PackageBuilder({
  onPackageSaved,
  onViewPackages,
  editPackageId,
}: PackageBuilderProps) {
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: editPackageData } = usePackage(editPackageId || "");
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const builder = useBuilderState();

  // Load package data when editing (key prop on component ensures fresh state)
  useEffect(() => {
    if (editPackageId && editPackageData && !builder.editingPackageId) {
      builder.loadPackage(
        editPackageId,
        editPackageData.package.name,
        editPackageData.package.service_ids
      );
    }
  }, [editPackageId, editPackageData, builder]);

  // Get selected services as full objects
  const selectedServices = useMemo(() => {
    if (!servicesData?.services) return [];
    return builder.selectedServiceIds
      .map((id) => servicesData.services.find((s) => s.id === id))
      .filter((s): s is Service => s !== undefined);
  }, [builder.selectedServiceIds, servicesData?.services]);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculatePricingBreakdown(
      selectedServices,
      builder.selectedServiceIds
    );
  }, [selectedServices, builder.selectedServiceIds]);

  // Handle service toggle with dependency/conflict logic
  const handleToggleService = useCallback(
    async (serviceId: string) => {
      if (!servicesData?.services) return;

      const isCurrentlySelected =
        builder.selectedServiceIds.includes(serviceId);

      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/645ba571-33d3-4e09-8730-cae21d88d07c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "package-builder.tsx:handleToggleService:entry",
            message: "Toggle service called",
            data: {
              serviceId,
              isCurrentlySelected,
              currentSelection: builder.selectedServiceIds,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            hypothesisId: "B",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (isCurrentlySelected) {
        // Removing - just remove it
        builder.removeService(serviceId);
      } else {
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/645ba571-33d3-4e09-8730-cae21d88d07c",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "package-builder.tsx:handleToggleService:adding",
              message: "Adding service",
              data: { serviceId },
              timestamp: Date.now(),
              sessionId: "debug-session",
              hypothesisId: "B",
            }),
          }
        ).catch(() => {});
        // #endregion

        // Add the service (dependencies are enforced at UI level - button is disabled if deps not met)
        builder.addService(serviceId);
      }

      // Validate after change
      const newSelection = isCurrentlySelected
        ? builder.selectedServiceIds.filter((id) => id !== serviceId)
        : [...builder.selectedServiceIds, serviceId];

      if (newSelection.length > 0) {
        try {
          const result = await validatePackage(newSelection);
          builder.setValidationErrors(result.errors);
        } catch {
          // Ignore validation errors during quick updates
        }
      } else {
        builder.setValidationErrors([]);
      }
    },
    [builder, servicesData?.services]
  );

  // Handle service removal
  const handleRemoveService = useCallback(
    (serviceId: string) => {
      builder.removeService(serviceId);
      // Clear validation errors if no services selected
      if (builder.selectedServiceIds.length <= 1) {
        builder.setValidationErrors([]);
      }
    },
    [builder]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (
      !builder.packageName.trim() ||
      builder.selectedServiceIds.length === 0
    ) {
      return;
    }

    try {
      let result;
      if (builder.editingPackageId) {
        result = await updatePackage.mutateAsync({
          id: builder.editingPackageId,
          data: {
            name: builder.packageName,
            service_ids: builder.selectedServiceIds,
          },
        });
      } else {
        result = await createPackage.mutateAsync({
          name: builder.packageName,
          service_ids: builder.selectedServiceIds,
        });
      }

      // Reset builder
      builder.reset();

      // Callback
      onPackageSaved?.(result.package.id);
    } catch (error) {
      console.error("Failed to save package:", error);
    }
  }, [builder, createPackage, updatePackage, onPackageSaved]);

  if (servicesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-6">
          <div className="w-96 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout fluid>
      <PageHeader>
        <div className="flex items-center gap-4 w-full">
          <h1 className="text-xl font-semibold">
            AccioData Background Screening
          </h1>
          <div className="ml-auto">
            {onViewPackages && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewPackages}
                className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              >
                <List className="h-4 w-4 mr-2" />
                View Saved Packages
              </Button>
            )}
          </div>
        </div>
      </PageHeader>

      {builder.validationErrors.length > 0 && (
        <PageAlert>
          <ConflictAlert errors={builder.validationErrors} />
        </PageAlert>
      )}

      <SplitLayout leftWidth="w-2/5" rightWidth="w-3/5" gap="lg">
        <SplitLeft>
          <ServiceList
            services={servicesData?.services || []}
            servicesByCategory={servicesData?.by_category}
            selectedServiceIds={builder.selectedServiceIds}
            onToggleService={handleToggleService}
          />
        </SplitLeft>
        <SplitRight>
          <CurrentPackage
            selectedServices={selectedServices}
            allServices={servicesData?.services || []}
            packageName={builder.packageName}
            onPackageNameChange={builder.setPackageName}
            onRemoveService={handleRemoveService}
            onSave={handleSave}
            validationErrors={builder.validationErrors}
            pricing={pricing}
            isSaving={createPackage.isPending || updatePackage.isPending}
            isEditing={!!builder.editingPackageId}
          />
        </SplitRight>
      </SplitLayout>
    </PageLayout>
  );
}
