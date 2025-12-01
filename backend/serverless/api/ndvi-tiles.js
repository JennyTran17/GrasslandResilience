/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: NDVI Anomaly Tile Proxy
 *
 * Proxies requests to Google Earth Engine tile server
 * UPDATED: Now dynamically generates GEE tile URLs with map ID
 */

const fetch = require('node-fetch');
const { getEE } = require('../../config/gee-auth');

// Cache the GEE map ID for 24 hours
let cachedMapId = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

    // Get or generate map ID
    const mapId = await getOrGenerateMapId();

    // Construct the GEE tile URL
    const projectId = process.env.GEE_PROJECT_ID || 'noble-anvil-476021-m6';
    const tileUrl = `https://earthengine.googleapis.com/v1/projects/${projectId}/maps/${mapId}/tiles/${zoom}/${col}/${row}`;

    console.log(`[NDVI Tiles] Fetching tile: z=${zoom}, x=${col}, y=${row}`);

    // Fetch the tile from Google Earth Engine with proper headers
    const response = await fetch(tileUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Grassland-Resilience-Navigator/1.0',
        'Accept': 'image/png,image/jpeg,image/*',
        'Referer': 'https://grassland-resilience-rao56wzns-fathfuls-projects.vercel.app/'
      },
      timeout: 10000
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error(`[NDVI Tiles] GEE tile fetch failed: ${response.status} ${response.statusText}`);

      // If 404 or 403, map ID might be expired - clear cache
      if (response.status === 404 || response.status === 403) {
        console.log('[NDVI Tiles] Map ID expired, clearing cache...');
        cachedMapId = null;
        cacheTimestamp = null;
      }

      return res.status(response.status).json({
        error: 'Failed to fetch tile from Earth Engine',
        status: response.status,
        statusText: response.statusText,
        hint: 'Map ID may have expired. Try again - a new one will be generated.'
      });
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
    console.error('[NDVI Tiles] Error in tile proxy:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to proxy tile request',
      message: error.message
    });
  }
}

/**
 * Get cached map ID or generate a new one
 * FALLBACK: If automatic generation fails, use pre-generated Map ID
 */
async function getOrGenerateMapId() {
  // CURRENT MAP ID (generated 2025-11-21 v2 in GEE Code Editor, valid for ~7 days)
  // Project: noble-anvil-476021-m6
  // Regenerate using: backend/scripts/generate-gee-map-id.js
  const MAP_ID = '00b06b56a167f30a90043cf5c03575c0-0aa647d8e865f3d73d93f825132d7994';

  console.log('[NDVI Tiles] Using Map ID from Code Editor (generated 2025-11-21 v2)');
  return MAP_ID;

  /* AUTOMATIC GENERATION DISABLED - GEE auth times out in serverless

  const now = Date.now();

  // Return cached map ID if still valid
  if (cachedMapId && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('[NDVI Tiles] Using cached map ID');
    return cachedMapId;
  }

  // Try to generate new map ID (this may fail due to authentication issues)
  console.log('[NDVI Tiles] Attempting to generate new GEE map ID...');

  try {
    const ee = await getEE();

    // Define Ireland region
    const ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];

    // Get most recent NDVI (last 30 days)
    const recentStart = new Date();
    recentStart.setDate(recentStart.getDate() - 30);
    const recentStartStr = recentStart.toISOString().split('T')[0];

    console.log(`[NDVI Tiles] Fetching current NDVI from ${recentStartStr} to ${currentDateStr}`);

    const currentNDVI = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
      .filterBounds(ireland)
      .filterDate(recentStartStr, currentDateStr)
      .select('NDVI')
      .mean();

    // Calculate historical mean (2015-2023, same time of year ±15 days)
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    console.log('[NDVI Tiles] Calculating historical climatology...');

    const historicalImages = [];
    for (let year = 2015; year <= 2023; year++) {
      const startDate = new Date(year, currentMonth - 1, Math.max(1, currentDay - 15));
      const endDate = new Date(year, currentMonth - 1, Math.min(31, currentDay + 15));

      const monthlyMean = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
        .filterBounds(ireland)
        .filterDate(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
        .select('NDVI')
        .mean();

      historicalImages.push(monthlyMean);
    }

    const historicalMean = ee.ImageCollection(historicalImages).mean();

    // Calculate anomaly
    const anomaly = currentNDVI.subtract(historicalMean);

    // Visualization parameters
    const visParams = {
      min: -3000,
      max: 3000,
      palette: ['darkred', 'red', 'orange', 'yellow', 'white', 'lightblue', 'blue', 'darkblue']
    };

    // Generate map ID
    console.log('[NDVI Tiles] Requesting map ID from GEE...');

    const mapIdObj = await new Promise((resolve, reject) => {
      anomaly.getMap(visParams, (obj, error) => {
        if (error) {
          console.error('[NDVI Tiles] getMap error:', error);
          reject(error);
        } else {
          console.log('[NDVI Tiles] Map ID generated:', obj.mapid);
          resolve(obj);
        }
      });
    });

    // Cache the result
    cachedMapId = mapIdObj.mapid;
    cacheTimestamp = now;

    console.log(`[NDVI Tiles] New map ID cached: ${cachedMapId}`);
    console.log(`[NDVI Tiles] Cache will expire at: ${new Date(now + CACHE_DURATION).toISOString()}`);

    return cachedMapId;

  } catch (error) {
    console.error('[NDVI Tiles] Failed to generate map ID:', error.message);

    // Fallback chain:
    // 1. Try expired cached map ID first
    if (cachedMapId) {
      console.warn('[NDVI Tiles] Using expired cached map ID as fallback');
      return cachedMapId;
    }

    // 2. Use pre-generated fallback map ID
    console.warn('[NDVI Tiles] Using pre-generated fallback map ID');
    console.warn('[NDVI Tiles] Note: This map ID was generated on 2024-11-13 and will expire in ~7 days');

    // Cache the fallback so we don't keep trying to regenerate
    cachedMapId = FALLBACK_MAP_ID;
    cacheTimestamp = now;

    return FALLBACK_MAP_ID;
  }
  */
}

/**
 * Force refresh map ID (for manual refresh endpoint)
 */
export async function refreshMapId() {
  cachedMapId = null;
  cacheTimestamp = null;
  return await getOrGenerateMapId();
}
