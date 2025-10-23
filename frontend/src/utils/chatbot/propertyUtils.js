import { allProperties, PRICE_UNIT } from '../../data/properties';

// Define property types from actual data
export const propertyTypes = [...new Set(allProperties.map(p => p.type))];

// Define locations from actual data
export const propertyLocations = [...new Set(allProperties.map(p => p.location))];

// Format price with proper currency
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(price);
};

// Filter properties based on search preferences
export const filterProperties = (preferences) => {
  try {
    let results = [...allProperties];
    
    // Filter by type
    if (preferences.type) {
      results = results.filter(p => p.type === preferences.type);
    }
    
    // Filter by location
    if (preferences.location) {
      const locationPattern = new RegExp(preferences.location, 'i');
      results = results.filter(p => locationPattern.test(p.location));
    }
    
    // Filter by price range
    if (preferences.minPrice) {
      results = results.filter(p => p.price >= preferences.minPrice);
    }
    
    if (preferences.maxPrice) {
      results = results.filter(p => p.price <= preferences.maxPrice);
    }
    
    // Filter by bedrooms
    if (preferences.minBedrooms) {
      results = results.filter(p => p.bedrooms >= preferences.minBedrooms);
    }
    
    // Filter by gender preference
    if (preferences.gender) {
      results = results.filter(p => 
        p.gender === preferences.gender ||
        (preferences.gender === 'female' && p.title.toLowerCase().includes('girl')) ||
        (preferences.gender === 'male' && p.title.toLowerCase().includes('men'))
      );
    }
    
    // Filter for students
    if (preferences.forStudents) {
      results = results.filter(p => 
        p.forStudents ||
        p.title.toLowerCase().includes('student') || 
        p.title.toLowerCase().includes('usas')
      );
    }
    
    // Format results for display
    return results.map(property => ({
      id: property.id,
      title: property.title,
      price: formatPrice(property.price),
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      image: property.image,
      gender: property.gender,
      forStudents: property.forStudents
    }));
  } catch (error) {
    console.error("Error filtering properties:", error);
    return [];
  }
};

// Get detailed property information by ID
export const getPropertyDetails = (id) => {
  try {
    const property = allProperties.find(p => p.id === parseInt(id));
    
    if (!property) return null;
    
    return {
      id: property.id,
      title: property.title,
      description: property.description || `Beautiful ${property.bedrooms}-bedroom ${property.type.toLowerCase()} located in ${property.location}.`,
      price: formatPrice(property.price),
      priceUnit: property.priceUnit || PRICE_UNIT,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      type: property.type,
      gender: property.gender,
      forStudents: property.forStudents,
      nearbyFacilities: property.nearbyFacilities || [],
      images: property.images || [property.image],
      available: property.available,
      availableFrom: property.availableFrom
    };
  } catch (error) {
    console.error("Error getting property details:", error);
    return null;
  }
};

// Enhance recommendation engine with machine learning-inspired scoring
export const getRecommendedProperties = (currentProperty, userContext) => {
  if (!currentProperty) return [];
  
  // Extract user preferences from context
  const userPrefs = getUserPreferences(userContext);
  
  // Get similar properties based on various criteria
  const similarProperties = allProperties.filter(p => 
    p.id !== currentProperty.id && (
      (p.location === currentProperty.location) || // Same location
      (p.type === currentProperty.type) || // Same type
      (Math.abs(p.bedrooms - currentProperty.bedrooms) <= 1) || // Similar bedrooms
      (Math.abs(p.price - currentProperty.price) < currentProperty.price * 0.2) // Similar price range (within 20%)
    )
  );
  
  // Score each property based on similarity and user preferences
  const scoredProperties = similarProperties.map(p => {
    let score = 0;
    
    // Base similarity scoring
    if (p.location === currentProperty.location) score += 3;
    if (p.type === currentProperty.type) score += 2;
    
    // Price similarity - closer gets higher score
    const priceDiff = Math.abs(p.price - currentProperty.price);
    const priceRange = currentProperty.price * 0.2;
    if (priceDiff < priceRange * 0.25) score += 4;
    else if (priceDiff < priceRange * 0.5) score += 3;
    else if (priceDiff < priceRange * 0.75) score += 2;
    else if (priceDiff < priceRange) score += 1;
    
    // Bedroom preference
    if (p.bedrooms === currentProperty.bedrooms) score += 2;
    else if (Math.abs(p.bedrooms - currentProperty.bedrooms) === 1) score += 1;
    
    // Gender preference match
    if (userPrefs.gender && p.gender === userPrefs.gender) score += 3;
    else if (p.gender === currentProperty.gender) score += 2;
    
    // Student accommodation match
    if (userPrefs.forStudents && p.forStudents) score += 3;
    else if (p.forStudents === currentProperty.forStudents) score += 2;
    
    // Bonus points for properties with more photos
    if (p.images && p.images.length > 2) score += 1;
    
    // Boost score for properties that match user's past clicks
    if (userPrefs.viewedProperties && userPrefs.viewedProperties.includes(p.id)) {
      score += 1;
    }
    
    return { property: p, score };
  });
  
  // Sort by score (highest first) and return top 3
  return scoredProperties
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => ({
      id: item.property.id,
      title: item.property.title,
      price: formatPrice(item.property.price),
      location: item.property.location,
      bedrooms: item.property.bedrooms,
      image: item.property.image,
      score: item.score // Include score for debugging
    }));
};

// Helper function to extract user preferences from context
function getUserPreferences(userContext) {
  const prefs = {
    gender: userContext.searchPreferences?.gender,
    forStudents: userContext.searchPreferences?.forStudents,
    minPrice: userContext.searchPreferences?.minPrice,
    maxPrice: userContext.searchPreferences?.maxPrice,
    location: userContext.searchPreferences?.location,
    minBedrooms: userContext.searchPreferences?.minBedrooms,
    viewedProperties: userContext.viewedProperties || []
  };
  
  return prefs;
}