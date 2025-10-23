import React from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { allProperties } from '../data/properties';

const FeaturedProperties = () => {
  // Select featured properties (first 3 properties from allProperties)
  // In a real app, you might have a "featured" flag in your data
  const featuredProperties = allProperties
    .filter(property => property.featured || property.id <= 3) // Get properties marked as featured or first 3
    .slice(0, 6); // Limit to 6 properties max
    
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-600 mt-2">Discover our handpicked selection of premium properties</p>
          </div>
          <Link 
            to="/properties" 
            className="mt-4 md:mt-0 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors duration-300 inline-flex items-center"
          >
            View All Properties
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                featured={true}  // Pass featured flag to show special styling
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No featured properties at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;