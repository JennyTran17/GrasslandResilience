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
        type: 'smap-soil-moisture',
        description: 'SMAP Level 3 Daily Composite - Soil Moisture',
        // For MVP, we provide the SMAP WMS endpoint
        wmsUrl: 'https://n5eil01u.ecs.nsidc.org/SMAP',
        dataFormat: 'WMS',
        visualization: {
          min: 0.02,
          max: 0.5,
          palette: ['brown', 'yellow', 'lightblue', 'blue', 'darkblue'],
          units: 'cm³/cm³'
        },
        legend: {
          'Brown': 'Very dry soil (< 0.1)',
          'Yellow': 'Dry soil (0.1 - 0.2)',
          'Light Blue': 'Moderate moisture (0.2 - 0.3)',
          'Blue': 'Moist soil (0.3 - 0.4)',
          'Dark Blue': 'Very moist soil (> 0.4)'
        },
        metadata: {
          source: 'NASA SMAP L3',
          instrument: 'SMAP L-Band Radiometer',
          resolution: '9km',
          temporalResolution: 'Daily',
          region: 'Ireland'
        },
        note: 'SMAP data validates NDVI stress zones - low moisture confirms drought stress'
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