/**
 * API Authentication Middleware
 *
 * Provides simple API key authentication for production use
 */

// Load API keys from environment (comma-separated for multiple keys)
const loadApiKeys = () => {
  const apiKeysEnv = process.env.API_KEYS;
  if (!apiKeysEnv) {
    return [];
  }

  return apiKeysEnv.split(',').map(key => key.trim()).filter(key => key.length > 0);
};

/**
 * Middleware to verify API key
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {boolean} True if authenticated, false otherwise
 */
function verifyApiKey(req, res) {
  // Check if API authentication is enabled
  const authEnabled = process.env.API_AUTH_ENABLED === 'true';

  if (!authEnabled) {
    console.log('[Auth] API authentication is disabled');
    return true;
  }

  // Get API keys
  const validApiKeys = loadApiKeys();

  if (validApiKeys.length === 0) {
    console.warn('[Auth] No API keys configured but AUTH is enabled!');
    return true; // Allow through if misconfigured
  }

  // Check for API key in headers or query params
  const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.query.api_key;

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'API key required. Provide via X-API-Key header or apiKey query parameter.',
      documentation: 'See docs/api-authentication.md for details'
    });
    return false;
  }

  // Validate API key
  if (!validApiKeys.includes(apiKey)) {
    console.warn(`[Auth] Invalid API key attempted: ${apiKey.substring(0, 8)}...`);
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key'
    });
    return false;
  }

  console.log(`[Auth] Valid API key: ${apiKey.substring(0, 8)}...`);
  return true;
}

/**
 * Generate a random API key
 * @returns {string} Random API key
 */
function generateApiKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let apiKey = '';

  for (let i = 0; i < length; i++) {
    apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return apiKey;
}

/**
 * Public endpoints that don't require authentication
 */
const publicEndpoints = [
  '/api/health',
  '/'
];

/**
 * Check if endpoint is public
 * @param {string} path - Request path
 * @returns {boolean}
 */
function isPublicEndpoint(path) {
  return publicEndpoints.some(endpoint => path === endpoint || path.startsWith(endpoint));
}

/**
 * Express middleware function
 */
function authMiddleware(req, res, next) {
  // Allow public endpoints
  if (isPublicEndpoint(req.path)) {
    return next();
  }

  // Verify API key for protected endpoints
  if (verifyApiKey(req, res)) {
    next();
  }
  // Response already sent by verifyApiKey if authentication failed
}

module.exports = {
  verifyApiKey,
  generateApiKey,
  authMiddleware,
  isPublicEndpoint
};
