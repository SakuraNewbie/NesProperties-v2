import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import FormComponent from "./FormComponent";
import { toast } from "react-toastify";

const UserSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsFormSubmitting(true);
    setError(null);
    
    try {
      // Sanitize form data
      const sanitizedData = { ...formData };
      
      // Remove empty fields that shouldn't be sent as empty strings
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === '') {
          delete sanitizedData[key];
        }
      });
      
      // Ensure role is always 'user'
      sanitizedData.role = 'user';
      
      const url = formMode === "edit" 
        ? `/api/users/${selectedUser._id}`
        : "/api/users";
      
      const method = formMode === "edit" ? "PUT" : "POST";
      
      console.log(`Making ${method} request to: ${url}`);
      console.log('Sending data:', { ...sanitizedData, password: sanitizedData.password ? '[FILTERED]' : undefined });
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });
      
      // Parse response - even error responses
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || `Failed to ${formMode} user`);
      }
      
      if (formMode === "edit") {
        setUsers(users.map(p => p._id === responseData._id ? responseData : p));
        toast.success("User updated successfully!");
      } else {
        setUsers([...users, responseData]);
        toast.success("User added successfully!");
      }
      
      resetForm();
    } catch (error) {
      console.error(`Error ${formMode === "edit" ? "updating" : "creating"} user:`, error);
      toast.error(`Failed to ${formMode} user: ${error.message}`);
      setError(error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const userToEdit = users.find(p => p._id === id);
    if (!userToEdit) {
      toast.error("User not found");
      return;
    }
    
    // Create a clean copy without password for editing
    const userForEdit = { ...userToEdit };
    delete userForEdit.password; // Don't prefill password
    
    setSelectedUser(userForEdit);
    setFormMode("edit");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this user?")) {
        return;
      }
      
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      
      setUsers(users.filter(p => p._id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormMode("add");
    setSelectedUser(null);
    setError(null);
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
      name: "fullName",
      label: "Full Name",
      required: true,
      placeholder: "Enter full name"
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
    { field: "fullName", header: "Full Name" },
    { 
      field: "createdAt", 
      header: "Created On",
      render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <section className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {formMode === "edit" ? "Edit User" : "Add New User"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        <FormComponent
          fields={formFields}
          onSubmit={handleSubmit}
          initialValues={selectedUser || {}}
          submitLabel={formMode === "edit" ? "Update User" : "Add User"}
          isLoading={isFormSubmitting}
        />
        
        {formMode === "edit" && (
          <div className="flex justify-end mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel Edit
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md flex justify-center">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading users...</span>
            </div>
          </div>
        ) : (
          <DataTable
            data={users}
            columns={tableColumns}
            onDelete={handleDelete}
            onEdit={handleEdit}
            itemName="user"
          />
        )}
      </div>
    </section>
  );
};

export default UserSection;