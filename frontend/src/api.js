const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Use window._env_ for runtime environment variables, or fallback to localhost
  baseUrl: window._env_?.API_URL || 'http://localhost:5000/api',
  
  request: async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${api.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    // Make sure to include these options for CORS
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include', // Important for CORS with authentication
      mode: 'cors'           // Explicitly request CORS mode
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // Handle different response status codes
        if (response.status === 401) {
          // Unauthorized - clear user data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        // Try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {};
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  },
};

export const setupResponseInterceptor = (navigate, logout) => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options) {
    try {
      const response = await originalFetch(url, options);
      
      // Handle session expiration
      if (response.status === 401) {
        // If the URL is related to our API and not a login/register request
        if (url.includes(API_URL) && 
            !url.includes('/login') && 
            !url.includes('/register')) {
          logout();
          navigate('/login', { 
            state: { from: window.location.pathname, message: 'Your session has expired. Please log in again.' }
          });
        }
      }
      
      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  };
};
