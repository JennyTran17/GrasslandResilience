/**
 * Google Earth Engine Code Editor Script
 * Generate Soil Moisture Map ID
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
 */

// Define Ireland region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

print('Fetching SMAP Soil Moisture data for Ireland...');

// Get ERA5 Soil Moisture (publicly accessible)
// ERA5 is a reanalysis dataset that provides global soil moisture estimates
// This is more reliable than SMAP for public Earth Engine access
var soilMoisture = ee.ImageCollection('ECMWF/ERA5/DAILY')
  .filterBounds(ireland)
  .filterDate('2023-01-01', '2024-01-01')  // Use 2023 data for better availability
  .select('volumetric_soil_water_layer_1')  // Top soil layer (0-7cm depth)
  .mean();

print('ERA5 Soil Moisture data fetched. Unit: m³/m³ (volumetric)');

// Visualization parameters for soil moisture
// SMAP values range from 0 to 1 (0% to 100% saturation)
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
print('✅ SUCCESS! Soil Moisture Map ID generated:');
print('============================================================');
print('');
print('Map ID: ' + mapId.mapid);
print('');
print('============================================================');
print('NEXT STEPS:');
print('1. Copy the Map ID above');
print('2. Update backend/serverless/api/soil-moisture-tiles.js');
print('3. Replace PLACEHOLDER_GENERATE_IN_GEE_CODE_EDITOR with this Map ID');
print('4. This Map ID will be valid for ~7 days');
print('============================================================');

// Also add the layer to the map for visual confirmation
Map.centerObject(ireland, 6);
Map.addLayer(soilMoisture, visParams, 'Soil Moisture');

print('');
print('Map preview added. Check the map to verify the layer looks correct.');
print('Legend: Brown = Dry, Blue = Wet');
