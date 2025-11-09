/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: Temporal Data (Time Series)
 *
 * Returns time series data for a clicked location
 * Provides historical mean vs current readings for the last 12 months
 *
 * UPDATED: Now uses real Google Earth Engine API for NDVI data
 */

const { getEE } = require('../../config/gee-auth');

// Fallback to simulated data if GEE fails
const USE_GEE = process.env.USE_GEE_TEMPORAL !== 'false'; // Enable by default

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
    // Get coordinates from query params (GET) or body (POST)
    let lat, lng;

    if (req.method === 'GET') {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
    } else if (req.method === 'POST') {
      lat = parseFloat(req.body.lat);
      lng = parseFloat(req.body.lng);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Please provide valid lat and lng parameters',
        example: 'GET /api/temporal-data?lat=53.5&lng=-7.5 or POST with body: {"lat": 53.5, "lng": -7.5}'
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Coordinates out of range',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    let dataSource = 'simulated';
    let ndviData, soilMoistureData;

    // Try to fetch real GEE data
    if (USE_GEE) {
      try {
        console.log(`[Temporal] Fetching real GEE data for (${lat}, ${lng})`);
        const geeData = await fetchGEETemporalData(lat, lng);
        ndviData = geeData.ndvi;
        soilMoistureData = geeData.soilMoisture;
        dataSource = 'Google Earth Engine';
      } catch (error) {
        console.warn('[Temporal] GEE fetch failed, falling back to simulated data:', error.message);
        const simData = generateSimulatedData(lat, lng);
        ndviData = simData.ndvi;
        soilMoistureData = simData.soilMoisture;
      }
    } else {
      // Use simulated data
      const simData = generateSimulatedData(lat, lng);
      ndviData = simData.ndvi;
      soilMoistureData = simData.soilMoisture;
    }

    const months = [
      'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
      'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'
    ];

    // Calculate average anomaly and trend
    const avgAnomaly = parseFloat((ndviData.anomaly.reduce((a, b) => a + b, 0) / ndviData.anomaly.length).toFixed(3));

    const response = {
      success: true,
      data: {
        location: {
          lat,
          lng,
          type: 'Point'
        },
        timeSeries: {
          months: months,
          ndvi: {
            historicalMean: ndviData.historicalMean,
            current: ndviData.current,
            anomaly: ndviData.anomaly,
            unit: 'NDVI (0-1)',
            description: 'Normalized Difference Vegetation Index'
          },
          soilMoisture: {
            values: soilMoistureData,
            unit: 'cm³/cm³',
            description: 'Volumetric Soil Moisture'
          }
        },
        metadata: {
          source: dataSource === 'simulated' ? 'Simulated data' : 'NOAA VIIRS VNP13A1 via Google Earth Engine',
          temporalResolution: 'Monthly',
          climatologyPeriod: '2015-2024',
          currentYear: '2024',
          region: lat > 51 && lat < 56 && lng > -11 && lng < -5 ? 'Ireland' : 'Custom',
          dataSource: dataSource
        },
        interpretation: {
          averageAnomaly: avgAnomaly,
          trend: avgAnomaly < -0.05 ? 'Declining vegetation health' :
                 avgAnomaly > 0.05 ? 'Improving vegetation health' : 'Stable vegetation',
          riskLevel: avgAnomaly < -0.1 ? 'High Risk' :
                     avgAnomaly < -0.05 ? 'Moderate Risk' :
                     avgAnomaly < 0.05 ? 'Low Risk' : 'Healthy'
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in temporal data endpoint:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve temporal data',
      message: error.message
    });
  }
}

/**
 * Fetch real temporal data from Google Earth Engine
 */
