const express = require('express');
const router = express.Router();
const { getSummary, getEvents, flushEvents } = require('../utils/eventLogger');

// Middleware to check admin access
const checkAdminAccess = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Admin access required' });
  }
};

// Get system status and summary
router.get('/status', checkAdminAccess, (req, res) => {
  const summary = getSummary();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`
    },
    summary
  });
});

// Get events for a specific date
router.get('/events/:date?', checkAdminAccess, (req, res) => {
  const date = req.params.date || new Date().toISOString().split('T')[0];
  
  // Force flush events to ensure we have the latest data
  flushEvents();
  
  const events = getEvents(date);
  res.json({
    date,
    count: events.length,
    events
  });
});

// Get all API endpoint stats
router.get('/endpoints', checkAdminAccess, (req, res) => {
  const summary = getSummary();
  
  // Sort endpoints by usage
  const sortedEndpoints = Object.entries(summary.apiEndpoints)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  
  res.json({
    total: summary.totalRequests,
    endpoints: sortedEndpoints
  });
});

// Get user activity
router.get('/users', checkAdminAccess, (req, res) => {
  const summary = getSummary();
  
  // Sort users by activity
  const sortedUsers = Object.entries(summary.userActivity)
    .sort((a, b) => b[1].requests - a[1].requests)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  
  res.json({
    userCount: Object.keys(summary.userActivity).length,
    users: sortedUsers
  });
});

// Get errors
router.get('/errors', checkAdminAccess, (req, res) => {
  const summary = getSummary();
  
  res.json({
    count: summary.errors.length,
    errors: summary.errors
  });
});

module.exports = router;