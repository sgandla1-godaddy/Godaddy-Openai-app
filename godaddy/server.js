const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GoDaddy Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from GoDaddy Server!',
    data: {
      server: 'React Node.js Server',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/api/findDomain', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Domain found!',
    data: {
      domain: 'example.com',
      price: 100,
      availability: 'available'
    },
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/godaddy/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GoDaddy Server running on port ${PORT}`);
  console.log(`📱 React app will be served from http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