async function fetchGEETemporalData(lat, lng) {
  const ee = await getEE();

  // Create point geometry
  const point = ee.Geometry.Point([lng, lat]);

  // Define the current year and historical period
  const currentYear = 2024;
  const historicalStartYear = 2015;
  const historicalEndYear = 2023;

  // Function to get monthly NDVI for a year range
  const getMonthlyNDVI = async (startYear, endYear) => {
    const monthlyValues = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const startDate = `${startYear}-${monthStr}-01`;
      const endDate = month === 12 ? `${endYear + 1}-01-01` : `${startYear}-${monthStr.padStart(2, '0')}-${new Date(startYear, month, 0).getDate()}`;

      // Get NDVI collection for this month across all years in range
      const collection = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
        .filterBounds(point)
        .filterDate(startDate, endDate)
        .select('NDVI');

      // Calculate mean NDVI value at the point
      const meanImage = collection.mean();

      // Sample the point
      const value = await new Promise((resolve, reject) => {
        meanImage.reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: point,
          scale: 500,
          maxPixels: 1
        }).evaluate((result, error) => {
          if (error) reject(error);
          else resolve(result.NDVI || 0);
        });
      });

      // Convert from NDVI scale (0-10000) to 0-1
      monthlyValues.push(parseFloat((value / 10000).toFixed(3)));
    }

    return monthlyValues;
  };

  // Get historical mean (average of 2015-2023)
  console.log('[GEE] Fetching historical NDVI data...');
  const historicalPromises = [];
  for (let year = historicalStartYear; year <= historicalEndYear; year++) {
    historicalPromises.push(getMonthlyNDVI(year, year));
  }

  const historicalYears = await Promise.all(historicalPromises);

  // Calculate mean for each month across all historical years
  const historicalMean = [];
  for (let month = 0; month < 12; month++) {
    const monthValues = historicalYears.map(year => year[month]).filter(v => v > 0);
    const mean = monthValues.length > 0
      ? monthValues.reduce((a, b) => a + b, 0) / monthValues.length
      : 0.5; // Default if no data
    historicalMean.push(parseFloat(mean.toFixed(3)));
  }

  // Get current year data
  console.log('[GEE] Fetching current year NDVI data...');
  const currentValues = await getMonthlyNDVI(currentYear, currentYear);

  // Calculate anomaly
  const anomalyValues = currentValues.map((current, i) => {
    return parseFloat((current - historicalMean[i]).toFixed(3));
  });

  return {
    ndvi: {
      historicalMean,
      current: currentValues,
      anomaly: anomalyValues
    },
    soilMoisture: generateSimulatedSoilMoisture() // Still simulated for now
  };
}

/**
 * Generate simulated temporal data (fallback)
 */
function generateSimulatedData(lat, lng) {
  const seasonalPattern = [
    0.35, 0.42, 0.55, 0.68, 0.75, 0.78,  // Winter to Spring to Summer
    0.80, 0.75, 0.65, 0.50, 0.40, 0.35   // Summer to Autumn to Winter
  ];

  const latitudeFactor = (90 - Math.abs(lat)) / 90;

  const historicalMean = seasonalPattern.map((base, i) => {
    const seasonal = base * (0.8 + latitudeFactor * 0.2);
    const noise = (Math.random() - 0.5) * 0.05;
    return parseFloat((seasonal + noise).toFixed(3));
  });

  const stressFactor = Math.sin(lng * 0.1) * 0.15;

  const currentValues = historicalMean.map((mean, i) => {
    const anomaly = stressFactor * (0.8 + Math.random() * 0.4);
    const noise = (Math.random() - 0.5) * 0.08;
    return parseFloat((mean + anomaly + noise).toFixed(3));
  });

  const anomalyValues = currentValues.map((current, i) => {
    return parseFloat((current - historicalMean[i]).toFixed(3));
  });

  return {
    ndvi: {
      historicalMean,
      current: currentValues,
      anomaly: anomalyValues
    },
    soilMoisture: generateSimulatedSoilMoisture()
  };
}

/**
 * Generate simulated soil moisture data
 * TODO: Replace with real SMAP API integration
 */
function generateSimulatedSoilMoisture() {
  const soilMoisture = [];
  for (let i = 0; i < 12; i++) {
    const baseMoisture = 0.25;
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.1;
    const noise = (Math.random() - 0.5) * 0.05;
    soilMoisture.push(parseFloat((baseMoisture + seasonal + noise).toFixed(3)));
  }
  return soilMoisture;
}
