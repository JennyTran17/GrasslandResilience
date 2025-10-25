/**
 * FIRMS Active Fire Endpoint
 * Returns near real-time active fire locations
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
    // FIRMS API endpoint
    // Note: In production, you'd fetch live data from NASA FIRMS
    // For MVP, we provide the API structure
    
    const response = {
      success: true,
      data: {
        type: 'firms-active-fires',
        description: 'Near Real-Time Active Fire Detection',
        apiEndpoint: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
        dataFormat: 'GeoJSON',
        visualization: {
          markerColor: 'red',
          markerSize: 'medium',
          icon: '🔥'
        },
        legend: {
          'Red Marker': 'Active fire detection (last 24 hours)',
          'Size': 'Indicates fire radiative power (brightness)'
        },
        metadata: {
          source: 'NASA FIRMS (VIIRS/MODIS)',
          instrument: 'VIIRS I-Band 375m',
          temporalResolution: 'Near Real-Time (NRT)',
          region: 'Ireland',
          updateFrequency: 'Every 3 hours'
        },
        note: 'Fire risk increases in areas with prolonged drought stress (red NDVI anomaly + low SMAP moisture)'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('FIRMS endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve FIRMS data',
      message: error.message
    });
  }
}