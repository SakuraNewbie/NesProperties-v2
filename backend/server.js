const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const propertyRoutes = require('./routes/propertyRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const authRoutes = require('./routes/authRoutes');
// const chatbotRoutes = require('./routes/chatbotRoutes');

// Import tracking utilities
const { trackApiRequest, errorLogger } = require('./middleware/eventTracking');
const { logEvent } = require('./utils/eventLogger');
require('./utils/dbMonitor');

const app = express();

// CRITICAL: Place CORS middleware first, before any other middleware
// Configure CORS to allow the frontend origin(s). In production set FRONTEND_URL
// to your deployed frontend (e.g. https://your-frontend.vercel.app). When
// credentials: true is used we must not use '*' so we provide an allowlist.
const defaultFrontendOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : defaultFrontendOrigins;

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (configuredOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.warn('CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Explicit OPTIONS handler with proper status code
app.options('*', cors());

// Log server start
logEvent('server', {
  status: 'starting',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000
});

// Debug request logger - Add this before CORS middleware
app.use((req, res, next) => {
  // Create a copy of the request object with only the data we want to log
  const requestLog = {
    timestamp: new Date().toISOString(),
    id: req.id || Math.random().toString(36).substring(2, 15),
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    headers: {
      ...req.headers,
      // Redact sensitive headers if needed
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
    }
  };
  
  // For debugging POST/PUT requests, also log the body
  // Skip logging binary data like file uploads
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && 
      req.headers['content-type'] && 
      req.headers['content-type'].includes('application/json')) {
    // Body will be parsed by express.json() middleware
    req.on('data', chunk => {
      try {
        const body = JSON.parse(chunk.toString());
        requestLog.body = body;
      } catch (e) {
        // If we can't parse as JSON, log the raw data length
        requestLog.body = `[Raw data: ${chunk.length} bytes]`;
      }
    });
  }
  
  console.log('\n🔵 REQUEST:', JSON.stringify(requestLog, null, 2));
  
  // Capture the response
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Store response data for logging
  const responseLog = {
    requestId: requestLog.id,
    timestamp: null,
    statusCode: null,
    headers: null,
    body: null,
    responseTime: null
  };
  
  const startTime = Date.now();
  
  // Override res.send
  res.send = function(body) {
    responseLog.timestamp = new Date().toISOString();
    responseLog.statusCode = res.statusCode;
    responseLog.headers = res._headers;
    responseLog.responseTime = `${Date.now() - startTime}ms`;
    
    // Try to parse body as JSON if it's a string
    if (typeof body === 'string') {
      try {
        responseLog.body = JSON.parse(body);
      } catch (e) {
        // If not JSON, check if it's too large to log
        responseLog.body = body.length > 1000 ? `[String: ${body.length} chars]` : body;
      }
    } else {
      // For non-string responses (like objects passed to res.json)
      responseLog.body = body;
    }
    
    console.log('\n🟢 RESPONSE:', JSON.stringify(responseLog, null, 2));
    return originalSend.apply(res, arguments);
  };
  
  // Override res.json
  res.json = function(body) {
    responseLog.timestamp = new Date().toISOString();
    responseLog.statusCode = res.statusCode;
    responseLog.headers = res._headers;
    responseLog.responseTime = `${Date.now() - startTime}ms`;
    responseLog.body = body;
    
    console.log('\n🟢 RESPONSE:', JSON.stringify(responseLog, null, 2));
    return originalJson.apply(res, arguments);
  };
  
  // Override res.end to catch responses without body
  res.end = function(chunk) {
    if (!responseLog.timestamp) {
      responseLog.timestamp = new Date().toISOString();
      responseLog.statusCode = res.statusCode;
      responseLog.headers = res._headers;
      responseLog.responseTime = `${Date.now() - startTime}ms`;
      
      if (chunk) {
        responseLog.body = `[Raw data: ${chunk.length || 0} bytes]`;
      } else {
        responseLog.body = null;
      }
      
      console.log('\n🟢 RESPONSE:', JSON.stringify(responseLog, null, 2));
    }
    return originalEnd.apply(res, arguments);
  };
  
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add tracking middleware
app.use(trackApiRequest);

// Set static folder for uploaded files if available. `fileUpload` exports
// directory paths and indicates if disk storage is enabled.
try {
  const fileUploadUtil = require('./utils/fileUpload');
  if (fileUploadUtil && fileUploadUtil.diskUploadsEnabled) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  } else if (fileUploadUtil && !fileUploadUtil.diskUploadsEnabled) {
    console.warn('Uploads are using memory storage or tmpdir; skipping /uploads static mount');
  }
} catch (e) {
  // If utils/fileUpload fails to load for any reason, skip static mount
  console.warn('Could not configure /uploads static mount:', e.message);
}

// API routes
app.use('/api/properties', propertyRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/chatbot');

// Add new monitoring endpoints
app.use('/api/system', require('./routes/systemRoutes'));

// Error handler to ensure errors are logged too
app.use((err, req, res, next) => {
  console.log('\n🔴 ERROR:', JSON.stringify({
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    }
  }, null, 2));
  
  // Pass to existing error logger
  errorLogger(err, req, res, next);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logEvent('database', { status: 'connected', uri: process.env.MONGODB_URI.replace(/\/\/(.+?):.+?@/, '//\\1:[REDACTED]@') });
    console.log('MongoDB Connected');
  })
  .catch(err => {
    logEvent('error', { message: 'MongoDB Connection Error', details: err.message });
    console.error('MongoDB Connection Error:', err);
  });

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin.html'));
});

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when this file is run directly (node server.js).
// In serverless platforms (like Vercel) this file will be imported and the
// platform provides its own HTTP handling. Exporting the `app` makes it
// possible to wrap it with a serverless adapter (e.g. serverless-http).
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    logEvent('server', { status: 'running', port: PORT, url: `http://192.168.1.3:${PORT}` });
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at http://192.168.1.3:${PORT}`);
    console.log(`Debug logging enabled - all API traffic will be logged to console`);
  });
}

// Export the Express app so serverless wrappers can mount it.
module.exports = app;
