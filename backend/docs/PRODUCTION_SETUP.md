# Production Setup Guide

Complete guide to setting up the Grassland Resilience Navigator backend for production deployment.

## Prerequisites

- Node.js 22.x or higher
- npm or yarn
- Vercel account (for deployment)
- Google Cloud account (for Earth Engine)
- NASA Earthdata account

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Google Earth Engine

**Why:** Required for real-time NDVI data and tile generation

**Guide:** See [gee-service-account-setup.md](./gee-service-account-setup.md)

**Steps:**
1. Create GEE service account in Google Cloud Console
2. Download JSON key file
3. Register service account with Earth Engine
4. Extract credentials to .env

**Environment Variables:**
```bash
GEE_PROJECT_ID=your-project-id
GEE_SERVICE_ACCOUNT=your-sa@your-project.iam.gserviceaccount.com
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
USE_GEE_TEMPORAL=true
```

**Test:**
```bash
npm run test:gee
```

### 3. Get NASA FIRMS API Key

**Why:** Required for real-time fire detection data

**Guide:** See [firms-api-setup.md](./firms-api-setup.md)

**Steps:**
1. Visit https://firms.modaps.eosdis.nasa.gov/api/
2. Request MAP_KEY
3. Check email for API key
4. Add to .env

**Environment Variable:**
```bash
FIRMS_API_KEY=your-firms-api-key-here
```

**Test:**
```bash
curl "http://localhost:3000/api/firms-fires"
```

### 4. Set Up API Authentication (Optional but Recommended)

**Why:** Protect your API in production

**Guide:** See [api-authentication.md](./api-authentication.md)

**Steps:**
1. Generate API key
2. Add to .env and Vercel
3. Configure frontend to use key

**Generate Key:**
```bash
npm run generate:apikey
```

**Environment Variables:**
```bash
API_AUTH_ENABLED=true
API_KEYS=your-generated-key-here
```

**Test:**
```bash
curl -H "X-API-Key: your-key" http://localhost:3000/api/temporal-data?lat=53&lng=-7
```

### 5. Configure Vercel Deployment

**Add Environment Variables in Vercel:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add all production variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEE_PROJECT_ID` | `your-project-id` | From Google Cloud |
| `GEE_SERVICE_ACCOUNT` | `your-sa@...` | Service account email |
| `GEE_PRIVATE_KEY` | `"-----BEGIN...` | Full private key with \n |
| `USE_GEE_TEMPORAL` | `true` | Enable GEE temporal data |
| `FIRMS_API_KEY` | `your-firms-key` | From NASA FIRMS |
| `API_AUTH_ENABLED` | `true` | Enable authentication |
| `API_KEYS` | `key1,key2` | Your API keys |
| `NODE_ENV` | `production` | Environment |

3. Apply to: **Production**, **Preview**, **Development**

4. Click **Save**

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 7. Test Production Deployment

**Health Check:**
```bash
curl https://your-domain.vercel.app/api/health
```

**NDVI Tiles (with API key):**
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://your-domain.vercel.app/api/ndvi-anomaly"
```

**Temporal Data:**
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://your-domain.vercel.app/api/temporal-data?lat=53.5&lng=-7.5"
```

