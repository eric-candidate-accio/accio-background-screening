import type { ReactNode } from "react";

export interface SlotDefinition {
  name: string;
  required?: boolean;
}

export interface SlotProps {
  children: ReactNode;
}

export type SlotMap<T extends string> = Partial<Record<T, ReactNode>>;
