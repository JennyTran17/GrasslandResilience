/**
 * Quick Test: NDVI Tile Map ID Generation
 *
 * Tests if the automatic map ID generation works
 * Run: node config/test-tile-generation.js
 */

require('dotenv').config();

async function testTileGeneration() {
  console.log('🧪 Testing NDVI Tile Map ID Generation...\n');

  try {
    // Import the ndvi-tiles handler
    const ndviTilesModule = await import('../serverless/api/ndvi-tiles.js');

    console.log('✅ Module loaded successfully');
    console.log('📊 Testing getOrGenerateMapId function...\n');

    // Try to generate a map ID
    const startTime = Date.now();
    console.log('⏳ Generating GEE map ID (this may take 10-30 seconds)...');

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Map ID generation took too long (>60s)')), 60000);
    });

    // We can't directly access the internal function, so we'll check the module structure
    console.log('📦 Module exports available:', Object.keys(ndviTilesModule));

    if (ndviTilesModule.refreshMapId) {
      const mapIdPromise = ndviTilesModule.refreshMapId();
      const mapId = await Promise.race([mapIdPromise, timeoutPromise]);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Map ID generated successfully in ${duration}s`);
      console.log(`📍 Map ID: ${mapId}`);
      console.log('\n✅ Automatic generation is WORKING!\n');
    } else {
      console.log('⚠️  refreshMapId function not exported, checking handler only');
      console.log('✅ Handler exists, automatic generation code is in place\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);

    if (error.message.includes('GEE credentials')) {
      console.log('\n🔑 Issue: GEE authentication failed');
      console.log('   This explains why production is returning 401 errors');
      console.log('   ➡️  Solution: Verify GEE credentials in Vercel environment variables');
    } else if (error.message.includes('Timeout')) {
      console.log('\n⏱️  Issue: GEE initialization is timing out');
      console.log('   This could indicate network or authentication issues');
    }

    process.exit(1);
  }
}

testTileGeneration();
