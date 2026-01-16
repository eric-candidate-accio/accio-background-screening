# @repo/packages

Components for displaying and managing saved screening packages.

## Installation

This package is part of the monorepo and can be imported directly:

```tsx
import { PackagesList } from "@repo/packages";
```

## Components

### PackagesList

The main component for displaying a list of saved packages with sorting, actions, and empty states.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onEditPackage` | `(packageId: string) => void` | Callback when edit is clicked |
| `onCreatePackage` | `() => void` | Callback when create new is clicked |

#### Example

```tsx
import { PackagesList } from "@repo/packages";
import { useRouter } from "next/navigation";

function PackagesPage() {
  const router = useRouter();

  return (
    <PackagesList
      onEditPackage={(id) => router.push(`/packages/${id}/edit`)}
      onCreatePackage={() => router.push("/")}
    />
  );
}
```

---

### Individual Components

For custom layouts, individual components are exported:

#### PackageCard

A card displaying a single package with its services and pricing.

```tsx
import { PackageCard } from "@repo/packages";

<PackageCard
  package={pkg}
  onEdit={() => handleEdit(pkg.id)}
  onDelete={() => handleDelete(pkg.id)}
/>
```

#### PackageActions

Action buttons (edit, delete) for a package.

```tsx
import { PackageActions } from "@repo/packages";

<PackageActions
  packageId={pkg.id}
  onEdit={() => handleEdit(pkg.id)}
  onDelete={() => handleDelete(pkg.id)}
  isDeleting={deleteMutation.isPending}
/>
```

#### PackageSummary

Summary display showing service count and total price.

```tsx
import { PackageSummary } from "@repo/packages";

<PackageSummary
  serviceCount={5}
  total={89.99}
  createdAt="2024-01-15T10:30:00Z"
/>
```

---

## Hooks

### usePackageList

Manages list state including sorting and filtering.

```tsx
import { usePackageList } from "@repo/packages";

function CustomPackagesList() {
  const {
    packages,
    isLoading,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    toggleSort,
  } = usePackageList();

  return (
    <div>
      <div>
        <button onClick={() => toggleSort("name")}>
          Sort by Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => toggleSort("created_at")}>
          Sort by Date {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => toggleSort("total")}>
          Sort by Price {sortField === "total" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
      </div>

      {packages.map((pkg) => (
        <PackageCard key={pkg.id} package={pkg} />
      ))}
    </div>
  );
}
```

#### State

| Property | Type | Description |
|----------|------|-------------|
| `packages` | `Package[]` | Sorted list of packages |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `sortField` | `SortField` | Current sort field |
| `sortDirection` | `SortDirection` | Current sort direction |

#### Actions

| Method | Description |
|--------|-------------|
| `setSortField(field)` | Set the sort field |
| `setSortDirection(dir)` | Set the sort direction |
| `toggleSort(field)` | Toggle sort for a field (changes direction or switches field) |
| `refetch()` | Refetch packages from API |

#### Types

```tsx
type SortField = "name" | "created_at" | "total" | "service_count";
type SortDirection = "asc" | "desc";
```

---

## Full Example

```tsx
import { PackagesList, PackageCard, usePackageList } from "@repo/packages";
import { useDeletePackage } from "@repo/api";
import { PageLayout, PageHeader } from "@repo/layout";
import { Button } from "@repo/ui";

function PackagesPage() {
  const { packages, isLoading, toggleSort, sortField, sortDirection } = usePackageList();
  const deletePackage = useDeletePackage();

  return (
    <PageLayout>
      <PageHeader>
        <h1> Saved Packages</h1>
        <Button onClick={() => router.push("/")}>Create New</Button>
      </PageHeader>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={sortField === "name" ? "default" : "outline"}
            onClick={() => toggleSort("name")}
          >
            Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
          </Button>
          <Button 
            variant={sortField === "total" ? "default" : "outline"}
            onClick={() => toggleSort("total")}
          >
            Price {sortField === "total" && (sortDirection === "asc" ? "↑" : "↓")}
          </Button>
        </div>

        {isLoading ? (
          <Loading />
        ) : packages.length === 0 ? (
          <EmptyState />
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={() => router.push(`/packages/${pkg.id}/edit`)}
              onDelete={() => deletePackage.mutate(pkg.id)}
            />
          ))
        )}
      </div>
    </PageLayout>
  );
}
```
