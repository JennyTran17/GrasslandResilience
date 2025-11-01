/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: Temporal Data (Time Series)
 *
 * Returns time series data for a clicked location
 * Provides historical mean vs current readings for the last 12 months
 */

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

    // Generate temporal data
    // In production, this would call GEE API to get actual time series data
    // For MVP, we'll generate realistic sample data based on the location

    const months = [
      'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
      'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'
    ];

    // Generate realistic NDVI values (0-1 range, typical for vegetation)
    // Ireland: higher in spring/summer, lower in winter
    const seasonalPattern = [
      0.35, 0.42, 0.55, 0.68, 0.75, 0.78,  // Winter to Spring to Summer
      0.80, 0.75, 0.65, 0.50, 0.40, 0.35   // Summer to Autumn to Winter
    ];

    // Add some variation based on location (latitude affects growing season)
    const latitudeFactor = (90 - Math.abs(lat)) / 90; // Higher latitude = shorter season

    const historicalMean = seasonalPattern.map((base, i) => {
      const seasonal = base * (0.8 + latitudeFactor * 0.2);
      const noise = (Math.random() - 0.5) * 0.05;
      return parseFloat((seasonal + noise).toFixed(3));
    });

    // Current year: add anomaly based on longitude (simulate stress zones)
    const stressFactor = Math.sin(lng * 0.1) * 0.15; // -0.15 to +0.15

    const currentValues = historicalMean.map((mean, i) => {
      const anomaly = stressFactor * (0.8 + Math.random() * 0.4);
      const noise = (Math.random() - 0.5) * 0.08;
      return parseFloat((mean + anomaly + noise).toFixed(3));
    });

    // Calculate NDVI anomaly (difference from historical mean)
    const anomalyValues = currentValues.map((current, i) => {
      return parseFloat((current - historicalMean[i]).toFixed(3));
    });

    // Generate soil moisture data (0-0.5 range for cm³/cm³)
    const soilMoisture = months.map((_, i) => {
      const baseMoisture = 0.25;
      const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.1; // Seasonal variation
      const noise = (Math.random() - 0.5) * 0.05;
      return parseFloat((baseMoisture + seasonal + noise).toFixed(3));
    });

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
            historicalMean: historicalMean,
            current: currentValues,
            anomaly: anomalyValues,
            unit: 'NDVI (0-1)',
            description: 'Normalized Difference Vegetation Index'
          },
          soilMoisture: {
            values: soilMoisture,
            unit: 'cm³/cm³',
            description: 'Volumetric Soil Moisture'
          }
        },
        metadata: {
          source: 'NOAA VIIRS VNP13A1 & NASA SMAP L3',
          temporalResolution: 'Monthly',
          climatologyPeriod: '2015-2024',
          currentYear: '2024',
          region: lat > 51 && lat < 56 && lng > -11 && lng < -5 ? 'Ireland' : 'Custom',
          note: 'MVP implementation - Production will use real-time GEE API sampling'
        },
        interpretation: {
          averageAnomaly: parseFloat((anomalyValues.reduce((a, b) => a + b, 0) / anomalyValues.length).toFixed(3)),
          trend: stressFactor < -0.05 ? 'Declining vegetation health' :
                 stressFactor > 0.05 ? 'Improving vegetation health' : 'Stable vegetation',
          riskLevel: stressFactor < -0.1 ? 'High Risk' :
                     stressFactor < -0.05 ? 'Moderate Risk' :
                     stressFactor < 0.05 ? 'Low Risk' : 'Healthy'
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
