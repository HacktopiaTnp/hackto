import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('\n========================================');
  console.log('   CLOUDINARY CONFIGURATION TEST');
  console.log('========================================\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
  console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
  console.log('   Upload Folder:', process.env.CLOUDINARY_FOLDER || 'tnp-portal (default)');
  console.log('   Upload Preset:', process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload (default)');

  // Verify configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    console.log('\n❌ ERROR: Missing Cloudinary credentials in .env file');
    console.log('\nTo fix:');
    console.log('1. Go to https://cloudinary.com/console/settings/api-keys');
    console.log('2. Copy your cloud name, API key, and API secret');
    console.log('3. Add them to .env file:');
    console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('   CLOUDINARY_API_KEY=your_api_key');
    console.log('   CLOUDINARY_API_SECRET=your_api_secret');
    console.log('4. Restart the server\n');
    return false;
  }

  // Test API connection
  console.log('\n2. Testing API Connection:');
  try {
    const result = await (cloudinary.api as any).ping();
    console.log('   Status:', '✓ Connected');
    console.log('   Response:', result);

    // Test URL generation
    console.log('\n3. Testing URL Generation:');
    const testUrl = cloudinary.url('sample.jpg', {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
    console.log('   Generated URL:', testUrl);

    console.log('\n✓ Cloudinary is properly configured and working!');
    console.log('========================================\n');
    return true;
  } catch (error) {
    console.log('   Status:', '✗ Connection Failed');
    console.log('   Error:', error instanceof Error ? error.message : String(error));
    console.log('\n❌ Failed to connect to Cloudinary');
    console.log('   Possible issues:');
    console.log('   - Invalid credentials');
    console.log('   - Check your API key and secret');
    console.log('   - Verify Cloud Name is correct\n');
    return false;
  }
}

// Run test
testCloudinary().then(success => {
  process.exit(success ? 0 : 1);
});
