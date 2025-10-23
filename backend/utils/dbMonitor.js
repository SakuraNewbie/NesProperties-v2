const mongoose = require('mongoose');
const { logEvent } = require('./eventLogger');

// Track MongoDB operations
mongoose.set('debug', (collectionName, method, query, doc) => {
  logEvent('database', {
    collection: collectionName,
    operation: method,
    query: JSON.stringify(query),
    docSize: doc ? Object.keys(doc).length : 0
  });
});

module.exports = {};