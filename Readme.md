# Background Screening Package Builder

A monorepo containing a Next.js web application and a Ruby Sinatra API for building custom background screening packages.

## Prerequisites

- **Node.js** >= 18
- **pnpm** 8.15.6+ (`corepack enable && corepack prepare pnpm@8.15.6 --activate`)
- **Ruby** >= 2.7.8 (recommended: 3.2+ via [rbenv](https://github.com/rbenv/rbenv))
- **Bundler** (`gem install bundler`)

## Project Structure

```
├── apps/
│   ├── api/                    # Ruby Sinatra API (port 4567)
│   │   ├── domain/             # Domain layer (entities, services, repositories)
│   │   ├── infrastructure/     # Infrastructure layer (JSON repositories)
│   │   ├── config/             # Static configuration (services.json)
│   │   ├── data/               # Persistent data (packages.json)
│   │   └── myapp.rb            # Main Sinatra application
│   └── web/                    # Next.js web app (port 3000)
│       └── src/app/            # Next.js App Router pages
├── packages/
│   ├── api/                    # @repo/api - API client & React Query hooks
│   ├── ui/                     # @repo/ui - Design system primitives
│   ├── layout/                 # @repo/layout - Layout system & useSlots
│   ├── builder/                # @repo/builder - Package Builder feature
│   ├── packages/               # @repo/packages - Saved Packages feature
│   └── e2e/                    # @repo/e2e - Playwright E2E tests
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package.json
```

## Setup

```bash
# Install Node dependencies
pnpm install

# Install Ruby gems for the API
pnpm setup
```

## Development

```bash
# Run both apps in parallel (includes type generation)
pnpm dev

# Or run individually
pnpm dev:web   # Next.js on http://localhost:3000
pnpm dev:api   # Sinatra on http://localhost:4567
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in development mode |
| `pnpm dev:web` | Run only the Next.js web app |
| `pnpm dev:api` | Run only the Sinatra API |
| `pnpm build` | Build all apps |
| `pnpm setup` | Install Ruby gems for the API |
| `pnpm lint` | Run linters across all apps |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm clean` | Clean build artifacts |

---

## Package Architecture

The monorepo follows a layered package architecture with clear boundaries:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  APPS                                        │
│  ┌────────────────────────────────────────┐  ┌───────────────────────────┐  │
│  │              apps/web                  │  │        apps/api           │  │
│  │  • Next.js pages & routing             │  │  • Ruby Sinatra           │  │
│  │  • Composes features from packages     │  │  • Domain-driven design   │  │
│  └────────────────┬───────────────────────┘  └───────────────────────────┘  │
│                   │ imports                                                  │
├───────────────────┼─────────────────────────────────────────────────────────┤
│                   ▼          FEATURE PACKAGES                                │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │     @repo/builder           │  │         @repo/packages              │   │
│  │  • ServiceList              │  │  • PackagesList                     │   │
│  │  • ServiceCard              │  │  • PackageCard                      │   │
│  │  • CurrentPackage           │  │  • PackageActions                   │   │
│  │  • PricingSummary           │  │  • Uses: @repo/ui, @repo/layout     │   │
│  │  • Uses: @repo/ui, layout   │  │                                     │   │
│  └──────────────┬──────────────┘  └──────────────┬──────────────────────┘   │
│                 │                                 │                          │
├─────────────────┼─────────────────────────────────┼─────────────────────────┤
│                 ▼           FOUNDATION PACKAGES   ▼                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │       @repo/layout          │  │           @repo/ui                  │   │
│  │  • PageLayout               │  │  • Button, Card, Badge              │   │
│  │  • Header                   │  │  • Alert, Input, Separator          │   │
│  │  • useSlots hook            │  │  • shadcn/ui-style primitives       │   │
│  │  • Slot components          │  │  • cn() utility                     │   │
│  │  • Uses: @repo/ui           │  │  • CSS variables                    │   │
│  └──────────────┬──────────────┘  └─────────────────────────────────────┘   │
│                 │                                 ▲                          │
│                 └─────────────────────────────────┘                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          @repo/api                                   │    │
│  │  • API client • React Query hooks • Generated OpenAPI types          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Package Descriptions

#### `@repo/ui` - Design Primitives

Pure presentational components with no business logic:

```typescript
import { Button, Card, Badge, Alert, Input } from "@repo/ui";
```

**Components:** Button, Card, CardHeader, CardContent, CardFooter, Badge, Alert, Input, Label, Checkbox, Separator, ScrollArea, Skeleton

**Utility:** `cn()` - Tailwind class merging utility

#### `@repo/layout` - Layout System

Composable layout primitives using the slots pattern:

```typescript
import { PageLayout, PageHeader, PageSidebar, useSlots } from "@repo/layout";

<PageLayout>
  <PageHeader>Header content</PageHeader>
  <PageSidebar>Sidebar content</PageSidebar>
  Main content
</PageLayout>
```

**Components:** PageLayout, SplitLayout, Header

**Slots:** PageHeader, PageSidebar, PageAlert, PageFooter, PageActions

**Hooks:** `useSlots()` - Extract named slots from children

#### `@repo/api` - API Client & Hooks

Type-safe API client with React Query hooks:

```typescript
import { useServices, usePackages, useCreatePackage } from "@repo/api";

const { data, isLoading } = useServices();
const createPackage = useCreatePackage();
```

**Hooks:** useServices, useService, usePackages, usePackage, useCreatePackage, useUpdatePackage, useDeletePackage

**Utilities:** validatePackage, calculatePricing, checkCanAddService, checkCanRemoveService

#### `@repo/builder` - Package Builder Feature

Complete Package Builder UI:

```typescript
import { PackageBuilder } from "@repo/builder";

<PackageBuilder
  onPackageSaved={(id) => router.push("/packages")}
  onViewPackages={() => router.push("/packages")}
/>
```

**Components:** PackageBuilder, ServiceList, ServiceCard, CurrentPackage, PricingSummary, ConflictAlert, SavePackageForm

**Hooks:** `useBuilderState()` - Local builder state management

**Utilities:** Client-side pricing and validation functions

#### `@repo/packages` - Package Management Feature

Saved packages list UI:

```typescript
import { PackagesList } from "@repo/packages";

<PackagesList
  onCreateNew={() => router.push("/")}
  onEdit={(id) => router.push(`/?edit=${id}`)}
/>
```

**Components:** PackagesList, PackageCard, PackageActions, PackageSummary

**Hooks:** `usePackageList()` - Filtering and sorting

---

## Package Dependencies

| Package | Dependencies |
|---------|--------------|
| `@repo/ui` | tailwindcss, clsx, tailwind-merge, class-variance-authority, lucide-react |
| `@repo/layout` | `@repo/ui`, react |
| `@repo/api` | `@tanstack/react-query` |
| `@repo/builder` | `@repo/ui`, `@repo/layout`, `@repo/api`, lucide-react |
| `@repo/packages` | `@repo/ui`, `@repo/layout`, `@repo/api`, lucide-react |
| `apps/web` | `@repo/builder`, `@repo/packages`, next, react |

---

## Apps

### Web (`apps/web`)

Next.js 16 application with React 19, TypeScript, and Tailwind CSS.

**Pages:**
- `/` - Package Builder (create/edit packages)
- `/packages` - Saved Packages list

**Configuration:**
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4567`

### API (`apps/api`)

Ruby Sinatra API server following Domain-Driven Design.

See [`apps/api/README.md`](apps/api/README.md) for detailed API documentation.

**Key Endpoints:**
- `GET /api/services` - List all screening services
- `GET /api/packages` - List saved packages
- `POST /api/packages` - Create a new package
- `POST /api/packages/validate` - Validate package configuration
- `POST /api/packages/price` - Calculate pricing with discounts

---

## Environment Variables

### Web App (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4567
```

---

## Development Workflow

1. **Start Development:**
   ```bash
   pnpm dev
   ```
   This runs the API, generates TypeScript types from OpenAPI, and starts the web app.

2. **Type Generation:**
   Types are automatically generated from the API's OpenAPI spec when running `pnpm dev`. To regenerate manually:
   ```bash
   pnpm --filter @repo/api generate-types
   ```

3. **Adding New UI Components:**
   - Primitives go in `@repo/ui`
   - Layout components go in `@repo/layout`
   - Feature-specific components go in `@repo/builder` or `@repo/packages`

4. **Adding New API Endpoints:**
   - Add route in `apps/api/myapp.rb`
   - Update `apps/api/openapi.yaml`
   - Regenerate types with `pnpm --filter @repo/api generate-types`
   - Add React Query hook in `@repo/api`

---

## End-to-End Testing

The project includes a comprehensive Playwright E2E test suite in `packages/e2e/`.

### Running E2E Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Or run from the e2e package directory
cd packages/e2e
pnpm test

# Run with Playwright UI for debugging
pnpm test:ui

# Run in headed mode (see the browser)
pnpm test:headed

# Run in debug mode
pnpm test:debug
```

### Test Configuration

The Playwright configuration automatically starts both the API and web app before running tests. No need to manually start the dev servers.

- **Base URL:** `http://localhost:3000`
- **API Server:** `http://localhost:4567`
- **Browser:** Chromium

### Test Scenarios

The E2E suite covers 4 main user flows:

| Flow | Description | Tests |
|------|-------------|-------|
| **Flow 1** | Building a Basic Package | Add services, verify pricing, save and persist |
| **Flow 2** | Dependency Handling | Verify dependency warnings, enable after adding required services |
| **Flow 3** | Conflict Resolution | Prevent conflicting services, resolve by removal |
| **Flow 4** | Maximum Discounts | Bundle discounts, volume discounts, verify pricing |

### Installing Playwright Browsers

If you get an error about missing browsers:

```bash
cd packages/e2e
pnpm exec playwright install chromium
```

---

## Architectural Decision Points

This section documents the reasoning behind key design decisions in the codebase.

### 1. Where should validation logic live?

**Implementation:** Both frontend and backend

| Layer | Location | Purpose |
|-------|----------|---------|
| Frontend | [`packages/builder/src/lib/validation.ts`](packages/builder/src/lib/validation.ts) | Client-side validation for immediate UX feedback |
| Backend | [`apps/api/domain/services/validation_service.rb`](apps/api/domain/services/validation_service.rb) | Server-side validation as the source of truth |

**Rationale:** The frontend provides optimistic UI updates for a responsive user experience, while the server validates all data before persistence to ensure data integrity. This dual approach prevents invalid packages from being saved while keeping the UI snappy.

### 2. How are service dependencies modeled?

**Implementation:** JSON configuration file

- **Location:** [`apps/api/config/services.json`](apps/api/config/services.json)
- Each service defines `dependencies` (required services) and `conflicts` (mutually exclusive services) as arrays of service IDs

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| JSON config (chosen) | Easy to modify without code changes; version controllable; readable | Cannot express complex conditional rules |
| Code constants | Type-safe; can include logic | Requires deployment for changes |
| Database | Dynamic updates; admin UI possible | More infrastructure; overkill for static rules |

The JSON approach is suitable for static business rules that change infrequently.

### 3. How is pricing calculation handled?

**Implementation:** Declarative rule arrays

```typescript
// Volume thresholds - easy to add new tiers
const VOLUME_THRESHOLDS = [
  { minServices: 8, discount: 0.15, name: "15% Off - Enterprise Package" },
  { minServices: 5, discount: 0.1, name: "10% Off - Large Package" },
];

// Bundle rules - easy to add new bundles
const BUNDLE_RULES = [
  { requiredIds: ["state_criminal", "county_criminal", ...], discount: 20, name: "Criminal Bundle" },
  { requiredIds: ["employment_verification", ...], discount: 15, name: "Verification Bundle" },
];
```

**Location:** [`packages/builder/src/lib/pricing.ts`](packages/builder/src/lib/pricing.ts)

**Maintainability:** Adding new discount rules requires only adding new entries to the arrays. The calculation logic (`calculateVolumeDiscount`, `calculateBundleDiscounts`) iterates over these arrays, so no conditional logic changes are needed.

### 4. What happens when removing a service that others depend on?

**Implementation:** Allow removal with visual warning

- `checkRemovalImpact()` in [`validation.ts`](packages/builder/src/lib/validation.ts) identifies which services depend on the one being removed
- UI shows an amber warning icon with a tooltip listing dependent services
- Removal is allowed, but the package enters an invalid state (red styling, error banner)
- User must either remove the dependent services or add back the required service

**UX Choice:** Inform rather than block. This lets users see the full impact of their changes and decide how to resolve the conflict, rather than forcing a specific resolution order.

### 5. How is package data persisted?

**Implementation:** JSON file storage with Repository pattern

| Component | Location |
|-----------|----------|
| Data file | [`apps/api/data/packages.json`](apps/api/data/packages.json) |
| Repository interface | [`apps/api/domain/repositories/package_repository.rb`](apps/api/domain/repositories/package_repository.rb) |
| JSON implementation | [`apps/api/infrastructure/repositories/json/json_package_repository.rb`](apps/api/infrastructure/repositories/json/json_package_repository.rb) |

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| JSON file (chosen) | Simple; no database setup; easy to inspect/debug | No concurrent write safety; doesn't scale |
| SQLite | ACID compliance; still simple | Requires migrations; binary file |
| PostgreSQL | Production-ready; scales | Infrastructure overhead |

The JSON approach is suitable for a demo/assessment context. The Repository pattern abstracts the storage mechanism, making it easy to swap to a database implementation for production use.
