import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const PropertyGrid = ({ properties }) => {
  // Helper function to get the complete property image URL
  const getPropertyImage = (property) => {
    // Check if property has images array and it's not empty
    if (property.images && property.images.length > 0) {
      // Try to find a primary image first
      const primaryImage = property.images.find(img => img.isPrimary);
      const imagePath = primaryImage ? primaryImage.imagePath : property.images[0].imagePath;
      
      // Convert relative URL to absolute URL if needed
      if (imagePath.startsWith('http')) {
        return imagePath;
      } else {
        // Remove the /api suffix from the base URL to get the correct domain
        const baseUrl = api.baseUrl.replace(/\/api$/, '');
        return `${baseUrl}${imagePath}`;
      }
    }
    // Fallback to a placeholder image
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <Link 
          key={property._id} 
          to={`/properties/${property._id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-w-16 aspect-h-9">
            <img 
              src={getPropertyImage(property)}
              alt={property.title}
              className="object-cover h-48 w-full"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }}
            />
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{property.title}</h3>
            <p className="text-emerald-600 font-medium mb-2">RM {property.price.toLocaleString()} / month</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{property.type}</span>
              <span>{property.bedrooms} BR • {property.bathrooms} BA</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <span>{property.location?.area || 'Area N/A'}</span>
              {property.location?.distanceToUSAS && (
                <span className="ml-2">• {property.location.distanceToUSAS}km to USAS</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PropertyGrid;