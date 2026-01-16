"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui";

export interface HeaderProps {
  children?: ReactNode;
  className?: string;
  logo?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
}

export function Header({
  children,
  className,
  logo,
  nav,
  actions,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center">
        {logo && <div className="mr-4 flex">{logo}</div>}
        {nav && <nav className="flex items-center gap-6 text-sm">{nav}</nav>}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        {children}
      </div>
    </header>
  );
}
