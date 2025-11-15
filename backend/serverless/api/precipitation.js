/**
 * Precipitation Endpoint
 * Returns precipitation data metadata and tile URL
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
    const response = {
      success: true,
      data: {
        type: 'precipitation',
        description: 'GPM IMERG Precipitation Data',
        // Tile URL for map visualization
        tileUrl: 'https://grassland-resilience.vercel.app/api/precipitation-tiles?z={z}&x={x}&y={y}',
        dataFormat: 'XYZ Tiles',
        visualization: {
          min: 0.0,
          max: 10.0,
          palette: ['FFFFFF', 'E0F3F8', '91BFDB', '4575B4', '313695', '000080'],
          units: 'mm/hr'
        },
        legend: {
          'White': 'No precipitation (0)',
          'Light Blue': 'Light rain (0-2 mm/hr)',
          'Blue': 'Moderate rain (2-5 mm/hr)',
          'Dark Blue': 'Heavy rain (5-10 mm/hr)',
          'Navy': 'Very heavy rain (> 10 mm/hr)'
        },
        metadata: {
          source: 'NASA GPM IMERG',
          dataset: 'NASA/GPM_L3/IMERG_V06',
          variable: 'precipitationCal',
          resolution: '~11km',
          temporalResolution: 'Daily mean',
          region: 'Ireland',
          description: 'Global Precipitation Measurement Mission'
        },
        note: 'Precipitation data helps correlate with NDVI anomalies and soil moisture patterns'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Precipitation endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve precipitation data',
      message: error.message
    });
  }
}
