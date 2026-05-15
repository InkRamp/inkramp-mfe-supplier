# inkramp-mfe-supplier - Sales History Micro Frontend

## Overview

**inkramp-mfe-supplier** is a micro-frontend application designed to display sales history and performance metrics for sales executives. This MFE is part of a larger sales incentive management system and works in both standalone and federated modes.

## Features

### 1. **Role-Based Access Control (RBAC)**
- **Super Admin**: Can view all sales data across the organization
- **Org Admin**: Can view all sales data across the organization
- **Team Lead**: Can view sales data for their team members
- **Sales Executive**: Can only view their own sales data

### 2. **Sales History Dashboard**
- Comprehensive view of sales records with detailed information
- Interactive summary cards showing key metrics:
  - Total Sales Amount
  - Total Commission Earned
  - Completed Sales Count
  - Pending Sales Count
  - Cancelled Sales Count

### 3. **User Selection (Admin/Team Lead)**
- Admins and team leads can select different sales executives from a dropdown
- Seamlessly switches between viewing different users' data

### 4. **Responsive Design**
- Mobile-friendly layout that adapts to different screen sizes
- Optimized for both desktop and mobile viewing

## Technical Architecture

### Project Structure

```
inkramp-mfe-supplier/
├── src/
│   ├── app/
│   │   ├── sales-history/          # Sales history component
│   │   ├── app.component.ts         # Main app component
│   │   └── ...
│   ├── styles/
│   │   ├── _tokens.scss             # Design tokens (colors, spacing, etc.)
│   │   └── _mixins.scss             # Reusable SCSS mixins
│   └── styles.scss                  # Global styles
├── projects/
│   └── core-services/               # Shared services library
│       └── src/
│           └── lib/
│               ├── auth.service.ts       # Zitadel authentication
│               ├── role.service.ts       # Role-based access control
│               └── sales-data.service.ts # Sales data management
└── webpack.config.js                # Module federation configuration
```

### Core Services

#### 1. **RoleService** (`projects/core-services/src/lib/role.service.ts`)

Manages user roles and permissions with the following key features:
- Current user state management
- Role-based permission checks
- User hierarchy management
- Viewable users based on role

**Key Methods:**
```typescript
getCurrentUser(): User | null
setCurrentUser(user: User): void
hasRole(role: UserRole): boolean
hasAnyRole(roles: UserRole[]): boolean
isAdmin(): boolean
isTeamLeadOrHigher(): boolean
getViewableUsers(): User[]
```

#### 2. **SalesDataService** (`projects/core-services/src/lib/sales-data.service.ts`)

Provides sales data with filtering and summary capabilities:
- Sales history retrieval
- Date range filtering
- Sales summary calculations
- Dummy data generation for testing

**Key Methods:**
```typescript
getSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]>
getSalesSummary(userId: string): Observable<SalesSummary>
getAllSales(): Observable<SalesRecord[]>
```

#### 3. **AuthService** (`projects/core-services/src/lib/auth.service.ts`)

Handles Zitadel OIDC authentication (inherited from original implementation):
- OAuth 2.0 / OIDC authentication flow
- Token management
- User session handling

### Design System

#### Design Tokens (`src/styles/_tokens.scss`)

Centralized design tokens ensure consistency across all MFEs:
- **Brand Colors**: Primary, secondary, accent colors
- **Neutral Colors**: Gray scale palette
- **Typography**: Font families, sizes, weights
- **Spacing**: Standardized spacing scale
- **Border Radius**: Consistent corner rounding
- **Shadows**: Elevation system
- **Transitions**: Animation timing
- **Z-index**: Layering system

#### Mixins (`src/styles/_mixins.scss`)

Reusable SCSS mixins for common patterns:
- `flex-center`: Center content with flexbox
- `flex-between`: Space-between layout
- `card`: Card component styling
- `button-primary`, `button-secondary`: Button styles
- `truncate-text`: Text overflow handling
- `responsive`: Media query helper
- `scrollbar`: Custom scrollbar styling

### Module Federation

The MFE is configured for module federation with the following setup:

