const os = require('os');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Get the best local IP address for network access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let bestIP = null;
  
  // Try to find the best IP address
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        // Prefer Wi-Fi/Ethernet over localhost
        if (!bestIP || (interface.address !== '127.0.0.1' && interface.address !== '169.254.x.x')) {
          bestIP = interface.address;
        }
      }
    }
  }
  
  return bestIP || 'localhost';
}

// Check if port is available
function checkPortAvailable(ip, port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: ip,
      port: port,
      path: '/',
      method: 'HEAD',
      timeout: 3000
    });
    
    req.on('response', () => {
      resolve(true);
      req.abort();
    });
    
    req.on('error', () => {
      resolve(false);
      req.abort();
    });
    
    req.setTimeout(1000, () => {
      resolve(false);
      req.abort();
    });
    
    req.end();
  });
}

// Generate multiple access URLs for maximum compatibility
function generateAccessURLs(ip, port) {
  const urls = [];
  
  // Primary: HTTP URL
  urls.push({
    type: 'HTTP',
    url: `http://${ip}:${port}`,
    description: 'Standard HTTP access'
  });
  
  // Try HTTPS variant
  urls.push({
    type: 'HTTPS',
    url: `https://${ip}:${port}`,
    description: 'HTTPS access (if SSL enabled)'
  });
  
  // Localhost fallback
  if (ip !== 'localhost') {
    urls.push({
      type: 'Localhost',
      url: `http://localhost:${port}`,
      description: 'Local machine access'
    });
  }
  
  // Network scan URL (for device discovery)
  urls.push({
    type: 'Network',
    url: `http://${ip}:${port}/network-test`,
    description: 'Network connectivity test'
  });
  
  return urls;
}

// Generate enhanced QR code for terminal display
function generateTerminalQR() {
  const localIP = getLocalIP();
  const port = 3000; // Default React port
  
  console.log('\n' + '='.repeat(70));
  console.log('� SAMB\'s Laundry Mobile App - Enhanced QR Scanner');
  console.log('='.repeat(70));
  
  // Generate all possible access URLs
  const accessURLs = generateAccessURLs(localIP, port);
  const primaryURL = accessURLs[0].url;
  
  console.log(`\n🌐 Network Information:`);
  console.log(`   IP Address: ${localIP}`);
  console.log(`   Port: ${port}`);
  console.log(`   Network: ${os.platform()}`);
  console.log(`   Status: ${localIP !== 'localhost' ? '✅ Network Ready' : '⚠️ Local Only'}`);
  
  // Check if server is responding
  console.log(`\n🔍 Checking Server Status...`);
  checkPortAvailable(localIP, port).then(isAvailable => {
    console.log(`   Server Status: ${isAvailable ? '✅ Online' : '❌ Offline'}`);
    
    if (!isAvailable) {
      console.log('\n⚠️  Server is not responding!');
      console.log('   Troubleshooting:');
      console.log('   • Make sure React app is running: npm start');
      console.log('   • Check if port 3000 is available');
      console.log('   • Verify firewall settings');
      console.log('   • Try: http://localhost:3000');
    }
    
    console.log('\n📱 SCANNABLE QR CODES:');
    console.log('═'.repeat(70));
    
    // Generate QR codes for all access methods
    accessURLs.forEach((access, index) => {
      console.log(`\n🔗 ${access.type.toUpperCase()} ACCESS:`);
      console.log(`   URL: ${access.url}`);
      console.log(`   ${access.description}`);
      
      try {
        // Generate QR code with error correction for better scanning
        qrcode.generate(access.url, {
          small: false, // Larger QR code for better scanning
          margin: 2,
          errorCorrectionLevel: 'H', // High error correction
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        if (index === 0) {
          console.log('   ⭐ PRIMARY QR CODE (Recommended)');
        }
      } catch (error) {
        console.error(`   ❌ Error generating ${access.type} QR:`, error.message);
      }
    });
    
    console.log('═'.repeat(70));
    
    console.log('\n📋 How to Connect:');
    console.log('1. 📱 Open phone camera OR any QR scanner app');
    console.log('2. 🎯 Point camera at PRIMARY QR code above');
    console.log('3. 🔗 Tap the link that appears on your screen');
    console.log('4. 🌐 SAMB\'s Laundry app will open instantly!');
    
    console.log('\n🎯 Alternative Access Methods:');
    accessURLs.forEach((access, index) => {
      console.log(`   ${index + 1}. ${access.type}: ${access.url}`);
    });
    
    console.log('\n⚡ Fast Connection Tips:');
    console.log('✅ All QR codes are optimized for fast scanning');
    console.log('✅ High error correction ensures reliable scanning');
    console.log('✅ Multiple access methods for maximum compatibility');
    console.log('✅ Large QR codes for better phone camera recognition');
    
    console.log('\n🔧 Troubleshooting:');
    console.log('❌ If QR code not scanning:');
    console.log('   • Make terminal window larger');
    console.log('   • Increase screen brightness');
    console.log('   • Try different QR scanner app');
    console.log('   • Ensure good lighting conditions');
    
    console.log('\n🌐 Network Issues:');
    console.log('❌ If "Cannot Connect":');
    console.log(`   • Check server is running: npm start`);
    console.log(`   • Try direct access: http://localhost:3000`);
    console.log(`   • Verify same WiFi network`);
    console.log(`   • Check firewall settings`);
    console.log(`   • Test with different device`);
    
    console.log('\n📱 Device Compatibility:');
    console.log('✅ Works with: iPhone, Android, iPad, Tablets');
    console.log('✅ Compatible with: Camera apps, QR scanners, Expo Go');
    console.log('✅ No app installation required - uses browser');
    
    console.log('\n' + '='.repeat(70));
  });
}

// Run the enhanced QR code generator
generateTerminalQR();
