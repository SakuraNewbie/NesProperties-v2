import { useState } from 'react';

const PropertyCard = ({ message, onActionClick }) => {
  // Always call hooks first!
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const property = message.property;
  if (!property) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  return (
    <div className="p-4 rounded shadow bg-white dark:bg-gray-700 mb-4">
      <div className="p-3">
        {/* Image Carousel */}
        <div className="relative my-2">
          {property.images && property.images.length > 0 ? (
            <>
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                className="w-full h-36 object-cover cursor-pointer rounded"
                onClick={handleImageClick}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  e.target.onerror = null;
                }}
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-r"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-l"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {property.images.map((_, i) => (
                      <span
                        key={i}
                        className={`block w-1.5 h-1.5 rounded-full ${
                          i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-36 bg-gray-200 flex items-center justify-center rounded">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
        </div>

        {/* Card Header */}
        <div className="font-bold text-lg mb-1">{property.title || property.area}</div>
        <div className="text-sm text-gray-500 mb-1">{property.fullAddress}</div>
        <div className="text-sm mb-1">
          Distance to USAS: {property.distanceToUSAS ? `${property.distanceToUSAS} km` : 'N/A'}
        </div>
        {property.price && (
          <div className="text-emerald-700 font-semibold mb-1">{property.price} RM/month</div>
        )}

        {/* Location */}
        {property.location && typeof property.location === 'object' ? (
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
            {property.location.area && <span>{property.location.area}</span>}
            {property.location.fullAddress && <span>{property.location.fullAddress}</span>}
            {property.location.distanceToUSAS && <span>{property.location.distanceToUSAS} km</span>}
          </div>
        ) : (
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
            <span>{property.location}</span>
          </div>
        )}

        {/* Details */}
        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
          <span>{property.bedrooms} BR</span>
          <span>•</span>
          <span>{property.bathrooms} BA</span>
          <span>•</span>
          <span>{property.area} sq ft</span>
        </div>

        <div className="text-xs text-gray-600 mt-2">{property.description}</div>

        {/* Tenant preferences */}
        {property.gender && (
          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                property.gender === 'female'
                  ? 'bg-pink-100 text-pink-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {property.gender === 'female' ? 'Female tenants only' : 'Male tenants only'}
            </span>
          </div>
        )}

        {/* Student indicator */}
        {property.forStudents && (
          <div className="mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Student accommodation
            </span>
          </div>
        )}

        {/* Nearby facilities */}
        {property.nearbyFacilities && property.nearbyFacilities.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500">Nearby:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {property.nearbyFacilities.map((facility, i) => (
                <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onActionClick(`Schedule viewing for property ${property.id}`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-1 px-3 rounded flex-1 transition text-sm"
          >
            Schedule Viewing
          </button>
          <button
            onClick={() => onActionClick(`Contact agent about property ${property.id}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 sm:py-1 px-3 rounded flex-1 transition text-sm"
          >
            Contact Agent
          </button>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-1">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </div>
      </div>

      {/* Full-screen image modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Photo ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2"
              onClick={() => setIsImageModalOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;