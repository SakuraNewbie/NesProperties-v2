const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Terrace', 'Apartment', 'Condo', 'House', '1-Storey Terrace', '2-Storey Terrace', 'Semi-D']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  location: {
    area: {
      type: String,
      required: [true, 'Area/neighborhood is required']
    },
    fullAddress: {
      type: String,
      required: [true, 'Full address is required']
    },
    distanceToUSAS: {
      type: Number,
      required: [true, 'Distance to USAS is required']
    }
  },
  rooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required']
  },
  squareFeet: {
    type: Number,
    required: [true, 'Square footage is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  genderRestriction: {
    type: String,
    enum: ['none', 'male_only', 'female_only'],
    default: 'none'
  },
  amenities: {
    type: [String],
    default: []
  },
  images: [{
    imagePath: String,
    isPrimary: Boolean,
    imageType: {
      type: String,
      enum: ['regular', 'panorama', 'virtualTour'],
      default: 'regular'
    },
    altText: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: [true, 'Property must belong to an owner']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a text index for searching
propertySchema.index({ 
  title: 'text', 
  'location.area': 'text', 
  'location.fullAddress': 'text', 
  description: 'text' 
});

// Update the 'updatedAt' field on save
propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
