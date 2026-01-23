# Bearer Token Authentication - Debugging Guide

This application supports both standalone and SPA (Module Federation) modes with stateless, API-driven authentication.

## Quick Start for Debugging

### 1. Copy/Paste Bearer Tokens

For debugging purposes, you can manually set Bearer tokens:

1. Open your browser's DevTools Console
2. Paste the following command with your token:
   ```javascript
   localStorage.setItem('bearer_token', 'YOUR_BEARER_TOKEN_HERE');
   ```
3. Refresh the page (F5 or Cmd+R)
4. The token will be automatically included in all API requests

### 2. View Current Token

To check the current token:
```javascript
localStorage.getItem('bearer_token');
```

### 3. Remove Token

To clear the token:
```javascript
localStorage.removeItem('bearer_token');
```

## How It Works

### Stateless Architecture

- **No user state stored locally**: All user information comes from API responses
- **Token-based auth**: Bearer token is automatically injected into all HTTP requests
- **Works in both modes**: 
  - Standalone mode: Run the app independently with `npm start`
  - SPA mode: Loaded as a micro-frontend via Module Federation

### HTTP Interceptor

The `authInterceptor` automatically:
1. Reads the Bearer token from `localStorage` on every request
2. Adds `Authorization: Bearer <token>` header to all API calls
3. Works seamlessly without manual configuration

### Files Involved

- **`src/app/interceptors/auth.interceptor.ts`**: Adds Bearer token to requests
- **`src/app/services/token.service.ts`**: Manages token storage
- **`src/app/app.config.ts`**: Registers the HTTP interceptor
- **`projects/core-services/src/lib/auth.service.ts`**: Updated for stateless auth
- **`projects/core-services/src/lib/role.service.ts`**: Updated to use API data

## API Configuration

Update API endpoints in `src/app/config/api.config.ts`:

```typescript
export const API_CONFIG: ApiConfig = {
  baseUrl: 'https://your-api-server.com',
  endpoints: {
    users: '/api/users',
    sales: '/api/sales',
    auth: '/api/auth'
  }
};
```

## Testing

### Standalone Mode
```bash
npm start
# Opens at http://localhost:4101
```

### Module Federation Mode
The app exposes components via webpack module federation and can be loaded by a shell application.

## Differences from Previous Implementation

### Before (Stateful)
- User info stored in localStorage
- OIDC flow managed authentication state
- Hardcoded dummy users in services
- Token stored with specific key name

### After (Stateless)
- User info comes from API responses only
- Token is just for API authentication
- No hardcoded users (uses API data)
- Standard `bearer_token` key for easy debugging
- HTTP interceptor handles token injection automatically

## Production vs Development

### Development
- Manually set tokens via console for quick testing
- Uses dummy data as fallback if no API available

### Production
- Tokens obtained via OIDC flow
- All data comes from real API endpoints
- No dummy data fallback

## Troubleshooting

### Token not being sent
1. Check token exists: `localStorage.getItem('bearer_token')`
2. Check browser DevTools Network tab for Authorization header
3. Verify HTTP interceptor is registered in `app.config.ts`

### API calls failing
1. Verify API_CONFIG.baseUrl is correct
2. Check CORS settings on your API
3. Verify token is valid (not expired)

### User data not loading
1. Ensure API returns user data in expected format
2. Check RoleService is receiving data from API
3. Verify token has correct permissions
