const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const fetch = require('node-fetch');

// Llama 2 integration endpoint
router.post('/llm', async (req, res) => {
  try {
    // Accept both message and propertyId from frontend
    const { message, propertyId, context = {} } = req.body;

    let property = null;
    let properties = [];
    let isDetail = false;

    // 1. If propertyId is provided (clicked from UI), fetch by ID
    if (propertyId) {
      property = await Property.findById(propertyId);
      isDetail = !!property;
    }

    // 2. If not, try to extract a property title from the message
    if (!isDetail && message) {
      const propertyMatch = message.match(/property\s+([a-zA-Z0-9\s]+)/i);
      if (propertyMatch) {
        property = await Property.findOne({ title: new RegExp(propertyMatch[1].trim(), 'i') });
        isDetail = !!property;
      }
    }

    // 3. If not detail, check for list intent
    if (!isDetail && message && /property|apartment|house|show|list/i.test(message)) {
      properties = await Property.find({}).limit(5);
    }


    // Return property-card if detail, property-list if list, text otherwise
    if (property) {
      res.json({
        type: 'property-card',
        property: property,
        content: 'Here are the details for this property...',
        suggestions: ['Contact owner', 'Show similar properties'],
        context: { ...context }
      });
    } else if (properties.length) {
      res.json({
        type: 'property-list',
        properties,
        content: llmResponse.response,
        suggestions: ['Show more', 'Filter by price', 'Contact owner'],
        context: { ...context }
      });
    } else {
      res.json({
        type: 'text',
        content: llmResponse.response,
        suggestions: [],
        context: { ...context }
      });
    }
  } catch (error) {
    res.status(500).json({
      type: 'text',
      content: 'Sorry, something went wrong. Please try again later.',
      suggestions: ['Try again', 'Contact support']
    });
  }
});

module.exports = router;
