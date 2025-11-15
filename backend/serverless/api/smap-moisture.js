/**
 * SMAP Soil Moisture Endpoint
 * Returns soil moisture data for validating NDVI anomalies
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    // SMAP L3 Daily Composite data
    // Note: This is a placeholder URL structure
    // In production, you'd fetch from NASA LANCE/DAAC API
    
    const response = {
      success: true,
      data: {
        type: 'soil-moisture',
        description: 'ERA5 Soil Moisture (Top Layer 0-7cm)',
        // Tile URL for map visualization
        tileUrl: 'https://grassland-resilience.vercel.app/api/soil-moisture-tiles?z={z}&x={x}&y={y}',
        dataFormat: 'XYZ Tiles',
        visualization: {
          min: 0.0,
          max: 0.5,
          palette: ['8B4513', 'D2691E', 'F4A460', 'ADD8E6', '4682B4', '000080'],
          units: 'm³/m³'
        },
        legend: {
          'Brown': 'Very dry soil (< 0.1)',
          'Yellow': 'Dry soil (0.1 - 0.2)',
          'Light Blue': 'Moderate moisture (0.2 - 0.3)',
          'Blue': 'Moist soil (0.3 - 0.4)',
          'Dark Blue': 'Very moist soil (> 0.4)'
        },
        metadata: {
          source: 'ECMWF ERA5 Daily',
          dataset: 'volumetric_soil_water_layer_1',
          resolution: '~11km',
          temporalResolution: 'Daily',
          region: 'Ireland',
          depth: '0-7cm (top soil layer)'
        },
        note: 'Soil moisture validates NDVI stress zones - low moisture confirms drought stress'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('SMAP endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve SMAP data',
      message: error.message
    });
  }
}