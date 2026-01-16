"use client";

import { Children, isValidElement, type ReactNode, type ReactElement } from "react";

type SlotComponentType = React.ComponentType<{ children?: ReactNode }>;

/**
 * useSlots - Extract named slots from children for composable layouts
 *
 * @example
 * ```tsx
 * function MyLayout({ children }: { children: ReactNode }) {
 *   const { slots, rest } = useSlots(children, {
 *     Header: PageHeader,
 *     Sidebar: PageSidebar,
 *     Alert: PageAlert,
 *   });
 *
 *   return (
 *     <div>
 *       {slots.Header}
 *       {slots.Alert}
 *       <div className="flex">
 *         {slots.Sidebar}
 *         <main>{rest}</main>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSlots<T extends Record<string, SlotComponentType>>(
  children: ReactNode,
  slotComponents: T
): {
  slots: { [K in keyof T]: ReactNode };
  rest: ReactNode[];
} {
  const slots: Record<string, ReactNode> = {};
  const rest: ReactNode[] = [];

  // Create a map of component types to slot names
  const componentToSlotName = new Map<SlotComponentType, string>();
  for (const [name, component] of Object.entries(slotComponents)) {
    componentToSlotName.set(component, name);
  }

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child !== null && child !== undefined) {
        rest.push(child);
      }
      return;
    }

    const element = child as ReactElement<{ children?: ReactNode }>;
    const slotName = componentToSlotName.get(element.type as SlotComponentType);

    if (slotName) {
      // It's a slot component - extract its children
      slots[slotName] = element.props.children;
    } else {
      rest.push(child);
    }
  });

  return {
    slots: slots as { [K in keyof T]: ReactNode },
    rest,
  };
}
