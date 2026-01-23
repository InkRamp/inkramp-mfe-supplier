# Standalone Mode Setup Guide

This guide explains how to configure and run the application in standalone mode with the real API.

## Required sessionStorage Values

To run the application in standalone mode, you need to set the following values in your browser's sessionStorage:

### 1. Bearer Token (Required)
```javascript
sessionStorage.setItem('bearer_token', 'YOUR_JWT_TOKEN_HERE');
```

**Example:**
```javascript
sessionStorage.setItem('bearer_token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlkxYTVVMlY3dER2RHR4bkVjd1o5SiJ9...');
```

### 2. Organization/Brand (Required)
```javascript
sessionStorage.setItem('org', 'hdfc');
// OR
sessionStorage.setItem('brandId', 'hdfc');
```

The system will check for 'org' first, then fall back to 'brandId' if 'org' is not found.

## Quick Setup Steps

1. **Open your application** in the browser
2. **Open DevTools Console** (F12 or Cmd+Option+I)
3. **Set the required values:**
   ```javascript
   // Set your Bearer token
   sessionStorage.setItem('bearer_token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlkxYTVVMlY3dER2RHR4bkVjd1o5SiJ9.eyJpc3MiOiJodHRwczovL2Rldi0yNnNvdzI0dG9uZTVuYThhLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTI0OTM1NjYxOTMyNjYyMzkxMiIsImF1ZCI6WyJodHRwczovL3NvbWV0aGluZyIsImh0dHBzOi8vZGV2LTI2c293MjR0b25lNW5hOGEudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc2OTE2NDE0NSwiZXhwIjoxNzY5MjUwNTQ1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRrUHk1Y282NWpFU0lBVDhUOVNCeTVYNGNtZW9saGwiLCJwZXJtaXNzaW9ucyI6W119.oyKFZWxTtGEHF2a9sEFCfcg-b39u28ZLNo7P1IaUF0X7IENumB_QMtlArSih7t2tXsmA4SdU8Qq670vF8neuKDvR88wcW8Ktdt5j2XbmBh3npt43QJKz-BQSOSfJiB3WXwN6L2mJHNCq9rkGiJgkwT8tfu-EUQl195h56h7x6aXLQtPLoYLNmo1NM3kVdG22GmmSkUr2C7F8-7xBAe2wiGmyzeQLzxAV5hnWTv-AQVVTDw2X4UtB4Rh8Mspo-0M0XNuKgadQo7xsntdw-6e1izhynFYFGECyfyXnKPUtVs9FWamF1Iypsd09muazCwTScPKAW23IbsKuUM7F_0fiJw');
   
   // Set your organization/brand
   sessionStorage.setItem('org', 'hdfc');
   ```
4. **Refresh the page** (F5 or Cmd+R)
5. All API calls will now include your Bearer token and use the correct organization

## API Configuration

The application is now configured to use:
- **Base URL:** `https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db`
- **API Enabled:** `true`

### Available Endpoints

The system constructs URLs dynamically based on your organization:

| Endpoint | URL Pattern | Example |
|----------|------------|---------|
| Incentives | `/incentives/{org}` | `/incentives/hdfc` |
| Users | `/users` | `/users` |
| Sales | `/sales` | `/sales` |
| Auth | `/auth` | `/auth` |

## Verifying Your Setup

### Check sessionStorage Values
```javascript
// Check if bearer token is set
console.log('Token:', sessionStorage.getItem('bearer_token'));

// Check if org is set
console.log('Org:', sessionStorage.getItem('org'));
```

### Test API Call in Console
```javascript
// Test getting incentives
fetch('https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db/incentives/hdfc', {
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('bearer_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Incentives:', data));
```

## Using the DataService

Once configured, you can use the DataService to fetch incentives:

```typescript
import { DataService } from './services/data.service';

// In your component
constructor(private dataService: DataService) {}

ngOnInit() {
  this.dataService.getIncentives().subscribe(
    response => {
      console.log('Incentives data:', response);
      // Handle the response
    },
    error => {
      console.error('Error fetching incentives:', error);
    }
  );
}
```

## Troubleshooting

### "Organization/Brand not found in sessionStorage"
- Make sure you've set either `org` or `brandId` in sessionStorage
- Check spelling: `sessionStorage.setItem('org', 'hdfc');`

### "401 Unauthorized"
- Your bearer token may be expired or invalid
- Get a fresh token and update sessionStorage
- Refresh the page after updating

### API calls not working
1. Open DevTools Network tab
2. Check if Authorization header is present
3. Verify the URL includes your organization (e.g., `/incentives/hdfc`)
4. Check the response for error details

## Security Notes

- **sessionStorage** is used instead of localStorage for security
- Tokens are automatically cleared when you close the browser tab
- Tokens are not accessible across different tabs/windows
- Never commit actual tokens to your code repository

## Development vs Production

### Development
- Use the steps above to manually set tokens
- Tokens remain valid until browser tab is closed

### Production
- Tokens should be obtained via OAuth/OIDC flow
- The application will automatically store tokens in sessionStorage
- No manual intervention needed

## Additional Configuration

To change the organization/brand:
```javascript
// Change to a different organization
sessionStorage.setItem('org', 'icici');
// Refresh the page to use the new organization
```

To clear all data and start fresh:
```javascript
sessionStorage.clear();
// Refresh and set new values
```
