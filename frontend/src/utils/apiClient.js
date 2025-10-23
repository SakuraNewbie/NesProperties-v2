// Define api object at the top of the file
const api = {
  baseUrl: window._env_?.API_URL || 'http://localhost:5000/api',
  
  request: async (endpoint, options = {}) => {
    // Ensure endpoint doesn't start with /api if baseUrl already includes it
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${api.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Include CORS-specific options
    const fetchOptions = {
      ...options,
      credentials: 'include',  // Important for CORS with credentials
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    console.log(`Making request to: ${url}`);
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle non-ok responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }
      
      // For 204 No Content responses, return empty object
      if (response.status === 204) {
        return {};
      }
      
      // Parse JSON response
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }
};

// Export the api for use in other files
export { api };

// Add authorization header helper
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Property API functions
export const propertyApi = {
  getProperties: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';
    
    return await api.request(endpoint, {
      headers: getAuthHeader()
    });
  },
  
  getPropertyById: async (id) => {
    return await api.request(`/properties/${id}`, {
      headers: getAuthHeader()
    });
  },
  
  searchProperties: async (query, filters = {}) => {
    const queryParams = new URLSearchParams({ query });
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    return await api.request(`/properties/search?${queryParams}`, {
      headers: getAuthHeader()
    });
  },
  
  createProperty: async (propertyData) => {
    return await api.request('/properties', {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      },
      body: JSON.stringify(propertyData)
    });
  },
  
  updateProperty: async (id, propertyData) => {
    return await api.request(`/properties/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader()
      },
      body: JSON.stringify(propertyData)
    });
  },
  
  deleteProperty: async (id) => {
    return await api.request(`/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
  },
  
  uploadImage: async (propertyId, imageFile, metadata = {}) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Add metadata fields to FormData
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Get only the auth header without Content-Type
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${api.baseUrl}/properties/${propertyId}/images`, {
      method: 'POST',
      headers,  // Important: Don't set Content-Type with FormData
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Image upload failed (${response.status})`);
    }
    
    return await response.json();
  },
  
  uploadVirtualTour: async (propertyId, panoramaFile, metadata = {}) => {
    const formData = new FormData();
    formData.append('image', panoramaFile);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    // Fix: Include authorization header correctly
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return await fetch(`${api.baseUrl}/properties/${propertyId}/virtual-tour`, {
      method: 'POST',
      headers,  // Don't set Content-Type with FormData
      body: formData
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Virtual tour upload failed');
        });
      }
      return response.json();
    });
  },
  
  getPropertyImages: async (propertyId) => {
    return await api.request(`/properties/${propertyId}/images`, {
      credentials: 'include',
      headers: getAuthHeader()
    });
  },
  
  deletePropertyImage: async (propertyId, imageId) => {
    return await api.request(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeader()
    });
  }
};

// Owner API functions
export const ownerApi = {
  getOwnerByUserId: async (userId) => {
    const response = await api.request(`/owners?userId=${userId}`, {
      headers: getAuthHeader()
    });
    return Array.isArray(response) && response.length > 0 ? response[0] : null;
  },
  
  getOwnerProperties: async (ownerId) => {
    // Don't add /api prefix - let api.request handle the full URL construction
    return await api.request(`/owners/${ownerId}/properties`, {
      headers: getAuthHeader()
    });
  },
  
  updateOwner: async (ownerId, ownerData) => {
    return await api.request(`/owners/${ownerId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader()
      },
      body: JSON.stringify(ownerData)
    });
  }
};

// Auth API functions
export const authApi = {
  login: async (credentials) => {
    return await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  registerUser: async (userData) => {
    return await api.request('/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  registerOwner: async (ownerData) => {
    return await api.request('/auth/register/owner', {
      method: 'POST',
      body: JSON.stringify(ownerData)
    });
  },
  
  getCurrentUser: async () => {
    return await api.request('/auth/me', {
      headers: getAuthHeader()
    });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Admin API functions
export const adminApi = {
  getDashboardStats: async () => {
    return await api.request('/admin/dashboard', {
      headers: getAuthHeader()
    });
  },
  
  getUsers: async () => {
    return await api.request('/admin/users', {
      headers: getAuthHeader()
    });
  },
  
  createUser: async (userData) => {
    return await api.request('/admin/users', {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
  },
  
  updateUser: async (id, userData) => {
    return await api.request(`/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
  },
  
  deleteUser: async (id) => {
    return await api.request(`/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
  },
  
  toggleFeatureProperty: async (id) => {
    return await api.request(`/admin/properties/${id}/feature`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
  }
};

// Enhanced Chatbot API functions
export const chatbotApi = {
  sendQuery: async (message, context = {}) => {
    try {
      const response = await fetch(`${api.baseUrl}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ message, context })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in chatbot query:', error);
      throw error;
    }
  },
  
  getHistory: async (sessionId) => {
    try {
      const response = await fetch(`${api.baseUrl}/chatbot/history?sessionId=${sessionId}`, {
        headers: {
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },
  
  provideFeedback: async (messageId, feedback) => {
    try {
      const response = await fetch(`${api.baseUrl}/chatbot/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ messageId, feedback })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
  
  resolvePropertyId: async (displayId) => {
    try {
      const response = await fetch(`${api.baseUrl}/chatbot/resolveProperty?id=${displayId}`, {
        headers: {
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resolving property ID:', error);
      throw error;
    }
  }
};
