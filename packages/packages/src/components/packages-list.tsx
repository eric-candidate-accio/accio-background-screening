"use client";

import {
  useDeletePackage,
  usePackages,
  useServices,
  type Package,
  type PricingBreakdown,
} from "@repo/api";
import { PageHeader, PageLayout } from "@repo/layout";
import { Badge, Button, Card, CardContent, Input, Skeleton } from "@repo/ui";
import {
  ArrowUpDown,
  Package as PackageIcon,
  Plus,
  Search,
} from "lucide-react";
import { useCallback } from "react";
import { usePackageList, type SortField } from "../hooks/use-package-list";
import { PackageCard } from "./package-card";

export interface PackagesListProps {
  /** Callback when "New Package" is clicked */
  onCreateNew?: () => void;
  /** Callback when editing a package */
  onEdit?: (id: string) => void;
}

export function PackagesList({ onCreateNew, onEdit }: PackagesListProps) {
  const { data: packagesData, isLoading: packagesLoading } = usePackages();
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const deletePackage = useDeletePackage();

  const packages = (packagesData?.packages || []) as (Package & {
    pricing: PricingBreakdown;
  })[];

  const {
    searchQuery,
    sortField,
    setSearchQuery,
    setSortField,
    filteredPackages,
    totalCount,
  } = usePackageList({ packages });

  const handleDelete = useCallback(
    (id: string) => {
      deletePackage.mutate(id);
    },
    [deletePackage]
  );

  const handleEdit = useCallback(
    (id: string) => {
      onEdit?.(id);
    },
    [onEdit]
  );

  const isLoading = packagesLoading || servicesLoading;

  if (isLoading) {
    return (
      <PageLayout fluid>
        <PageHeader>
          <div className="flex items-center gap-4 w-full">
            <h1 className="text-xl font-semibold">Saved Packages</h1>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout fluid>
      <PageHeader>
        <div className="flex items-center gap-4 w-full">
          <h1 className="text-xl font-semibold">Saved Packages</h1>
          <Badge
            variant="secondary"
            className="ml-2 bg-white/20 text-white border-0"
          >
            {totalCount} {totalCount === 1 ? "package" : "packages"}
          </Badge>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-white/10 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            {/* Sort */}
            <Button
              variant="outline"
              size="sm"
              className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              onClick={() => {
                const fields: SortField[] = [
                  "updated_at",
                  "name",
                  "total",
                  "created_at",
                ];
                const currentIndex = fields.indexOf(sortField);
                const nextField = fields[(currentIndex + 1) % fields.length];
                setSortField(nextField);
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortField === "updated_at"
                ? "Recent"
                : sortField === "name"
                  ? "Name"
                  : sortField === "total"
                    ? "Price"
                    : "Created"}
            </Button>

            {/* New Package */}
            {onCreateNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNew}
                className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Package
              </Button>
            )}
          </div>
        </div>
      </PageHeader>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <PackageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first screening package to get started.
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              No packages match "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              services={servicesData?.services}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletePackage.isPending}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
