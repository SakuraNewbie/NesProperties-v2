import React, { useState } from "react";

const FormComponent = ({ fields, onSubmit, initialValues = {}, submitLabel = "Submit", isLoading = false }) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      // Check required fields
      if (field.required && !formValues[field.name]) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }
      
      // Email validation
      if (field.type === 'email' && formValues[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[field.name])) {
          newErrors[field.name] = 'Invalid email address';
        }
      }
      
      // Password validation
      if (field.type === 'password' && formValues[field.name] && field.validate) {
        if (formValues[field.name].length < 6) {
          newErrors[field.name] = 'Password must be at least 6 characters';
        }
      }
      
      // Number validation
      if (field.type === 'number' && formValues[field.name]) {
        if (isNaN(Number(formValues[field.name]))) {
          newErrors[field.name] = 'Please enter a valid number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-1">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                rows={field.rows || 3}
                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select {field.label || field.name}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
            
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center transition disabled:opacity-50"
        >
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FormComponent;