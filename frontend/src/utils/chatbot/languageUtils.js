// Define translations for UI elements and responses
export const translations = {
  en: {
    welcome: "👋 Hi! I'm your NES Properties assistant. How can I help you find the perfect rental property today?",
    suggestions: {
      showAll: "Show all properties",
      students: "Student accommodations",
      women: "Properties for women only"
    },
    propertyCard: {
      scheduleViewing: "Schedule Viewing",
      contactAgent: "Contact Agent",
      noImage: "No Image Available",
      nearbyFacilities: "Nearby:",
      femaleOnly: "Female tenants only",
      maleOnly: "Male tenants only",
      student: "Student accommodation"
    },
    input: {
      placeholder: "Type your message…",
      listening: "Listening..."
    },
    // Add more translations as needed
  },
  ms: {
    welcome: "👋 Hi! Saya pembantu NES Properties anda. Bagaimana saya boleh membantu anda mencari hartanah sewaan yang sempurna hari ini?",
    suggestions: {
      showAll: "Tunjukkan semua hartanah",
      students: "Penginapan pelajar",
      women: "Hartanah untuk wanita sahaja"
    },
    propertyCard: {
      scheduleViewing: "Jadualkan Lawatan",
      contactAgent: "Hubungi Ejen",
      noImage: "Tiada Gambar",
      nearbyFacilities: "Berdekatan:",
      femaleOnly: "Untuk penyewa wanita sahaja",
      maleOnly: "Untuk penyewa lelaki sahaja",
      student: "Penginapan pelajar"
    },
    input: {
      placeholder: "Taip mesej anda…",
      listening: "Mendengar..."
    },
    // Add more translations as needed
  }
};

// Get a translation key based on current language
export const getTranslation = (key, language, fallback = '') => {
  // Split the key by dots to access nested properties
  const keys = key.split('.');
  let value = translations[language];
  
  // Navigate through the nested properties
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      // Key not found, return fallback
      return fallback || key;
    }
  }
  
  return value;
};