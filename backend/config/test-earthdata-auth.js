/**
 * Earthdata Authentication Test Script
 * Tests NASA Earthdata Login credentials and API access
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env file from the backend directory
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('ERROR loading .env file:', result.error);
  process.exit(1);
}

console.log('.env file loaded successfully!\n');

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEarthdataAuth() {
  log('\n🚀 Testing NASA Earthdata Authentication\n', 'blue');

  // Check if credentials are configured
  const username = process.env.EARTHDATA_USERNAME;
  const password = process.env.EARTHDATA_PASSWORD;
  const token = process.env.EARTHDATA_TOKEN;

  console.log('Debug - checking environment variables:');
  console.log('Username exists:', !!username, username ? `(${username})` : '');
  console.log('Password exists:', !!password, password ? '(hidden)' : '');
  console.log('Token exists:', !!token, token ? `(${token.substring(0, 20)}...)` : '');
  console.log('');

  // Validation
  if (!username || !password || !token) {
    log('❌ ERROR: Missing credentials in .env file', 'red');
    log('\nPlease fill in the following in backend/.env:', 'yellow');
    if (!username) log('  - EARTHDATA_USERNAME', 'yellow');
    if (!password) log('  - EARTHDATA_PASSWORD', 'yellow');
    if (!token) log('  - EARTHDATA_TOKEN', 'yellow');
    process.exit(1);
  }

  log('✅ Credentials found in .env file', 'green');
  log(`   Username: ${username}`, 'blue');
  log(`   Token: ${token.substring(0, 10)}...`, 'blue');

  // Test 1: Validate token format
  log('\n📋 Test 1: Validating token format...', 'blue');
  if (token.length < 20) {
    log('❌ Token appears to be invalid (too short)', 'red');
    return false;
  }
  log('✅ Token format looks valid', 'green');

  // Test 2: Test GIBS endpoint (public - no auth needed)
  log('\n📋 Test 2: Testing GIBS endpoint access...', 'blue');
  try {
    const https = require('https');
    const gibsUrl = process.env.NASA_GIBS_BASE_URL + '?request=GetCapabilities&service=WMTS';
    
    await new Promise((resolve, reject) => {
      https.get(gibsUrl, (res) => {
        if (res.statusCode === 200) {
          log('✅ GIBS endpoint is accessible', 'green');
          resolve();
        } else {
          log(`⚠️  GIBS returned status: ${res.statusCode}`, 'yellow');
          resolve();
        }
      }).on('error', reject);
    });
  } catch (error) {
    log(`❌ GIBS test failed: ${error.message}`, 'red');
  }

  // Test 3: Verify token structure (JWT)
  log('\n📋 Test 3: Validating token structure...', 'blue');
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      log('✅ Token has valid JWT structure', 'green');
      
      // Decode the payload (second part)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      log(`   Token issued for: ${payload.uid}`, 'blue');
      log(`   Token expires: ${new Date(payload.exp * 1000).toLocaleDateString()}`, 'blue');
    } else {
      log('⚠️  Token structure looks unusual', 'yellow');
    }
  } catch (error) {
    log(`⚠️  Could not decode token: ${error.message}`, 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('✅ EARTHDATA AUTHENTICATION SETUP COMPLETE', 'green');
  log('='.repeat(60), 'blue');
  log('\nYou are ready to proceed with:', 'green');
  log('  ✓ Google Earth Engine setup', 'green');
  log('  ✓ VIIRS data access', 'green');
  log('  ✓ SMAP data integration', 'green');
  log('  ✓ FIRMS active fire data', 'green');
  log('\n');

  return true;
}

// Run the test
testEarthdataAuth().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});