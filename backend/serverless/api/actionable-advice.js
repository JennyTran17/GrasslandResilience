/**
 * GRASSLAND RESILIENCE NAVIGATOR
 * API Endpoint: Actionable Advice Generator
 *
 * Generates farmer-friendly recommendations based on Risk Score
 * Covers grazing, machinery use, and fertilizer application
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
    // Get risk score from query params (GET) or body (POST)
    let riskScore, ndviAnomaly, soilMoisture, lat, lng;

    if (req.method === 'GET') {
      riskScore = parseFloat(req.query.riskScore);
      ndviAnomaly = req.query.ndviAnomaly ? parseFloat(req.query.ndviAnomaly) : null;
      soilMoisture = req.query.soilMoisture ? parseFloat(req.query.soilMoisture) : null;
      lat = req.query.lat ? parseFloat(req.query.lat) : null;
      lng = req.query.lng ? parseFloat(req.query.lng) : null;
    } else if (req.method === 'POST') {
      riskScore = parseFloat(req.body.riskScore);
      ndviAnomaly = req.body.ndviAnomaly ? parseFloat(req.body.ndviAnomaly) : null;
      soilMoisture = req.body.soilMoisture ? parseFloat(req.body.soilMoisture) : null;
      lat = req.body.lat ? parseFloat(req.body.lat) : null;
      lng = req.body.lng ? parseFloat(req.body.lng) : null;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate risk score
    if (isNaN(riskScore) || riskScore < 1 || riskScore > 5) {
      return res.status(400).json({
        error: 'Invalid risk score',
        message: 'Risk score must be between 1 and 5'
      });
    }

    // Generate advice based on risk score
    const advice = generateAdvice(riskScore, ndviAnomaly, soilMoisture);

    const response = {
      success: true,
      data: {
        riskScore,
        category: getRiskCategory(riskScore),
        advice: {
          grazing: advice.grazing,
          machinery: advice.machinery,
          fertilizer: advice.fertilizer,
          general: advice.general
        },
        priority: getPriority(riskScore),
        actions: advice.actions,
        timeline: advice.timeline,
        ...(lat && lng && { location: { lat, lng } }),
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in actionable advice endpoint:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to generate actionable advice',
      message: error.message
    });
  }
}

/**
 * Generate comprehensive advice based on risk score
 */
