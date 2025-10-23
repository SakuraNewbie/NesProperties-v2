/**
 * Environment configuration utility
 * 
 * This module handles loading environment variables in different environments
 * and makes them available throughout the application.
 */

// Initialize environment variables object
window._env_ = window._env_ || {};

// Default configuration (used when environment variables aren't available)
const defaultConfig = {
  API_URL: 'http://localhost:5000/api',
  APP_NAME: 'NES Properties',
  DEFAULT_LOCALE: 'en',
};

// Merge any runtime config with defaults
Object.keys(defaultConfig).forEach(key => {
  window._env_[key] = window._env_[key] || defaultConfig[key];
});

// Helper function to get config values
export const getConfig = (key, defaultValue = null) => {
  return window._env_[key] !== undefined ? window._env_[key] : defaultValue;
};

export default {
  apiUrl: getConfig('API_URL'),
  appName: getConfig('APP_NAME'),
  defaultLocale: getConfig('DEFAULT_LOCALE'),
};
