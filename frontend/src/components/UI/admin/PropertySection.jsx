import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";
import FormComponent from "./FormComponent";
import { toast } from "react-toastify";
import { PROPERTY_TYPES } from "../../config/constant";

const PropertySection = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchOwners();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/owners");
      if (!res.ok) throw new Error("Failed to fetch owners");
      const data = await res.json();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleSubmit = async (formData) => {
    setIsFormSubmitting(true);
    try {
      console.log("Submitting property data:", formData);
      
      const url = formMode === "edit" 
        ? `/api/properties/${selectedProperty._id}`
        : "/api/properties";
      
      const method = formMode === "edit" ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      // Parse error response
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        
        if (errorData.errors) {
          // Show specific validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        } else {
          throw new Error(errorData.message || `Failed to ${formMode} property`);
        }
      }
      
      const data = await res.json();
      
      if (formMode === "edit") {
        setProperties(properties.map(p => p._id === data._id ? data : p));
        toast.success("Property updated successfully!");
      } else {
        setProperties([...properties, data]);
        toast.success("Property added successfully!");
      }
      
      resetForm();
    } catch (error) {
      console.error(`Error ${formMode === "edit" ? "updating" : "creating"} property:`, error);
      toast.error(error.message || `Failed to ${formMode} property`);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const propertyToEdit = properties.find(p => p._id === id);
    setSelectedProperty(propertyToEdit);
    setFormMode("edit");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete property");
      
      setProperties(properties.filter(p => p._id !== id));
      toast.success("Property deleted successfully!");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    }
  };

  const resetForm = () => {
    setFormMode("add");
    setSelectedProperty(null);
  };

  const formFields = [
    {
      name: "title",
      label: "Property Title",
      required: true,
      placeholder: "Enter property title",
    },
    {
      name: "type",
      label: "Property Type",
      type: "select",
      required: true,
      options: PROPERTY_TYPES.map(type => ({
        value: type, // This is correct - we're using the exact enum value
        // Format the label for display only
        label: type.split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
      }))
    },
    {
      name: "price",
      label: "Monthly Rent (RM)",
      type: "number",
      required: true,
      placeholder: "e.g., 300",
    },
    {
      name: "squareFeet",
      label: "Square Feet",
      type: "number",
      required: true,
      placeholder: "e.g., 1200",
    },
    {
      name: "bathrooms",
      label: "Bathrooms",
      type: "number",
      required: true,
      placeholder: "e.g., 2",
    },
    {
      name: "rooms",
      label: "Bedrooms",
      type: "number",
      required: true,
      placeholder: "e.g., 3",
    },
    {
      name: "location",
      label: "Location",
      required: true,
      placeholder: "e.g., Taman Sentosa",
    },
    {
      name: "owner",
      label: "Owner",
      type: "select",
      required: true,
      options: owners.map(owner => ({
        value: owner._id,
        label: owner.fullName || owner.username
      }))
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Enter property description",
    }
  ];

  const tableColumns = [
    { field: "title", header: "Title" },
    { field: "type", header: "Type" },
    { field: "price", header: "Price", render: (item) => `RM${item.price}` },
    { field: "location", header: "Location" },
    { field: "rooms", header: "Bedrooms" },
    { field: "bathrooms", header: "Bathrooms" },
    { 
      field: "owner", 
      header: "Owner", 
      render: (item) => item.owner?.fullName || item.owner || "N/A" 
    }
  ];

  return (
    <section className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {formMode === "edit" ? "Edit Property" : "Add New Property"}
        </h2>
        
        <FormComponent
          fields={formFields}
          onSubmit={handleSubmit}
          initialValues={selectedProperty || {}}
          submitLabel={formMode === "edit" ? "Update Property" : "Add Property"}
          isLoading={isFormSubmitting}
        />
        
        {formMode === "edit" && (
          <div className="flex justify-end">
            <button
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel Edit
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Properties</h2>
        
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md flex justify-center">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading properties...</span>
            </div>
          </div>
        ) : (
          <DataTable
            data={properties}
            columns={tableColumns}
            onDelete={handleDelete}
            onEdit={handleEdit}
            itemName="property"
          />
        )}
      </div>
    </section>
  );
};

export default PropertySection;