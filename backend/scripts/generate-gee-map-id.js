/**
 * Google Earth Engine Code Editor Script
 * Generate NDVI Anomaly Map ID
 *
 * INSTRUCTIONS:
 * 1. Go to: https://code.earthengine.google.com/
 * 2. Copy this entire script into the Code Editor
 * 3. Click "Run" button
 * 4. Wait ~10-30 seconds for it to complete
 * 5. Check the Console (right panel) for the Map ID
 * 6. Copy the Map ID that appears in the console
 */

// Define Ireland region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

print('Fetching NDVI data for Ireland...');

// Get recent NDVI - last 6 months for better data availability
var currentNDVI = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
  .filterBounds(ireland)
  .filterDate('2024-05-01', '2024-11-01')
  .select('NDVI')
  .mean()
  .multiply(1.0);  // Ensure it's a proper image

print('Calculating historical baseline (2020-2023)...');

// Historical baseline - use recent years only for better comparison
var historicalMean = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
  .filterBounds(ireland)
  .filterDate('2020-01-01', '2024-01-01')
  .select('NDVI')
  .mean()
  .multiply(1.0);  // Ensure it's a proper image

print('Calculating anomaly...');

// Both images are now guaranteed to have the same band structure
var anomaly = currentNDVI.subtract(historicalMean);

// Visualization parameters
var visParams = {
  min: -3000,
  max: 3000,
  palette: ['darkred', 'red', 'orange', 'yellow', 'white', 'lightblue', 'blue', 'darkblue']
};

// Generate map and get the Map ID
var mapId = anomaly.getMapId(visParams);

// Print the Map ID to the console
print('============================================================');
print('✅ SUCCESS! Map ID generated:');
print('============================================================');
print('');
print('Map ID: ' + mapId.mapid);
print('');
print('============================================================');
print('NEXT STEPS:');
print('1. Copy the Map ID above');
print('2. Update your backend code with this Map ID');
print('3. This Map ID will be valid for ~7 days');
print('============================================================');

// Also add the layer to the map for visual confirmation
Map.centerObject(ireland, 6);
Map.addLayer(anomaly, visParams, 'NDVI Anomaly');

print('');
print('Map preview added. Check the map to verify the layer looks correct.');
