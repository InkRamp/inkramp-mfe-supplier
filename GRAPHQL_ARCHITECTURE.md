# GraphQL Architecture & Mock Data System

## Overview

This document describes the new data layer architecture that supports both mock data (for development) and GraphQL APIs (for production) with a simple configuration flag.

## Architecture

### 1. Centralized Mock Data (`src/app/data/mock-data.ts`)

All mock data is now centralized in a single file. This includes:
- User data (all roles: super-admin, org-admin, team-lead, sales-executive)
- Sales records (50 generated records)
- Products catalog
- Clients list
- Regions

**Benefits:**
- Easy to update mock data in one place
- Consistent data across the application
- Simple to understand and debug

### 2. Data Configuration (`src/app/config/data.config.ts`)

Controls whether to use GraphQL or mock data:

```typescript
export const DATA_CONFIG: DataConfig = {
  useGraphQL: false,              // Set to true to use GraphQL
  graphqlEndpoint: 'https://api.example.com/graphql',
  mockDataDelay: 300              // Simulated API delay in ms
};
```

**To switch to GraphQL:**
Simply change `useGraphQL: false` to `useGraphQL: true`

### 3. GraphQL Configuration (`src/app/graphql/graphql.config.ts`)

All GraphQL-related configuration in one place:
- Endpoint URL
- Headers configuration
- Authentication token handling

### 4. GraphQL Queries (`src/app/graphql/queries/`)

All GraphQL queries organized by domain:

- **sales.queries.ts**: Sales-related queries
  - GET_SALES_HISTORY
  - GET_SALES_SUMMARY
  - GET_ALL_SALES

- **user.queries.ts**: User-related queries
  - GET_ALL_USERS
  - GET_CURRENT_USER
  - GET_VIEWABLE_USERS

### 5. Unified Data Service (`src/app/services/data.service.ts`)

The DataService abstracts the data source:

```typescript
// Automatically uses mock data or GraphQL based on config
dataService.getSalesHistory(userId, startDate, endDate)
dataService.getSalesSummary(userId)
dataService.getAllSales()
dataService.getAllUsers()
```

**How it works:**
1. Checks `DATA_CONFIG.useGraphQL` flag
2. If `false`: Returns data from `MOCK_DATA` with simulated delay
3. If `true`: Makes GraphQL query to the configured endpoint

### 6. Backward Compatibility

Existing services (`SalesDataService`, `RoleService`) continue to work:
- If `DataService` is injected, they use it
- Otherwise, they fall back to their original implementation
- No breaking changes to existing code

## File Structure

```
src/app/
├── config/
│   └── data.config.ts           # Main configuration flag
├── data/
│   └── mock-data.ts             # All mock data in one place
├── graphql/
│   ├── graphql.config.ts        # GraphQL endpoint & headers config
│   └── queries/
│       ├── index.ts             # Barrel export
│       ├── sales.queries.ts     # Sales queries
│       └── user.queries.ts      # User queries
└── services/
    └── data.service.ts          # Unified data abstraction layer
```

## Usage Examples

### Using DataService directly:

```typescript
import { DataService } from './services/data.service';

constructor(private dataService: DataService) {}

ngOnInit() {
  // Works with both mock and GraphQL
  this.dataService.getSalesHistory('user-4').subscribe(sales => {
    console.log(sales);
  });
}
```

### Using existing services (backward compatible):

```typescript
import { SalesDataService } from '@org/core-services';

constructor(private salesService: SalesDataService) {}

ngOnInit() {
  // Automatically uses DataService if available
  this.salesService.getSalesHistory('user-4').subscribe(sales => {
    console.log(sales);
  });
}
```

## Switching to GraphQL

When your GraphQL backend is ready:

1. Update `src/app/config/data.config.ts`:
   ```typescript
   export const DATA_CONFIG: DataConfig = {
     useGraphQL: true,  // Changed from false
     graphqlEndpoint: 'https://your-api.com/graphql',
     mockDataDelay: 300
   };
   ```

2. That's it! No other code changes needed.

## Testing

The mock data system includes:
- Realistic data generation
- Simulated API delays
- Consistent data structure matching GraphQL schema

## Future Enhancements

- Add HTTP interceptor for authentication tokens
- Add caching layer for GraphQL responses
- Add error handling and retry logic
- Add loading states management
- Add GraphQL mutations (currently only queries)

## Benefits of This Architecture

✅ **Simple to switch**: One boolean flag  
✅ **Easy to debug**: All data in one file  
✅ **Type-safe**: TypeScript interfaces ensure consistency  
✅ **Backward compatible**: Existing code works without changes  
✅ **Organized**: Clear separation of concerns  
✅ **Testable**: Easy to mock and test  
✅ **Scalable**: Easy to add new queries and data sources
