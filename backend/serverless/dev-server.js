const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dynamic import helper for ES6 modules
async function loadHandler(modulePath) {
  const module = await import(modulePath);
  return module.default;
}

// Helper function to wrap Vercel serverless functions for Express
const wrapHandler = (handlerPromise) => async (req, res) => {
  try {
    const handler = await handlerPromise;
    await handler(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Define routes matching Vercel's serverless function structure
app.get('/api/health', wrapHandler(loadHandler('./api/health.js')));
app.get('/api/ndvi-anomaly', wrapHandler(loadHandler('./api/ndvi-anomaly.js')));
app.get('/api/ndvi-tiles', wrapHandler(loadHandler('./api/ndvi-tiles.js')));

// SMAP and FIRMS endpoints support both GET and POST
const smapHandler = wrapHandler(loadHandler('./api/smap-moisture.js'));
app.get('/api/smap-moisture', smapHandler);
app.post('/api/smap-moisture', smapHandler);

const firmsHandler = wrapHandler(loadHandler('./api/firms-fires.js'));
app.get('/api/firms-fires', firmsHandler);
app.post('/api/firms-fires', firmsHandler);

// Temporal data endpoint supports both GET and POST
const temporalHandler = wrapHandler(loadHandler('./api/temporal-data.js'));
app.get('/api/temporal-data', temporalHandler);
app.post('/api/temporal-data', temporalHandler);

// Risk scoring and advice endpoints support both GET and POST
const riskScoreHandler = wrapHandler(loadHandler('./api/risk-score.js'));
app.get('/api/risk-score', riskScoreHandler);
app.post('/api/risk-score', riskScoreHandler);

const adviceHandler = wrapHandler(loadHandler('./api/actionable-advice.js'));
app.get('/api/actionable-advice', adviceHandler);
app.post('/api/actionable-advice', adviceHandler);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Grassland Resilience Navigator API - Development Server',
    endpoints: [
      'GET /api/health',
      'GET /api/ndvi-anomaly',
      'GET /api/ndvi-tiles',
      'GET|POST /api/smap-moisture',
      'GET|POST /api/firms-fires',
      'GET|POST /api/temporal-data',
      'GET|POST /api/risk-score',
      'GET|POST /api/actionable-advice'
    ]
  });
});

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Grassland Resilience Navigator API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health - API health check',
      'GET /api/ndvi-anomaly - NDVI Anomaly tile URL (proxied)',
      'GET /api/ndvi-tiles?z={z}&x={x}&y={y} - NDVI tile proxy',
      'GET|POST /api/smap-moisture - SMAP Soil Moisture data',
      'GET|POST /api/firms-fires - FIRMS Active Fire data',
      'GET|POST /api/temporal-data?lat={lat}&lng={lng} - Time series data for clicked location',
      'GET|POST /api/risk-score?lat={lat}&lng={lng} - Calculate 1-5 resilience risk score',
      'GET|POST /api/actionable-advice?riskScore={score} - Generate farming recommendations'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/ndvi-anomaly');
  console.log('  GET  /api/ndvi-tiles?z={z}&x={x}&y={y}');
  console.log('  GET|POST /api/smap-moisture');
  console.log('  GET|POST /api/firms-fires');
  console.log('  GET|POST /api/temporal-data?lat={lat}&lng={lng}');
  console.log('  GET|POST /api/risk-score?lat={lat}&lng={lng}');
  console.log('  GET|POST /api/actionable-advice?riskScore={score}');
});
