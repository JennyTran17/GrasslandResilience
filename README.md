🌍 Grassland Resilience Navigator - Backend

## What We Built

A NASA satellite data API that monitors grassland health across Ireland using:
- *NDVI Anomaly* - Detects vegetation stress (red = drought, blue = healthy)
- *Soil Moisture* - Validates stress with water availability
- *Active Fires* - Near real-time fire detection

---

## 🌐 Live API Endpoints

*Base URL:* https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app

### 1. Health Check

GET https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/health

[🔗 Test it live](https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/health)

### 2. NDVI Anomaly (Vegetation Stress Map)

GET https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/ndvi-anomaly

[🔗 Test it live](https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/ndvi-anomaly)

Returns tile URL for mapping + legend

### 3. SMAP Soil Moisture

GET https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/smap-moisture

[🔗 Test it live](https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/smap-moisture)

Returns soil moisture visualization parameters

### 4. FIRMS Active Fires

GET https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/firms-fires

[🔗 Test it live](https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/firms-fires)

Returns fire detection data structure

---

## 💻 Quick Setup

### 1. Install Dependencies
bash
cd backend
npm install


### 2. Configure Credentials
Edit .env file with your NASA Earthdata and GEE credentials.

### 3. Run Locally
bash
vercel dev

Test at: http://localhost:3000/api/ndvi-anomaly

### 4. Deploy
bash
vercel --prod


---

## 📂 Project Structure

backend/
├── serverless/api/
│   ├── ndvi-anomaly.js    # Vegetation stress
│   ├── smap-moisture.js   # Soil moisture
│   └── firms-fires.js     # Active fires
├── gee-scripts/           # Google Earth Engine scripts
├── .env                   # Your credentials
└── vercel.json           # Deployment config


---

## 🔌 Frontend Integration
javascript
// Fetch NDVI tiles
const response = await fetch('https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/ndvi-anomaly');
const { data } = await response.json();

// Add to Leaflet map
L.tileLayer(data.tileUrl, { opacity: 0.7 }).addTo(map);


---

## 📊 What Each Endpoint Returns

All endpoints return JSON with:
- success: true/false
- data: Object with tile URLs, legends, metadata
- Visualization parameters for mapping

---

## 🛠️ Tech Stack

- *Data:* NASA VIIRS, SMAP, FIRMS
- *Processing:* Google Earth Engine (433 images, 2015-2024)
- *API:* Vercel Serverless Functions
- *Format:* REST JSON + WMS/WMTS tiles

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