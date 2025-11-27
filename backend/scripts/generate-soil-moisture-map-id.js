/**
 * Google Earth Engine Code Editor Script
 * Generate Soil Moisture Map ID - CORRECTED VERSION
 *
 * INSTRUCTIONS:
 * 1. Go to: https://code.earthengine.google.com/
 * 2. Make sure you're in project: noble-anvil-476021-m6
 * 3. Copy this entire script into the Code Editor
 * 4. Click "Run" button
 * 5. Wait ~10-30 seconds for it to complete
 * 6. Check the Console (right panel) for the Map ID
 * 7. Copy the Map ID that appears in the console
 * 8. Update backend/serverless/api/soil-moisture-tiles.js with the new Map ID
 *
 * FIXES APPLIED (2025-11-21):
 * - Using ERA5-Land dataset (more recent data than ERA5)
 * - Using 2025 data (not 2023)
 * - Added .multiply(1.0) for proper image format
 * - Added .clip(ireland) to bound tiles to Ireland only
 * - Correct band name: volumetric_soil_water_layer_1
 */

// Define Ireland region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

print('Fetching ERA5-Land Soil Moisture data for Ireland...');
print('Using most recent available data (2025)');

// Get ERA5-Land Soil Moisture - USING 2025 DATA
// ERA5-Land has more recent data than ERA5
var soilMoisture = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
  .filterBounds(ireland)
  .filterDate('2025-01-01', '2025-12-31')  // ✅ Use current year data
  .select('volumetric_soil_water_layer_1')  // Top soil layer (0-7cm depth)
  .mean()
  .multiply(1.0)   // ✅ Ensure proper image format
  .clip(ireland);  // ✅ Clip to Ireland bounds only (prevents white boxes)

print('ERA5-Land Soil Moisture data fetched');
print('Dataset: ECMWF/ERA5_LAND/DAILY_AGGR');
print('Band: volumetric_soil_water_layer_1');
print('Unit: m³/m³ (volumetric)');

// Visualization parameters for soil moisture
var visParams = {
  min: 0.0,
  max: 0.5,
  palette: ['8B4513', 'D2691E', 'F4A460', 'ADD8E6', '4682B4', '000080']
  // Brown -> Tan -> Light Orange -> Light Blue -> Steel Blue -> Navy
  // Represents: Very Dry -> Dry -> Moderate -> Moist -> Wet -> Saturated
};

print('Visualization settings:');
print('  Min: 0.0 (very dry soil)');
print('  Max: 0.5 (saturated soil)');
print('  Palette: Brown to Blue gradient');

// Generate map and get the Map ID
print('Generating Map ID...');
var mapId = soilMoisture.getMapId(visParams);

// Print the Map ID to the console
print('============================================================');
print('✅ SUCCESS! Soil Moisture Map ID generated (CORRECTED):');
print('============================================================');
print('');
print('Map ID: ' + mapId.mapid);
print('');
print('============================================================');
print('NEXT STEPS:');
print('1. Copy the Map ID above');
print('2. Update backend/serverless/api/soil-moisture-tiles.js');
print('3. Update the MAP_ID constant with this value');
print('4. This Map ID will be valid for ~7 days');
print('============================================================');
print('');
print('FIXES APPLIED:');
print('✓ Using ERA5-Land (not ERA5)');
print('✓ Using 2025 data (not 2023)');
print('✓ Added .multiply(1.0) for proper format');
print('✓ Added .clip(ireland) to prevent white boxes');
print('============================================================');

// Also add the layer to the map for visual confirmation
Map.centerObject(ireland, 6);
Map.addLayer(soilMoisture, visParams, 'Soil Moisture (2025)');

print('');
print('Map preview added. Check the map - you should see:');
print('✓ Colorized data (brown to blue) over Ireland');
print('✓ NO white/transparent boxes');
print('✓ Clear distinction between wet and dry areas');
