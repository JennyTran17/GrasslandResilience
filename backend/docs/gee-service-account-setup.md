# Google Earth Engine Service Account Setup

## Overview
To use the GEE API server-side, you need a service account with credentials.

## Steps to Create GEE Service Account

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select Your GEE Project
- In the project dropdown (top left), select: `noble-anvil-476021-m6`
- Or create a new project if needed

### 3. Enable Earth Engine API
- Navigate to: **APIs & Services** → **Library**
- Search for "Earth Engine API"
- Click **Enable**

### 4. Create Service Account
- Navigate to: **IAM & Admin** → **Service Accounts**
- Click **Create Service Account**
- Fill in details:
  - **Name:** `grassland-resilience-sa`
  - **Description:** `Service account for Grassland Resilience Navigator backend`
- Click **Create and Continue**

### 5. Grant Permissions
- **Role:** Select `Project > Editor` or `Earth Engine > Earth Engine Resource Writer`
- Click **Continue** → **Done**

### 6. Create JSON Key
- Click on your newly created service account
- Go to **Keys** tab
- Click **Add Key** → **Create new key**
- Select **JSON** format
- Click **Create**
- A JSON file will download automatically

### 7. Register Service Account with Earth Engine
**Important:** Service accounts must be registered with Earth Engine separately.

#### Option A: Via GEE Code Editor (Web)
1. Go to: https://code.earthengine.google.com/
2. Open the **Scripts** panel
3. Run this script:
```javascript
// Get your service account email from the JSON file
var serviceAccountEmail = 'grassland-resilience-sa@noble-anvil-476021-m6.iam.gserviceaccount.com';

// Request access (this may require manual approval from GEE team)
print('Service account email: ' + serviceAccountEmail);
print('Email this address to earthengine-signup@google.com requesting Earth Engine access');
```

#### Option B: Via Command Line (if you have gcloud CLI)
```bash
# Authenticate
gcloud auth login

# Grant Earth Engine access to service account
earthengine set_project noble-anvil-476021-m6
earthengine authenticate

# Register service account
gcloud projects add-iam-policy-binding noble-anvil-476021-m6 \
  --member="serviceAccount:grassland-resilience-sa@noble-anvil-476021-m6.iam.gserviceaccount.com" \
  --role="roles/earthengine.writer"
```

### 8. Extract Credentials for .env

Open the downloaded JSON file. It looks like:
```json
{
  "type": "service_account",
  "project_id": "noble-anvil-476021-m6",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "grassland-resilience-sa@noble-anvil-476021-m6.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 9. Add to .env File

Add these lines to your `.env` file:

```bash
# Google Earth Engine Service Account
GEE_SERVICE_ACCOUNT=grassland-resilience-sa@noble-anvil-476021-m6.iam.gserviceaccount.com
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FULL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GEE_PROJECT_ID=noble-anvil-476021-m6
```

**Important:** Keep the newlines (`\n`) in the private key as-is.

### 10. Add to Vercel Environment Variables

In Vercel dashboard:
1. Go to your project: **Settings** → **Environment Variables**
2. Add:
   - `GEE_SERVICE_ACCOUNT` = `grassland-resilience-sa@noble-anvil-476021-m6.iam.gserviceaccount.com`
   - `GEE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`
   - `GEE_PROJECT_ID` = `noble-anvil-476021-m6`
3. Apply to: **Production**, **Preview**, and **Development**
4. Click **Save**

## Testing

Test your setup locally:
```bash
node config/test-gee-auth.js
```

## Security Notes

- **Never commit the JSON key file to Git**
- Add `*-key.json` to `.gitignore`
- Rotate keys periodically
- Use separate service accounts for development and production

## Troubleshooting

### "Service account does not have Earth Engine access"
- Wait 24-48 hours after registration
- Email earthengine-signup@google.com if access not granted

### "Private key format error"
- Ensure newlines are preserved as `\n`
- Don't add extra quotes or spaces
- Copy the entire key including BEGIN/END markers

### "Project not found"
- Verify GEE_PROJECT_ID matches your Cloud Console project ID
- Ensure Earth Engine API is enabled for the project

## Quick Reference

**Service Account Email Format:**
```
your-sa-name@your-project-id.iam.gserviceaccount.com
```

**Private Key Format:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n
```

---

**Last Updated:** 2025-01-08
