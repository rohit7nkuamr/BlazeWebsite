const express = require('express');
const path = require('path');
const ip = require('ip');
const httpsLocalhost = require('https-localhost')();
const app = express();
const PORT = process.env.PORT || 3006;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start HTTP server (for local development)
app.listen(PORT, '0.0.0.0', () => {
  const localIp = ip.address();
  console.log(`HTTP server running at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://${localIp}:${PORT}`);
  console.log('');
  console.log('To access from your phone:');
  console.log(`1. Make sure your phone is connected to the same WiFi network as this computer`);
  console.log(`2. Open your phone's browser and navigate to: http://${localIp}:${PORT}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Start HTTPS server (optional, for testing secure features)
async function startHttpsServer() {
  try {
    const httpsPort = PORT + 1;
    const httpsApp = await httpsLocalhost.app();
    
    // Serve static files
    httpsApp.use(express.static(__dirname));
    
    // Route for home page
    httpsApp.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    httpsApp.listen(httpsPort, '0.0.0.0', () => {
      const localIp = ip.address();
      console.log(`\nHTTPS server running at:`);
      console.log(`- Local: https://localhost:${httpsPort}`);
      console.log(`- Network: https://${localIp}:${httpsPort}`);
      console.log('\nNote: For HTTPS on mobile devices, you may need to accept the self-signed certificate');
    });
  } catch (error) {
    console.error('Failed to start HTTPS server:', error.message);
  }
}

// Start the HTTPS server
startHttpsServer();
