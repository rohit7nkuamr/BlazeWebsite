const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const ip = require('ip');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  const localIp = ip.address();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`To access from other devices on your network, use: http://${localIp}:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
