import React, { useEffect, useState } from "react";
import { api } from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, faPlus, faTrash, faEdit, 
  faSave, faTimes, faSpinner, faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const OwnerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    location: {
      area: "",
      fullAddress: "",
      distanceToUSAS: ""
    },
    description: "",
    genderRestriction: "none",
    amenities: []
  });

  const amenityOptions = [
    { id: "wifi", label: "WiFi" },
    { id: "air_conditioning", label: "Air Conditioning" },
    { id: "washing_machine", label: "Washing Machine" },
    { id: "water_heater", label: "Water Heater" }, 
    { id: "refrigerator", label: "Refrigerator" },
    { id: "study_desk", label: "Study Desk" },
    { id: "parking", label: "Parking" },
    { id: "security", label: "Security" }
  ];

  const propertyTypes = ["Terrace", "Apartment", "Condo", "House"];
  const genderOptions = [
    { value: "none", label: "No Restriction" },
    { value: "male_only", label: "Male Students Only" },
    { value: "female_only", label: "Female Students Only" }
  ];

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!user || !user.id) {
        setError("No user logged in. Please log in again.");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${api.baseUrl}/owners?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch owner data");
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setOwnerData(data[0]);
          fetchOwnerProperties(data[0]._id);
        } else {
          setError("No owner profile found. Please contact support.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching owner data:", err);
        setError("Failed to load owner information. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchOwnerData();
  }, [user]);

  const fetchOwnerProperties = async (ownerId) => {
    if (!ownerId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${api.baseUrl}/properties?owner=${ownerId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenityChange = (amenityId) => {
    setFormData(prev => {
      const currentAmenities = [...prev.amenities];
      
      if (currentAmenities.includes(amenityId)) {
        return {
          ...prev,
          amenities: currentAmenities.filter(id => id !== amenityId)
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenityId]
        };
      }
    });
  };

  const validateForm = () => {
    // Add validation logic if needed
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!ownerData?._id) {
      setError("Owner information not found. Please refresh the page.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const propertyData = {
        ...formData,
        owner: ownerData._id
      };
      
      if (editingProperty) {
        // Update existing property
        const response = await fetch(`${api.baseUrl}/properties/${editingProperty._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to update property");
        }
        
        const updatedProperty = await response.json();
        
        // Update property in the list
        setProperties(properties.map(p => 
          p._id === editingProperty._id ? updatedProperty : p
        ));
      } else {
        // Create new property
        const response = await fetch(`${api.baseUrl}/properties`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to create property");
        }
        
        const newProperty = await response.json();
        
        // Add new property to the list
        setProperties([...properties, newProperty]);
      }
      
      // Reset form
      setFormData({
        title: "",
        type: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        location: {
          area: "",
          fullAddress: "",
          distanceToUSAS: ""
        },
        description: "",
        genderRestriction: "none",
        amenities: []
      });
      
      // Close form
      setShowForm(false);
      setEditingProperty(null);
      
    } catch (err) {
      console.error("Error saving property:", err);
      setError(err.message || "Failed to save property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || "",
      type: property.type || "",
      price: property.price || "",
      bedrooms: property.bedrooms || "",
      bathrooms: property.bathrooms || "",
      squareFeet: property.squareFeet || "",
      location: {
        area: property.location?.area || "",
        fullAddress: property.location?.fullAddress || "",
        distanceToUSAS: property.location?.distanceToUSAS || ""
      },
      description: property.description || "",
      genderRestriction: property.genderRestriction || "none",
      amenities: property.amenities || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`${api.baseUrl}/properties/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete property");
      }
      
      // Remove from list
      setProperties(properties.filter(p => p._id !== id));
    } catch (err) {
      console.error("Error deleting property:", err);
      setError("Failed to delete property. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
        {loading && !ownerData ? (
          <div className="animate-pulse h-5 bg-gray-200 rounded w-1/3"></div>
        ) : (
          <p className="text-gray-600">
            Welcome, {ownerData?.name || ownerData?.fullName || user.username || "Property Owner"}!
          </p>
        )}
      </div>

      {/* Properties management section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Your Properties</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProperty(null);
            }}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Property
          </button>
        </div>
        
        {/* Property form */}
        {showForm && (
          <div className="border-b p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic information */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select Type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (RM)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="genderRestriction" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender Restriction
                  </label>
                  <select
                    id="genderRestriction"
                    name="genderRestriction"
                    value={formData.genderRestriction}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  >
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="squareFeet" className="block text-sm font-medium text-gray-700 mb-1">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    id="squareFeet"
                    name="squareFeet"
                    value={formData.squareFeet}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                {/* Location fields */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">Location Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="location.area" className="block text-sm font-medium text-gray-700 mb-1">
                        Area/Neighborhood
                      </label>
                      <input
                        type="text"
                        id="location.area"
                        name="location.area"
                        value={formData.location.area}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address
                      </label>
                      <input
                        type="text"
                        id="location.fullAddress"
                        name="location.fullAddress"
                        value={formData.location.fullAddress}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.distanceToUSAS" className="block text-sm font-medium text-gray-700 mb-1">
                        Distance to USAS (km)
                      </label>
                      <input
                        type="number"
                        id="location.distanceToUSAS"
                        name="location.distanceToUSAS"
                        value={formData.location.distanceToUSAS}
                        onChange={handleChange}
                        required
                        step="0.1"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  ></textarea>
                </div>
                
                {/* Amenities */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenityOptions.map(amenity => (
                      <div key={amenity.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity.id}`}
                          checked={formData.amenities.includes(amenity.id)}
                          onChange={() => handleAmenityChange(amenity.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm text-gray-700">
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProperty(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {editingProperty ? 'Update Property' : 'Add Property'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Properties list */}
        {loading ? (
          <div className="p-6 flex justify-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-red-500 text-2xl" />
          </div>
        ) : properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                          <FontAwesomeIcon icon={faHome} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{property.title || "Unnamed Property"}</div>
                          <div className="text-sm text-gray-500">{property.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.location?.area || "N/A"}</div>
                      <div className="text-xs text-gray-500">
                        {property.location?.distanceToUSAS ? `${property.location.distanceToUSAS}km to USAS` : "Distance not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.bedrooms || 0} bd | {property.bathrooms || 0} ba</div>
                      <div className="text-xs text-gray-500">{property.squareFeet || 0} sq ft</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">RM{property.price || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(property)}
                        className="text-indigo-600 hover:text-indigo-900 mx-2"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="text-gray-400 mb-3">
              <FontAwesomeIcon icon={faHome} className="text-4xl" />
            </div>
            <p className="text-gray-500 mb-6">You don't have any properties listed yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Your First Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;