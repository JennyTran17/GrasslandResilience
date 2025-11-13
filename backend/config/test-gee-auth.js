/**
 * Test Google Earth Engine Authentication
 *
 * Run: node config/test-gee-auth.js
 */

require('dotenv').config();
const { initializeGEE, getEE } = require('./gee-auth');

async function testGEEAuth() {
  console.log('🔐 Testing Google Earth Engine Authentication...\n');

  try {
    // Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const hasServiceAccount = !!process.env.GEE_SERVICE_ACCOUNT;
    const hasPrivateKey = !!process.env.GEE_PRIVATE_KEY;
    const hasProjectId = !!process.env.GEE_PROJECT_ID;

    console.log(`   GEE_SERVICE_ACCOUNT: ${hasServiceAccount ? '✅' : '❌'}`);
    console.log(`   GEE_PRIVATE_KEY: ${hasPrivateKey ? '✅' : '❌'}`);
    console.log(`   GEE_PROJECT_ID: ${hasProjectId ? '✅ (' + process.env.GEE_PROJECT_ID + ')' : '❌'}`);

    if (!hasServiceAccount || !hasPrivateKey) {
      throw new Error('Missing GEE credentials. Please check your .env file.');
    }

    // Initialize GEE
    console.log('\n2️⃣ Initializing Earth Engine...');
    await initializeGEE();
    console.log('   ✅ Initialization successful');

    // Get EE instance
    console.log('\n3️⃣ Getting Earth Engine instance...');
    const ee = await getEE();
    console.log('   ✅ Earth Engine instance ready');

    // Test a simple operation
    console.log('\n4️⃣ Testing basic Earth Engine operation...');

    // Get server info
    const info = await new Promise((resolve, reject) => {
      ee.data.getInfo('NOAA/VIIRS/001/VNP13A1', (result, error) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log('   ✅ Successfully connected to Earth Engine!');
    console.log('   📊 Test dataset info:', info ? 'Retrieved' : 'N/A');

    // Test Ireland region query
    console.log('\n5️⃣ Testing Ireland region query...');
    const ireland = ee.Geometry.Rectangle([-10.5, 51.5, -6.0, 55.5]);

    const collection = ee.ImageCollection('NOAA/VIIRS/001/VNP13A1')
      .filterBounds(ireland)
      .filterDate('2024-01-01', '2024-12-31')
      .select('NDVI');

    const count = await new Promise((resolve, reject) => {
      collection.size().evaluate((result, error) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log(`   ✅ Found ${count} NDVI images for Ireland in 2024`);

    console.log('\n✅ All tests passed! Earth Engine is ready to use.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    console.log('\n📚 Troubleshooting:');
    console.log('   1. Check that GEE_SERVICE_ACCOUNT and GEE_PRIVATE_KEY are set in .env');
    console.log('   2. Ensure service account has Earth Engine access');
    console.log('   3. Verify private key format (keep \\n newlines)');
    console.log('   4. See docs/gee-service-account-setup.md for setup guide\n');
    process.exit(1);
  }
}

// Run the test
testGEEAuth();
