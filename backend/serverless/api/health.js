/**
 * Health Check Endpoint
 * Returns API status and available endpoints
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Grassland Resilience Navigator API',
    version: '1.0.0',
    endpoints: {
      '/api/health': 'API health check',
      '/api/ndvi-anomaly': 'NDVI Anomaly tile URL',
      '/api/smap-moisture': 'SMAP Soil Moisture data (coming soon)',
      '/api/firms-fires': 'FIRMS Active Fire data (coming soon)'
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  return res.status(200).json(health);
}