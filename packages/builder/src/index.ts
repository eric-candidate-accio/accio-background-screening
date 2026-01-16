// Main builder component
export { PackageBuilder, type PackageBuilderProps } from "./components/package-builder";

// Individual components (for custom compositions)
export { ServiceList, type ServiceListProps } from "./components/service-list";
export { ServiceCategory, type ServiceCategoryProps } from "./components/service-category";
export { ServiceCard, type ServiceCardProps } from "./components/service-card";
export { CurrentPackage, type CurrentPackageProps } from "./components/current-package";
export { SelectedService, type SelectedServiceProps } from "./components/selected-service";
export { PricingSummary, type PricingSummaryProps } from "./components/pricing-summary";
export { ConflictAlert, type ConflictAlertProps } from "./components/conflict-alert";
export { SavePackageForm, type SavePackageFormProps } from "./components/save-package-form";

// Hooks
export { useBuilderState, type BuilderState, type BuilderActions } from "./hooks/use-builder-state";

// Utilities
export * from "./lib/pricing";
export * from "./lib/validation";
