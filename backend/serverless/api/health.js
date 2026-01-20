/**
 * Health Check Endpoint
 * Returns API status and available endpoints
 */

export default async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Grassland Resilience Navigator API',
      version: '1.0.0',
      endpoints: {
        '/api/health': 'API health check',
        '/api/ndvi-anomaly': 'NDVI Anomaly tile configuration (proxied)',
        '/api/ndvi-tiles': 'NDVI tile proxy - fetches from GEE',
        '/api/smap-moisture': 'SMAP Soil Moisture data configuration',
        '/api/firms-fires': 'FIRMS Active Fire data configuration',
        '/api/temporal-data': 'Time series data for clicked location'
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      },
      performance: {
        responseTime: `${Date.now() - new Date(req.headers['x-vercel-request-start'] || Date.now())}ms`
      }
    };

    return res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}