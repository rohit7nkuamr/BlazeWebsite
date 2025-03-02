const http = require('http');
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = 8080; // Change this to your desired port

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, world! Your server is running successfully.');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
