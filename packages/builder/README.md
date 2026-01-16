# @repo/builder

Interactive package builder components for creating and editing background screening packages.

## Installation

This package is part of the monorepo and can be imported directly:

```tsx
import { PackageBuilder } from "@repo/builder";
```

## Components

### PackageBuilder

The main builder component that provides a complete package creation/editing experience.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onPackageSaved` | `(packageId: string) => void` | Callback when package is saved successfully |
| `onViewPackages` | `() => void` | Callback to navigate to packages list |
| `editPackageId` | `string \| null` | Package ID to edit (for edit mode) |

#### Example

```tsx
import { PackageBuilder } from "@repo/builder";
import { useRouter } from "next/navigation";

function BuilderPage() {
  const router = useRouter();

  return (
    <PackageBuilder
      onPackageSaved={(id) => {
        console.log("Saved package:", id);
        router.push("/packages");
      }}
      onViewPackages={() => router.push("/packages")}
    />
  );
}
```

#### Edit Mode

```tsx
function EditPackagePage({ params }: { params: { id: string } }) {
  return (
    <PackageBuilder
      editPackageId={params.id}
      onPackageSaved={() => router.push("/packages")}
    />
  );
}
```

---

### Individual Components

For custom compositions, individual components are exported:

#### ServiceList

Displays available services grouped by category.

```tsx
import { ServiceList } from "@repo/builder";

<ServiceList
  services={services}
  servicesByCategory={servicesByCategory}
  selectedServiceIds={selectedIds}
  onToggleService={(serviceId) => handleToggle(serviceId)}
/>
```

#### ServiceCategory

A collapsible category section with services.

```tsx
import { ServiceCategory } from "@repo/builder";

<ServiceCategory
  category="criminal"
  services={criminalServices}
  selectedServiceIds={selectedIds}
  onToggleService={handleToggle}
/>
```

#### ServiceCard

Individual service card with selection checkbox.

```tsx
import { ServiceCard } from "@repo/builder";

<ServiceCard
  service={service}
  isSelected={selectedIds.includes(service.id)}
  onToggle={() => handleToggle(service.id)}
/>
```

#### CurrentPackage

The right panel showing selected services and package configuration.

```tsx
import { CurrentPackage } from "@repo/builder";

<CurrentPackage
  selectedServices={selectedServices}
  allServices={allServices}
  packageName={packageName}
  onPackageNameChange={setPackageName}
  onRemoveService={handleRemove}
  onSave={handleSave}
  validationErrors={errors}
  pricing={pricing}
  isSaving={isPending}
  isEditing={!!editId}
/>
```

#### SelectedService

A selected service line item with remove button.

```tsx
import { SelectedService } from "@repo/builder";

<SelectedService
  service={service}
  allServices={allServices}
  onRemove={() => handleRemove(service.id)}
/>
```

#### PricingSummary

Displays pricing breakdown with discounts.

```tsx
import { PricingSummary } from "@repo/builder";

<PricingSummary
  pricing={{
    subtotal: 100,
    discounts: [{ type: "volume", name: "Volume Discount", amount: 10 }],
    total_discount: 10,
    total: 90,
    service_count: 5,
  }}
/>
```

#### ConflictAlert

Displays validation errors/conflicts.

```tsx
import { ConflictAlert } from "@repo/builder";

<ConflictAlert
  errors={[
    {
      type: "missing_dependency",
      service_id: "criminal",
      message: "Requires SSN Trace",
      required_service_id: "ssn_trace",
    },
  ]}
/>
```

#### SavePackageForm

Package name input with save button.

```tsx
import { SavePackageForm } from "@repo/builder";

<SavePackageForm
  packageName={name}
  onPackageNameChange={setName}
  onSave={handleSave}
  canSave={selectedServices.length > 0}
  isSaving={isPending}
  isEditing={false}
/>
```

---

## Hooks

### useBuilderState

Manages local state for the package builder UI.

```tsx
import { useBuilderState } from "@repo/builder";

function CustomBuilder() {
  const builder = useBuilderState();

  return (
    <div>
      <button onClick={() => builder.addService("criminal")}>
        Add Criminal Check
      </button>
      <button onClick={() => builder.removeService("criminal")}>
        Remove
      </button>
      <input
        value={builder.packageName}
        onChange={(e) => builder.setPackageName(e.target.value)}
      />
      <p>Selected: {builder.selectedServiceIds.join(", ")}</p>
      <button onClick={builder.reset}>Clear All</button>
    </div>
  );
}
```

#### State

| Property | Type | Description |
|----------|------|-------------|
| `selectedServiceIds` | `string[]` | Currently selected service IDs |
| `packageName` | `string` | Package name for saving |
| `validationErrors` | `ValidationError[]` | Validation errors from API |
| `editingPackageId` | `string \| null` | ID of package being edited |

#### Actions

| Method | Description |
|--------|-------------|
| `addService(id)` | Add a service to selection |
| `removeService(id)` | Remove a service from selection |
| `toggleService(id)` | Toggle a service in/out of selection |
| `setSelectedServices(ids)` | Set multiple services at once |
| `setPackageName(name)` | Update the package name |
| `setValidationErrors(errors)` | Set validation errors |
| `reset()` | Clear all state |
| `loadPackage(id, name, serviceIds)` | Load a package for editing |

---

## Utilities

### Pricing

```tsx
import { calculatePricingBreakdown, formatPrice } from "@repo/builder";

const pricing = calculatePricingBreakdown(selectedServices, selectedIds);
console.log(formatPrice(pricing.total)); // "$45.00"
```

### Validation

```tsx
import { checkDependencies, findConflicts } from "@repo/builder";

// Check if adding a service requires other services
const { missingDependencies, hasAllDependencies } = checkDependencies(
  serviceId,
  currentlySelectedIds,
  allServices
);

// Find conflicts with current selection
const conflicts = findConflicts(serviceId, currentlySelectedIds, allServices);
```

---

## Full Custom Example

```tsx
import {
  ServiceList,
  CurrentPackage,
  useBuilderState,
  calculatePricingBreakdown,
} from "@repo/builder";
import { useServices, useCreatePackage } from "@repo/api";
import { SplitLayout, SplitLeft, SplitRight } from "@repo/layout";

function CustomPackageBuilder() {
  const { data } = useServices();
  const createPackage = useCreatePackage();
  const builder = useBuilderState();

  const selectedServices = useMemo(() => {
    return builder.selectedServiceIds
      .map((id) => data?.services.find((s) => s.id === id))
      .filter(Boolean);
  }, [builder.selectedServiceIds, data?.services]);

  const pricing = calculatePricingBreakdown(
    selectedServices,
    builder.selectedServiceIds
  );

  return (
    <SplitLayout leftWidth="w-1/2" rightWidth="w-1/2">
      <SplitLeft>
        <ServiceList
          services={data?.services || []}
          servicesByCategory={data?.by_category || {}}
          selectedServiceIds={builder.selectedServiceIds}
          onToggleService={builder.toggleService}
        />
      </SplitLeft>
      <SplitRight>
        <CurrentPackage
          selectedServices={selectedServices}
          allServices={data?.services || []}
          packageName={builder.packageName}
          onPackageNameChange={builder.setPackageName}
          onRemoveService={builder.removeService}
          onSave={() => createPackage.mutate({
            name: builder.packageName,
            service_ids: builder.selectedServiceIds,
          })}
          validationErrors={builder.validationErrors}
          pricing={pricing}
          isSaving={createPackage.isPending}
          isEditing={false}
        />
      </SplitRight>
    </SplitLayout>
  );
}
```
