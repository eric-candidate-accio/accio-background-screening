import type { ReactNode } from "react";

/**
 * Slot marker components for use with useSlots
 * These components are just markers - they don't render anything themselves.
 * The PageLayout uses useSlots to extract their children and render them in the right place.
 */

export function PageHeader({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
PageHeader.displayName = "PageHeader";

export function PageSidebar({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
PageSidebar.displayName = "PageSidebar";

export function PageAlert({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
PageAlert.displayName = "PageAlert";

export function PageFooter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
PageFooter.displayName = "PageFooter";

export function PageActions({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
PageActions.displayName = "PageActions";

export function SplitLeft({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
SplitLeft.displayName = "SplitLeft";

export function SplitRight({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
SplitRight.displayName = "SplitRight";
