import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyApi } from "../../../utils/apiClient";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const PROPERTY_TYPES = [
  "Terrace",
  "Apartment",
  "Condo",
  "House",
  "1-Storey Terrace",
  "2-Storey Terrace",
  "Semi-D"
];

const GENDER_RESTRICTIONS = [
  { value: "none", label: "No Restriction" },
  { value: "female_only", label: "Female Only" },
  { value: "male_only", label: "Male Only" }
];

const AMENITIES = [
  { value: "wifi", label: "WiFi" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "washing_machine", label: "Washing Machine" },
  { value: "refrigerator", label: "Refrigerator" },
  { value: "parking", label: "Parking" },
  { value: "security", label: "Security" },
  { value: "study_desk", label: "Study Desk" },
  { value: "furnished", label: "Fully Furnished" },
  { value: "water_heater", label: "Water Heater" }
];

const PropertyForm = ({ property, ownerId, onClose }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!property;
  
  const [formData, setFormData] = useState({
    title: "",
    type: PROPERTY_TYPES[0],
    price: "",
    location: {
      area: "",
      fullAddress: "",
      distanceToUSAS: ""
    },
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    description: "",
    genderRestriction: "none",
    amenities: [],
    owner: ownerId
  });

  useEffect(() => {
    if (isEditMode && property) {
      setFormData({
        ...property,
        price: property.price.toString(),
        rooms: property.rooms.toString(),
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        squareFeet: property.squareFeet.toString(),
        location: {
          ...property.location,
          distanceToUSAS: property.location.distanceToUSAS.toString()
        }
      });
    }
  }, [property, isEditMode]);

  const createPropertyMutation = useMutation({
    mutationFn: propertyApi.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries(['ownerProperties']);
      toast.success("Property created successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to create property: ${error.message}`);
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }) => propertyApi.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ownerProperties']);
      toast.success("Property updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message}`);
    }
  });

  // Fix the handleChange function to use the name variable
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Apply the same fix to handleNumberChange
  const handleNumberChange = (e) => {
    const { value } = e.target;
    
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleChange(e);
    }
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter(a => a !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string values to numbers
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      rooms: parseInt(formData.rooms),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      squareFeet: parseInt(formData.squareFeet),
      location: {
        ...formData.location,
        distanceToUSAS: parseFloat(formData.location.distanceToUSAS)
      }
    };
    
    if (isEditMode) {
      updatePropertyMutation.mutate({ id: property._id, data: processedData });
    } else {
      createPropertyMutation.mutate(processedData);
    }
  };

  const isPending = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Property" : "Add New Property"}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., Spacious Apartment in Taman Jati"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type*
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                required
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Price (RM)*
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 1200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area/Neighborhood*
              </label>
              <input
                type="text"
                name="location.area"
                value={formData.location.area}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., Taman Jati"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance to USAS (km)*
              </label>
              <input
                type="text"
                name="location.distanceToUSAS"
                value={formData.location.distanceToUSAS}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 2.5"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address*
              </label>
              <input
                type="text"
                name="location.fullAddress"
                value={formData.location.fullAddress}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 123 Jalan Jati, Taman Jati, Kuala Kangsar"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Rooms*
              </label>
              <input
                type="text"
                name="rooms"
                value={formData.rooms}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 5"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms*
              </label>
              <input
                type="text"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 3"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms*
              </label>
              <input
                type="text"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Feet*
              </label>
              <input
                type="text"
                name="squareFeet"
                value={formData.squareFeet}
                onChange={handleNumberChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="e.g., 1200"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                placeholder="Describe your property..."
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender Restriction
              </label>
              <select
                name="genderRestriction"
                value={formData.genderRestriction}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
              >
                {GENDER_RESTRICTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map((amenity) => (
                  <div key={amenity.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity.value}`}
                      name="amenities"
                      value={amenity.value}
                      checked={formData.amenities.includes(amenity.value)}
                      onChange={handleAmenityChange}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label
                      htmlFor={`amenity-${amenity.value}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center"
            >
              {isPending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {isEditMode ? "Save Changes" : "Create Property"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;