/**
 * API Key Generator
 *
 * Generates secure random API keys for authentication
 * Run: node config/api-key-generator.js
 */

const { generateApiKey } = require('./api-auth');

console.log('\n🔐 Grassland Resilience Navigator - API Key Generator\n');

// Generate a new API key
const apiKey = generateApiKey();

console.log('Generated API Key:');
console.log('━'.repeat(50));
console.log(apiKey);
console.log('━'.repeat(50));

console.log('\n📋 Add to .env file:');
console.log(`API_AUTH_ENABLED=true`);
console.log(`API_KEYS=${apiKey}`);

console.log('\n📋 Add to Vercel Environment Variables:');
console.log(`1. Go to Vercel Dashboard → Settings → Environment Variables`);
console.log(`2. Add: API_AUTH_ENABLED = true`);
console.log(`3. Add: API_KEYS = ${apiKey}`);
console.log(`4. Apply to Production, Preview, Development`);
console.log(`5. Redeploy`);

console.log('\n✅ Next Steps:');
console.log('1. Copy the API key above');
console.log('2. Add to your .env file');
console.log('3. Add to Vercel environment variables');
console.log('4. Test with: curl -H "X-API-Key: YOUR_KEY" https://your-domain.com/api/health');

console.log('\n⚠️  Security:');
console.log('- Never commit this key to Git');
console.log('- Store securely (password manager, env variables)');
console.log('- Rotate periodically (every 90 days)');

console.log('\n📖 Documentation: docs/api-authentication.md\n');
