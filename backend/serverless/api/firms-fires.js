/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: FIRMS Active Fires
 *
 * Returns near real-time active fire locations from NASA FIRMS
 * UPDATED: Now uses live FIRMS API data
 */

const fetch = require('node-fetch');

// Cache FIRMS data for 3 hours (matches FIRMS update frequency)
let cachedFireData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.status(200).json({ ok: true });
  }

  try {
    // Get query parameters
    const days = parseInt(req.query.days || '1'); // Default to last 1 day
    const source = req.query.source || 'VIIRS_SNPP_NRT'; // Default to VIIRS
    const minConfidence = req.query.minConfidence || 'nominal'; // Filter by confidence

    // Validate parameters
    if (days < 1 || days > 10) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 10'
      });
    }

    // Check if API key is configured
    const apiKey = process.env.FIRMS_API_KEY;
    if (!apiKey) {
      console.warn('[FIRMS] No API key configured, returning placeholder data');
      return res.status(200).json(getPlaceholderResponse());
    }

    // Try to get cached data
    const now = Date.now();
    if (cachedFireData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('[FIRMS] Returning cached fire data');
      return res.status(200).json({
        ...cachedFireData,
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000 / 60) + ' minutes'
      });
    }

    // Fetch fresh data from FIRMS
    console.log(`[FIRMS] Fetching fire data: source=${source}, days=${days}`);

    const fireData = await fetchFIRMSData(apiKey, source, days, minConfidence);

    // Cache the result
    cachedFireData = fireData;
    cacheTimestamp = now;

    return res.status(200).json({
      ...fireData,
      cached: false
    });

  } catch (error) {
    console.error('[FIRMS] Error:', error);

    // Return cached data if available, even if expired
    if (cachedFireData) {
      console.warn('[FIRMS] Returning stale cached data due to error');
      return res.status(200).json({
        ...cachedFireData,
        cached: true,
        warning: 'Using cached data due to API error'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve FIRMS fire data',
      message: error.message,
      fallback: getPlaceholderResponse()
    });
  }
}

/**
 * Fetch real fire data from NASA FIRMS API
 * Using area endpoint with Ireland bounding box
 */
async function fetchFIRMSData(apiKey, source, days, minConfidence) {
  // Ireland bounding box: west, south, east, north
  const irelandBbox = '-10.5,51.4,-5.4,55.4';

  // Construct FIRMS area API URL with bounding box
  // Format: /api/area/csv/MAP_KEY/source/area/dayrange/date
  const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/${source}/${irelandBbox}/${days}`;

  console.log(`[FIRMS] Calling API: ${firmsUrl.replace(apiKey, '***KEY***')}`);

  const response = await fetch(firmsUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Grassland-Resilience-Navigator/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`FIRMS API error: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Convert CSV to GeoJSON
  const geoJson = convertCSVToGeoJSON(csvText);

  console.log(`[FIRMS] Received ${geoJson.features ? geoJson.features.length : 0} fire detections`);

  // Filter by confidence level
  const confidenceLevels = {
    'low': ['low', 'nominal', 'high'],
    'nominal': ['nominal', 'high'],
    'high': ['high']
  };

  const allowedConfidences = confidenceLevels[minConfidence] || confidenceLevels['nominal'];

  const filteredFeatures = geoJson.features.filter(feature => {
    const confidence = feature.properties.confidence;
    return allowedConfidences.includes(confidence);
  });

  console.log(`[FIRMS] After filtering by confidence: ${filteredFeatures.length} detections`);

  // Process and return data
  return {
    success: true,
    data: {
      type: 'firms-active-fires',
      description: 'Near Real-Time Active Fire Detection',
      fires: {
        type: 'FeatureCollection',
        features: filteredFeatures.map(feature => ({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            latitude: feature.properties.latitude,
            longitude: feature.properties.longitude,
            brightness: feature.properties.bright_ti4,
            frp: feature.properties.frp, // Fire Radiative Power (MW)
            confidence: feature.properties.confidence,
            acquisitionDate: feature.properties.acq_date,
            acquisitionTime: feature.properties.acq_time,
            satellite: feature.properties.satellite,
            dayNight: feature.properties.daynight,
            // Calculate severity
            severity: getSeverity(feature.properties.frp, feature.properties.confidence)
          }
        }))
      },
      metadata: {
        source: `NASA FIRMS ${source}`,
        instrument: source.includes('VIIRS') ? 'VIIRS 375m' : 'MODIS 1km',
        temporalResolution: 'Near Real-Time (NRT)',
        region: 'Ireland',
        updateFrequency: 'Every 3 hours',
        detectionCount: filteredFeatures.length,
        queryDays: days,
        minConfidence: minConfidence,
        timestamp: new Date().toISOString()
      },
      visualization: {
        markerColor: 'red',
        markerSize: 'medium',
        icon: '🔥'
      },
      interpretation: {
        riskLevel: getRiskLevel(filteredFeatures.length),
        note: 'Fire risk increases in areas with prolonged drought stress (red NDVI anomaly + low soil moisture)'
      }
    }
  };
}

/**
 * Convert FIRMS CSV to GeoJSON format
 */
function convertCSVToGeoJSON(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length <=  1) {
    return { type: 'FeatureCollection', features: [] };
  }

  const headers = lines[0].split(',');
  const features = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;

    const properties = {};
    headers.forEach((header, index) => {
      properties[header] = values[index];
    });

    // Convert numeric fields
    const lat = parseFloat(properties.latitude);
    const lon = parseFloat(properties.longitude);
    if (isNaN(lat) || isNaN(lon)) continue;

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: properties
    });
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Get fire severity based on FRP and confidence
 */
function getSeverity(frp, confidence) {
  if (confidence === 'low') return 'low';

  if (frp > 100) return 'high';
  if (frp > 50) return 'moderate';
  return 'low';
}

/**
 * Get risk level based on fire count
 */
function getRiskLevel(fireCount) {
  if (fireCount === 0) return 'No active fires detected';
  if (fireCount <= 5) return 'Low fire activity';
  if (fireCount <= 15) return 'Moderate fire activity';
  return 'High fire activity - monitor closely';
}

/**
 * Get placeholder response when API key is not configured
 */
function getPlaceholderResponse() {
  return {
    success: true,
    data: {
      type: 'firms-active-fires',
      description: 'Near Real-Time Active Fire Detection',
      fires: {
        type: 'FeatureCollection',
        features: []
      },
      metadata: {
        source: 'NASA FIRMS (Placeholder - API key not configured)',
        instrument: 'VIIRS 375m / MODIS 1km',
        temporalResolution: 'Near Real-Time (NRT)',
        region: 'Ireland',
        updateFrequency: 'Every 3 hours',
        detectionCount: 0,
        note: 'Configure FIRMS_API_KEY environment variable to enable live fire data'
      },
      visualization: {
        markerColor: 'red',
        markerSize: 'medium',
        icon: '🔥'
      },
      interpretation: {
        riskLevel: 'No active fires detected',
        note: 'Fire risk increases in areas with prolonged drought stress (red NDVI anomaly + low soil moisture)'
      }
    },
    placeholder: true
  };
}
