import http from 'http';

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Server is running' }));
});

server.listen(5000, () => {
  console.log('Test server listening on port 5000');
});