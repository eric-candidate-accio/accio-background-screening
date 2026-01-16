# @repo/ui

Shared UI component library built on Radix UI primitives with Tailwind CSS styling.

## Installation

This package is part of the monorepo and can be imported directly:

```tsx
import { Button, Card, Badge } from "@repo/ui";
```

## Setup

Import the global styles in your app's root layout:

```tsx
import "@repo/ui/styles/globals.css";
```

## Components

### Button

A versatile button component with multiple variants and sizes.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Visual style |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `asChild` | `boolean` | `false` | Render as child element |

#### Examples

```tsx
import { Button } from "@repo/ui";

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icons
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader className="mr-2 h-4 w-4 animate-spin" />
  Saving...
</Button>

// As link
<Button asChild>
  <a href="/settings">Settings</a>
</Button>
```

---

### Card

Container component for grouped content.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui";

<Card>
  <CardHeader>
    <CardTitle>Package Name</CardTitle>
    <CardDescription>5 services selected</CardDescription>
  </CardHeader>
  <CardContent>
    <ul>
      <li>Criminal Background Check</li>
      <li>Drug Screening</li>
    </ul>
  </CardContent>
  <CardFooter>
    <Button>Save Package</Button>
  </CardFooter>
</Card>
```

---

### Badge

Small status or category indicators.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | Visual style |

```tsx
import { Badge } from "@repo/ui";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Category badges
<Badge variant="secondary">Criminal</Badge>
<Badge variant="secondary">Verification</Badge>
```

---

### Alert

Displays important messages or notifications.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@repo/ui";

// Default alert
<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

// Destructive alert
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>

// With icon
<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This action cannot be undone.</AlertDescription>
</Alert>
```

---

### Input

Text input field.

```tsx
import { Input } from "@repo/ui";

<Input type="text" placeholder="Package name" />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled" />
```

---

### Label

Accessible form labels.

```tsx
import { Label } from "@repo/ui";
import { Input } from "@repo/ui";

<div className="space-y-2">
  <Label htmlFor="name">Package Name</Label>
  <Input id="name" placeholder="Enter package name" />
</div>
```

---

### Checkbox

Checkbox input with optional label.

```tsx
import { Checkbox } from "@repo/ui";
import { Label } from "@repo/ui";

// Basic
<Checkbox id="terms" />

// With label
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>

// Controlled
<Checkbox
  checked={isChecked}
  onCheckedChange={(checked) => setIsChecked(checked)}
/>
```

---

### Tabs

Tabbed navigation component.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="services">Services</TabsTrigger>
    <TabsTrigger value="pricing">Pricing</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Overview content here...
  </TabsContent>
  <TabsContent value="services">
    Services content here...
  </TabsContent>
  <TabsContent value="pricing">
    Pricing content here...
  </TabsContent>
</Tabs>
```

---

### Separator

Visual divider between content.

```tsx
import { Separator } from "@repo/ui";

<div>
  <h2>Section 1</h2>
  <Separator className="my-4" />
  <h2>Section 2</h2>
</div>

// Vertical separator
<div className="flex h-5 items-center space-x-4">
  <span>Item 1</span>
  <Separator orientation="vertical" />
  <span>Item 2</span>
</div>
```

---

### ScrollArea

Custom scrollable container.

```tsx
import { ScrollArea } from "@repo/ui";

<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">
    {items.map((item) => (
      <div key={item.id} className="py-2">
        {item.name}
      </div>
    ))}
  </div>
</ScrollArea>
```

---

### Skeleton

Loading placeholder.

```tsx
import { Skeleton } from "@repo/ui";

// Basic shapes
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />

// Card skeleton
<div className="space-y-3">
  <Skeleton className="h-[125px] w-full rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
</div>

// Avatar skeleton
<Skeleton className="h-12 w-12 rounded-full" />
```

---

## Utilities

### cn()

Utility function for merging class names with Tailwind CSS.

```tsx
import { cn } from "@repo/ui";

// Merge classes
<div className={cn("text-base", isLarge && "text-lg")} />

// Conditional classes
<Button className={cn(
  "transition-colors",
  isActive ? "bg-primary" : "bg-secondary"
)} />

// Override classes
<Card className={cn("p-4", className)} />
```

---

## Styling

All components use Tailwind CSS and support className overrides:

```tsx
<Button className="w-full">Full Width</Button>
<Card className="shadow-lg">Elevated Card</Card>
<Badge className="uppercase">Custom</Badge>
```

### CSS Variables

The global styles define CSS variables for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

---

## API Reference

### Exports

```tsx
// Utility
export { cn } from "./lib/utils";

// Components
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./components/card";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
export { Alert, AlertTitle, AlertDescription } from "./components/alert";
export { Input } from "./components/input";
export { Label } from "./components/label";
export { Separator } from "./components/separator";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export { ScrollArea } from "./components/scroll-area";
export { Skeleton } from "./components/skeleton";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";
```
