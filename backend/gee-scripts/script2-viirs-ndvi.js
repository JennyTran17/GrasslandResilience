// ==========================================
// GRASSLAND RESILIENCE NAVIGATOR
// Script 2: Load VIIRS NDVI Data
// Day 2 - Morning Task
// ==========================================

print('=== VIIRS NDVI Data Loading ===');

// Define Ireland Region of Interest (ROI)
var ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

// Center map on Ireland
Map.centerObject(ireland, 7);

// Load VIIRS NDVI Collection
// VNP13A1: VIIRS Vegetation Indices 16-Day Global 500m
var viirs = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
  .filterBounds(ireland)
  .filterDate('2024-01-01', '2025-10-23')
  .select('NDVI');

print('VIIRS Collection loaded');
print('Number of images:', viirs.size());

// Get the most recent image
var latestNDVI = viirs.sort('system:time_start', false).first();

// Print image information
print('Latest NDVI image:');
print('Date:', ee.Date(latestNDVI.get('system:time_start')));
print('Image metadata:', latestNDVI);

// Basic visualization
var ndviVis = {
  min: 0,
  max: 9000,
  palette: ['white', 'yellow', 'green', 'darkgreen']
};

// Add NDVI layer to map
Map.addLayer(latestNDVI, ndviVis, 'Latest NDVI');
Map.addLayer(ireland, {color: 'red'}, 'Ireland ROI', false);

print('✅ NDVI data loaded and displayed!');
print('Check the map - green areas = healthy vegetation');