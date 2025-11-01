# Grassland Resilience Navigator - Backend API

NASA Space Apps Challenge 2024 - Grassland Health Monitoring System

## Overview

This backend provides RESTful API endpoints for the Grassland Resilience Navigator, serving satellite-derived vegetation health data, soil moisture information, and active fire detection for real-time grassland monitoring.

## Tech Stack

- **Runtime:** Node.js 22.x
- **Framework:** Express.js
- **Deployment:** Vercel Serverless Functions
- **Data Sources:**
  - Google Earth Engine (NDVI data)
  - NASA SMAP (Soil Moisture)
  - NASA FIRMS (Active Fires)
  - NASA Earthdata

## Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm or yarn
- Vercel CLI (for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create .env file (if needed)
cp .env.example .env
```

### Development

```bash
# Start local development server
npm run dev

# The API will be available at http://localhost:3000
```

### Testing

```bash
# Test Earthdata authentication
npm run test:auth

# Manual endpoint testing
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ndvi-anomaly
curl "http://localhost:3000/api/temporal-data?lat=53.5&lng=-7.5"
```

### Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Project Structure

```
backend/
├── serverless/
│   ├── api/
│   │   ├── health.js              # Health check endpoint
│   │   ├── ndvi-anomaly.js        # NDVI layer configuration
│   │   ├── ndvi-tiles.js          # GEE tile proxy
│   │   ├── smap-moisture.js       # Soil moisture endpoint
│   │   ├── firms-fires.js         # Active fire endpoint
│   │   └── temporal-data.js       # Time series data
│   ├── dev-server.js              # Local development server
│   └── index.js                   # Root endpoint
├── config/
│   └── test-earthdata-auth.js     # Earthdata auth test
├── docs/
│   ├── API_DOCUMENTATION.md       # Complete API docs
│   └── earthdata-setup.md         # Earthdata setup guide
├── package.json
├── vercel.json                    # Vercel configuration
└── README.md
```

## API Endpoints

### Base URL

**Production:** `https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app`

**Local:** `http://localhost:3000`

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | API health check |
| `/api/ndvi-anomaly` | GET | NDVI layer configuration (proxied) |
| `/api/ndvi-tiles?z={z}&x={x}&y={y}` | GET | NDVI tile proxy |
| `/api/smap-moisture` | GET/POST | SMAP soil moisture configuration |
| `/api/firms-fires` | GET/POST | FIRMS active fire data |
| `/api/temporal-data?lat={lat}&lng={lng}` | GET/POST | Time series data for location |

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for detailed endpoint documentation.

## Environment Variables

Currently, the MVP uses hardcoded configurations. For production, add these to `.env`:

```bash
# NASA Earthdata (if needed)
EARTHDATA_USERNAME=your_username
EARTHDATA_PASSWORD=your_password

# Google Earth Engine (if implementing dynamic tile generation)
GEE_SERVICE_ACCOUNT=your_service_account
GEE_PRIVATE_KEY=your_private_key

# FIRMS API (if implementing real-time fire data)
FIRMS_API_KEY=your_api_key

# Node Environment
NODE_ENV=production
```

## Data Sources & Attribution

### NDVI Data
- **Source:** NOAA VIIRS VNP13A1
- **Resolution:** 500m
- **Update Frequency:** 16-day composite
- **Coverage:** Global
- **Climatology Period:** 2015-2024

### Soil Moisture
- **Source:** NASA SMAP Level 3
- **Resolution:** 9km
- **Update Frequency:** Daily
- **Coverage:** Global (excluding polar regions)

### Active Fires
- **Source:** NASA FIRMS (VIIRS/MODIS)
- **Resolution:** 375m (VIIRS I-Band)
- **Update Frequency:** Near Real-Time (every 3 hours)
- **Coverage:** Global

## Architecture

### Tile Proxy Flow

```
Frontend Request
    ↓
/api/ndvi-anomaly (Get tile URL)
    ↓
Frontend Leaflet Map
    ↓
/api/ndvi-tiles?z={z}&x={x}&y={y}
    ↓
Backend Proxy (fetch from GEE)
    ↓
Google Earth Engine
    ↓
PNG Tile → Frontend
```

### Why Proxy Tiles?

1. **Security:** Hides GEE URLs from frontend
2. **Control:** Add rate limiting, authentication, logging
3. **Caching:** 24-hour cache reduces GEE requests
4. **Flexibility:** Easy to swap data sources

## Performance Optimizations

1. **Tile Caching:** 24-hour cache on tile proxy (`Cache-Control: public, max-age=86400`)
2. **Serverless Functions:** Auto-scaling with Vercel
3. **CDN Distribution:** Vercel Edge Network
4. **Efficient Data Formats:** JSON for configs, binary for tiles

## Development Roadmap

### Phase 1: Foundation (Days 1-5) ✅ COMPLETE
- [x] Data access setup (Earthdata, GEE)
- [x] Serverless proxy setup
- [x] Basic endpoints

### Phase 2: Core Visualization (Days 6-10) ✅ COMPLETE
- [x] NDVI Anomaly endpoint
- [x] SMAP Soil Moisture endpoint
- [x] Tile proxy implementation

### Phase 3: Interactivity (Days 11-15) ✅ COMPLETE
- [x] Temporal data endpoint
- [x] FIRMS fire data structure

### Phase 4: Polish & Testing (Days 16-20) 🔄 IN PROGRESS
- [x] Comprehensive documentation
- [ ] Performance optimization
- [ ] Final testing
- [ ] Deployment

## Known Limitations (MVP)

1. **Temporal Data:** Uses generated sample data. Production needs real GEE API integration.
2. **FIRMS Data:** Placeholder structure. Needs live API integration.
3. **No Authentication:** Currently public API. Production should add API keys.
4. **No Rate Limiting:** Should implement in production.
5. **Manual GEE URLs:** Tile URLs are manually generated. Should automate via GEE Python API.

## Production Deployment Checklist

- [ ] Implement real GEE API sampling for temporal data
- [ ] Integrate live FIRMS API
- [ ] Add API authentication (API keys or OAuth)
- [ ] Implement rate limiting
- [ ] Set up monitoring (Sentry/DataDog)
- [ ] Add Redis caching layer
- [ ] Implement dynamic GEE tile URL generation
- [ ] Set up CI/CD pipeline
- [ ] Add automated tests
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation review

## Testing

### Manual Testing

```bash
# Health check
curl https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/health

# NDVI configuration
curl https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/ndvi-anomaly

# Temporal data for Ireland
curl "https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/temporal-data?lat=53.5&lng=-7.5"

# Tile proxy (view in browser)
https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/ndvi-tiles?z=8&x=123&y=87
```

## Troubleshooting

### Common Issues

**Issue:** `Cannot find module 'node-fetch'`
```bash
# Solution: Install dependencies
npm install
```

**Issue:** `vercel: command not found`
```bash
# Solution: Install Vercel CLI globally
npm install -g vercel
```

**Issue:** Tiles not loading
```bash
# Check if GEE URL is still valid (they expire)
# Update the URL in serverless/api/ndvi-tiles.js
```

**Issue:** CORS errors
```bash
# All endpoints have CORS enabled
# Check browser console for specific error
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

---

**Built for NASA Space Apps Challenge 2024**

**Team:** Grassland Resilience Navigator

**Last Updated:** January 2025
