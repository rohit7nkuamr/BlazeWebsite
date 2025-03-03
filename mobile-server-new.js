const express = require('express');
const path = require('path');
const ip = require('ip');
const os = require('os');

// Get available network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        results.push({
          name: name,
          address: iface.address
        });
      }
    }
  }
  
  return results;
}

// Create Express app
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get network interfaces for display
const networkInterfaces = getNetworkInterfaces();
const localIp = ip.address();

// Configuration
const config = {
  mobilePorts: [8080, 8082, 8084, 8086, 8088], // Try these ports in order
  localPort: 3000,                            // Port for localhost access
  hostname: '0.0.0.0'                         // Listen on all interfaces
};

// Start mobile server
function startMobileServer(portIndex = 0) {
  if (portIndex >= config.mobilePorts.length) {
    console.log('\n❌ Failed to start mobile server on any port. Check firewall settings.');
    return;
  }
  
  const currentPort = config.mobilePorts[portIndex];
  
  app.listen(currentPort, config.hostname)
    .on('listening', () => {
      console.log('\n✅ MOBILE SERVER STARTED SUCCESSFULLY');
      console.log('-----------------------------------');
      console.log(`📱 Mobile access URLs:`);
      
      // Display all available network interfaces
      networkInterfaces.forEach(iface => {
        console.log(`   http://${iface.address}:${currentPort} (${iface.name})`);
      });
      
      console.log('\n📋 INSTRUCTIONS:');
      console.log('1. Connect your mobile device to the same WiFi network as this computer');
      console.log(`2. Open your mobile browser and navigate to: http://${localIp}:${currentPort}`);
      console.log('3. If you cannot connect, check your firewall settings');
      console.log('   - Make sure the port is open');
      console.log('   - Ensure the app is allowed through the firewall');
      console.log('-----------------------------------');
    })
    .on('error', (err) => {
      console.log(`❌ Could not start mobile server on port ${currentPort}: ${err.message}`);
      startMobileServer(portIndex + 1);
    });
}

// Start local server
function startLocalServer() {
  app.listen(config.localPort, 'localhost')
    .on('listening', () => {
      console.log(`🖥️  Local access: http://localhost:${config.localPort}`);
    })
    .on('error', (err) => {
      console.log(`❌ Could not start local server on port ${config.localPort}: ${err.message}`);
      // Try alternative port for local access
      const altLocalPort = config.localPort + 1;
      app.listen(altLocalPort, 'localhost')
        .on('listening', () => {
          console.log(`🖥️  Local access: http://localhost:${altLocalPort}`);
        })
        .on('error', (err) => {
          console.log(`❌ Could not start local server on alternative port ${altLocalPort}: ${err.message}`);
        });
    });
}

// Start both servers
console.log('🚀 Starting Blaze Restaurant servers...');
startMobileServer();
startLocalServer();

console.log('\n⚠️  Press Ctrl+C to stop the servers');

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
