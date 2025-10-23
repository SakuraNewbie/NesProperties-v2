const { logEvent } = require('../utils/eventLogger');

/**
 * Middleware that logs all incoming API requests
 */
const trackApiRequest = (req, res, next) => {
  // Extract useful info from request
  const startTime = Date.now();
  const requestData = {
    method: req.method,
    route: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || req.user?._id || null,
    body: Object.keys(req.body || {}).reduce((obj, key) => {
      // Don't log sensitive info
      if (['password', 'token', 'creditCard'].includes(key)) {
        obj[key] = '[REDACTED]';
      } else {
        obj[key] = req.body[key];
      }
      return obj;
    }, {})
  };
  
  // Log the request
  logEvent('request', requestData);
  
  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log response info
    logEvent('response', {
      route: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || req.user?._id || null,
      contentLength: data ? data.length : 0
    });
    
    originalSend.apply(res, arguments);
  };
  
  next();
};

/**
 * Error handler that logs errors
 */
const errorLogger = (err, req, res, next) => {
  logEvent('error', {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
    userId: req.user?.id || req.user?._id || null
  });
  
  next(err);
};

module.exports = {
  trackApiRequest,
  errorLogger
};