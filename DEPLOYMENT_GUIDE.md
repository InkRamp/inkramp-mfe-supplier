# Deployment Guide - mfe-MY_SALES

## Build & Deployment Instructions

### Prerequisites
- Node.js 18+ and npm installed
- Access to GitHub repository
- GitHub Pages access (for deployment)

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Core Services Library
```bash
npm run ng build core-services
```

### 3. Serve Locally
```bash
npm start
# Application runs at http://localhost:4101
```

### 4. Build for Production
```bash
npm run build
# Output: dist/mfe-MY_SALES/
```

---

## CI/CD Pipeline

The repository should have a GitHub Actions workflow for automated deployment. Here's the recommended configuration:

### .github/workflows/deploy.yml

```yaml
name: Deploy mfe-MY_SALES

on:
  push:
    branches:
      - main
      - develop

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build core-services
      run: npm run ng build core-services
      
    - name: Build application
      run: npm run build
      
    - name: Run tests
      run: npm test -- --browsers=ChromeHeadless --watch=false
      
    - name: Deploy to GitHub Pages
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        branch: main  # Target branch in all-mfe-builds repo
        folder: ./dist/mfe-MY_SALES
        repository-name: OpensourceKD/all-mfe-builds
        token: ${{ secrets.PAT_TOKEN }}
        target-folder: mfe-MY_SALES
        clean: false
        single-commit: false  # Keep history for multiple MFEs
```

### Required Secrets

Add these secrets in GitHub repository settings:

1. **PAT_TOKEN**: Personal Access Token with repo permissions
   - Navigate to: Settings → Developer settings → Personal access tokens
   - Create token with `repo` scope
   - Add to repository secrets

---

## Deployment Targets

### GitHub Pages (Recommended for Demo)

**URL Structure**: `https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES/`

**Folder Structure in all-mfe-builds repo**:
```
all-mfe-builds/
├── mfe-MY_SALES/
│   ├── index.html
│   ├── remoteEntry.js
│   ├── main.*.js
│   ├── polyfills.*.js
│   └── ...
├── mfe-CRUD_RULES/
├── mfe-MY_REPORT/
└── ...
```

### Custom Server Deployment

For production environments, deploy to a CDN or web server:

1. **AWS S3 + CloudFront**
   ```bash
   aws s3 sync dist/mfe-MY_SALES/ s3://your-bucket/mfe-MY_SALES/
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/mfe-MY_SALES/*"
   ```

2. **Azure Static Web Apps**
   ```bash
   az storage blob upload-batch -s dist/mfe-MY_SALES -d '$web/mfe-MY_SALES' --account-name youraccount
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /mfe-MY_SALES/ {
           alias /var/www/mfe-MY_SALES/;
           try_files $uri $uri/ /mfe-MY_SALES/index.html;
       }
   }
   ```

---

## Shell Integration

### Loading the MFE in Shell

**Method 1: Static Configuration**

```typescript
// In shell's module federation config
const routes: Routes = [
  {
    path: 'sales',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES/remoteEntry.js',
      exposedModule: './Component'
    }).then(m => m.AppComponent)
  }
];
```

**Method 2: Dynamic Configuration**

```typescript
// Shell's MFE registry
const mfeRegistry = {
  'mfe-MY_SALES': {
    remoteEntry: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES/remoteEntry.js',
    exposedModule: './Component',
    displayName: 'My Sales',
    icon: '💼',
    roles: ['super-admin', 'org-admin', 'team-lead', 'sales-executive']
  }
};

// Load dynamically
async function loadMFE(name: string) {
  const config = mfeRegistry[name];
  return loadRemoteModule({
    type: 'module',
    remoteEntry: config.remoteEntry,
    exposedModule: config.exposedModule
  });
}
```

---

## Environment Configuration

