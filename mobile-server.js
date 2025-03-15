const express = require('express');
const path = require('path');
const ip = require('ip');

// Create two separate app instances for better isolation
const mobileApp = express();
const localApp = express();

// Serve static files from the current directory for both apps
mobileApp.use(express.static(__dirname));
localApp.use(express.static(__dirname));

// Route for the home page for both apps
mobileApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

localApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server on port 80 for external access (mobile)
// Note: Port 80 might require admin privileges on some systems
const mobilePort = 8082; // Fallback to 8082 if 80 fails
const mobilePorts = [80, 8082, 8080, 3000]; // Try these ports in order
let mobileServerStarted = false;

// Try different ports for mobile access
function tryMobilePorts(portIndex = 0) {
  if (portIndex >= mobilePorts.length) {
    console.log('Failed to start mobile server on any port. Check firewall settings.');
    return;
  }
  
  const currentPort = mobilePorts[portIndex];
  const mobileServer = mobileApp.listen(currentPort, '0.0.0.0', () => {
    const localIp = ip.address();
    console.log(`Mobile access server running at: http://${localIp}:${currentPort}`);
    console.log(`Use this URL on your mobile device: http://${localIp}:${currentPort}`);
    console.log('If mobile access is not working, check your firewall settings.');
    console.log('Make sure the port is open and the app is allowed through the firewall.');
    mobileServerStarted = true;
  }).on('error', (err) => {
    console.log(`Could not start mobile server on port ${currentPort}: ${err.message}`);
    tryMobilePorts(portIndex + 1);
  });
}

// Start mobile server
tryMobilePorts();

// Start another instance on port 3001 for local access
const localPort = 3001;
localApp.listen(localPort, 'localhost', () => {
  console.log(`Local access server running at: http://localhost:${localPort}`);
}).on('error', (err) => {
  console.log(`Could not start local server on port ${localPort}: ${err.message}`);
  // Try alternative port for local access
  const altLocalPort = 3002;
  localApp.listen(altLocalPort, 'localhost', () => {
    console.log(`Local access server running at: http://localhost:${altLocalPort}`);
  });
});

console.log('Press Ctrl+C to stop the servers');

// Add some basic error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
