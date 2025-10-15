# Quick Start Guide - GraphQL Mock Data System

## How to Use

### Using Mock Data (Current Default)

The application is currently configured to use mock data. You don't need to do anything - just run the app:

```bash
npm start
```

The app will use the mock data defined in `src/app/data/mock-data.ts`.

### Switching to GraphQL

When your GraphQL backend is ready:

1. Open `src/app/config/data.config.ts`
2. Change the configuration:

```typescript
export const DATA_CONFIG: DataConfig = {
  useGraphQL: true,  // Changed from false
  graphqlEndpoint: 'https://your-actual-api.com/graphql',
  mockDataDelay: 300
};
```

3. Rebuild and restart your app:

```bash
npm run build
npm start
```

That's it! The application will now use GraphQL queries instead of mock data.

## Verifying the Setup

### Check Current Configuration

Look at `src/app/config/data.config.ts` to see which mode is active:
- `useGraphQL: false` → Using mock data
- `useGraphQL: true` → Using GraphQL API

### Available Data

The mock data includes:
- **6 users** across 4 role types (super-admin, org-admin, team-lead, sales-executive)
- **50 sales records** distributed among 3 sales executives
- **8 product types** across 4 categories
- **8 clients**
- **5 regions**

### Testing Different Data Sources

**Option 1: Test with Mock Data**
```typescript
// In data.config.ts
useGraphQL: false
```

**Option 2: Test with GraphQL (when backend is ready)**
```typescript
// In data.config.ts
useGraphQL: true,
graphqlEndpoint: 'https://api.production.com/graphql'
```

## GraphQL Queries Available

All queries are in `src/app/graphql/queries/`:

### Sales Queries
- `GET_SALES_HISTORY` - Get sales for a specific user with optional date filters
- `GET_SALES_SUMMARY` - Get sales summary (totals, counts) for a user
- `GET_ALL_SALES` - Get all sales records (admin/lead access)

### User Queries
- `GET_ALL_USERS` - Get all users in the system
- `GET_CURRENT_USER` - Get currently authenticated user
- `GET_VIEWABLE_USERS` - Get users visible to current user based on role

## Architecture Overview

```
User Request
    ↓
SalesDataService / RoleService (existing services)
    ↓
DataService (new unified service)
    ↓
    ├─→ useGraphQL = false → Mock Data (MOCK_DATA)
    └─→ useGraphQL = true  → GraphQL API (with queries)
```

## Debugging Tips

1. **Check which mode is active**: Look at the config file
2. **Verify mock data**: Inspect `src/app/data/mock-data.ts`
3. **Test GraphQL queries**: Use GraphQL Playground/Apollo Studio
4. **Check network requests**: Open browser DevTools → Network tab
5. **View console logs**: Services log their operations

## Next Steps

1. **Development**: Keep using mock data (`useGraphQL: false`)
2. **Integration Testing**: Set up a test GraphQL endpoint
3. **Production**: Update config to point to production GraphQL endpoint
4. **Monitoring**: Add error handling and logging for GraphQL requests

## Support

For questions or issues:
- Check `GRAPHQL_ARCHITECTURE.md` for detailed architecture
- Review `IMPLEMENTATION_NOTES.md` for implementation details
- Inspect test files for usage examples
