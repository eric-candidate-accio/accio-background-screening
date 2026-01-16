import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Service, ServicesResponse, CanAddResponse, CanRemoveResponse } from "../types";

// Query keys
export const serviceKeys = {
  all: ["services"] as const,
  detail: (id: string) => ["services", id] as const,
};

/**
 * Fetch all available screening services
 */
export function useServices() {
  return useQuery({
    queryKey: serviceKeys.all,
    queryFn: () => apiClient.get<ServicesResponse>("/api/services"),
  });
}

/**
 * Fetch a single service by ID
 */
export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => apiClient.get<Service>(`/api/services/${id}`),
    enabled: !!id,
  });
}

/**
 * Check if a service can be added to the current package
 */
export async function checkCanAddService(
  serviceId: string,
  currentServiceIds: string[]
): Promise<CanAddResponse> {
  return apiClient.post<CanAddResponse>(`/api/services/${serviceId}/can-add`, {
    current_service_ids: currentServiceIds,
  });
}

/**
 * Check if a service can be removed from the current package
 */
export async function checkCanRemoveService(
  serviceId: string,
  currentServiceIds: string[]
): Promise<CanRemoveResponse> {
  return apiClient.post<CanRemoveResponse>(`/api/services/${serviceId}/can-remove`, {
    current_service_ids: currentServiceIds,
  });
}
