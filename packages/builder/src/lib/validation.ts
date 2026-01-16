import type { Service, ValidationError } from "@repo/api";

/**
 * Client-side validation for immediate feedback
 * Full validation is still done server-side
 */

/**
 * Check if adding a service would cause conflicts
 */
export function checkConflicts(
  serviceId: string,
  currentServiceIds: string[],
  allServices: Service[]
): { hasConflict: boolean; conflictingServices: Service[] } {
  const serviceToAdd = allServices.find((s) => s.id === serviceId);
  if (!serviceToAdd) {
    return { hasConflict: false, conflictingServices: [] };
  }

  const conflictingServices: Service[] = [];

  // Check if the new service conflicts with any currently selected
  for (const existingId of currentServiceIds) {
    if (serviceToAdd.conflicts.includes(existingId)) {
      const existingService = allServices.find((s) => s.id === existingId);
      if (existingService) {
        conflictingServices.push(existingService);
      }
    }
  }

  // Check if any current service conflicts with the new one
  for (const existingId of currentServiceIds) {
    const existingService = allServices.find((s) => s.id === existingId);
    if (existingService?.conflicts.includes(serviceId)) {
      if (!conflictingServices.find((s) => s.id === existingId)) {
        conflictingServices.push(existingService);
      }
    }
  }

  return {
    hasConflict: conflictingServices.length > 0,
    conflictingServices,
  };
}

/**
 * Check if a service's dependencies are satisfied
 */
export function checkDependencies(
  serviceId: string,
  currentServiceIds: string[],
  allServices: Service[]
): { satisfied: boolean; missingDependencies: Service[] } {
  const service = allServices.find((s) => s.id === serviceId);
  if (!service || service.dependencies.length === 0) {
    return { satisfied: true, missingDependencies: [] };
  }

  const currentSet = new Set(currentServiceIds);
  const missingDependencies: Service[] = [];

  for (const depId of service.dependencies) {
    if (!currentSet.has(depId)) {
      const depService = allServices.find((s) => s.id === depId);
      if (depService) {
        missingDependencies.push(depService);
      }
    }
  }

  return {
    satisfied: missingDependencies.length === 0,
    missingDependencies,
  };
}

/**
 * Check what would happen if a service is removed
 */
export function checkRemovalImpact(
  serviceId: string,
  currentServiceIds: string[],
  allServices: Service[]
): { canRemove: boolean; dependentServices: Service[] } {
  const dependentServices: Service[] = [];

  for (const id of currentServiceIds) {
    if (id === serviceId) continue;
    const service = allServices.find((s) => s.id === id);
    if (service?.dependencies.includes(serviceId)) {
      dependentServices.push(service);
    }
  }

  return {
    canRemove: true, // Can always remove, but may need to cascade
    dependentServices,
  };
}

/**
 * Get validation status for a service in context of current selection
 */
export function getServiceStatus(
  serviceId: string,
  currentServiceIds: string[],
  allServices: Service[]
): {
  isSelected: boolean;
  canAdd: boolean;
  addBlockReason?: string;
  hasConflict: boolean;
  hasMissingDeps: boolean;
} {
  const isSelected = currentServiceIds.includes(serviceId);
  const { hasConflict, conflictingServices } = checkConflicts(
    serviceId,
    currentServiceIds,
    allServices
  );
  const { satisfied, missingDependencies } = checkDependencies(
    serviceId,
    currentServiceIds,
    allServices
  );

  let canAdd = true;
  let addBlockReason: string | undefined;

  if (hasConflict) {
    // Allow adding but show invalid state - user must resolve conflict
    addBlockReason = `Conflicts with: ${conflictingServices.map((s) => s.name).join(", ")}`;
  } else if (!satisfied) {
    // Allow adding but show invalid state - user must add dependencies to resolve
    addBlockReason = `Requires: ${missingDependencies.map((s) => s.name).join(", ")}`;
  }

  // #region agent log
  if (serviceId === 'county_criminal') {
    fetch('http://127.0.0.1:7242/ingest/645ba571-33d3-4e09-8730-cae21d88d07c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'validation.ts:getServiceStatus',message:'County criminal status check',data:{serviceId,currentServiceIds,canAdd,hasConflict,hasMissingDeps:!satisfied,addBlockReason},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion

  return {
    isSelected,
    canAdd,
    addBlockReason,
    hasConflict,
    hasMissingDeps: !satisfied,
  };
}

/**
 * Convert validation errors to user-friendly messages
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map((error) => {
    switch (error.type) {
      case "missing_dependency":
        return error.message;
      case "conflict":
        return error.message;
      default:
        return error.message;
    }
  });
}