### Development
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  mfeBaseUrl: 'http://localhost:4101',
  apiUrl: 'http://localhost:3000/api'
};
```

### Production
```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  mfeBaseUrl: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES',
  apiUrl: 'https://api.yourdomain.com'
};
```

---

## Version Management

### Semantic Versioning

Follow semantic versioning for releases:
- **MAJOR**: Breaking changes in API or exposed modules
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Tagging Releases

```bash
# Create a new version
npm version patch -m "Fix: Sales summary calculation"
git push origin --tags

# Or for features
npm version minor -m "Feature: Add date range filter"
git push origin --tags
```

### Version in remoteEntry.js

For production, consider versioned deployments:
```
mfe-MY_SALES/
├── v1.0.0/
│   └── remoteEntry.js
├── v1.1.0/
│   └── remoteEntry.js
└── latest/  (symlink to current version)
    └── remoteEntry.js
```

---

## Rollback Strategy

### Quick Rollback

If a deployment has issues:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Deploy previous tag
git checkout v1.0.0
npm run build
# Deploy manually
```

### Blue-Green Deployment

Maintain two environments:
- **Blue**: Current production (v1.0.0)
- **Green**: New version (v1.1.0)

Switch traffic after validation:
```javascript
// Shell's MFE config
const mfeVersion = isGreenActive ? 'v1.1.0' : 'v1.0.0';
const remoteEntry = `https://cdn.example.com/mfe-MY_SALES/${mfeVersion}/remoteEntry.js`;
```

---

## Performance Optimization

### CDN Configuration

**Recommended CDN Settings**:
- **Cache-Control**: `public, max-age=31536000` for JS/CSS
- **Cache-Control**: `no-cache` for index.html
- **Compression**: Enable gzip/brotli
- **HTTP/2**: Enable for better performance

### Bundle Analysis

```bash
# Install analyzer
npm install -D webpack-bundle-analyzer

# Add script to package.json
"analyze": "ng build --stats-json && webpack-bundle-analyzer dist/mfe-MY_SALES/stats.json"

# Run analysis
npm run analyze
```

---

## Monitoring & Logging

### Application Insights

```typescript
// Add to app.config.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'YOUR_KEY',
    enableAutoRouteTracking: true
  }
});
appInsights.loadAppInsights();
appInsights.trackPageView();
```

### Error Tracking

```typescript
// Add to app.config.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0,
});
```

---

## Health Checks

### Endpoint for Shell

Create a health check endpoint:

```typescript
// src/app/health/health.component.ts
@Component({
  selector: 'app-health',
  template: '{{ status | json }}'
})
export class HealthComponent {
  status = {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dependencies: {
      'core-services': 'ok',
      'sales-data': 'ok'
    }
  };
}
```

---

## Troubleshooting

### Common Issues

**1. Module not found**
```
Error: Shared module @org/core-services not found
Solution: Ensure core-services is built before main app
npm run ng build core-services && npm run build
```

**2. CORS errors**
```
Error: Access to fetch at 'remoteEntry.js' from origin 'xyz' has been blocked
Solution: Configure CORS headers on server
Access-Control-Allow-Origin: *
```

**3. Version mismatch**
```
Error: Version mismatch for shared dependency @angular/core
Solution: Ensure all MFEs use same Angular version
Check package.json and align versions
```

---

## Security Checklist

- [ ] Remove console.log statements in production
- [ ] Enable Content Security Policy headers
- [ ] Implement authentication tokens
- [ ] Validate all user inputs
- [ ] Use HTTPS for all remote entries
- [ ] Implement rate limiting on APIs
- [ ] Regular dependency updates
- [ ] Security audits (`npm audit`)

---

## Support & Resources

### Documentation
- [MFE_DOCUMENTATION.md](./MFE_DOCUMENTATION.md) - Detailed technical docs
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Assumptions & decisions
- [README.md](./README.md) - Quick start guide

### Contacts
- Development Team: [GitHub Issues]
- Architecture Questions: [Main Documentation]
- Emergency Hotline: [TBD]

---

**Last Updated**: October 11, 2025  
**Version**: 1.0.0  
**Deployment Status**: Ready for Production
