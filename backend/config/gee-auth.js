/**
 * Google Earth Engine Authentication Configuration
 *
 * This module handles GEE authentication using service account credentials
 * Supports both local development and serverless deployment
 */

const ee = require('@google/earthengine');

let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize Google Earth Engine with service account credentials
 * @returns {Promise<void>}
 */
async function initializeGEE() {
  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Return immediately if already initialized
  if (isInitialized) {
    return Promise.resolve();
  }

  // Create new initialization promise
  initializationPromise = (async () => {
    try {
      console.log('[GEE] Initializing Earth Engine...');

      // Get credentials from environment variable
      const privateKeyEnv = process.env.GEE_PRIVATE_KEY;
      const serviceAccountEnv = process.env.GEE_SERVICE_ACCOUNT;
      const projectId = process.env.GEE_PROJECT_ID || 'grassland-resilience-navigator';

      if (!privateKeyEnv || !serviceAccountEnv) {
        throw new Error(
          'GEE credentials not found. Please set GEE_PRIVATE_KEY and GEE_SERVICE_ACCOUNT environment variables.'
        );
      }

      // Parse the private key (handle escaped newlines from .env)
      const privateKey = privateKeyEnv.replace(/\\n/g, '\n');

      // Authenticate with service account
      await new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(
          privateKey,
          () => {
            console.log('[GEE] Authentication successful');
            ee.initialize(
              null,
              null,
              () => {
                console.log('[GEE] Initialization complete');
                isInitialized = true;
                resolve();
              },
              (error) => {
                console.error('[GEE] Initialization failed:', error);
                reject(error);
              }
            );
          },
          (error) => {
            console.error('[GEE] Authentication failed:', error);
            reject(error);
          },
          null,
          serviceAccountEnv
        );
      });

    } catch (error) {
      console.error('[GEE] Setup error:', error);
      initializationPromise = null; // Allow retry
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Get Earth Engine instance (automatically initializes if needed)
 * @returns {Promise<object>} Initialized Earth Engine instance
 */
async function getEE() {
  if (!isInitialized) {
    await initializeGEE();
  }
  return ee;
}

/**
 * Check if GEE is initialized
 * @returns {boolean}
 */
function isGEEInitialized() {
  return isInitialized;
}

module.exports = {
  initializeGEE,
  getEE,
  isGEEInitialized,
  ee // Export raw ee for direct access after initialization
};
