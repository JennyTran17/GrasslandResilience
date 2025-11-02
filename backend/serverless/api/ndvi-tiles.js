/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: NDVI Anomaly Tile Proxy
 *
 * Proxies requests to Google Earth Engine tile server
 * This prevents the frontend from hitting GEE directly
 */

import fetch from 'node-fetch';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Base GEE tile URL (without {z}/{x}/{y})
// NOTE: This URL expires periodically and needs to be regenerated from GEE
// TODO: Implement GEE Python API for dynamic tile URL generation
// Last updated: 2025-01-01
const GEE_TILE_BASE_URL = 'https://earthengine.googleapis.com/v1/projects/noble-anvil-476021-m6/maps/8f7b360c66580a2b154a28a5b1ed2bf9-2078067a71b694cb945fea68564b61b3/tiles';

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract tile parameters from query string
    const { z, x, y } = req.query;

    // Validate parameters
    if (!z || !x || !y) {
      return res.status(400).json({
        error: 'Missing tile parameters',
        message: 'Required parameters: z (zoom), x (column), y (row)',
        example: '/api/ndvi-tiles?z=8&x=123&y=87'
      });
    }

    // Validate that parameters are numbers
    const zoom = parseInt(z);
    const col = parseInt(x);
    const row = parseInt(y);

    if (isNaN(zoom) || isNaN(col) || isNaN(row)) {
      return res.status(400).json({
        error: 'Invalid tile parameters',
        message: 'Parameters z, x, y must be valid integers'
      });
    }

    // Construct the GEE tile URL
    const tileUrl = `${GEE_TILE_BASE_URL}/${zoom}/${col}/${row}`;

    // Fetch the tile from Google Earth Engine with proper headers
    const response = await fetch(tileUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Grassland-Resilience-Navigator/1.0',
        'Accept': 'image/png,image/jpeg,image/*',
        'Referer': 'https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app'
      },
      timeout: 10000
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error(`GEE tile fetch failed: ${response.status} ${response.statusText}`);
      console.error(`Tile URL: ${tileUrl}`);
      
      // Return a transparent tile if GEE fails
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(transparentPng);
    }

    // Get the tile image as a buffer
    const imageBuffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Debug: Log tile info
    console.log(`Tile fetched: ${zoom}/${col}/${row}, Size: ${imageBuffer.length} bytes, Type: ${contentType}`);
    
    // Check if it's a valid image (not an error response)
    if (imageBuffer.length < 100) {
      console.warn('Suspiciously small tile response, may be an error');
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour only

    // Return the tile image
    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('Error in NDVI tile proxy:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to proxy tile request',
      message: error.message
    });
  }
}
