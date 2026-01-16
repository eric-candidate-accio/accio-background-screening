"use client";

import type { ValidationError } from "@repo/api";
import { useCallback, useMemo, useState } from "react";

export interface BuilderState {
  /** Currently selected service IDs */
  selectedServiceIds: string[];
  /** Package name for saving */
  packageName: string;
  /** Validation errors from API */
  validationErrors: ValidationError[];
  /** Whether the builder is in edit mode (editing existing package) */
  editingPackageId: string | null;
}

export interface BuilderActions {
  /** Add a service to the selection */
  addService: (serviceId: string) => void;
  /** Remove a service from the selection */
  removeService: (serviceId: string) => void;
  /** Toggle a service in/out of selection */
  toggleService: (serviceId: string) => void;
  /** Set multiple services at once */
  setSelectedServices: (serviceIds: string[]) => void;
  /** Update the package name */
  setPackageName: (name: string) => void;
  /** Set validation errors */
  setValidationErrors: (errors: ValidationError[]) => void;
  /** Clear the builder state */
  reset: () => void;
  /** Load package for editing */
  loadPackage: (id: string, name: string, serviceIds: string[]) => void;
}

const initialState: BuilderState = {
  selectedServiceIds: [],
  packageName: "",
  validationErrors: [],
  editingPackageId: null,
};

/**
 * useBuilderState - Manages local state for the package builder
 *
 * This hook separates local UI state from server state (managed by React Query).
 * The builder uses this for immediate UI feedback while API calls are in progress.
 */
export function useBuilderState(): BuilderState & BuilderActions {
  const [state, setState] = useState<BuilderState>(initialState);

  const addService = useCallback((serviceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(serviceId)
        ? prev.selectedServiceIds
        : [...prev.selectedServiceIds, serviceId],
    }));
  }, []);

  const removeService = useCallback((serviceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.filter(
        (id) => id !== serviceId
      ),
    }));
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(serviceId)
        ? prev.selectedServiceIds.filter((id) => id !== serviceId)
        : [...prev.selectedServiceIds, serviceId],
    }));
  }, []);

  const setSelectedServices = useCallback((serviceIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedServiceIds: serviceIds,
    }));
  }, []);

  const setPackageName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      packageName: name,
    }));
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[]) => {
    setState((prev) => ({
      ...prev,
      validationErrors: errors,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const loadPackage = useCallback(
    (id: string, name: string, serviceIds: string[]) => {
      setState({
        selectedServiceIds: serviceIds,
        packageName: name,
        validationErrors: [],
        editingPackageId: id,
      });
    },
    []
  );

  return useMemo(
    () => ({
      ...state,
      addService,
      removeService,
      toggleService,
      setSelectedServices,
      setPackageName,
      setValidationErrors,
      reset,
      loadPackage,
    }),
    [
      state,
      addService,
      removeService,
      toggleService,
      setSelectedServices,
      setPackageName,
      setValidationErrors,
      reset,
      loadPackage,
    ]
  );
}
