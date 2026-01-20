/**
 * Root endpoint for Grassland Resilience Navigator API
 * Displays welcome message and available endpoints
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const response = {
    message: 'Grassland Resilience Navigator API',
    version: '1.0.0',
    description: 'NASA Hackathon MVP - Backend Services',
    documentation: 'https://github.com/your-repo/grassland-resilience',
    endpoints: {
      'GET /api/health': 'API health check and status',
      'GET /api/ndvi-anomaly': 'NDVI Anomaly tile configuration (proxied tile URL)',
      'GET /api/ndvi-tiles?z={z}&x={x}&y={y}': 'NDVI tile proxy - fetches tiles from Google Earth Engine',
      'GET /api/smap-moisture': 'SMAP Soil Moisture data configuration',
      'GET /api/soil-moisture-tiles?z={z}&x={x}&y={y}': 'Soil Moisture tile proxy - fetches tiles from Google Earth Engine',
      'GET /api/precipitation': 'Precipitation data configuration',
      'GET /api/precipitation-tiles?z={z}&x={x}&y={y}': 'Precipitation tile proxy - fetches tiles from Google Earth Engine',
      'GET /api/firms-fires': 'FIRMS Active Fire detection data',
      'GET|POST /api/temporal-data?lat={lat}&lng={lng}': 'Time series data for clicked location (12 months NDVI & soil moisture)',
      'GET|POST /api/risk-score?lat={lat}&lng={lng}': 'Calculate 1-5 resilience risk score from NDVI/SMAP data',
      'GET|POST /api/actionable-advice?riskScore={score}': 'Generate farming recommendations (grazing, machinery, fertilizer)'
    },
    usage: {
      example: `${req.headers.host}/api/health`,
      tileExample: `${req.headers.host}/api/ndvi-tiles?z=8&x=123&y=87`
    },
    status: 'operational'
  };

  return res.status(200).json(response);
}
