export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  USER: 'user',
};

export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_USER: '/auth/register/user',
    REGISTER_OWNER: '/auth/register/owner',
    ME: '/auth/me',
  },
  PROPERTIES: {
    LIST: '/properties',
    FEATURED: '/properties/featured',
    SEARCH: '/properties/search',
    DETAIL: (id) => `/properties/${id}`,
    IMAGES: (id) => `/properties/${id}/images`,
    VIRTUAL_TOUR: (id) => `/properties/${id}/virtual-tour`,
  },
  OWNER: {
    DETAIL: (id) => `/owners/${id}`,
    PROPERTIES: (id) => `/owners/${id}/properties`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: (id) => `/admin/users/${id}`,
    PROPERTIES_FEATURE: (id) => `/admin/properties/${id}/feature`,
  },
  CHATBOT: {
    QUERY: '/chatbot/query',
  },
};

export const PROPERTY_TYPES = [
  "Terrace",
  "Apartment",
  "Condo",
  "House",
  "1-Storey Terrace",
  "2-Storey Terrace",
  "Semi-D"
];

export const GENDER_RESTRICTIONS = [
  { value: "none", label: "Any Gender" },
  { value: "female_only", label: "Female Only" },
  { value: "male_only", label: "Male Only" }
];

export const AMENITIES = [
  { value: "wifi", label: "WiFi", icon: "wifi" },
  { value: "air_conditioning", label: "Air Conditioning", icon: "snowflake" },
  { value: "washing_machine", label: "Washing Machine", icon: "tshirt" },
  { value: "refrigerator", label: "Refrigerator", icon: "temperature-low" },
  { value: "parking", label: "Parking", icon: "parking" },
  { value: "security", label: "Security", icon: "shield-alt" },
  { value: "study_desk", label: "Study Desk", icon: "desk" },
  { value: "furnished", label: "Fully Furnished", icon: "couch" },
  { value: "water_heater", label: "Water Heater", icon: "hot-tub" }
];