# Background Screening API

A Ruby Sinatra API for managing background screening packages with service dependencies, conflict detection, and dynamic pricing.

## Architecture

This API follows **Domain-Driven Design (DDD)** principles with a clean separation between domain logic and infrastructure:

```
apps/api/
├── myapp.rb                     # Main Sinatra application & routes
├── openapi.yaml                 # OpenAPI 3.0 specification
├── config/
│   └── services.json            # Service definitions (static)
├── data/
│   └── packages.json            # Saved packages (mutable)
├── domain/                      # Domain Layer (pure business logic)
│   ├── entities/
│   │   ├── service.rb           # Service entity
│   │   └── package.rb           # Package aggregate root
│   ├── repositories/            # Repository interfaces (contracts)
│   │   ├── package_repository.rb
│   │   └── service_repository.rb
│   └── services/
│       ├── pricing_service.rb   # Discount calculations
│       └── validation_service.rb # Business rule validation
└── infrastructure/              # Infrastructure Layer (implementations)
    └── repositories/
        └── json/                # JSON file storage implementation
            ├── json_package_repository.rb
            └── json_service_repository.rb
```

### Layer Responsibilities

| Layer | Purpose |
|-------|---------|
| **Domain** | Business logic, entities, and repository interfaces (no external dependencies) |
| **Infrastructure** | Concrete implementations (JSON storage, future: PostgreSQL, etc.) |
| **Application** | HTTP routes in `myapp.rb` that orchestrate domain and infrastructure |

### Repository Pattern

The domain layer defines abstract repository interfaces:

```ruby
# domain/repositories/package_repository.rb
class PackageRepository
  def all; raise NotImplementedError; end
  def find(id); raise NotImplementedError; end
  def create(package); raise NotImplementedError; end
  # ...
end
```

The infrastructure layer provides concrete implementations:

```ruby
# infrastructure/repositories/json/json_package_repository.rb
class JsonPackageRepository < Domain::Repositories::PackageRepository
  def all
    # JSON file implementation
  end
end
```

### Swapping Storage Backends

To switch from JSON to PostgreSQL (or any other storage):

```ruby
# In myapp.rb - just change the implementation:

# Current: JSON files
def package_repository
  Infrastructure::Repositories::Json::JsonPackageRepository.new(DATA_PATH)
end

# Future: PostgreSQL
def package_repository
  Infrastructure::Repositories::Postgres::PostgresPackageRepository.new(connection)
end
```

The domain layer remains unchanged—it only depends on the abstract interfaces.

## Setup

```bash
# Install Ruby dependencies
bundle install

# Start the server (development)
bundle exec ruby myapp.rb

# Or via turbo from project root
pnpm dev:api
```

The API runs on `http://localhost:4567`.

## API Endpoints

### Services

#### List All Services

```http
GET /api/services
```

Returns all available screening services grouped by category.

**Response:**
```json
{
  "services": [
    {
      "id": "state_criminal",
      "name": "State Criminal Search",
      "base_price": 15.0,
      "category": "criminal",
      "dependencies": [],
      "conflicts": []
    }
  ],
  "by_category": {
    "criminal": [...],
    "verification": [...],
    "driving": [...],
    "drug_screening": [...]
  }
}
```

#### Get Single Service

```http
GET /api/services/:id
```

### Packages

#### List All Packages

```http
GET /api/packages
```

Returns all saved packages with pricing calculations.

#### Get Most Recent Package

```http
GET /api/packages/recent
```

Returns the most recently updated package (useful for restoring state on page load).

#### Get Package by ID

```http
GET /api/packages/:id
```

**Response:**
```json
{
  "package": {
    "id": "uuid",
    "name": "Standard Hire Package",
    "service_ids": ["state_criminal", "employment_verification"],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "services": [
    { "id": "state_criminal", "name": "State Criminal Search", "price": 15.0 }
  ],
  "pricing": {
    "subtotal": 50.0,
    "discounts": [],
    "total_discount": 0,
    "total": 50.0,
    "service_count": 2
  },
  "validation": {
    "valid?": true,
    "errors": [],
    "warnings": []
  }
}
```

#### Create Package

```http
POST /api/packages
Content-Type: application/json

{
  "name": "My Package",
  "service_ids": ["state_criminal", "employment_verification"]
}
```

