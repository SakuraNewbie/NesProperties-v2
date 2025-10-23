const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const dailyLogFile = () => path.join(logsDir, `events-${new Date().toISOString().split('T')[0]}.json`);
const summaryFile = path.join(logsDir, 'summary.json');

// Initialize event buffer and summary data
let eventBuffer = [];
let summary = {
  totalRequests: 0,
  apiEndpoints: {},
  userActivity: {},
  errors: [],
  chatbotInteractions: 0,
  propertyViews: {},
  lastUpdated: new Date().toISOString()
};

// Load existing summary if available
try {
  if (fs.existsSync(summaryFile)) {
    summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  }
} catch (err) {
  console.error('Error loading summary file:', err);
}

// Log an event with automatic metadata
const logEvent = (eventType, data = {}) => {
  const timestamp = new Date();
  const event = {
    eventType,
    timestamp: timestamp.toISOString(),
    data
  };
  
  // Add to buffer
  eventBuffer.push(event);
  
  // Update summary statistics
  summary.totalRequests++;
  summary.lastUpdated = timestamp.toISOString();
  
  // Track API endpoints
  if (data.route) {
    summary.apiEndpoints[data.route] = (summary.apiEndpoints[data.route] || 0) + 1;
  }
  
  // Track user activity
  if (data.userId) {
    summary.userActivity[data.userId] = summary.userActivity[data.userId] || {
      requests: 0,
      lastActive: null
    };
    summary.userActivity[data.userId].requests++;
    summary.userActivity[data.userId].lastActive = timestamp.toISOString();
  }
  
  // Track errors
  if (eventType === 'error' && data.message) {
    summary.errors.push({
      timestamp: timestamp.toISOString(),
      message: data.message,
      stack: data.stack
    });
    // Keep only last 100 errors
    if (summary.errors.length > 100) {
      summary.errors = summary.errors.slice(-100);
    }
  }
  
  // Track chatbot
  if (eventType.startsWith('chatbot_')) {
    summary.chatbotInteractions++;
  }
  
  // Track property views
  if (eventType === 'property_view' && data.propertyId) {
    summary.propertyViews[data.propertyId] = (summary.propertyViews[data.propertyId] || 0) + 1;
  }
  
  // Write to console with color coding
  let consolePrefix = '';
  switch (eventType) {
    case 'error': consolePrefix = '\x1b[31m[ERROR]\x1b[0m'; break;
    case 'auth': consolePrefix = '\x1b[36m[AUTH]\x1b[0m'; break;
    case 'database': consolePrefix = '\x1b[33m[DB]\x1b[0m'; break;
    case 'request': consolePrefix = '\x1b[32m[REQ]\x1b[0m'; break;
    default: consolePrefix = `[${eventType.toUpperCase()}]`;
  }
  
  console.log(`${consolePrefix} ${timestamp.toISOString()} - ${JSON.stringify(data)}`);
  
  // Flush buffer to disk every 50 events or if it's an error
  if (eventBuffer.length >= 50 || eventType === 'error') {
    flushEvents();
  }
  
  return event;
};

// Flush events to disk
const flushEvents = () => {
  if (eventBuffer.length === 0) return;
  
  try {
    const logFilePath = dailyLogFile();
    let existingEvents = [];
    
    // Read existing file if it exists
    if (fs.existsSync(logFilePath)) {
      try {
        existingEvents = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
        if (!Array.isArray(existingEvents)) {
          existingEvents = [];
        }
      } catch (e) {
        console.error('Error parsing existing log file:', e);
      }
    }
    
    // Combine existing and new events
    const allEvents = [...existingEvents, ...eventBuffer];
    
    // Write to file
    fs.writeFileSync(logFilePath, JSON.stringify(allEvents, null, 2));
    
    // Write summary file
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    // Clear buffer
    eventBuffer = [];
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

// Make sure events get flushed on process exit
process.on('exit', flushEvents);
process.on('SIGINT', () => {
  flushEvents();
  process.exit(0);
});

module.exports = {
  logEvent,
  flushEvents,
  getSummary: () => summary,
  getEvents: (date = new Date().toISOString().split('T')[0]) => {
    const filePath = path.join(logsDir, `events-${date}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
  }
};