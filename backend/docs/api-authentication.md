# API Authentication Guide

## Overview
The Grassland Resilience Navigator API supports optional API key authentication to protect your endpoints in production.

## Generating API Keys

### Option 1: Using the Generator Script
Run the included generator:
```bash
node config/api-key-generator.js
```

This will output:
```
Generated API Key: Xy9aBc3dEf4gH5iJ6kL7mN8oP9qR0sT1
Add to .env: API_KEYS=Xy9aBc3dEf4gH5iJ6kL7mN8oP9qR0sT1
```

### Option 2: Manual Generation (OpenSSL)
```bash
# Generate a random 32-character key
openssl rand -hex 16
```

### Option 3: Online Generator
Use a secure random string generator:
- https://www.uuidgenerator.net/api/guid (use raw output)
- https://1password.com/password-generator/ (32+ characters)

## Configuration

### Step 1: Add to .env File

Add these lines to your `.env` file:

```bash
# API Authentication
API_AUTH_ENABLED=true
API_KEYS=your-api-key-here,another-key-here
```

**Multiple Keys:**
Separate multiple API keys with commas (no spaces):
```bash
API_KEYS=key1,key2,key3
```

**Disable Authentication (Development):**
```bash
API_AUTH_ENABLED=false
```

### Step 2: Add to Vercel Environment Variables

In Vercel dashboard:
1. Go to: **Settings** → **Environment Variables**
2. Add:
   - **Key:** `API_AUTH_ENABLED`
   - **Value:** `true`
3. Add:
   - **Key:** `API_KEYS`
   - **Value:** `your-comma-separated-keys`
4. Apply to: **Production** (and optionally Preview/Development)
5. Click **Save**
6. **Redeploy** your application

## Usage

### Making Authenticated Requests

#### Option 1: Header (Recommended)
```bash
curl -H "X-API-Key: your-api-key-here" \
  https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5
```

#### Option 2: Query Parameter
```bash
curl "https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5&apiKey=your-api-key-here"
```

### JavaScript/Fetch Example
```javascript
// Using header
fetch('https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));

// Using query parameter
fetch('https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5&apiKey=your-api-key-here')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Frontend Integration
```javascript
const API_KEY = 'your-api-key-here'; // Store securely (env variable)
const BASE_URL = 'https://your-domain.com';

async function fetchTemporalData(lat, lng) {
  const response = await fetch(
    `${BASE_URL}/api/temporal-data?lat=${lat}&lng=${lng}`,
    {
      headers: {
        'X-API-Key': API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

## Public Endpoints

These endpoints are always public (no API key required):
- `/` - Root endpoint
- `/api/health` - Health check

All other endpoints require authentication when `API_AUTH_ENABLED=true`.

## Error Responses

### 401 Unauthorized (Missing API Key)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "API key required. Provide via X-API-Key header or apiKey query parameter.",
  "documentation": "See docs/api-authentication.md for details"
}
```

### 403 Forbidden (Invalid API Key)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Invalid API key"
}
```

## Security Best Practices

### DO:
✅ Store API keys in environment variables
✅ Use HTTPS for all API requests
✅ Rotate API keys periodically (every 90 days)
✅ Use different keys for development and production
✅ Limit API key distribution (need-to-know basis)
✅ Monitor API usage logs for suspicious activity
✅ Revoke compromised keys immediately

### DON'T:
❌ Commit API keys to Git/GitHub
❌ Share API keys in emails or chat
❌ Use the same key across multiple environments
❌ Hard-code API keys in frontend code
❌ Expose API keys in client-side JavaScript
❌ Use weak or predictable keys

## Key Rotation

### How to Rotate Keys

1. **Generate a new API key**
```bash
node config/api-key-generator.js
```

2. **Add the new key alongside the old one**
```bash
# .env
API_KEYS=old-key-here,new-key-here
```

3. **Update clients to use the new key** (gradual migration)

4. **Monitor logs** to ensure old key usage drops to zero

5. **Remove the old key**
```bash
# .env
API_KEYS=new-key-here
```

6. **Update Vercel** environment variables accordingly

## Frontend Security

### Never Expose Keys in Frontend
API keys should **NEVER** be embedded directly in frontend code that runs in the browser.

### Options for Frontend Apps:

#### Option 1: Proxy Through Your Backend
Create a backend proxy that adds the API key server-side:
```javascript
// Your backend
app.get('/proxy/temporal-data', async (req, res) => {
  const { lat, lng } = req.query;

  const response = await fetch(
    `https://grassland-api.com/api/temporal-data?lat=${lat}&lng=${lng}`,
    {
      headers: {
        'X-API-Key': process.env.API_KEY // Secure!
      }
    }
  );

  const data = await response.json();
  res.json(data);
});
```

#### Option 2: Use Environment Variables (Build Time)
For static sites (Next.js, Vite, etc.):
```javascript
// .env.local (NOT committed to Git)
NEXT_PUBLIC_API_KEY=your-key

// In your code
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

**Note:** This embeds the key in the bundle. Only use for public/demo apps.

#### Option 3: Disable Authentication (MVP/Demo)
For MVP or demo deployments:
```bash
API_AUTH_ENABLED=false
```

## Rate Limiting (Future Enhancement)

API authentication sets the foundation for rate limiting. Future updates will include:
- Per-key rate limits
- Usage analytics
- Automatic throttling
- Quota management

## Monitoring

### Check API Usage
View Vercel logs:
```bash
vercel logs
```

Look for authentication events:
```
[Auth] Valid API key: Xy9aBc3d...
[Auth] Invalid API key attempted: badkey12...
```

## Troubleshooting

### "API key required" error
- Ensure `X-API-Key` header or `apiKey` query param is included
- Check for typos in header name (case-sensitive)
- Verify the key is being sent (check network tab)

### "Invalid API key" error
- Double-check the key matches exactly (no extra spaces)
- Verify the key is in the `API_KEYS` environment variable
- Ensure Vercel environment variables are saved and deployed

### Authentication disabled but still getting errors
- Check `API_AUTH_ENABLED=false` is set
- Redeploy after changing environment variables
- Clear any caches

## Testing

### Test with curl
```bash
# Should succeed
curl -H "X-API-Key: your-real-key" \
  https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5

# Should return 401
curl https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5

# Should return 403
curl -H "X-API-Key: invalid-key" \
  https://your-domain.com/api/temporal-data?lat=53.5&lng=-7.5
```

### Test Script
Create `test-api-auth.js`:
```javascript
const API_KEY = 'your-key-here';
const BASE_URL = 'https://your-domain.com';

async function testAuth() {
  // Test with valid key
  const validResponse = await fetch(
    `${BASE_URL}/api/health`,
    { headers: { 'X-API-Key': API_KEY } }
  );
  console.log('Valid key:', validResponse.ok ? '✅' : '❌');

  // Test without key
  const noKeyResponse = await fetch(`${BASE_URL}/api/temporal-data?lat=53&lng=-7`);
  console.log('No key:', noKeyResponse.status === 401 ? '✅' : '❌');

  // Test with invalid key
  const invalidResponse = await fetch(
    `${BASE_URL}/api/temporal-data?lat=53&lng=-7`,
    { headers: { 'X-API-Key': 'invalid' } }
  );
  console.log('Invalid key:', invalidResponse.status === 403 ? '✅' : '❌');
}

testAuth();
```

---

**Last Updated:** 2025-01-08
