# NASA FIRMS API Setup Guide

## Overview
NASA FIRMS (Fire Information for Resource Management System) provides near real-time active fire data from MODIS and VIIRS satellites.

## Getting Your FIRMS API Key

### Step 1: Visit FIRMS Website
Go to: https://firms.modaps.eosdis.nasa.gov/api/

### Step 2: Request API Key (MAP_KEY)
1. Click on **"Request a MAP_KEY"**
2. Fill out the form:
   - **Email Address:** Your valid email
   - **Organization/Institution:** Your organization name (e.g., "Grassland Resilience Navigator")
   - **Intended Use:** Briefly describe your use case
     - Example: *"Real-time grassland fire monitoring for agricultural decision support in Ireland"*
3. Click **Submit**

### Step 3: Check Your Email
- You'll receive an email with your MAP_KEY within a few minutes
- The key looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Save this key** - you'll need it for the .env file

### Step 4: Verify Your Key
Test your API key with this example URL (replace YOUR_KEY):
```
https://firms.modaps.eosdis.nasa.gov/api/country/csv/YOUR_KEY/VIIRS_SNPP_NRT/IRL/1
```

This should return CSV data for Ireland fires in the last 1 day.

## Add to .env File

Add this line to your `.env` file:
```bash
FIRMS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Add to Vercel Environment Variables

In Vercel dashboard:
1. Go to: **Settings** → **Environment Variables**
2. Add:
   - **Key:** `FIRMS_API_KEY`
   - **Value:** `your-actual-key-here`
3. Apply to: **Production**, **Preview**, and **Development**
4. Click **Save**
5. **Important:** Redeploy your application for changes to take effect

## FIRMS API Endpoints

### Country Endpoint (Recommended for Ireland)
```
https://firms.modaps.eosdis.nasa.gov/api/country/{format}/{MAP_KEY}/{source}/{country_code}/{dayrange}
```

**Parameters:**
- `format`: `csv`, `json`, or `geojson`
- `MAP_KEY`: Your API key
- `source`: `VIIRS_SNPP_NRT`, `VIIRS_NOAA20_NRT`, or `MODIS_NRT`
- `country_code`: `IRL` (Ireland)
- `dayrange`: Number of days (1-10)

**Example:**
```
https://firms.modaps.eosdis.nasa.gov/api/country/geojson/YOUR_KEY/VIIRS_SNPP_NRT/IRL/1
```

### Area Endpoint (Custom Bounding Box)
```
https://firms.modaps.eosdis.nasa.gov/api/area/{format}/{MAP_KEY}/{source}/{area}/{dayrange}/{date}
```

**Ireland Bounding Box:**
```
https://firms.modaps.eosdis.nasa.gov/api/area/geojson/YOUR_KEY/VIIRS_SNPP_NRT/-10.5,51.5,-6.0,55.5/1
```

Format: `min_lng,min_lat,max_lng,max_lat`

## Data Sources

### VIIRS_SNPP_NRT (Recommended)
- **Satellite:** Suomi NPP
- **Resolution:** 375m
- **Update Frequency:** Every 3 hours
- **Latency:** ~3 hours

### VIIRS_NOAA20_NRT
- **Satellite:** NOAA-20
- **Resolution:** 375m
- **Update Frequency:** Every 3 hours
- **Latency:** ~3 hours

### MODIS_NRT
- **Satellites:** Terra & Aqua
- **Resolution:** 1km
- **Update Frequency:** Every 3 hours
- **Latency:** ~3 hours

## Response Fields

### GeoJSON Response
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-7.5, 53.5]
      },
      "properties": {
        "latitude": 53.5,
        "longitude": -7.5,
        "bright_ti4": 320.5,
        "scan": 0.4,
        "track": 0.4,
        "acq_date": "2024-01-15",
        "acq_time": "1430",
        "satellite": "N",
        "confidence": "nominal",
        "version": "2.0NRT",
        "bright_ti5": 290.3,
        "frp": 12.5,
        "daynight": "D"
      }
    }
  ]
}
```

### Important Fields
- `latitude` / `longitude`: Fire location
- `bright_ti4`: Brightness temperature (Kelvin)
- `frp`: Fire Radiative Power (MW) - fire intensity
- `confidence`: Detection confidence (low/nominal/high)
- `acq_date` / `acq_time`: Acquisition date/time (UTC)
- `daynight`: Day (D) or Night (N) detection

## Rate Limits

- **Requests per hour:** 1000 (generous)
- **Daily limit:** Check FIRMS documentation
- **Recommended caching:** 3-6 hours (matches FIRMS update frequency)

## Best Practices

1. **Cache responses** for 3 hours (FIRMS update frequency)
2. **Use country endpoint** for Ireland (more efficient than area)
3. **Combine sources** (VIIRS + MODIS) for better coverage
4. **Filter by confidence** - use "nominal" or "high" only
5. **Set reasonable dayrange** - 1-2 days is usually sufficient

## Testing

Test your integration:
```bash
# Test FIRMS API endpoint
curl "https://firms.modaps.eosdis.nasa.gov/api/country/json/YOUR_KEY/VIIRS_SNPP_NRT/IRL/1"

# Test your backend endpoint (after implementation)
curl "http://localhost:3000/api/firms-fires"
```

## Troubleshooting

### Invalid MAP_KEY
- Double-check key in .env file
- Ensure no extra spaces or quotes
- Verify key is activated (check email)

### No Data Returned
- Try increasing dayrange (1 → 3 days)
- Check if there are actually fires in Ireland recently
- Verify bounding box coordinates

### Rate Limit Exceeded
- Implement caching (3-6 hour cache recommended)
- Reduce polling frequency
- Use single source instead of multiple

## Resources

- **FIRMS Website:** https://firms.modaps.eosdis.nasa.gov/
- **API Documentation:** https://firms.modaps.eosdis.nasa.gov/api/
- **Fire Map:** https://firms.modaps.eosdis.nasa.gov/map/
- **Support:** support@earthdata.nasa.gov

---

**Last Updated:** 2025-01-08
