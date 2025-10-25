# Earthdata Login Setup Guide

## Overview
NASA's Earthdata Login is a centralized authentication system required to access NASA's Earth observation data, including:
- LANCE (Land, Atmosphere Near real-time Capability for EOS)
- GIBS (Global Imagery Browse Services)
- SMAP DAAC (Soil Moisture Active Passive Data Archive)
- VIIRS and MODIS data products

## Step-by-Step Setup

### 1. Register for Earthdata Account

1. Go to: https://urs.earthdata.nasa.gov/users/new
2. Fill in required information:
   - Username
   - Email address
   - Password
   - Organization
   - Country
3. Accept terms and conditions
4. Click "Register"

### 2. Verify Your Email

1. Check your email inbox for verification message from NASA
2. Click the verification link
3. Confirm your account is active

### 3. Generate Application Token

1. Log in at: https://urs.earthdata.nasa.gov/
2. Go to your profile (click your username)
3. Navigate to: "My Applications" → "Generate Token"
4. Copy the generated token (you'll need this for API access)
5. **IMPORTANT:** Save this token securely - you won't be able to see it again!

### 4. Approve Required Applications

To access specific NASA data services, you need to approve applications:

#### For LANCE (Near Real-Time Data):
1. Go to: https://urs.earthdata.nasa.gov/users/[your_username]/authorized_apps
2. Search for "LANCE"
3. Click "Approve" for LANCE applications

#### For SMAP Data:
1. Search for "NSIDC" (National Snow and Ice Data Center)
2. Approve NSIDC applications

#### For GIBS:
1. Search for "GIBS"
2. Approve GIBS Earthdata Search

### 5. Configure Your Environment

1. Open `backend/.env` file
2. Fill in your credentials:
   ```
   EARTHDATA_USERNAME=your_actual_username
   EARTHDATA_PASSWORD=your_actual_password
   EARTHDATA_TOKEN=your_generated_token
   ```

### 6. Test Your Access

Run the test script to verify your credentials work:

```bash
cd backend
node config/test-earthdata-auth.js
```

## API Authentication Methods

### Method 1: Basic Authentication (Username + Password)
```javascript
const response = await fetch(NASA_API_URL, {
  headers: {
    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  }
});
```

### Method 2: Bearer Token (Recommended)
```javascript
const response = await fetch(NASA_API_URL, {
  headers: {
    'Authorization': `Bearer ${EARTHDATA_TOKEN}`
  }
});
```

## Common Issues & Solutions

### Issue: "Invalid Credentials"
- **Solution:** Verify username/password are correct
- Re-generate token if needed

### Issue: "Access Denied to Data Product"
- **Solution:** Make sure you've approved the specific application
- Check: https://urs.earthdata.nasa.gov/users/[username]/authorized_apps

### Issue: "Token Expired"
- **Solution:** Generate a new token
- Update `.env` file with new token

## Security Best Practices

1. ✅ **NEVER** commit `.env` file to git
2. ✅ Always use `.env.example` as a template
3. ✅ Rotate tokens periodically (every 90 days)
4. ✅ Use environment variables in production
5. ✅ Store tokens in secure credential management systems

## Useful Links

- **Earthdata Login Home:** https://urs.earthdata.nasa.gov/
- **Earthdata Documentation:** https://urs.earthdata.nasa.gov/documentation
- **LANCE Data Access:** https://earthdata.nasa.gov/earth-observation-data/near-real-time
- **GIBS Documentation:** https://nasa-gibs.github.io/gibs-api-docs/

## Next Steps

After completing this setup:
- ✅ Credentials configured in `.env`
- ➡️ Proceed to: GEE (Google Earth Engine) setup
- ➡️ Test API access with sample requests