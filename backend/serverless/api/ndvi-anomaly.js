/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: NDVI Anomaly Tiles
 * 
 * Returns the GEE tile URL for the NDVI Anomaly layer
 * This endpoint serves as a proxy to Earth Engine tiles
 */

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
    // Get the base URL from the request (for production vs development)
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // NDVI Anomaly Tile URL - now proxied through our backend
    // Frontend will call: /api/ndvi-tiles?z={z}&x={x}&y={y}
    // This prevents direct access to Google Earth Engine
    const tileUrl = `${baseUrl}/api/ndvi-tiles?z={z}&x={x}&y={y}`;

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