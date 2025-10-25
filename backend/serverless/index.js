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
      'GET /api/ndvi-anomaly': 'NDVI Anomaly tile URL from Google Earth Engine',
      'GET /api/smap-moisture': 'SMAP Soil Moisture data configuration',
      'GET /api/firms-fires': 'FIRMS Active Fire detection data'
    },
    usage: {
      example: `${req.headers.host}/api/health`
    },
    status: 'operational'
  };

  return res.status(200).json(response);
}
