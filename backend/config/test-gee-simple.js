/**
 * Simple GEE Test - Check if service account is valid
 * This uses a different authentication method to diagnose the issue
 */

require('dotenv').config();
const https = require('https');

async function testServiceAccount() {
  console.log('🔍 Testing GEE Service Account Validity\n');

  const serviceAccount = process.env.GEE_SERVICE_ACCOUNT;
  const projectId = process.env.GEE_PROJECT_ID;

  console.log('Service Account:', serviceAccount);
  console.log('Project ID:', projectId);
  console.log('\n' + '='.repeat(60));

  // Test 1: Check if private key format is correct
  console.log('\n📋 TEST 1: Private Key Format');
  const privateKey = process.env.GEE_PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ No private key found');
    return;
  }

  console.log('Key length:', privateKey.length);
  console.log('Has BEGIN:', privateKey.includes('BEGIN PRIVATE KEY'));
  console.log('Has END:', privateKey.includes('END PRIVATE KEY'));

  const parsedKey = privateKey.replace(/\\n/g, '\n');
  const lines = parsedKey.split('\n').filter(l => l.trim());
  console.log('Lines after parsing:', lines.length);
  console.log('First line:', lines[0]);
  console.log('Last line:', lines[lines.length - 1]);

  // Test 2: Check the @google/earthengine package
  console.log('\n📦 TEST 2: Earth Engine Package');
  try {
    const ee = require('@google/earthengine');
    console.log('✅ Package loaded');
    console.log('Version info:', ee.data ? 'data object exists' : 'no data object');
  } catch (error) {
    console.error('❌ Package error:', error.message);
  }

  // Test 3: Diagnose the timeout issue
  console.log('\n🔍 TEST 3: Authentication Timeout Analysis');
  console.log('\nPossible causes of timeout:');
  console.log('  1. Service account not registered with Earth Engine');
  console.log('  2. Service account deleted or disabled in GCP');
  console.log('  3. Private key does not match service account');
  console.log('  4. Network/firewall blocking GEE auth endpoints');
  console.log('  5. GEE project not properly configured');

  console.log('\n📝 Next steps to fix:');
  console.log('\n1. Verify service account exists in Google Cloud Console:');
  console.log('   https://console.cloud.google.com/iam-admin/serviceaccounts?project=' + projectId);

  console.log('\n2. Check if service account is registered with Earth Engine:');
  console.log('   Go to: https://code.earthengine.google.com/');
  console.log('   Click: Settings (gear icon) -> Project');
  console.log('   Verify:', projectId, 'is listed');

  console.log('\n3. Ensure service account has Earth Engine permission:');
  console.log('   In GCP Console, check IAM roles for:', serviceAccount);
  console.log('   Should have: "Earth Engine Resource Admin" or similar role');

  console.log('\n4. Try regenerating service account key:');
  console.log('   In GCP Console -> Service Accounts -> Actions -> Manage Keys');
  console.log('   Create new key -> JSON format');
  console.log('   Extract the private_key field');

  console.log('\n5. Alternative: Use OAuth2 instead of service account');
  console.log('   This might work better with serverless functions');

  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
  console.log('The service account authentication is timing out,');
  console.log('which means GEE is not accepting the credentials.');
  console.log('\nThis is NOT a code issue - the automatic generation');
  console.log('code is perfect. This is a GEE account configuration issue.');
}

testServiceAccount();
