# Grassland Resilience Navigator - API Documentation

## Base URL

**Production:** `https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app`

**Development:** `http://localhost:3000`

---

## Overview

The Grassland Resilience Navigator API provides endpoints for accessing satellite-derived vegetation health data, soil moisture information, and active fire detection for grassland monitoring.

### Data Sources
- **NDVI Data:** NOAA VIIRS VNP13A1 (500m resolution)
- **Soil Moisture:** NASA SMAP Level 3 Daily Composites (9km resolution)
- **Active Fires:** NASA FIRMS (VIIRS/MODIS) Near Real-Time

---

## Authentication

Currently, all endpoints are **publicly accessible** (no authentication required for MVP).

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

Returns API status and available endpoints.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Grassland Resilience Navigator API",
  "version": "1.0.0",
  "endpoints": {
    "/api/health": "API health check",
    "/api/ndvi-anomaly": "NDVI Anomaly tile URL",
    "/api/smap-moisture": "SMAP Soil Moisture data",
    "/api/firms-fires": "FIRMS Active Fire data",
    "/api/temporal-data": "Time series data"
  },
  "environment": {
    "nodeVersion": "v22.20.0",
    "platform": "linux"
  }
}
```

---

### 2. NDVI Anomaly Configuration

**GET** `/api/ndvi-anomaly`

Returns configuration for the NDVI Anomaly map layer, including the proxied tile URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "ndvi-anomaly",
    "tileUrl": "https://your-domain.com/api/ndvi-tiles?z={z}&x={x}&y={y}",
    "description": "NDVI Anomaly layer showing vegetation stress (red) and health (blue)",
    "visualization": {
      "min": -3000,
      "max": 3000,
      "palette": ["darkred", "red", "orange", "yellow", "white", "lightblue", "blue", "darkblue"]
    },
    "legend": {
      "Dark Red": "Severe stress (< -2000)",
      "Red/Orange": "Moderate stress (-2000 to -1000)",
      "Yellow": "Slight stress (-1000 to -500)",
      "White": "Normal conditions (-500 to +500)",
      "Light Blue": "Slight improvement (+500 to +1000)",
      "Blue": "Moderate improvement (+1000 to +2000)",
      "Dark Blue": "Strong improvement (> +2000)"
    },
    "metadata": {
      "region": "Ireland",
      "climatologyPeriod": "2015-2024",
      "currentDate": "2024-05-24",
      "source": "NOAA VIIRS VNP13A1",
      "resolution": "500m"
    }
  }
}
```

**Frontend Usage (Leaflet):**
```javascript
const response = await fetch('/api/ndvi-anomaly');
const data = await response.json();

L.tileLayer(data.data.tileUrl, {
  attribution: 'NDVI Anomaly',
  opacity: 0.7
}).addTo(map);
```

---

### 3. NDVI Tile Proxy

**GET** `/api/ndvi-tiles?z={zoom}&x={x}&y={y}`

Proxies tile requests to Google Earth Engine. Returns PNG image tiles.

**Query Parameters:**
- `z` (required): Zoom level (integer, 0-18)
- `x` (required): Tile column (integer)
- `y` (required): Tile row (integer)

**Example:**
```
GET /api/ndvi-tiles?z=8&x=123&y=87
```

**Response:**
- Content-Type: `image/png`
- Returns PNG tile image
- Cached for 24 hours

**Error Response (400):**
```json
{
  "error": "Missing tile parameters",
  "message": "Required parameters: z (zoom), x (column), y (row)",
  "example": "/api/ndvi-tiles?z=8&x=123&y=87"
}
```

---

### 4. SMAP Soil Moisture

**GET** or **POST** `/api/smap-moisture`

Returns SMAP soil moisture layer configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "smap-soil-moisture",
    "description": "SMAP Level 3 Daily Composite - Soil Moisture",
    "wmsUrl": "https://n5eil01u.ecs.nsidc.org/SMAP",
    "dataFormat": "WMS",
    "visualization": {
      "min": 0.02,
      "max": 0.5,
      "palette": ["brown", "yellow", "lightblue", "blue", "darkblue"],
      "units": "cm³/cm³"
    },
    "legend": {
      "Brown": "Very dry soil (< 0.1)",
      "Yellow": "Dry soil (0.1 - 0.2)",
      "Light Blue": "Moderate moisture (0.2 - 0.3)",
      "Blue": "Moist soil (0.3 - 0.4)",
      "Dark Blue": "Very moist soil (> 0.4)"
    },
    "metadata": {
      "source": "NASA SMAP L3",
      "instrument": "SMAP L-Band Radiometer",
      "resolution": "9km",
      "temporalResolution": "Daily",
      "region": "Ireland"
    },
    "note": "SMAP data validates NDVI stress zones - low moisture confirms drought stress"
  }
}
```

---

### 5. FIRMS Active Fires

**GET** or **POST** `/api/firms-fires`

Returns FIRMS active fire detection configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "firms-active-fires",
    "description": "Near Real-Time Active Fire Detection",
    "apiEndpoint": "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
    "dataFormat": "GeoJSON",
    "visualization": {
      "markerColor": "red",
      "markerSize": "medium",
      "icon": "🔥"
    },
    "legend": {
      "Red Marker": "Active fire detection (last 24 hours)",
      "Size": "Indicates fire radiative power (brightness)"
    },
    "metadata": {
      "source": "NASA FIRMS (VIIRS/MODIS)",
      "instrument": "VIIRS I-Band 375m",
      "temporalResolution": "Near Real-Time (NRT)",
      "region": "Ireland",
      "updateFrequency": "Every 3 hours"
    },
    "note": "Fire risk increases in areas with prolonged drought stress (red NDVI anomaly + low SMAP moisture)"
  }
}
```