Returns `201 Created` with the package, pricing, and validation.

#### Update Package

```http
PUT /api/packages/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "service_ids": ["state_criminal", "county_criminal", "employment_verification"]
}
```

#### Delete Package

```http
DELETE /api/packages/:id
```

Returns `204 No Content` on success.

### Validation & Pricing

#### Validate Package Configuration

```http
POST /api/packages/validate
Content-Type: application/json

{
  "service_ids": ["county_criminal"]
}
```

**Response (invalid):**
```json
{
  "valid?": false,
  "errors": [
    {
      "type": "missing_dependency",
      "service_id": "county_criminal",
      "message": "County Criminal Search requires State Criminal Search",
      "required_service_id": "state_criminal"
    }
  ],
  "warnings": []
}
```

#### Calculate Pricing

```http
POST /api/packages/price
Content-Type: application/json

{
  "service_ids": ["state_criminal", "county_criminal", "federal_criminal", "national_criminal", "employment_verification", "education_verification", "professional_license", "mvr"]
}
```

**Response:**
```json
{
  "services": [
    { "id": "state_criminal", "name": "State Criminal Search", "price": 15.0 },
    ...
  ],
  "pricing": {
    "subtotal": 230.0,
    "discounts": [
      { "type": "volume", "name": "Volume Discount (15% for 8+ services)", "amount": 34.5 },
      { "type": "bundle", "name": "Criminal Bundle Discount (all 4 criminal searches)", "amount": 20.0 },
      { "type": "bundle", "name": "Verification Bundle Discount (all 3 verification services)", "amount": 15.0 }
    ],
    "total_discount": 69.5,
    "total": 160.5,
    "service_count": 8
  }
}
```

#### Check If Service Can Be Added

```http
POST /api/services/:id/can-add
Content-Type: application/json

{
  "current_service_ids": []
}
```

**Response (allowed):**
```json
{
  "allowed": true
}
```

**Response (blocked by dependency):**
```json
{
  "allowed": false,
  "reason": "County Criminal Search requires State Criminal Search to be added first",
  "missing_dependencies": ["state_criminal"]
}
```

#### Check If Service Can Be Removed

```http
POST /api/services/:id/can-remove
Content-Type: application/json

{
  "current_service_ids": ["state_criminal", "county_criminal"]
}
```

**Response:**
```json
{
  "allowed": true,
  "cascade_remove": ["county_criminal"],
  "warning": "Removing this service will also remove: County Criminal Search"
}
```

## Business Rules

### Service Dependencies

| Service | Requires |
|---------|----------|
| County Criminal Search | State Criminal Search |
| Federal Criminal Search | State Criminal Search |
| National Criminal Database | None (standalone) |

### Service Conflicts

| Service | Conflicts With |
|---------|----------------|
| Drug Test (5-Panel) | Drug Test (10-Panel) |
| Drug Test (10-Panel) | Drug Test (5-Panel) |

### Pricing Rules

**Volume Discounts:**
- 5+ services: 10% off subtotal
- 8+ services: 15% off subtotal

**Bundle Discounts (stackable):**
- All 4 Criminal searches: $20 off
- All 3 Verification services: $15 off

## Available Services

| ID | Name | Price | Category |
|----|------|-------|----------|
| `state_criminal` | State Criminal Search | $15.00 | Criminal |
| `county_criminal` | County Criminal Search | $25.00 | Criminal |
| `federal_criminal` | Federal Criminal Search | $30.00 | Criminal |
| `national_criminal` | National Criminal Database | $40.00 | Criminal |
| `employment_verification` | Employment Verification | $35.00 | Verification |
| `education_verification` | Education Verification | $35.00 | Verification |
| `professional_license` | Professional License Verification | $30.00 | Verification |
| `mvr` | Motor Vehicle Report (MVR) | $20.00 | Driving |
| `drug_test_5_panel` | Drug Test (5-Panel) | $45.00 | Drug Screening |
| `drug_test_10_panel` | Drug Test (10-Panel) | $65.00 | Drug Screening |

## Error Responses

All errors return JSON with an `error` field:

```json
{
  "error": "Package not found: invalid-id"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (invalid JSON) |
| 404 | Resource not found |
| 422 | Unprocessable Entity (validation failed) |
| 500 | Internal server error |
