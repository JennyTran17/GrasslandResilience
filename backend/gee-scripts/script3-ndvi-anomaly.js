// ==========================================
// GRASSLAND RESILIENCE NAVIGATOR
// Script 3: NDVI Climatology & Anomaly Calculation
// Day 2-3: Historical Baseline & Stress Detection
// This is the CORE ALGORITHM for the MVP
// ==========================================

print('=== NDVI ANOMALY CALCULATION ===');

// ============================================
// STEP 1: DEFINE REGION OF INTEREST
// ============================================

// Ireland Region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

// Center map
Map.centerObject(ireland, 7);

print('Region: Ireland');

// ============================================
// STEP 2: LOAD HISTORICAL DATA (CLIMATOLOGY)
// ============================================

// Define climatology period (10-20 years recommended)
var climatologyStart = '2015-01-01';
var climatologyEnd = '2024-12-31';

print('Calculating historical climatology...');
print('Period:', climatologyStart, 'to', climatologyEnd);

// Load historical VIIRS NDVI data
var historicalNDVI = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
  .filterBounds(ireland)
  .filterDate(climatologyStart, climatologyEnd)
  .select('NDVI');

print('Historical images loaded:', historicalNDVI.size());

// Calculate the long-term mean (climatology)
var ndviMean = historicalNDVI.mean();

print('✅ Historical climatology calculated');

// ============================================
// STEP 3: GET CURRENT/RECENT DATA
// ============================================

print('Loading current NRT data...');

// Get most recent NDVI data
var currentStart = '2024-01-01';
var currentEnd = '2024-12-31';

var currentNDVI = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
  .filterBounds(ireland)
  .filterDate(currentStart, currentEnd)
  .select('NDVI')
  .sort('system:time_start', false)
  .first();

print('Current image date:', ee.Date(currentNDVI.get('system:time_start')));

// ============================================
// STEP 4: CALCULATE ANOMALY
// ============================================

print('Calculating NDVI Anomaly...');

// Anomaly = Current NDVI - Historical Mean NDVI
var ndviAnomaly = currentNDVI.subtract(ndviMean);

print('✅ Anomaly calculated!');
print('Negative values = Below average (STRESS)');
print('Positive values = Above average (HEALTHY)');

// ============================================
// STEP 5: VISUALIZATION
// ============================================

// Visualize Historical Mean
var meanVis = {
  min: 0,
  max: 9000,
  palette: ['white', 'lightgreen', 'green', 'darkgreen']
};

Map.addLayer(ndviMean, meanVis, 'Historical Mean NDVI', false);

// Visualize Current NDVI
var currentVis = {
  min: 0,
  max: 9000,
  palette: ['white', 'yellow', 'green', 'darkgreen']
};

Map.addLayer(currentNDVI, currentVis, 'Current NDVI', false);

// Visualize ANOMALY (This is the KEY layer!)
var anomalyVis = {
  min: -3000,
  max: 3000,
  palette: [
    'darkred',    // Severe negative anomaly (drought/stress)
    'red',
    'orange',
    'yellow',
    'white',      // Normal (no anomaly)
    'lightblue',
    'blue',
    'darkblue'    // Strong positive anomaly (healthy)
  ]
};

Map.addLayer(ndviAnomaly, anomalyVis, 'NDVI Anomaly (STRESS MAP)', true);
Map.addLayer(ireland, {color: 'black'}, 'Ireland ROI', false);

// ============================================
// STEP 6: STATISTICS & INSIGHTS
// ============================================

print('\n=== SUMMARY STATISTICS ===');

// Calculate anomaly statistics for Ireland
var stats = ndviAnomaly.reduceRegion({
  reducer: ee.Reducer.mean()
    .combine({reducer2: ee.Reducer.min(), sharedInputs: true})
    .combine({reducer2: ee.Reducer.max(), sharedInputs: true})
    .combine({reducer2: ee.Reducer.stdDev(), sharedInputs: true}),
  geometry: ireland,
  scale: 500,
  maxPixels: 1e9
});

print('Regional Anomaly Stats:', stats);

// ============================================
// STEP 7: EXPORT READY
// ============================================

print('\n=== EXPORT INFORMATION ===');
print('To export this anomaly layer for web use:');
print('1. Use Map.addLayer() tile URL (for WMS/WMTS)');
print('2. Or export as GeoTIFF to Google Drive');
print('3. Or create Earth Engine App for API access');

print('\n✅ NDVI ANOMALY ANALYSIS COMPLETE!');
print('Red areas on map = Vegetation stress');
print('Blue areas on map = Above-average health');

// ============================================
// NOTES FOR INTEGRATION
// ============================================

// For the MVP frontend (Leaflet integration):
// 1. The ndviAnomaly layer can be served as WMS/WMTS
// 2. Use ee.Image.getMapId() to get tile URL
// 3. Pass this URL to Leaflet as a tile layer
// 4. Example code will be in serverless functions

// Next steps for Week 2:
// - Task 2.1: Export this as a stable WMS endpoint
// - Task 2.2: Integrate with SMAP soil moisture
// - Task 3.1: Add temporal sampling for clicked points