"use client";

import type { Service, ValidationError, Discount } from "@repo/api";
import { Card, CardContent, CardHeader, CardTitle, ScrollArea } from "@repo/ui";
import { Package } from "lucide-react";
import { SelectedService } from "./selected-service";
import { PricingSummary } from "./pricing-summary";
import { SavePackageForm } from "./save-package-form";
import { ConflictAlert } from "./conflict-alert";
import { checkRemovalImpact, checkDependencies, checkConflicts } from "../lib/validation";

export interface CurrentPackageProps {
  selectedServices: Service[];
  allServices: Service[];
  packageName: string;
  onPackageNameChange: (name: string) => void;
  onRemoveService: (serviceId: string) => void;
  onSave: () => void;
  validationErrors: ValidationError[];
  pricing: {
    subtotal: number;
    discounts: Discount[];
    totalDiscount: number;
    total: number;
  };
  isSaving: boolean;
  isEditing: boolean;
}

export function CurrentPackage({
  selectedServices,
  allServices,
  packageName,
  onPackageNameChange,
  onRemoveService,
  onSave,
  validationErrors,
  pricing,
  isSaving,
  isEditing,
}: CurrentPackageProps) {
  const selectedIds = selectedServices.map((s) => s.id);

  return (
    <div className="space-y-4">
      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <ConflictAlert errors={validationErrors} />
      )}

      {/* Selected services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Your Package
            {selectedServices.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({selectedServices.length} services)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No services selected</p>
              <p className="text-xs mt-1">
                Click on services from the left to add them
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="divide-y divide-border">
                {selectedServices.map((service) => {
                  const { dependentServices } = checkRemovalImpact(
                    service.id,
                    selectedIds,
                    allServices
                  );
                  const { satisfied, missingDependencies } = checkDependencies(
                    service.id,
                    selectedIds,
                    allServices
                  );
                  const { hasConflict, conflictingServices } = checkConflicts(
                    service.id,
                    selectedIds,
                    allServices
                  );
                  return (
                    <SelectedService
                      key={service.id}
                      service={service}
                      hasDependents={dependentServices.length > 0}
                      dependentNames={dependentServices.map((s) => s.name)}
                      hasMissingDeps={!satisfied}
                      missingDepNames={missingDependencies.map((s) => s.name)}
                      hasConflict={hasConflict}
                      conflictingNames={conflictingServices.map((s) => s.name)}
                      onRemove={onRemoveService}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      {selectedServices.length > 0 && (
        <PricingSummary
          subtotal={pricing.subtotal}
          discounts={pricing.discounts}
          totalDiscount={pricing.totalDiscount}
          total={pricing.total}
          serviceCount={selectedServices.length}
        />
      )}

      {/* Save form */}
      <Card>
        <CardContent className="pt-6">
          <SavePackageForm
            packageName={packageName}
            onPackageNameChange={onPackageNameChange}
            onSave={onSave}
            isValid={validationErrors.length === 0}
            isSaving={isSaving}
            isEditing={isEditing}
            serviceCount={selectedServices.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
