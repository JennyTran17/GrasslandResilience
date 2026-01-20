/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: Risk Score Calculator
 *
 * Analyzes NDVI anomaly and SMAP soil moisture to calculate
 * a 1-5 Resilience Risk Score for grassland health
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
    // Get data from query params (GET) or body (POST)
    let lat, lng, ndviAnomaly, soilMoisture;

    if (req.method === 'GET') {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      ndviAnomaly = req.query.ndviAnomaly ? parseFloat(req.query.ndviAnomaly) : null;
      soilMoisture = req.query.soilMoisture ? parseFloat(req.query.soilMoisture) : null;
    } else if (req.method === 'POST') {
      lat = parseFloat(req.body.lat);
      lng = parseFloat(req.body.lng);
      ndviAnomaly = req.body.ndviAnomaly ? parseFloat(req.body.ndviAnomaly) : null;
      soilMoisture = req.body.soilMoisture ? parseFloat(req.body.soilMoisture) : null;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Please provide valid lat and lng parameters'
      });
    }

    // If NDVI/SMAP not provided, simulate based on location
    // In production, this would fetch real values from temporal-data endpoint
    if (ndviAnomaly === null || soilMoisture === null) {
      // Simulate stress based on longitude (for demo purposes)
      const stressFactor = Math.sin(lng * 0.1);
      ndviAnomaly = ndviAnomaly !== null ? ndviAnomaly : stressFactor * 1500; // -1500 to +1500
      soilMoisture = soilMoisture !== null ? soilMoisture : 0.25 + (stressFactor * 0.1); // 0.15 to 0.35
    }

    // Calculate Risk Score (1-5 scale)
    const riskScore = calculateRiskScore(ndviAnomaly, soilMoisture);

    // Get risk category
    const riskCategory = getRiskCategory(riskScore);

    // Get severity level
    const severityLevel = getSeverityLevel(riskScore);

    const response = {
      success: true,
      data: {
        location: {
          lat,
          lng
        },
        inputs: {
          ndviAnomaly,
          soilMoisture,
          units: {
            ndviAnomaly: 'scaled NDVI difference',
            soilMoisture: 'cm³/cm³'
          }
        },
        riskScore: {
          score: riskScore,
          scale: '1-5 (1=Excellent, 5=Critical)',
          category: riskCategory,
          severity: severityLevel
        },
        interpretation: {
          ndviStatus: interpretNDVI(ndviAnomaly),
          moistureStatus: interpretSoilMoisture(soilMoisture),
          overallStatus: getOverallStatus(riskScore),
          confidence: calculateConfidence(ndviAnomaly, soilMoisture)
        },
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in risk score endpoint:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to calculate risk score',
      message: error.message
    });
  }
}

/**
 * Calculate Risk Score based on NDVI Anomaly and Soil Moisture
 * @param {number} ndviAnomaly - NDVI anomaly value (-3000 to +3000)
 * @param {number} soilMoisture - Soil moisture (0 to 0.5 cm³/cm³)
 * @returns {number} Risk score (1-5)
 */
function calculateRiskScore(ndviAnomaly, soilMoisture) {
  let score = 3; // Start at neutral

  // NDVI Anomaly Impact (weight: 60%)
  if (ndviAnomaly < -2000) {
    score += 2.0; // Severe stress
  } else if (ndviAnomaly < -1000) {
    score += 1.5; // Moderate stress
  } else if (ndviAnomaly < -500) {
    score += 0.8; // Slight stress
  } else if (ndviAnomaly > 1000) {
    score -= 1.5; // Good health
  } else if (ndviAnomaly > 500) {
    score -= 0.8; // Slight improvement
  }

  // Soil Moisture Impact (weight: 40%)
  if (soilMoisture < 0.1) {
    score += 1.2; // Very dry - amplifies stress
  } else if (soilMoisture < 0.15) {
    score += 0.8; // Dry
  } else if (soilMoisture > 0.4) {
    score += 0.3; // Too wet (can be problematic)
  } else if (soilMoisture > 0.25) {
    score -= 0.5; // Optimal moisture
  }

  // Interaction effect: Drought stress is worse with low moisture
  if (ndviAnomaly < -1000 && soilMoisture < 0.15) {
    score += 0.5; // Compound drought effect
  }

  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, Math.round(score * 10) / 10));
}

/**
 * Get risk category name
 */
function getRiskCategory(score) {
  if (score <= 1.5) return 'Excellent';
  if (score <= 2.5) return 'Good';
  if (score <= 3.5) return 'Moderate';
  if (score <= 4.5) return 'High Risk';
  return 'Critical';
}

/**
 * Get severity level
 */
function getSeverityLevel(score) {
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'Severe';
}

/**
 * Interpret NDVI anomaly value
 */
function interpretNDVI(ndviAnomaly) {
  if (ndviAnomaly < -2000) return 'Severe vegetation stress detected';
  if (ndviAnomaly < -1000) return 'Moderate vegetation stress';
  if (ndviAnomaly < -500) return 'Slight stress - monitor closely';
  if (ndviAnomaly < 500) return 'Normal vegetation conditions';
  if (ndviAnomaly < 1000) return 'Above average vegetation health';
  return 'Excellent vegetation health';
}

/**
 * Interpret soil moisture value
 */
function interpretSoilMoisture(soilMoisture) {
  if (soilMoisture < 0.1) return 'Very dry soil - irrigation needed';
  if (soilMoisture < 0.15) return 'Dry soil - water stress likely';
  if (soilMoisture < 0.25) return 'Adequate soil moisture';
  if (soilMoisture < 0.35) return 'Optimal soil moisture';
  if (soilMoisture < 0.45) return 'High soil moisture';
  return 'Saturated soil - drainage issues possible';
}

/**
 * Get overall status description
 */
function getOverallStatus(score) {
  if (score <= 1.5) return 'Grassland is in excellent condition. Continue current management practices.';
  if (score <= 2.5) return 'Grassland is healthy. Normal operations can proceed.';
  if (score <= 3.5) return 'Grassland showing some stress. Monitor and adjust practices as needed.';
  if (score <= 4.5) return 'Grassland is at high risk. Immediate action recommended.';
  return 'Grassland is in critical condition. Urgent intervention required.';
}

/**
 * Calculate confidence level
 */
function calculateConfidence(ndviAnomaly, soilMoisture) {
  // Higher confidence when values are more extreme
  const ndviConfidence = Math.min(100, Math.abs(ndviAnomaly) / 30);
  const moistureDeviation = Math.abs(soilMoisture - 0.25) * 200;

  const confidence = Math.round((ndviConfidence + moistureDeviation) / 2);

  if (confidence > 80) return 'High';
  if (confidence > 50) return 'Medium';
  return 'Low';
}
