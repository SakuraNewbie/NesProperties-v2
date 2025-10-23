import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Footer from '../components/Footer';
import VirtualTour from '../components/virtualtourv2/VirtualTour';
import ChatBotv2 from '../components/ChatBotv2';

// Helper function to get complete image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/800x600?text=No+Image';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  } else {
    // Remove the /api suffix from the base URL to get the correct domain
    const baseUrl = api.baseUrl.replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
  }
};

// Separate components for better organization
const PropertyImages = ({ property, mainImage, setMainImage }) => (
  <div className="w-full mb-8">
    <div className="rounded-lg overflow-hidden shadow-lg mb-4">
      <img
        src={getFullImageUrl(mainImage)}
        alt={property.title}
        className="w-full h-96 object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
        }}
      />
    </div>
    {property.images && property.images.length > 1 && (
      <div className="flex flex-wrap justify-center gap-2">
        {property.images.map((img, idx) => (
          <img
            key={idx}
            src={getFullImageUrl(img.imagePath)}
            alt={`Thumbnail ${idx + 1}`}
            className={`w-24 h-20 object-cover rounded cursor-pointer border-2 ${
              mainImage === img.imagePath ? 'border-emerald-600' : 'border-transparent'
            }`}
            onClick={() => setMainImage(img.imagePath)}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ))}
      </div>
    )}
  </div>
);

const PropertyInfo = ({ property }) => {
  // Extract location correctly
  const locationString = property.location ? 
    (typeof property.location === 'string' ? 
      property.location : 
      property.location.fullAddress || property.location.area || 'Location not specified')
    : 'Location not specified';

  // Get area value from either field name
  const areaValue = property.area || property.squareFeet;

  return (
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
      <p className="text-emerald-600 text-xl font-semibold mb-2">
      MYR {property.price.toLocaleString()}
      </p>
      <p className="text-gray-600 mb-4">{locationString}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4 max-w-2xl mx-auto md:mx-0">
        <div><span className="font-semibold">Bedrooms:</span> {property.bedrooms}</div>
        <div><span className="font-semibold">Bathrooms:</span> {property.bathrooms}</div>
        <div>
          <span className="font-semibold">Area:</span> 
          {areaValue ? `${areaValue} sq ft` : 'Not specified'}
        </div>
        {property.yearBuilt && (
          <div><span className="font-semibold">Year Built:</span> {property.yearBuilt}</div>
        )}
        {property.parkingSpaces && (
          <div><span className="font-semibold">Parking:</span> {property.parkingSpaces}</div>
        )}
        {property.type && (
          <div><span className="font-semibold">Type:</span> {property.type}</div>
        )}
      </div>
    </div>
  );
};

// New component for Owner Contact information
const OwnerContact = ({ owner }) => {
  if (!owner) return null;
  
  // Format phone number for WhatsApp link - remove hyphens and spaces
  const whatsappNumber = owner.phone.replace(/[-\s]/g, '');
  
  // Check common property names for owner name
  const ownerName = owner.name || 
                   owner.fullName || 
                   owner.username || 
                   (owner.firstName && owner.lastName ? `${owner.firstName} ${owner.lastName}` : '') || 
                   'Owner';
  
  return (
    <div className="mt-8 bg-emerald-50 p-6 rounded-lg border border-emerald-100 shadow-sm">
      <h2 className="text-xl font-semibold text-emerald-800 mb-3">Contact Property Owner</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow">
          <div className="mb-2">
            <p className="font-medium text-gray-700">Owner:</p>
            <p>{ownerName}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Phone:</p>
            <p>{owner.phone}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a 
            href={`tel:${owner.phone.replace(/[-\s]/g, '')}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Call
          </a>
          <a 
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

const PropertyDescription = ({ description }) => (
  <div className="mt-6">
    <h2 className="text-xl font-semibold mb-2">Description</h2>
    <p className="text-gray-700">{description}</p>
  </div>
);

const PropertyFeatures = ({ features = [], amenities = [] }) => {
  const featuresList = features.length > 0 ? features : amenities;
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Features</h2>
      <ul className="list-disc list-inside text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
        {featuresList.length > 0
          ? featuresList.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))
          : <li className="text-gray-400">No features listed.</li>
        }
      </ul>
    </div>
  );
};

const PropertyMap = ({ property }) => (
  property.mapData && (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Location</h2>
      <div className="rounded-lg overflow-hidden shadow border border-gray-200">
        <iframe
          title={`Map of ${property.title}`}
          src={property.mapData.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
      <div className="mt-2 text-center">
        <a 
          href={property.mapData.directLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Google Maps
        </a>
      </div>
    </section>
  )
);

// Main component
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch property details from API
        const response = await fetch(`${api.baseUrl}/properties/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch property: ${response.status}`);
        }
        
        const propertyData = await response.json();
        setProperty(propertyData);
        
        // Set the main image if property has images
        if (propertyData.images && propertyData.images.length > 0) {
          const primaryImage = propertyData.images.find(img => img.isPrimary);
          setMainImage(primaryImage ? primaryImage.imagePath : propertyData.images[0].imagePath);
        }
        
        // Fix: Properly fetch owner data using the owner ID (string)
        if (propertyData.owner && typeof propertyData.owner === 'string') {
          try {
            const ownerResponse = await fetch(`${api.baseUrl}/owners/${propertyData.owner}`);
            if (ownerResponse.ok) {
              const ownerData = await ownerResponse.json();
              setOwner(ownerData);
            }
          } catch (ownerError) {
            console.error('Error fetching owner:', ownerError);
          }
        } else if (propertyData.owner && propertyData.owner._id) {
          // If owner is an object with _id property
          try {
            const ownerResponse = await fetch(`${api.baseUrl}/owners/${propertyData.owner._id}`);
            if (ownerResponse.ok) {
              const ownerData = await ownerResponse.json();
              setOwner(ownerData);
            }
          } catch (ownerError) {
            console.error('Error fetching owner:', ownerError);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Property not found');
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleImageClick = (image) => setMainImage(image);

  if (loading) {
    return <div className="text-center py-20 text-lg">Loading property details...</div>;
  }

  if (error || !property) {
    return <div className="text-center py-20 text-red-500">{error || 'Property not found'}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-start mb-6">  {/* Changed from justify-center to justify-start */}
          <button
            onClick={() => navigate('/properties')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            &larr; Back
          </button>
        </div>

        {/* Main content with new layout */}
        <div className="max-w-6xl mx-auto">
          {/* Property Images - Full width at top */}
          {!loading && property && (
            <PropertyImages 
              property={property} 
              mainImage={mainImage} 
              setMainImage={handleImageClick} 
            />
          )}
          
          {/* Property Info & Details */}
          <div className="mb-10">
            {!loading && property && (
              <>
                <PropertyInfo property={property} />
                <OwnerContact owner={owner} />
                <PropertyDescription description={property.description} />
                <PropertyFeatures 
                  features={property.features} 
                  amenities={property.amenities} 
                />
                
                {/* Virtual Tour - Using the updated VirtualTourV2 component */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-emerald-700 text-center">Virtual Tour</h2>
                  <VirtualTour propertyId={property._id} />
                </section>
                
                <PropertyMap property={property} />
              </>
            )}
          </div>
        </div>
      </div>
      <ChatBotv2 />
      {/* Footer */}
      <Footer />
    </>
  );
};

export default PropertyDetail;