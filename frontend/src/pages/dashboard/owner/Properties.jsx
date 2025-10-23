import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi, propertyApi } from "../../../utils/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faPencilAlt, faTrashAlt, faCamera,
  faPanorama, faSpinner, faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import PropertyForm from "../../../components/UI/owner/PropertyForm";

const Properties = ({ onImageUpload, onVirtualTourUpload }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const { data: ownerData } = useQuery({
    queryKey: ['owner', user?.id],
    queryFn: () => ownerApi.getOwnerByUserId(user?.id),
    enabled: !!user?.id
  });

  const { 
    data: properties, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['ownerProperties', ownerData?._id],
    queryFn: () => ownerApi.getOwnerProperties(ownerData?._id),
    enabled: !!ownerData?._id
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId) => propertyApi.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['ownerProperties']);
      toast.success("Property deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    }
  });

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const formatPrice = (price) => {
    return `RM ${price.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-emerald-500" />
        <p className="mt-2 text-gray-600">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-500" />
        <p className="mt-2 text-red-500">Error loading properties: {error.message}</p>
        <button 
          onClick={() => queryClient.invalidateQueries(['ownerProperties'])}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Properties</h2>
            <p className="text-sm text-gray-600">Manage your rental properties</p>
          </div>
          <button
            onClick={handleAddProperty}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            <span>Add Property</span>
          </button>
        </div>

        {properties && properties.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property._id} className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images.find(img => img.isPrimary)?.imagePath || property.images[0].imagePath}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {property.title}
                    </h3>
                    <p className="text-emerald-600 font-medium">
                      {formatPrice(property.price)} / month
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {property.location.area} • {property.bedrooms} BR • {property.bathrooms} BA
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {property.squareFeet} sq ft • {property.type}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => onImageUpload(property)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <FontAwesomeIcon icon={faCamera} className="mr-1" />
                        Images
                      </button>
                      <button
                        onClick={() => onVirtualTourUpload(property)}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        <FontAwesomeIcon icon={faPanorama} className="mr-1" />
                        360° Tour
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                        disabled={deletePropertyMutation.isPending}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
            <button
              onClick={handleAddProperty}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Your First Property
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <PropertyForm
          property={editingProperty}
          ownerId={ownerData?._id}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Properties;