**webpack.config.js:**
```javascript
{
  name: 'mfeMySales',
  exposes: {
    './Component': './src/app/app.component.ts',
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    '@angular/common/http': { singleton: true },
    '@org/core-services': { singleton: true },
    'rxjs': { singleton: true }
  }
}
```

## Dummy Data

The application uses dummy data for demonstration purposes. All data is generated in memory and includes:

### Sales Executives
- Alice Sales (user-4) - Sales Executive
- Bob Sales (user-5) - Sales Executive
- Carol Sales (user-6) - Sales Executive

### Sales Records
- 50 sample sales records across all sales executives
- Various products across different categories (Electronics, Software, Services, Hardware)
- Different statuses (Completed, Pending, Cancelled)
- Date range spanning the last 6 months
- Realistic amounts and commissions

### Products
- Enterprise Software License
- Cloud Storage Solution
- Server Hardware
- IoT Device Package
- Consulting Services
- Mobile App Development
- Security Suite
- Network Infrastructure

## Development

### Building the Application

```bash
# Build core-services library
npm run ng build core-services

# Build the MFE
npm run build
```

### Running Locally

```bash
# Serve the MFE in standalone mode
npm start
```

The application will be available at `http://localhost:4101`

### Testing

```bash
# Run unit tests
npm test

# Run tests in headless mode
npm test -- --browsers=ChromeHeadless --watch=false
```

## Usage in Shell Application

### Loading the MFE

The shell application can load this MFE dynamically using Module Federation:

```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

const component = await loadRemoteModule({
  type: 'module',
  remoteEntry: 'http://localhost:4101/remoteEntry.js',
  exposedModule: './Component'
});
```

### User Selection for Admins/Team Leads

The shell should provide a user selector in its header/navigation when admins or team leads are viewing this MFE. The current implementation shows a selector within the MFE itself, but this can be moved to the shell for better UX consistency.

## Design Principles

This MFE follows SOLID, DRY, and YAGNI principles:

### SOLID
- **Single Responsibility**: Each service has a clear, focused purpose
- **Open/Closed**: Services are extensible without modification
- **Liskov Substitution**: Interfaces and types are well-defined
- **Interface Segregation**: Clean public APIs
- **Dependency Inversion**: Dependencies are injected, not hard-coded

### DRY (Don't Repeat Yourself)
- Shared SCSS tokens and mixins
- Reusable services in core-services library
- Pure functions for data transformations
- Component methods are focused and reusable

### YAGNI (You Aren't Gonna Need It)
- No premature optimization
- No unused features
- Simple, straightforward implementations
- Only essential dependencies

## Future Enhancements

### Planned Features
1. **API Integration**: Replace dummy data with actual backend API calls
2. **Advanced Filtering**: Date range pickers, status filters, search functionality
3. **Export Capabilities**: Export sales data to CSV/Excel
4. **Charts & Graphs**: Visual representations of sales trends
5. **Pagination**: Handle large datasets efficiently
6. **Real-time Updates**: WebSocket integration for live data
7. **Caching**: Smart caching strategies for better performance

### Integration with Other MFEs
- **mfe-CRUD_RULES**: Create and manage incentive rules
- **mfe-MY_REPORT**: Visual analytics and reports

## Brand Support

The design token system supports future brand-specific deployments:
- Centralized token files can be swapped per brand
- GraphQL layer (planned) will handle brand-specific data abstraction
- Component styling is token-based, making theming straightforward

## Performance Considerations

### Perceived Performance
- Loading indicators during data fetch
- Optimistic UI updates
- Lazy loading of components
- Efficient change detection with OnPush strategy (can be added)

### Bundle Size
- Current production build: ~58 KB initial
- Lazy chunks for better loading performance
- Tree-shaking enabled
- Production optimizations applied

## Deployment

The MFE is deployed to GitHub Pages as part of the CI/CD pipeline:

```yaml
- name: Deploy to GitHub Pages
  uses: JamesIves/github-pages-deploy-action@v4
  with:
    branch: main
    folder: ./dist/inkramp-mfe-supplier
    repository-name: InkRamp/all-mfe-builds
    target-folder: inkramp-mfe-supplier
    clean: false
```

## License

Copyright © 2025 Sales Management System

## Support

For issues and questions, please refer to the main repository documentation or contact the development team.
