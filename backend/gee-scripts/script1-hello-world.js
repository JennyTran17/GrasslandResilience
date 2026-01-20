// ==========================================
// GRASSLAND RESILIENCE NAVIGATOR
// Script 1: Hello World Test
// Day 1-2: GEE Setup Verification
// ==========================================

// Print a welcome message
print('🌍 Hello from Earth Engine!');
print('Project: Grassland Resilience Navigator');
print('Status: GEE Setup Successful ✅');

// Define Ireland's location
var irelandCenter = ee.Geometry.Point([-8.0, 53.5]);

// Center the map on Ireland
Map.centerObject(irelandCenter, 6);

// Add a marker for Ireland
Map.addLayer(irelandCenter, {color: 'red'}, 'Ireland Center');

// Print confirmation
print('Map centered on Ireland 🇮🇪');