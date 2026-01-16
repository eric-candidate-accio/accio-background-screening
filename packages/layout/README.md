# @repo/layout

A composable layout system using slot-based patterns for building consistent page structures.

## Installation

This package is part of the monorepo and can be imported directly:

```tsx
import { PageLayout, PageHeader, SplitLayout, SplitLeft, SplitRight } from "@repo/layout";
```

## Concepts

### Slot-Based Composition

This package uses a slot-based pattern where layout components accept children that are "slot markers." These markers tell the layout where to render specific content. This approach provides:

- Clear, declarative structure
- Flexible content placement
- Type-safe slot definitions
- Easy-to-read JSX

## Components

### PageLayout

A full-page layout with support for header, sidebar, alerts, actions, and footer slots.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Slot components and main content |
| `className` | `string` | - | Additional CSS classes |
| `fluid` | `boolean` | `false` | Full width layout without container constraints |
| `sidebarPosition` | `"left" \| "right"` | `"left"` | Position of the sidebar |

#### Available Slots

- `PageHeader` - Sticky header at the top
- `PageSidebar` - Side navigation or content panel
- `PageAlert` - Full-width alert banner below header
- `PageActions` - Sticky bottom action bar
- `PageFooter` - Footer section

#### Example

```tsx
import { PageLayout, PageHeader, PageSidebar, PageAlert } from "@repo/layout";

function MyPage() {
  return (
    <PageLayout fluid sidebarPosition="left">
      <PageHeader>
        <h1>My Application</h1>
        <nav>{/* Navigation items */}</nav>
      </PageHeader>

      <PageAlert>
        <Alert variant="warning">System maintenance scheduled</Alert>
      </PageAlert>

      <PageSidebar>
        <Navigation items={navItems} />
      </PageSidebar>

      {/* Main content (non-slot children) */}
      <MainContent />
    </PageLayout>
  );
}
```

---

### SplitLayout

A two-column layout for builder-style interfaces, dashboards, or any side-by-side content.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | `SplitLeft` and `SplitRight` slot components |
| `className` | `string` | - | Additional CSS classes |
| `leftWidth` | `string` | `"w-1/3"` | Tailwind width class for left panel |
| `rightWidth` | `string` | `"flex-1"` | Tailwind width class for right panel |
| `gap` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Gap between panels |

#### Available Slots

- `SplitLeft` - Left panel content
- `SplitRight` - Right panel content

#### Example

```tsx
import { SplitLayout, SplitLeft, SplitRight } from "@repo/layout";

function BuilderPage() {
  return (
    <SplitLayout leftWidth="w-2/5" rightWidth="w-3/5" gap="lg">
      <SplitLeft>
        <ServiceList
          services={services}
          onSelect={handleSelect}
        />
      </SplitLeft>
      <SplitRight>
        <CurrentPackage
          selectedServices={selected}
          onSave={handleSave}
        />
      </SplitRight>
    </SplitLayout>
  );
}
```

---

### Header

A standalone header component with slots for logo, navigation, and actions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Additional content |
| `className` | `string` | - | Additional CSS classes |
| `logo` | `ReactNode` | - | Logo/brand element |
| `nav` | `ReactNode` | - | Navigation items |
| `actions` | `ReactNode` | - | Action buttons (right-aligned) |

#### Example

```tsx
import { Header } from "@repo/layout";

function AppHeader() {
  return (
    <Header
      logo={<Logo />}
      nav={
        <>
          <a href="/dashboard">Dashboard</a>
          <a href="/settings">Settings</a>
        </>
      }
      actions={
        <Button onClick={handleLogout}>Logout</Button>
      }
    />
  );
}
```

---

## Combining Layouts

Layouts can be nested for complex page structures:

```tsx
import {
  PageLayout,
  PageHeader,
  PageAlert,
  SplitLayout,
  SplitLeft,
  SplitRight,
} from "@repo/layout";

function PackageBuilder() {
  return (
    <PageLayout fluid>
      <PageHeader>
        <h1>Package Builder</h1>
        <Button>View Packages</Button>
      </PageHeader>

      <PageAlert>
        <ConflictAlert errors={errors} />
      </PageAlert>

      <SplitLayout leftWidth="w-2/5" rightWidth="w-3/5" gap="lg">
        <SplitLeft>
          <ServiceList services={services} />
        </SplitLeft>
        <SplitRight>
          <CurrentPackage selected={selected} />
        </SplitRight>
      </SplitLayout>
    </PageLayout>
  );
}
```

---

## Custom Slots with useSlots

Create your own slot-based layouts using the `useSlots` hook:

```tsx
import { useSlots } from "@repo/layout";
import type { ReactNode } from "react";

// 1. Define slot marker components
function CardHeader({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
CardHeader.displayName = "CardHeader";

function CardFooter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
CardFooter.displayName = "CardFooter";

// 2. Create the layout component
function Card({ children }: { children: ReactNode }) {
  const { slots, rest } = useSlots(children, {
    Header: CardHeader,
    Footer: CardFooter,
  });

  return (
    <div className="rounded-lg border">
      {slots.Header && (
        <div className="border-b p-4 font-semibold">
          {slots.Header}
        </div>
      )}
      <div className="p-4">{rest}</div>
      {slots.Footer && (
        <div className="border-t p-4 bg-muted">
          {slots.Footer}
        </div>
      )}
    </div>
  );
}

// 3. Use it
function Example() {
  return (
    <Card>
      <CardHeader>My Card Title</CardHeader>
      <p>This is the main content</p>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## API Reference

### Exports

```tsx
// Layout components
export { PageLayout } from "./components/page-layout";
export { SplitLayout } from "./components/split-layout";
export { Header } from "./components/header";

// Slot markers
export { PageHeader, PageSidebar, PageAlert, PageFooter, PageActions } from "./components/slots";
export { SplitLeft, SplitRight } from "./components/slots";

// Hooks
export { useSlots } from "./hooks/use-slots";

// Types
export type { PageLayoutProps } from "./components/page-layout";
export type { SplitLayoutProps } from "./components/split-layout";
export type { HeaderProps } from "./components/header";
export type { SlotDefinition, SlotProps, SlotMap } from "./types";
```
