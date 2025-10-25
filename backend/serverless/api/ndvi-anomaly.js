/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: NDVI Anomaly Tiles
 * 
 * Returns the GEE tile URL for the NDVI Anomaly layer
 * This endpoint serves as a proxy to Earth Engine tiles
 */

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // NDVI Anomaly Tile URL from GEE (Script 4 output)
    // NOTE: This URL may need to be regenerated periodically
    // TODO: Implement dynamic URL generation via GEE Python API for production
    
    const tileUrl = 'https://earthengine.googleapis.com/v1/projects/noble-anvil-476021-m6/maps/d8c8bccf7700be3946a9508dd6fd6ba6-a4019955c2462bfca51bbeab4d2fd1b3/tiles/{z}/{x}/{y}';

    // Return the tile configuration
    const response = {
      success: true,
      data: {
        type: 'ndvi-anomaly',
        tileUrl: tileUrl,
        description: 'NDVI Anomaly layer showing vegetation stress (red) and health (blue)',
        visualization: {
          min: -3000,
          max: 3000,
          palette: ['darkred', 'red', 'orange', 'yellow', 'white', 'lightblue', 'blue', 'darkblue']
        },
        legend: {
          'Dark Red': 'Severe stress (< -2000)',
          'Red/Orange': 'Moderate stress (-2000 to -1000)',
          'Yellow': 'Slight stress (-1000 to -500)',
          'White': 'Normal conditions (-500 to +500)',
          'Light Blue': 'Slight improvement (+500 to +1000)',
          'Blue': 'Moderate improvement (+1000 to +2000)',
          'Dark Blue': 'Strong improvement (> +2000)'
        },
        metadata: {
          region: 'Ireland',
          climatologyPeriod: '2015-2024',
          currentDate: '2024-05-24',
          source: 'NOAA VIIRS VNP13A1',
          resolution: '500m'
        }
      }
    };

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // Return response
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in NDVI anomaly endpoint:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve NDVI anomaly data',
      message: error.message
    });
  }
}