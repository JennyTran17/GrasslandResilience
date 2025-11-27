/**
 * Google Earth Engine Code Editor Script
 * Generate Precipitation Map ID - CORRECTED VERSION
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
 *
 * FIXES APPLIED (2025-11-21):
 * - Added .clip(ireland) to bound tiles to Ireland only
 * - CRITICAL: Fixed visualization range from (0-10) to (0.05-0.25) mm/hr
 *   The actual mean precipitation data is 0.05-0.25, not 0-10!
 *   Previous range made all data appear as white boxes.
 * - Changed palette to brown->blue for better visibility
 */

// Define Ireland region
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

print('Fetching GPM Precipitation data for Ireland...');
print('Using most recent available data (2024)');

// Get GPM (Global Precipitation Measurement) data
// Note: 2025 data not yet available, using 2024
var gpm = ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
  .filterBounds(ireland)
  .filterDate('2024-01-01', '2024-12-31')
  .select('precipitationCal')  // Calibrated precipitation estimate
  .mean()  // Average precipitation over the period
  .multiply(1.0)  // Ensure it's a proper image
  .clip(ireland);  // ✅ Clip to Ireland bounds only (prevents white boxes)

print('GPM data fetched. Precipitation unit: mm/hr');
print('Dataset: NASA/GPM_L3/IMERG_V06');
print('Band: precipitationCal');

// Check actual data range
var stats = gpm.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: ireland,
  scale: 10000,
  maxPixels: 1e9
});

print('Actual data range:', stats);

// ✅ CRITICAL FIX: Use actual data range for visualization!
// The mean precipitation is around 0.05-0.25 mm/hr, NOT 0-10!
// Using 0-10 made all data appear as the minimum color (white boxes)
var visParams = {
  min: 0.05,   // ✅ Match actual minimum
  max: 0.25,   // ✅ Match actual maximum
  palette: ['8B4513', 'D2691E', 'F4A460', 'FFFFCC', 'ADD8E6', '4682B4', '000080']
  // Brown (dry/low precip) -> Yellow -> Light Blue -> Blue -> Navy (high precip)
};

print('Visualization settings:');
print('  Min: 0.05 mm/hr (low precipitation)');
print('  Max: 0.25 mm/hr (high precipitation)');
print('  Palette: Brown to Blue gradient');
print('  ⚠️  NOTE: Range is 0.05-0.25, NOT 0-10! This is the actual data range.');

// Generate map and get the Map ID
print('Generating Map ID...');
var mapId = gpm.getMapId(visParams);

// Print the Map ID to the console
print('============================================================');
print('✅ SUCCESS! Precipitation Map ID generated (CORRECTED):');
print('============================================================');
print('');
print('Map ID: ' + mapId.mapid);
print('');
print('============================================================');
print('NEXT STEPS:');
print('1. Copy the Map ID above');
print('2. Update backend/serverless/api/precipitation-tiles.js');
print('3. Update the MAP_ID constant with this value');
print('4. This Map ID will be valid for ~7 days');
print('============================================================');
print('');
print('FIXES APPLIED:');
print('✓ Added .clip(ireland) to prevent white boxes');
print('✓ FIXED visualization range to 0.05-0.25 mm/hr (was 0-10)');
print('✓ Changed palette to brown->blue for better visibility');
print('============================================================');

// Also add the layer to the map for visual confirmation
Map.centerObject(ireland, 6);
Map.addLayer(gpm, visParams, 'Precipitation (2024 - CORRECTED)');

print('');
print('Map preview added. Check the map - you should see:');
print('✓ Colorized data (brown to blue) over Ireland');
print('✓ NO white/transparent boxes');
print('✓ Clear precipitation patterns');
print('');
print('⚠️  If you see white boxes, the visualization range is wrong!');
print('   Always check actual data range with reduceRegion() first.');
