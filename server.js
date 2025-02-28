const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3006;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`To access the website, open your browser and navigate to http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