**FIRMS Fires:**
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://your-domain.vercel.app/api/firms-fires"
```

## Verification Checklist

- [ ] GEE authentication working (`npm run test:gee` passes)
- [ ] FIRMS API key configured and returning data
- [ ] API authentication enabled and working
- [ ] All environment variables set in Vercel
- [ ] Production deployment successful
- [ ] Health endpoint returning 200
- [ ] NDVI tiles loading correctly
- [ ] Temporal data returning real GEE data (check `dataSource` field)
- [ ] FIRMS fires returning real data (check `placeholder: false`)

## Troubleshooting

### GEE Authentication Fails

**Symptoms:**
- `npm run test:gee` fails
- Temporal data returns simulated data
- Logs show "GEE initialization failed"

**Solutions:**
1. Check `GEE_PRIVATE_KEY` format (must include `\n` newlines)
2. Verify service account email is correct
3. Ensure service account is registered with Earth Engine
4. Wait 24-48 hours after service account creation
5. Check Google Cloud Console for service account status

### FIRMS API Returns No Data

**Symptoms:**
- `/api/firms-fires` returns empty features array
- Response has `placeholder: true`

**Solutions:**
1. Verify `FIRMS_API_KEY` is set correctly
2. Test key directly: `curl "https://firms.modaps.eosdis.nasa.gov/api/country/json/YOUR_KEY/VIIRS_SNPP_NRT/IRL/1"`
3. Check if there are actually fires in Ireland (use FIRMS fire map)
4. Try increasing `days` parameter: `/api/firms-fires?days=3`

### API Authentication Not Working

**Symptoms:**
- Requests succeed without API key
- Getting 401/403 unexpectedly

**Solutions:**
1. Check `API_AUTH_ENABLED=true` is set
2. Verify `API_KEYS` contains valid keys (comma-separated, no spaces)
3. Ensure header is `X-API-Key` (case-sensitive)
4. Redeploy after changing environment variables
5. Check Vercel logs for authentication messages

### Vercel Deployment Fails

**Symptoms:**
- Build fails
- Functions timeout
- Module not found errors

**Solutions:**
1. Ensure `package.json` has all dependencies
2. Check Node.js version is 22.x
3. Verify `vercel.json` routes are correct
4. Check Vercel function logs for specific errors
5. Test locally first: `npm run dev`

## Performance Optimization

### Caching Strategy

**GEE Map IDs:** 24-hour cache (reduces GEE API calls)
```javascript
// Cached in serverless/api/ndvi-tiles.js
const CACHE_DURATION = 24 * 60 * 60 * 1000;
```

**FIRMS Data:** 3-hour cache (matches NASA update frequency)
```javascript
// Cached in serverless/api/firms-fires.js
const CACHE_DURATION = 3 * 60 * 60 * 1000;
```

**Temporal Data:** No cache (real-time queries)

### Monitoring

**Recommended Tools:**
- **Vercel Analytics:** Built-in (enable in Vercel dashboard)
- **Sentry:** Error tracking (add `@sentry/node`)
- **LogDNA/DataDog:** Log aggregation

**Key Metrics to Monitor:**
- API response times
- GEE map ID generation failures
- FIRMS API errors
- Authentication failures
- Function execution duration

## Security Checklist

- [ ] API keys stored in environment variables (not code)
- [ ] GEE private key secured
- [ ] API authentication enabled in production
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS configured appropriately
- [ ] Sensitive data not logged
- [ ] Rate limiting considered (optional for MVP)
- [ ] Security headers configured

## Maintenance

### Regular Tasks

**Weekly:**
- Check Vercel logs for errors
- Monitor API usage
- Verify FIRMS data is updating

**Monthly:**
- Review API key usage
- Check GEE quota usage
- Update dependencies (`npm outdated`)

**Quarterly:**
- Rotate API keys
- Security audit
- Performance review
- Update documentation

### Updating the Backend

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Test locally
npm run dev

# Deploy to production
vercel --prod
```

## Rollback Procedure

If deployment fails:

1. **Quick Rollback:**
```bash
# In Vercel Dashboard: Deployments → Previous Deployment → Promote to Production
```

2. **Code Rollback:**
```bash
git revert HEAD
git push origin main
vercel --prod
```

3. **Environment Variable Rollback:**
- Revert changes in Vercel Dashboard → Settings → Environment Variables
- Redeploy

## Support & Resources

**Documentation:**
- [API Documentation](./API_DOCUMENTATION.md)
- [GEE Setup](./gee-service-account-setup.md)
- [FIRMS Setup](./firms-api-setup.md)
- [API Authentication](./api-authentication.md)

**External Resources:**
- Vercel Docs: https://vercel.com/docs
- GEE Docs: https://developers.google.com/earth-engine
- FIRMS API: https://firms.modaps.eosdis.nasa.gov/api/

**Getting Help:**
- GitHub Issues: [Your repo]/issues
- Email: support@your-domain.com

---

**Last Updated:** 2025-01-08
**Version:** 1.1.0
