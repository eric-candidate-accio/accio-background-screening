"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui";
import { useSlots } from "../hooks/use-slots";
import { SplitLeft, SplitRight } from "./slots";

export interface SplitLayoutProps {
  children: ReactNode;
  className?: string;
  /** Left panel width */
  leftWidth?: string;
  /** Right panel width */
  rightWidth?: string;
  /** Gap between panels */
  gap?: "none" | "sm" | "md" | "lg";
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

/**
 * SplitLayout - Two-column layout for builder-style interfaces
 *
 * @example
 * ```tsx
 * <SplitLayout leftWidth="w-96" gap="md">
 *   <SplitLeft>
 *     <ServiceList />
 *   </SplitLeft>
 *   <SplitRight>
 *     <CurrentPackage />
 *   </SplitRight>
 * </SplitLayout>
 * ```
 */
export function SplitLayout({
  children,
  className,
  leftWidth = "w-1/3",
  rightWidth = "flex-1",
  gap = "md",
}: SplitLayoutProps) {
  const { slots } = useSlots(children, {
    Left: SplitLeft,
    Right: SplitRight,
  });

  return (
    <div className={cn("flex", gapClasses[gap], className)}>
      <div className={cn("shrink-0", leftWidth)}>{slots.Left}</div>
      <div className={cn("min-w-0", rightWidth)}>{slots.Right}</div>
    </div>
  );
}
