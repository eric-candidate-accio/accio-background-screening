"use client";

import type { Package, PricingBreakdown } from "@repo/api";
import { useMemo, useState } from "react";

export type SortField = "name" | "created_at" | "updated_at" | "total";
export type SortDirection = "asc" | "desc";

export interface UsePackageListOptions {
  packages: (Package & { pricing: PricingBreakdown })[];
}

export interface PackageListState {
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

export interface PackageListActions {
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;
  setSort: (field: SortField, direction: SortDirection) => void;
}

export function usePackageList({ packages }: UsePackageListOptions) {
  const [state, setState] = useState<PackageListState>({
    searchQuery: "",
    sortField: "updated_at",
    sortDirection: "desc",
  });

  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter((pkg) => pkg.name.toLowerCase().includes(query));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (state.sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "updated_at":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "total":
          comparison = a.pricing.total - b.pricing.total;
          break;
      }

      return state.sortDirection === "desc" ? -comparison : comparison;
    });

    return result;
  }, [packages, state.searchQuery, state.sortField, state.sortDirection]);

  const actions: PackageListActions = {
    setSearchQuery: (query) =>
      setState((prev) => ({ ...prev, searchQuery: query })),
    setSortField: (field) =>
      setState((prev) => ({
        ...prev,
        sortField: field,
        sortDirection: prev.sortField === field ? prev.sortDirection : "asc",
      })),
    toggleSortDirection: () =>
      setState((prev) => ({
        ...prev,
        sortDirection: prev.sortDirection === "asc" ? "desc" : "asc",
      })),
    setSort: (field, direction) =>
      setState((prev) => ({
        ...prev,
        sortField: field,
        sortDirection: direction,
      })),
  };

  return {
    ...state,
    ...actions,
    filteredPackages,
    totalCount: packages.length,
    filteredCount: filteredPackages.length,
  };
}
