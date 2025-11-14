/**
 * Google Earth Engine Code Editor Script
 * Generate Precipitation Map ID
 *
 * INSTRUCTIONS:
 * 1. Go to: https://code.earthengine.google.com/
 * 2. Make sure you're in project: noble-anvil-476021-m6
 * 3. Copy this entire script into the Code Editor
 * 4. Click "Run" button
 * 5. Wait ~10-30 seconds for it to complete
 * 6. Check the Console (right panel) for the Map ID
 * 7. Copy the Map ID that appears in the console
 * 8. Update backend/serverless/api/precipitation-tiles.js with the new Map ID
 */

// Define Ireland region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

print('Fetching GPM Precipitation data for Ireland...');

// Get GPM (Global Precipitation Measurement) data
// This provides global, 30-minute resolution precipitation estimates
var gpm = ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
  .filterBounds(ireland)
  .filterDate('2024-01-01', '2024-12-31')
  .select('precipitationCal')  // Calibrated precipitation estimate
  .mean()  // Average precipitation over the period
  .multiply(1.0);  // Ensure it's a proper image

print('GPM data fetched. Precipitation unit: mm/hr');

// Visualization parameters for precipitation
// GPM values represent mm/hr of precipitation
var visParams = {
  min: 0.0,
  max: 10.0,
  palette: ['FFFFFF', 'E0F3F8', '91BFDB', '4575B4', '313695', '000080']
  // White -> Light Blue -> Blue -> Dark Blue -> Navy -> Black
  // Represents: No Rain -> Light Rain -> Moderate Rain -> Heavy Rain -> Extreme Rain
};

print('Visualization settings:');
print('  Min: 0.0 mm/hr (no rain)');
print('  Max: 10.0 mm/hr (heavy rain)');
print('  Palette: White to Navy gradient');

// Generate map and get the Map ID
print('Generating Map ID...');
var mapId = gpm.getMapId(visParams);

// Print the Map ID to the console
print('============================================================');
print('✅ SUCCESS! Precipitation Map ID generated:');
print('============================================================');
print('');
print('Map ID: ' + mapId.mapid);
print('');
print('============================================================');
print('NEXT STEPS:');
print('1. Copy the Map ID above');
print('2. Update backend/serverless/api/precipitation-tiles.js');
print('3. Replace PLACEHOLDER_GENERATE_IN_GEE_CODE_EDITOR with this Map ID');
print('4. This Map ID will be valid for ~7 days');
print('============================================================');

// Also add the layer to the map for visual confirmation
Map.centerObject(ireland, 6);
Map.addLayer(gpm, visParams, 'Precipitation');

print('');
print('Map preview added. Check the map to verify the layer looks correct.');
print('Legend: White = Dry, Dark Blue = Heavy Rain');
