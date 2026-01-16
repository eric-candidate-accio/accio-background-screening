/**
 * API Types
 *
 * These types can be auto-generated from the OpenAPI spec.
 * To regenerate:
 *   1. Start the API: pnpm dev:api
 *   2. Generate types: pnpm --filter @repo/api generate-types
 *
 * The generated types will be in ./generated/api.ts
 * Once generated, you can import from there instead of using these manual types.
 */

// Re-export generated types when available
// export type { components, paths } from "./generated/api";

// ===================
// Manual Type Definitions (fallback until generated)
// ===================

// Service types
export interface Service {
  id: string;
  name: string;
  base_price: number;
  category: ServiceCategory;
  dependencies: string[];
  conflicts: string[];
}

export type ServiceCategory =
  | "criminal"
  | "verification"
  | "driving"
  | "drug_screening";

export interface ServicesResponse {
  services: Service[];
  by_category: Record<ServiceCategory, Service[]>;
}

// Package types
export interface Package {
  id: string;
  name: string;
  service_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface PackageWithPricing {
  package: Package;
  services: ServiceLineItem[];
  pricing: PricingBreakdown;
  validation: ValidationResult;
}

export interface PackagesListResponse {
  packages: (Package & { pricing: PricingBreakdown })[];
}

// Pricing types
export interface ServiceLineItem {
  id: string;
  name: string;
  price: number;
}

export interface Discount {
  type: "volume" | "bundle";
  name: string;
  amount: number;
}

export interface PricingBreakdown {
  subtotal: number;
  discounts: Discount[];
  total_discount: number;
  total: number;
  service_count: number;
}

export interface PricingResponse {
  services: ServiceLineItem[];
  pricing: PricingBreakdown;
}

// Validation types
export interface ValidationError {
  type: "missing_dependency" | "conflict";
  service_id: string;
  message: string;
  required_service_id: string;
}

export interface ValidationResult {
  "valid?": boolean;
  errors: ValidationError[];
  warnings: string[];
}

// Can-add / Can-remove responses
export interface CanAddResponse {
  allowed: boolean;
  reason?: string;
  missing_dependencies?: string[];
  conflicting_services?: string[];
}

export interface CanRemoveResponse {
  allowed: boolean;
  cascade_remove: string[];
  warning?: string;
}

// Request types
export interface CreatePackageRequest {
  name: string;
  service_ids: string[];
}

export interface UpdatePackageRequest {
  name?: string;
  service_ids?: string[];
}

export interface ValidateRequest {
  service_ids: string[];
}

export interface PriceRequest {
  service_ids: string[];
}

export interface CanAddRemoveRequest {
  current_service_ids: string[];
}

// API Error
export interface ApiError {
  error: string;
  validation?: ValidationResult;
}
