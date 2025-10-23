import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import FormComponent from "./FormComponent";
import { toast } from "react-toastify";

const AdminSection = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admins");
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsFormSubmitting(true);
    try {
      const url = formMode === "edit" 
        ? `/api/admins/${selectedAdmin._id}`
        : "/api/admins";
      
      const method = formMode === "edit" ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${formMode} admin`);
      }
      
      const data = await res.json();
      
      if (formMode === "edit") {
        setAdmins(admins.map(p => p._id === data._id ? data : p));
        toast.success("Admin updated successfully!");
      } else {
        setAdmins([...admins, data]);
        toast.success("Admin added successfully!");
      }
      
      resetForm();
    } catch (error) {
      console.error(`Error ${formMode === "edit" ? "updating" : "creating"} admin:`, error);
      toast.error(`Failed to ${formMode} admin: ${error.message}`);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const adminToEdit = admins.find(p => p._id === id);
    setSelectedAdmin(adminToEdit);
    setFormMode("edit");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      // Check if this is the last admin
      if (admins.length <= 1) {
        toast.error("Cannot delete the last admin account");
        return;
      }

      // Check if trying to delete yourself
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id === id) {
        toast.error("You cannot delete your own account while logged in");
        return;
      }

      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete admin");
      
      setAdmins(admins.filter(p => p._id !== id));
      toast.success("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin. Please try again.");
    }
  };

  const resetForm = () => {
    setFormMode("add");
    setSelectedAdmin(null);
  };

  const formFields = [
    {
      name: "username",
      label: "Username",
      required: true,
      placeholder: "Enter username"
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter email address"
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: formMode === "add",
      placeholder: formMode === "add" ? "Enter password" : "Leave blank to keep current password"
    }
  ];

  const tableColumns = [
    { field: "username", header: "Username" },
    { field: "email", header: "Email" },
    { 
      field: "createDate", 
      header: "Created On",
      render: (item) => item.createDate ? new Date(item.createDate).toLocaleDateString() : 'N/A' 
    }
  ];

  return (
    <section className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {formMode === "edit" ? "Edit Admin" : "Add New Admin"}
        </h2>
        
        <FormComponent
          fields={formFields}
          onSubmit={handleSubmit}
          initialValues={selectedAdmin || {}}
          submitLabel={formMode === "edit" ? "Update Admin" : "Add Admin"}
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
        <h2 className="text-xl font-semibold mb-4">All Admins</h2>
        
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md flex justify-center">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading admins...</span>
            </div>
          </div>
        ) : (
          <DataTable
            data={admins}
            columns={tableColumns}
            onDelete={handleDelete}
            onEdit={handleEdit}
            itemName="admin"
          />
        )}
      </div>
    </section>
  );
};

export default AdminSection;