# @repo/api

API client and React Query hooks for the background screening services API.

## Installation

This package is part of the monorepo and can be imported directly:

```tsx
import { useServices, usePackages, apiClient } from "@repo/api";
```

## Configuration

Set the API URL via environment variable:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4567
```

If not set, defaults to `http://localhost:4567`.

## Hooks

### Services

#### `useServices()`

Fetch all available screening services.

```tsx
import { useServices } from "@repo/api";

function ServiceList() {
  const { data, isLoading, error } = useServices();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data?.services.map((service) => (
        <li key={service.id}>
          {service.name} - ${service.base_price}
        </li>
      ))}
    </ul>
  );
}
```

#### `useService(id)`

Fetch a single service by ID.

```tsx
const { data: service } = useService("criminal_background");
```

#### `checkCanAddService(serviceId, currentServiceIds)`

Check if a service can be added (validates dependencies/conflicts).

```tsx
const result = await checkCanAddService("drug_test", ["criminal_background"]);
if (!result.allowed) {
  console.log(result.reason);
  console.log(result.missing_dependencies);
}
```

#### `checkCanRemoveService(serviceId, currentServiceIds)`

Check if a service can be removed (checks for dependent services).

```tsx
const result = await checkCanRemoveService("ssn_trace", selectedIds);
if (result.cascade_remove.length > 0) {
  console.log("Will also remove:", result.cascade_remove);
}
```

---

### Packages

#### `usePackages()`

Fetch all saved packages.

```tsx
import { usePackages } from "@repo/api";

function PackagesList() {
  const { data, isLoading } = usePackages();

  return (
    <div>
      {data?.packages.map((pkg) => (
        <div key={pkg.id}>
          {pkg.name} - ${pkg.pricing.total}
        </div>
      ))}
    </div>
  );
}
```

#### `usePackage(id)`

Fetch a single package with full pricing and validation details.

```tsx
const { data } = usePackage("pkg_123");
// data.package - Package metadata
// data.services - Service line items
// data.pricing - Pricing breakdown
// data.validation - Validation result
```

#### `useRecentPackage()`

Fetch the most recently saved package.

```tsx
const { data: recentPackage } = useRecentPackage();
```

#### `useCreatePackage()`

Create a new package (mutation hook).

```tsx
import { useCreatePackage } from "@repo/api";

function SaveButton({ name, serviceIds }) {
  const createPackage = useCreatePackage();

  const handleSave = async () => {
    try {
      const result = await createPackage.mutateAsync({
        name,
        service_ids: serviceIds,
      });
      console.log("Created package:", result.package.id);
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  return (
    <button onClick={handleSave} disabled={createPackage.isPending}>
      {createPackage.isPending ? "Saving..." : "Save Package"}
    </button>
  );
}
```

#### `useUpdatePackage()`

Update an existing package (mutation hook).

```tsx
const updatePackage = useUpdatePackage();

await updatePackage.mutateAsync({
  id: "pkg_123",
  data: {
    name: "Updated Name",
    service_ids: ["service_1", "service_2"],
  },
});
```

#### `useDeletePackage()`

Delete a package (mutation hook).

```tsx
const deletePackage = useDeletePackage();

await deletePackage.mutateAsync("pkg_123");
```

#### `validatePackage(serviceIds)`

Validate a package configuration without saving.

```tsx
import { validatePackage } from "@repo/api";

const result = await validatePackage(["criminal", "drug_test"]);
if (!result["valid?"]) {
  console.log("Errors:", result.errors);
  console.log("Warnings:", result.warnings);
}
```

#### `calculatePricing(serviceIds)`

Calculate pricing for a configuration without saving.

```tsx
import { calculatePricing } from "@repo/api";

const pricing = await calculatePricing(selectedServiceIds);
console.log(`Subtotal: $${pricing.pricing.subtotal}`);
console.log(`Discounts: -$${pricing.pricing.total_discount}`);
console.log(`Total: $${pricing.pricing.total}`);
```

---

## API Client

For direct API access without React Query:

```tsx
import { apiClient, ApiClient } from "@repo/api";

// Use default client
const services = await apiClient.get<ServicesResponse>("/api/services");

// Or create custom instance
const customClient = new ApiClient("https://api.example.com");
const packages = await customClient.get<PackagesListResponse>("/api/packages");
```

### Methods

```tsx
apiClient.get<T>(endpoint: string): Promise<T>
apiClient.post<T>(endpoint: string, body?: unknown): Promise<T>
apiClient.put<T>(endpoint: string, body?: unknown): Promise<T>
apiClient.delete<T>(endpoint: string): Promise<T>
```

### Error Handling

```tsx
import { ApiRequestError } from "@repo/api";

try {
  await createPackage.mutateAsync(data);
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.log(error.status); // HTTP status code
    console.log(error.data.error); // Error message
    console.log(error.data.validation); // Validation details (if any)
  }
}
```

---

## Types

All API types are exported:

```tsx
import type {
  // Services
  Service,
  ServiceCategory,
  ServicesResponse,
  
  // Packages
  Package,
  PackageWithPricing,
  PackagesListResponse,
  
  // Pricing
  PricingBreakdown,
  PricingResponse,
  ServiceLineItem,
  Discount,
  
  // Validation
  ValidationResult,
  ValidationError,
  
  // Requests
  CreatePackageRequest,
  UpdatePackageRequest,
  
  // Responses
  CanAddResponse,
  CanRemoveResponse,
} from "@repo/api";
```

---

## Query Keys

For manual cache invalidation or prefetching:

```tsx
import { serviceKeys, packageKeys } from "@repo/api";

// Invalidate all services
queryClient.invalidateQueries({ queryKey: serviceKeys.all });

// Invalidate specific package
queryClient.invalidateQueries({ queryKey: packageKeys.detail("pkg_123") });

// Prefetch packages list
queryClient.prefetchQuery({
  queryKey: packageKeys.all,
  queryFn: () => apiClient.get("/api/packages"),
});
```
