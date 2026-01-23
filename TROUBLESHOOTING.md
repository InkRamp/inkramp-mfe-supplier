# Troubleshooting: API Not Firing

If you've set the sessionStorage values but the API is not firing, follow these steps:

## Step 1: Verify sessionStorage is Set Correctly

Open your browser DevTools Console and run:

```javascript
// Check both values
console.log('Token:', sessionStorage.getItem('bearer_token'));
console.log('Org:', sessionStorage.getItem('org'));
```

**Expected output:**
- Token should show your JWT token
- Org should show "hdfc" (or your organization name)

## Step 2: Verify Network Requests

1. Open DevTools **Network** tab
2. Refresh the page
3. Look for a request to: `https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db/incentives/hdfc`

**If you don't see the request:**
- The app might not be calling the API
- Check the console for errors

## Step 3: Check for Console Errors

Look in the Console tab for errors like:
- `Organization/Brand not found in sessionStorage` - means you need to set 'org' or 'brandId'
- `401 Unauthorized` - means your token is invalid or expired
- CORS errors - means the API needs to allow your origin

## Step 4: Test API Manually

Test the API directly in the console:

```javascript
fetch('https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db/incentives/hdfc', {
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('bearer_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Step 5: Check the App is Loading Incentives

The app should automatically call the incentives API when it loads. You should see:

**In the Console:**
```
In mfe-MY_SALES constructor
IN ngOnInit of mfe-MY_SALES
Loading incentives from API...
Incentives API response: { ... }
```

**In the UI:**
- An "API Status" section at the top
- Either "✅ API Connected Successfully!" with data
- Or "❌ Error:" with an error message

## Common Issues and Solutions

### Issue: "Organization/Brand not found in sessionStorage"

**Solution:**
```javascript
sessionStorage.setItem('org', 'hdfc');
// Refresh the page
location.reload();
```

### Issue: "401 Unauthorized"

**Solution:**
1. Get a fresh token from your auth provider
2. Set it in sessionStorage:
   ```javascript
   sessionStorage.setItem('bearer_token', 'NEW_TOKEN_HERE');
   location.reload();
   ```

### Issue: CORS Error

**Solution:**
- This is an API server issue
- The API must include these headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Headers: Authorization, Content-Type
  ```

### Issue: Network request not showing

**Solution:**
1. Check if `useMockData` is set to `false` in the config
2. Ensure the app rebuilt after changes: `npm run build`
3. Clear browser cache and refresh

## Current Configuration

The app is now configured with:

```typescript
// API Configuration (enabled by default)
API_CONFIG = {
  enabled: true,
  baseUrl: 'https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db'
}

// Mock data disabled
DATA_CONFIG = {
  useMockData: false
}
```

## Verify Setup Checklist

- [ ] sessionStorage has 'bearer_token' set
- [ ] sessionStorage has 'org' set to 'hdfc'
- [ ] Page has been refreshed after setting values
- [ ] Browser DevTools Console is open to see logs
- [ ] Network tab is open to see API requests
- [ ] No console errors visible

## Still Not Working?

If the API is still not firing after following all these steps:

1. **Check the browser console** for the exact error message
2. **Check the Network tab** to see if any request is being made
3. **Share the console logs** with the exact error message
4. **Check if the token is valid** by testing it with curl or Postman

## Example Complete Setup

```javascript
// 1. Set values in console
sessionStorage.setItem('bearer_token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlkxYTVVMlY3dER2RHR4bkVjd1o5SiJ9...');
sessionStorage.setItem('org', 'hdfc');

// 2. Refresh
location.reload();

// 3. Check console output - should see:
// "Loading incentives from API..."
// "Incentives API response: {...}"

// 4. Check Network tab - should see:
// GET https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db/incentives/hdfc
// Status: 200
```