---

### 6. Temporal Data (Time Series)

**GET** `/api/temporal-data?lat={latitude}&lng={longitude}`

**POST** `/api/temporal-data`

Returns 12-month time series data for a clicked location.

**Query Parameters (GET):**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)

**Request Body (POST):**
```json
{
  "lat": 53.5,
  "lng": -7.5
}
```

**Example:**
```
GET /api/temporal-data?lat=53.5&lng=-7.5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "lat": 53.5,
      "lng": -7.5,
      "type": "Point"
    },
    "timeSeries": {
      "months": ["Jan 2024", "Feb 2024", "Mar 2024", ..., "Dec 2024"],
      "ndvi": {
        "historicalMean": [0.35, 0.42, 0.55, ..., 0.35],
        "current": [0.30, 0.38, 0.50, ..., 0.32],
        "anomaly": [-0.05, -0.04, -0.05, ..., -0.03],
        "unit": "NDVI (0-1)",
        "description": "Normalized Difference Vegetation Index"
      },
      "soilMoisture": {
        "values": [0.25, 0.28, 0.32, ..., 0.24],
        "unit": "cm³/cm³",
        "description": "Volumetric Soil Moisture"
      }
    },
    "metadata": {
      "source": "NOAA VIIRS VNP13A1 & NASA SMAP L3",
      "temporalResolution": "Monthly",
      "climatologyPeriod": "2015-2024",
      "currentYear": "2024",
      "region": "Ireland",
      "note": "MVP implementation - Production will use real-time GEE API sampling"
    },
    "interpretation": {
      "averageAnomaly": -0.042,
      "trend": "Declining vegetation health",
      "riskLevel": "Moderate Risk"
    }
  }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid coordinates",
  "message": "Please provide valid lat and lng parameters",
  "example": "GET /api/temporal-data?lat=53.5&lng=-7.5 or POST with body: {\"lat\": 53.5, \"lng\": -7.5}"
}
```

**Frontend Usage (Chart.js):**
```javascript
// User clicks on map at lat=53.5, lng=-7.5
const response = await fetch(`/api/temporal-data?lat=53.5&lng=-7.5`);
const data = await response.json();

// Create chart
new Chart(ctx, {
  type: 'line',
  data: {
    labels: data.data.timeSeries.months,
    datasets: [
      {
        label: 'Historical Mean',
        data: data.data.timeSeries.ndvi.historicalMean,
        borderColor: 'gray'
      },
      {
        label: 'Current NDVI',
        data: data.data.timeSeries.ndvi.current,
        borderColor: 'blue'
      }
    ]
  }
});
```

---

## Error Handling

All endpoints return consistent error responses:

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## CORS

All endpoints include CORS headers allowing cross-origin requests:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Rate Limiting

**Current:** No rate limiting (MVP)

**Production:** Will implement rate limiting (TBD)

---

## Caching

- **Tile Proxy:** 24-hour cache (`Cache-Control: public, max-age=86400`)
- **Other Endpoints:** No caching (real-time data)

---

## Notes for Production

### Current MVP Limitations:
1. **Temporal Data:** Uses generated sample data based on location. Production will use real GEE API sampling.
2. **FIRMS Data:** Returns placeholder structure. Production will fetch live fire data from FIRMS API.
3. **Authentication:** Currently public. Production should implement API keys or OAuth.
4. **Rate Limiting:** Not implemented. Should add in production.
5. **GEE Tile URLs:** Manually generated. Production should implement dynamic URL generation via GEE Python API.

### Recommended Improvements:
1. Implement GEE Python API for dynamic tile URL generation
2. Add Redis caching for frequently accessed data
3. Implement WebSocket support for real-time fire alerts
4. Add pagination for large datasets
5. Implement user-specific data filtering
6. Add analytics tracking
7. Set up monitoring and alerting (e.g., Sentry, DataDog)

---

## Support

For issues or questions, contact the development team or create an issue in the GitHub repository.

---

**Last Updated:** 2025-01-01

**API Version:** 1.0.0
