🌍 Grassland Resilience Navigator

## What We Built

A complete web application that monitors grassland health across Ireland using NASA satellite data:
- **Frontend**: Interactive map with layer controls, field management, and user authentication
- **Backend**: NASA satellite data API with real-time processing
- **Data Sources**: NDVI Anomaly, Soil Moisture, Active Fires, Risk Assessment

---

## 🌐 Live Application

**Frontend**: Interactive web application with map interface
**Backend API Base URL**: https://grassland-resilience.vercel.app

### Available API Endpoints

#### 1. Health Check
GET https://grassland-resilience.vercel.app/api/health

#### 2. NDVI Anomaly (Vegetation Stress)
GET https://grassland-resilience.vercel.app/api/ndvi-anomaly
Returns tile URL for vegetation stress mapping

#### 3. SMAP Soil Moisture  
GET https://grassland-resilience.vercel.app/api/smap-moisture
Returns soil moisture visualization data

#### 4. FIRMS Active Fires
GET https://grassland-resilience.vercel.app/api/firms-fires
Returns active fire detection data

#### 5. Risk Assessment
POST https://grassland-resilience.vercel.app/api/risk-score
Calculates resilience risk score for coordinates

#### 6. Temporal Data
GET https://grassland-resilience.vercel.app/api/temporal-data
Returns time series data for location analysis

---

## 💻 Development Setup

### Frontend Setup
```bash
cd grassland-navigator
npm install
npm run dev
```
Access at: http://localhost:3000

### Backend Setup
```bash
cd backend
npm install
node serverless/dev-server.js
```
API at: http://localhost:3000/api/

### Environment Variables
Create `.env.local` in frontend and `.env` in backend with:
- Firebase configuration
- NASA Earthdata credentials
- Google Earth Engine service account

### Deploy
```bash
# Frontend
cd grassland-navigator && vercel --prod

# Backend  
cd backend && vercel --prod
```


---

## 📂 Project Structure

```
GrasslandResilience/
├── grassland-navigator/          # Frontend (Next.js)
│   ├── components/              # React components
│   │   ├── BaseMapInner.jsx    # Main map component
│   │   ├── LayerControls.jsx   # Layer toggle controls
│   │   ├── TemporalModal.jsx   # Time series charts
│   │   └── FieldList.jsx       # Saved fields management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API utilities & Firebase
│   └── pages/                  # Next.js pages
├── backend/                     # Backend API
│   ├── serverless/api/         # Vercel serverless functions
│   │   ├── ndvi-anomaly.js     # Vegetation stress
│   │   ├── smap-moisture.js    # Soil moisture
│   │   ├── firms-fires.js      # Active fires
│   │   ├── risk-score.js       # Risk assessment
│   │   └── temporal-data.js    # Time series data
│   ├── gee-scripts/            # Google Earth Engine scripts
│   └── vercel.json             # Deployment config
└── README.md
```


---

## 🎯 Key Features

### Frontend Application
- **Interactive Map**: Leaflet-based map with multiple satellite data layers
- **Layer Controls**: Toggle NDVI, soil moisture, precipitation, and fire layers
- **Click Analysis**: Click anywhere to get risk scores and temporal data
- **Field Management**: Save and manage field locations with Firebase
- **User Authentication**: Firebase Auth for user accounts
- **Responsive Design**: Works on desktop and mobile devices

### Backend API
- **Real-time Data**: NASA satellite data processing via Google Earth Engine
- **Risk Assessment**: AI-powered resilience scoring algorithm
- **Temporal Analysis**: Historical trend analysis for clicked locations
- **CORS Enabled**: Ready for frontend integration


---

## 📊 What Each Endpoint Returns

All endpoints return JSON with:
- success: true/false
- data: Object with tile URLs, legends, metadata
- Visualization parameters for mapping

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with React
- **Mapping**: Leaflet + React-Leaflet
- **Charts**: Chart.js for temporal visualizations
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore for field management
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js serverless functions
- **Data Sources**: NASA VIIRS, SMAP, FIRMS
- **Processing**: Google Earth Engine (433 images, 2015-2024)
- **API**: Vercel Serverless Functions
- **Format**: REST JSON + WMS/WMTS tiles

---

## 📈 Key Statistics

- *Region:* Ireland
- *Historical Baseline:* 10 years (2015-2024)
- *Resolution:* 500m (VIIRS NDVI)
- *Current Anomaly:* Mean +354 (slightly above average)
- *Stress Range:* -7,106 to +7,003

---

## 🎯 Days 1-5 Summary

- *Day 1:* NASA Earthdata auth setup
- *Day 2:* Google Earth Engine + VIIRS data
- *Day 3:* NDVI anomaly algorithm (core feature)
- *Day 4:* REST API + serverless deployment
- *Day 5:* Added SMAP + FIRMS endpoints

---

*NASA Space Apps Challenge 2025* 🛰️