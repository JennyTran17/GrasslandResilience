/**
 * Detailed GEE Authentication Test with Step-by-Step Diagnostics
 *
 * This test will pinpoint exactly where GEE authentication fails
 * Run: node config/test-gee-detailed.js
 */

require('dotenv').config();
const ee = require('@google/earthengine');

async function detailedGEETest() {
  console.log('🔍 DETAILED GEE AUTHENTICATION DIAGNOSTIC\n');
  console.log('═'.repeat(60));

  // Step 1: Environment Variables Check
  console.log('\n📋 STEP 1: Environment Variables Check');
  console.log('─'.repeat(60));

  const serviceAccount = process.env.GEE_SERVICE_ACCOUNT;
  const privateKey = process.env.GEE_PRIVATE_KEY;
  const projectId = process.env.GEE_PROJECT_ID;

  console.log(`GEE_SERVICE_ACCOUNT: ${serviceAccount ? '✅ SET' : '❌ MISSING'}`);
  if (serviceAccount) {
    console.log(`  Value: ${serviceAccount}`);
  }

  console.log(`GEE_PRIVATE_KEY: ${privateKey ? '✅ SET' : '❌ MISSING'}`);
  if (privateKey) {
    console.log(`  Length: ${privateKey.length} characters`);
    console.log(`  Starts with: ${privateKey.substring(0, 30)}...`);
    console.log(`  Contains newlines: ${privateKey.includes('\\n') ? '✅ YES' : '❌ NO (may need escaping)'}`);
  }

  console.log(`GEE_PROJECT_ID: ${projectId ? '✅ SET' : '❌ MISSING'}`);
  if (projectId) {
    console.log(`  Value: ${projectId}`);
  }

  if (!serviceAccount || !privateKey) {
    console.error('\n❌ FAILED: Missing required environment variables');
    process.exit(1);
  }

  // Step 2: Private Key Parsing
  console.log('\n🔐 STEP 2: Private Key Parsing');
  console.log('─'.repeat(60));

  try {
    const parsedKey = privateKey.replace(/\\n/g, '\n');
    console.log('✅ Private key parsed successfully');
    console.log(`  Newlines converted: ${parsedKey.split('\n').length} lines`);

    // Check if it looks like a valid private key
    if (!parsedKey.includes('BEGIN PRIVATE KEY')) {
      console.error('❌ Private key does not contain "BEGIN PRIVATE KEY"');
      console.error('   This may not be a valid private key format');
      process.exit(1);
    }
    console.log('✅ Private key format looks valid');
  } catch (error) {
    console.error('❌ Failed to parse private key:', error.message);
    process.exit(1);
  }

  // Step 3: GEE Authentication Attempt
  console.log('\n🔑 STEP 3: GEE Authentication');
  console.log('─'.repeat(60));

  const parsedKey = privateKey.replace(/\\n/g, '\n');

  console.log('Attempting authentication...');
  console.log('⏳ This may take 10-30 seconds...\n');

  const startTime = Date.now();
  let authSuccess = false;

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timed out after 45 seconds'));
      }, 45000);

      ee.data.authenticateViaPrivateKey(
        parsedKey,
        () => {
          clearTimeout(timeout);
          const authTime = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`✅ Authentication successful (${authTime}s)`);
          authSuccess = true;
          resolve();
        },
        (error) => {
          clearTimeout(timeout);
          const authTime = ((Date.now() - startTime) / 1000).toFixed(2);
          console.error(`❌ Authentication failed (${authTime}s)`);
          console.error('Error details:', error);
          reject(error);
        },
        null,
        serviceAccount
      );
    });
  } catch (error) {
    console.error('\n❌ AUTHENTICATION FAILED');
    console.error('─'.repeat(60));
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.message.includes('timeout')) {
      console.error('\n🔍 ISSUE: Authentication is timing out');
      console.error('Possible causes:');
      console.error('  1. Network connectivity issues');
      console.error('  2. GEE service is down');
      console.error('  3. Firewall blocking GEE API');
      console.error('  4. Service account not activated');
    } else if (error.message.includes('Invalid') || error.message.includes('credentials')) {
      console.error('\n🔍 ISSUE: Invalid credentials');
      console.error('Possible causes:');
      console.error('  1. Service account email is incorrect');
      console.error('  2. Private key does not match service account');
      console.error('  3. Private key format is corrupted');
    } else if (error.message.includes('permission') || error.message.includes('access')) {
      console.error('\n🔍 ISSUE: Permission denied');
      console.error('Possible causes:');
      console.error('  1. Service account does not have Earth Engine access');
      console.error('  2. GEE project is not registered');
      console.error('  3. Service account needs to be added to GEE project');
    }

    process.exit(1);
  }

  // Step 4: GEE Initialization
  console.log('\n⚙️  STEP 4: GEE Initialization');
  console.log('─'.repeat(60));

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Initialization timed out after 30 seconds'));
      }, 30000);

      ee.initialize(
        null,
        null,
        () => {
          clearTimeout(timeout);
          console.log('✅ Initialization successful');
          resolve();
        },
        (error) => {
          clearTimeout(timeout);
          console.error('❌ Initialization failed:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Step 5: Test API Access
  console.log('\n🌍 STEP 5: Test Earth Engine API Access');
  console.log('─'.repeat(60));

  try {
    console.log('Testing access to VIIRS NDVI dataset...');

    const testStart = Date.now();
    const datasetInfo = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Dataset query timed out after 30 seconds'));
      }, 30000);

      ee.data.getInfo('NOAA/VIIRS/001/VNP13A1', (result, error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const queryTime = ((Date.now() - testStart) / 1000).toFixed(2);
    console.log(`✅ Dataset accessible (${queryTime}s)`);

    if (datasetInfo) {
      console.log('  Dataset type:', datasetInfo.type || 'Unknown');
    }
  } catch (error) {
    console.error('❌ Dataset access failed:', error.message);
    process.exit(1);
  }

  // Step 6: Test Image Collection Query
  console.log('\n📊 STEP 6: Test Image Collection Query');
  console.log('─'.repeat(60));

  try {
    console.log('Querying NDVI images for Ireland...');

    const ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);
    const collection = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
      .filterBounds(ireland)
      .filterDate('2024-01-01', '2024-12-31')
      .select('NDVI');

    const queryStart = Date.now();
    const count = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image count query timed out after 30 seconds'));
      }, 30000);

      collection.size().evaluate((result, error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const queryTime = ((Date.now() - queryStart) / 1000).toFixed(2);
    console.log(`✅ Query successful (${queryTime}s)`);
    console.log(`  Found ${count} images`);
  } catch (error) {
    console.error('❌ Image query failed:', error.message);
    process.exit(1);
  }

  // Step 7: Test Map ID Generation
  console.log('\n🗺️  STEP 7: Test Map ID Generation');
  console.log('─'.repeat(60));

  try {
    console.log('Generating map ID for NDVI anomaly...');

    const ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

    // Get recent NDVI
    const currentNDVI = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
      .filterBounds(ireland)
      .filterDate('2024-01-01', '2024-12-31')
      .select('NDVI')
      .mean();

    // Simple visualization
    const visParams = {
      min: 0,
      max: 10000,
      palette: ['brown', 'yellow', 'green', 'darkgreen']
    };

    const mapStart = Date.now();
    const mapIdObj = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Map ID generation timed out after 60 seconds'));
      }, 60000);

      currentNDVI.getMap(visParams, (obj, error) => {
        clearTimeout(timeout);
        if (error) {
          console.error('getMap error details:', error);
          reject(error);
        } else {
          resolve(obj);
        }
      });
    });

    const mapTime = ((Date.now() - mapStart) / 1000).toFixed(2);
    console.log(`✅ Map ID generated successfully (${mapTime}s)`);
    console.log(`  Map ID: ${mapIdObj.mapid}`);

    // Test tile URL construction
    const tileUrl = `https://earthengine.googleapis.com/v1/projects/${projectId}/maps/${mapIdObj.mapid}/tiles/5/15/10`;
    console.log(`  Sample tile URL: ${tileUrl}`);

  } catch (error) {
    console.error('❌ Map ID generation failed:', error.message);
    console.error('Error details:', error);

    if (error.message.includes('timeout')) {
      console.error('\n🔍 ISSUE: Map generation is too slow for serverless');
      console.error('This explains the 401 errors in production!');
      console.error('Vercel serverless functions timeout before GEE can respond.');
    }

    process.exit(1);
  }

  // Success Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ ALL TESTS PASSED!');
  console.log('═'.repeat(60));
  console.log('\nGEE authentication and API access are working correctly.');
  console.log('The automatic map ID generation should work in production.');
  console.log('\nTotal time:', ((Date.now() - startTime) / 1000).toFixed(2), 'seconds\n');
}

// Run the test
detailedGEETest().catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error);
  process.exit(1);
});
