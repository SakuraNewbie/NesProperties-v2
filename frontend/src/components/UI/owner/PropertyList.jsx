const PropertyList = ({ properties, onDelete, onEdit, onManageImages, onManageVirtualTour }) => {
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
        <p className="text-gray-500 text-center py-6">You haven't added any properties yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Title</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Location</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Price</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Rooms</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{property.title || property.type}</td>
                <td className="px-4 py-3">{property.location}</td>
                <td className="px-4 py-3">MYR {property.price}</td>
                <td className="px-4 py-3">{property.rooms}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button 
                    onClick={() => onManageImages(property)}
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Images
                  </button>
                  
                  <button 
                    onClick={() => onManageVirtualTour(property)}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    360° Tour
                  </button>
                  
                  <button 
                    onClick={() => onEdit(property)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => onDelete(property._id)} 
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyList;