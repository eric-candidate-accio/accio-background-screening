import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type {
  CreatePackageRequest,
  PackageWithPricing,
  PackagesListResponse,
  PricingResponse,
  UpdatePackageRequest,
  ValidationResult,
} from "../types";

// Query keys
export const packageKeys = {
  all: ["packages"] as const,
  detail: (id: string) => ["packages", id] as const,
  recent: ["packages", "recent"] as const,
};

/**
 * Fetch all saved packages
 */
export function usePackages() {
  return useQuery({
    queryKey: packageKeys.all,
    queryFn: () => apiClient.get<PackagesListResponse>("/api/packages"),
  });
}

/**
 * Fetch a single package by ID
 */
export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: packageKeys.detail(id || ""),
    queryFn: () => apiClient.get<PackageWithPricing>(`/api/packages/${id}`),
    enabled: !!id,
  });
}

/**
 * Fetch the most recently saved package
 */
export function useRecentPackage() {
  return useQuery({
    queryKey: packageKeys.recent,
    queryFn: () => apiClient.get<PackageWithPricing>("/api/packages/recent"),
    retry: false, // Don't retry if no packages exist
  });
}

/**
 * Create a new package
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageRequest) =>
      apiClient.post<PackageWithPricing>("/api/packages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: packageKeys.recent });
    },
  });
}

/**
 * Update an existing package
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageRequest }) =>
      apiClient.put<PackageWithPricing>(`/api/packages/${id}`, data),
    onSuccess: (
      _data: PackageWithPricing,
      variables: { id: string; data: UpdatePackageRequest }
    ) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({
        queryKey: packageKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: packageKeys.recent });
    },
  });
}

/**
 * Delete a package
 */
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: packageKeys.recent });
    },
  });
}

/**
 * Validate a package configuration (without saving)
 */
export async function validatePackage(
  serviceIds: string[]
): Promise<ValidationResult> {
  return apiClient.post<ValidationResult>("/api/packages/validate", {
    service_ids: serviceIds,
  });
}

/**
 * Calculate pricing for a package configuration (without saving)
 */
export async function calculatePricing(
  serviceIds: string[]
): Promise<PricingResponse> {
  return apiClient.post<PricingResponse>("/api/packages/price", {
    service_ids: serviceIds,
  });
}
