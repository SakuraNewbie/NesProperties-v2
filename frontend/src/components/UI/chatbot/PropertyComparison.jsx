import React from 'react';

const PropertyComparison = ({ properties }) => {
  if (!properties || properties.length < 2) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-800">
        Property Comparison
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Feature</th>
              {properties.map(property => (
                <th key={property.id} className="p-2 text-left min-w-[150px]">
                  Property #{property.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Image row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Image</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                      e.target.onerror = null;
                    }}
                  />
                </td>
              ))}
            </tr>
            {/* Price row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Price</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100 font-medium text-emerald-600">
                  {property.price}
                </td>
              ))}
            </tr>
            {/* Location row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Location</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  {property.location}
                </td>
              ))}
            </tr>
            {/* Type row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Type</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  {property.type}
                </td>
              ))}
            </tr>
            {/* Bedrooms row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Bedrooms</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  {property.bedrooms}
                </td>
              ))}
            </tr>
            {/* Bathrooms row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Bathrooms</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  {property.bathrooms}
                </td>
              ))}
            </tr>
            {/* Area row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Area</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  {property.area} sq ft
                </td>
              ))}
            </tr>
            {/* Special features row */}
            <tr>
              <td className="p-2 border-t border-gray-100">Special Features</td>
              {properties.map(property => (
                <td key={property.id} className="p-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {property.gender === 'female' && (
                      <span className="bg-pink-50 text-pink-600 text-xs px-1.5 py-0.5 rounded">Women only</span>
                    )}
                    {property.gender === 'male' && (
                      <span className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 rounded">Men only</span>
                    )}
                    {property.forStudents && (
                      <span className="bg-yellow-50 text-yellow-600 text-xs px-1.5 py-0.5 rounded">Students</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="p-2 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs py-1 px-3 rounded transition">
          Contact Agent About These Properties
        </button>
      </div>
    </div>
  );
};

export default PropertyComparison;