function generateAdvice(riskScore, ndviAnomaly, soilMoisture) {
  const scoreRange = Math.ceil(riskScore);

  const adviceMap = {
    1: {
      // Excellent (1.0 - 1.9)
      grazing: {
        recommendation: 'Optimal grazing conditions',
        details: 'Continue normal grazing rotation. Grassland can support full stocking density.',
        intensity: 'Normal to high',
        rotationDays: '3-5 days per paddock'
      },
      machinery: {
        recommendation: 'All machinery operations safe',
        details: 'Soil conditions are ideal for all machinery work including heavy equipment.',
        restrictions: 'None',
        bestTimes: 'Anytime - conditions are excellent'
      },
      fertilizer: {
        recommendation: 'Optimal application timing',
        details: 'Apply fertilizer as planned. Grass is actively growing and will utilize nutrients efficiently.',
        type: 'Standard N-P-K blend',
        timing: 'Apply now for best results'
      },
      general: 'Grassland is thriving. Maintain current management practices. Consider harvesting surplus grass for silage.',
      actions: [
        'Continue normal grazing rotation',
        'Consider taking silage from surplus growth',
        'Apply planned fertilizer applications',
        'Monitor for optimal cutting/grazing windows'
      ],
      timeline: 'Continue current practices - review in 2 weeks'
    },
    2: {
      // Good (2.0 - 2.9)
      grazing: {
        recommendation: 'Normal grazing with monitoring',
        details: 'Grassland is healthy. Continue normal stocking rates with regular monitoring.',
        intensity: 'Normal',
        rotationDays: '4-6 days per paddock'
      },
      machinery: {
        recommendation: 'Safe for most operations',
        details: 'Good conditions for machinery work. Avoid unnecessary heavy equipment if soil seems moist.',
        restrictions: 'Minor precautions in wet areas',
        bestTimes: 'Mid-morning to late afternoon'
      },
      fertilizer: {
        recommendation: 'Apply as scheduled',
        details: 'Good conditions for fertilizer application. Grass is responding well to nutrients.',
        type: 'Balanced fertilizer',
        timing: 'Apply within next 7 days'
      },
      general: 'Grassland is in good health. Normal farm operations can proceed. Keep monitoring growth rates.',
      actions: [
        'Maintain current grazing pattern',
        'Apply scheduled fertilizer',
        'Monitor soil moisture levels',
        'Plan next rotation cycle'
      ],
      timeline: 'Review conditions in 1-2 weeks'
    },
    3: {
      // Moderate Risk (3.0 - 3.9)
      grazing: {
        recommendation: 'Reduce grazing pressure',
        details: 'Grassland showing stress. Reduce stocking density by 20-30% or increase rotation speed.',
        intensity: 'Light to moderate',
        rotationDays: '2-3 days per paddock (faster rotation)'
      },
      machinery: {
        recommendation: 'Limit heavy machinery',
        details: soilMoisture && soilMoisture < 0.15
          ? 'Soil is dry - machinery operations acceptable but avoid compaction in vulnerable areas.'
          : 'Restrict heavy machinery to essential operations only. Risk of soil compaction or damage.',
        restrictions: 'Avoid heavy equipment on stressed areas',
        bestTimes: 'Early morning or late evening when cooler'
      },
      fertilizer: {
        recommendation: 'Delay or reduce application',
        details: 'Consider postponing fertilizer until conditions improve. If applying, reduce rate by 30-50%.',
        type: 'Light application of slow-release fertilizer only',
        timing: 'Wait 1-2 weeks if possible'
      },
      general: 'Grassland under moderate stress. Reduce pressure on grass and monitor closely. Consider irrigation if available.',
      actions: [
        'Reduce stocking density by 20-30%',
        'Increase grazing rotation speed',
        'Postpone fertilizer application',
        'Monitor daily for changes',
        'Consider supplementary feeding',
        'Limit machinery traffic'
      ],
      timeline: 'Implement changes within 48 hours - review in 3-5 days'
    },
    4: {
      // High Risk (4.0 - 4.9)
      grazing: {
        recommendation: 'Severely restrict grazing',
        details: 'URGENT: Remove or significantly reduce livestock. Grass is under severe stress and needs recovery time.',
        intensity: 'Very light or none',
        rotationDays: 'Consider zero-grazing or 1-day rapid rotation'
      },
      machinery: {
        recommendation: 'Essential operations only',
        details: 'Avoid all non-essential machinery work. High risk of permanent damage to soil structure and grass sward.',
        restrictions: 'NO heavy equipment. Light machinery only if absolutely necessary.',
        bestTimes: 'Avoid if possible'
      },
      fertilizer: {
        recommendation: 'DO NOT apply fertilizer',
        details: 'Stop all fertilizer applications immediately. Stressed grass cannot utilize nutrients and runoff risk is high.',
        type: 'None - postpone indefinitely',
        timing: 'Wait for recovery (minimum 3-4 weeks)'
      },
      general: 'CRITICAL: Grassland in distress. Immediate action required to prevent long-term damage. Seek agricultural advisor support.',
      actions: [
        'URGENT: Remove livestock or reduce by 50-70%',
        'Stop all fertilizer applications',
        'Cease machinery operations',
        'Implement emergency irrigation if available',
        'Prepare alternative feeding strategy',
        'Contact agricultural advisor',
        'Monitor daily'
      ],
      timeline: 'Act immediately - review daily until improvement seen'
    },
    5: {
      // Critical (5.0)
      grazing: {
        recommendation: 'STOP ALL GRAZING IMMEDIATELY',
        details: 'EMERGENCY: Complete destocking required. Grassland is in critical condition. Any grazing will cause severe long-term damage.',
        intensity: 'ZERO - complete rest needed',
        rotationDays: 'Minimum 4-6 weeks rest required'
      },
      machinery: {
        recommendation: 'COMPLETE MACHINERY BAN',
        details: 'EMERGENCY: No machinery operations allowed. Any traffic will cause permanent soil compaction and sward damage.',
        restrictions: 'ABSOLUTE BAN on all machinery',
        bestTimes: 'Not applicable - no machinery allowed'
      },
      fertilizer: {
        recommendation: 'EMERGENCY: NO FERTILIZER',
        details: 'STOP: Absolutely no fertilizer application. High environmental contamination risk. Wait for full grassland recovery.',
        type: 'None',
        timing: 'Wait minimum 6-8 weeks after recovery begins'
      },
      general: 'EMERGENCY SITUATION: Grassland in critical failure. Immediate destocking and complete rest essential. Consult agricultural crisis support.',
      actions: [
        'EMERGENCY: Remove ALL livestock immediately',
        'Implement complete field rest',
        'Cease ALL operations (grazing, machinery, fertilizer)',
        'Contact emergency agricultural support',
        'Arrange alternative livestock accommodation',
        'Assess for reseeding necessity',
        'Monitor soil moisture and vegetation daily',
        'Plan recovery strategy with advisor',
        'Consider emergency irrigation if drought is cause'
      ],
      timeline: 'Act within 24 hours - daily monitoring essential until recovery begins'
    }
  };

  return adviceMap[scoreRange] || adviceMap[3]; // Default to moderate if out of range
}

/**
 * Get risk category
 */
function getRiskCategory(score) {
  if (score <= 1.9) return 'Excellent';
  if (score <= 2.9) return 'Good';
  if (score <= 3.9) return 'Moderate Risk';
  if (score <= 4.9) return 'High Risk';
  return 'Critical';
}

/**
 * Get priority level
 */
function getPriority(score) {
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'URGENT';
}
