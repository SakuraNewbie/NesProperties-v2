const PropertyList = ({ message, onPropertyClick, onSuggestionClick, darkMode }) => {
  const properties = message.properties || [];
  return (
    <div>
      {properties.map((property, idx) => (
        <div
          key={property._id || idx}
          className={`mb-4 p-3 border rounded cursor-pointer hover:bg-emerald-50 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          tabIndex={0}
          aria-label={`View details for ${property.title || property.area}`}
          onClick={() => onPropertyClick && onPropertyClick(property._id)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onPropertyClick && onPropertyClick(property._id)}
        >
          <div className="font-bold">{property.title || property.area}</div>
          <div className="text-xs text-gray-400">{property.fullAddress}</div>
          <div className="text-sm">Distance to USAS: {property.distanceToUSAS ? `${property.distanceToUSAS} km` : 'N/A'}</div>
          {/* Example tags */}
          {property.tags && property.tags.map((tag, i) => (
            <span key={i} className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mr-2 mt-2">{tag}</span>
          ))}
          {/* Price */}
          {property.price && (
            <div className="mt-1 text-emerald-700 font-semibold">{property.price} RM/month</div>
          )}
        </div>
      ))}
      {/* Suggestions */}
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.suggestions.map((s, i) => (
            <button
              key={i}
              className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => onSuggestionClick && onSuggestionClick(s)}
              tabIndex={0}
              aria-label={s}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;