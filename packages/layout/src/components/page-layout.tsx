"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui";
import { useSlots } from "../hooks/use-slots";
import {
  PageHeader,
  PageSidebar,
  PageAlert,
  PageFooter,
  PageActions,
} from "./slots";

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Full width layout without container constraints */
  fluid?: boolean;
  /** Sidebar position */
  sidebarPosition?: "left" | "right";
}

/**
 * PageLayout - Composable page layout using slots
 *
 * @example
 * ```tsx
 * <PageLayout>
 *   <PageAlert>
 *     <Alert variant="warning">Something needs attention</Alert>
 *   </PageAlert>
 *
 *   <PageSidebar>
 *     <ServiceList services={services} />
 *   </PageSidebar>
 *
 *   <CurrentPackage selectedServices={selected} />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  className,
  fluid = false,
  sidebarPosition = "left",
}: PageLayoutProps) {
  const { slots, rest } = useSlots(children, {
    Header: PageHeader,
    Sidebar: PageSidebar,
    Alert: PageAlert,
    Footer: PageFooter,
    Actions: PageActions,
  });

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Header slot */}
      {slots.Header && (
        <header className="sticky top-0 z-50 w-full bg-[#1e3a5f] text-white">
          <div className={cn("flex h-14 items-center", fluid ? "px-6" : "container")}>
            {slots.Header}
          </div>
        </header>
      )}

      {/* Alert slot - full width banner */}
      {slots.Alert && (
        <div className={cn(fluid ? "px-6" : "container", "py-4")}>
          {slots.Alert}
        </div>
      )}

      {/* Main content area with optional sidebar */}
      <div className={cn("flex-1 flex", fluid ? "px-6" : "container", "py-6")}>
        {slots.Sidebar && sidebarPosition === "left" && (
          <aside className="w-80 shrink-0 pr-6">
            {slots.Sidebar}
          </aside>
        )}

        <main className="flex-1 min-w-0">
          {rest}
        </main>

        {slots.Sidebar && sidebarPosition === "right" && (
          <aside className="w-80 shrink-0 pl-6">
            {slots.Sidebar}
          </aside>
        )}
      </div>

      {/* Actions slot - sticky bottom bar */}
      {slots.Actions && (
        <div className="sticky bottom-0 border-t border-border bg-background">
          <div className={cn(fluid ? "px-6" : "container", "py-4")}>
            {slots.Actions}
          </div>
        </div>
      )}

      {/* Footer slot */}
      {slots.Footer && (
        <footer className="border-t border-border">
          <div className={cn(fluid ? "px-6" : "container", "py-6")}>
            {slots.Footer}
          </div>
        </footer>
      )}
    </div>
  );
}
