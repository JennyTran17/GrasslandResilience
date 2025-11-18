/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: Soil Moisture Tile Proxy
 *
 * Proxies requests to Google Earth Engine tile server for SMAP soil moisture data
 */

const fetch = require('node-fetch');

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
        example: '/api/soil-moisture-tiles?z=8&x=123&y=87'
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

    // Get map ID
    const mapId = getMapId();

    // Construct the GEE tile URL
    const projectId = process.env.GEE_PROJECT_ID || 'noble-anvil-476021-m6';
    const tileUrl = `https://earthengine.googleapis.com/v1/projects/${projectId}/maps/${mapId}/tiles/${zoom}/${col}/${row}`;

    console.log(`[Soil Moisture Tiles] Fetching tile: z=${zoom}, x=${col}, y=${row}`);

    // Fetch the tile from Google Earth Engine
    const response = await fetch(tileUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Grassland-Resilience-Navigator/1.0'
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error(`[Soil Moisture Tiles] GEE tile fetch failed: ${response.status} ${response.statusText}`);

      return res.status(response.status).json({
        error: 'Failed to fetch tile from Earth Engine',
        status: response.status,
        statusText: response.statusText,
        hint: 'Map ID may have expired. Contact administrator to regenerate.'
      });
    }

    // Get the tile image as a buffer
    const imageBuffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Return the tile image
    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('[Soil Moisture Tiles] Error in tile proxy:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to proxy tile request',
      message: error.message
    });
  }
}

/**
 * Get Map ID for soil moisture
 *
 * NOTE: This needs to be generated using the Earth Engine Code Editor
 * Run the script at: backend/scripts/generate-soil-moisture-map-id.js
 *
 * TODO: Generate the actual Map ID
 */
function getMapId() {
  // Map ID generated 2025-11-18 in GEE Code Editor
  // Project: noble-anvil-476021-m6
  // Dataset: ERA5 Soil Moisture (volumetric_soil_water_layer_1)
  // Valid for ~7 days
  const MAP_ID = 'dc07958a0c915ae053f69a962a971576-f99bc7a8571eb4e23790f6d66eef5a07';

  console.log('[Soil Moisture Tiles] Using Map ID from Code Editor (generated 2025-11-18)');

  return MAP_ID;
}
