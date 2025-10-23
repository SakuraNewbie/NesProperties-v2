// eslint-disable-next-line no-unused-vars
import { allProperties, propertyFilters } from '../../data/properties';

// Extract property types and locations from allProperties
const propertyTypes = [...new Set(allProperties.map(p => p.type))];
const propertyLocations = [...new Set(allProperties.map(p => p.location))];

// Property types in lowercase for matching

// Common property search terms
const propertySearchTerms = [
  'property', 'properties', 'house', 'home', 'place', 'room', 'rental',
  'rent', 'accommodation', 'stay', 'terrace', 'semi-d'
];

// Intent detection function
export const detectIntent = (text, context) => {
  const lower = text.toLowerCase();
  
  // Improve location detection with regex patterns for Malaysian addresses
  const locationPatterns = [
    /(?:in|at|near|around)\s+([a-zA-Z\s]+(?:puteri|heights|garden|villa|residence|park|taman|bukit|jalan|bandar))/i,
    /(?:looking|search|find|show)\s+(?:in|at|near|around)\s+([a-zA-Z\s]+)/i,
    /properties?\s+(?:in|at|near)\s+([a-zA-Z\s]+)/i
  ];
  
  // Fix for unused variables
  let extractedLocation = null;
  for (const pattern of locationPatterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      extractedLocation = match[1].trim();
      // Use the extracted location
      if (!searchPreferences.location) {
        searchPreferences.location = extractedLocation;
      }
      break;
    }
  }
  
  // Use price patterns to extract price information
  const pricePatterns = [
    /(?:under|below|less than|maximum|max)\s*(?:of\s*)?(?:RM|MYR|RM\s*)?(\d+)/i,
    /(?:above|over|more than|minimum|min)\s*(?:of\s*)?(?:RM|MYR|RM\s*)?(\d+)/i,
    /(?:between|from)\s*(?:RM|MYR|RM\s*)?(\d+)\s*(?:to|and|-)(?:\s*(?:RM|MYR|RM\s*)?)?\s*(\d+)/i,
    /(?:RM|MYR|RM\s*)?(\d+)\s*(?:to|and|-)\s*(?:RM|MYR|RM\s*)?(\d+)/i
  ];

  // Process price patterns
  for (const pattern of pricePatterns) {
    const match = lower.match(pattern);
    if (match) {
      if (pattern.toString().includes('under|below|less') && match[1]) {
        searchPreferences.maxPrice = parseInt(match[1]);
      } else if (pattern.toString().includes('above|over|more') && match[1]) {
        searchPreferences.minPrice = parseInt(match[1]);
      } else if (match[1] && match[2]) {
        searchPreferences.minPrice = parseInt(match[1]);
        searchPreferences.maxPrice = parseInt(match[2]);
      }
      break;
    }
  }
  
  // Check for property ID patterns
  const idMatch = lower.match(/property (?:id)?\s*(?:#|number|no)?\.?\s*(\d+)/i) || 
                 lower.match(/show (?:me )?(?:property|house) (?:id)?\s*(?:#|number|no)?\.?\s*(\d+)/i) ||
                 lower.match(/tell (?:me )?about property (?:id)?\s*(?:#|number|no)?\.?\s*(\d+)/i) ||
                 lower.match(/id\s*(?:#|number|no)?\.?\s*(\d+)/i);
                 
  if (idMatch) {
    return {
      type: 'property_details',
      propertyId: parseInt(idMatch[1]),
      conversationStage: 'property_details'
    };
  }
  
  // Check for help or information intent
  if (lower.includes('help') || 
      lower.includes('what can you do') || 
      lower.includes('how does this work')) {
    return {
      type: 'help',
      conversationStage: 'help'
    };
  }
  
  // Check for agent contact intent
  if (lower.includes('agent') || 
      lower.includes('contact') || 
      lower.includes('talk to someone')) {
    return {
      type: 'contact_agent',
      conversationStage: 'contact_agent'
    };
  }
  
  // Check for schedule viewing intent
  if (lower.includes('schedule') || 
      lower.includes('viewing') || 
      lower.includes('visit') ||
      lower.includes('book')) {
    return {
      type: 'schedule_viewing',
      conversationStage: 'schedule_viewing'
    };
  }
  
  // Detect property search intent
  const searchPreferences = {};
  
  // Check for property type
  for (const type of propertyTypes) {
    if (lower.includes(type.toLowerCase())) {
      searchPreferences.type = type;
      break;
    }
  }
  
  // Check for general property search terms
  const hasPropertySearchTerms = propertySearchTerms.some(term => lower.includes(term));
  
  // Check for location
  for (const location of propertyLocations) {
    if (lower.includes(location.toLowerCase())) {
      searchPreferences.location = location;
      break;
    }
  }
  
  // Check for gender preferences
  if (lower.includes('women') || lower.includes('woman') || 
      lower.includes('female') || lower.includes('girl')) {
    searchPreferences.gender = 'female';
  } else if (lower.includes('men') || lower.includes('man') || 
             lower.includes('male') || lower.includes('boy')) {
    searchPreferences.gender = 'male';
  }
  
  // Check for student preferences
  if (lower.includes('student') || lower.includes('usas')) {
    searchPreferences.forStudents = true;
  }
  
  // Check for price filters
  const underMatch = lower.match(/under\s*(?:rm)?\s*(\d+)/i);
  if (underMatch) {
    searchPreferences.maxPrice = parseInt(underMatch[1]);
  }
  
  const overMatch = lower.match(/over\s*(?:rm)?\s*(\d+)/i);
  if (overMatch) {
    searchPreferences.minPrice = parseInt(overMatch[1]);
  }
  
  const rangeMatch = lower.match(/(?:rm)?\s*(\d+)\s*(?:-|to)\s*(?:rm)?\s*(\d+)/i);
  if (rangeMatch) {
    searchPreferences.minPrice = parseInt(rangeMatch[1]);
    searchPreferences.maxPrice = parseInt(rangeMatch[2]);
  }
  
  // Check for bedrooms
  const bedroomMatch = lower.match(/(\d+)\s*(?:bedroom|bed|br)/i);
  if (bedroomMatch) {
    searchPreferences.minBedrooms = parseInt(bedroomMatch[1]);
  }
  
  // If we have search preferences or general property search terms, it's a search intent
  if (Object.keys(searchPreferences).length > 0 || 
      hasPropertySearchTerms ||
      lower.includes('show') || lower.includes('find') || 
      lower.includes('search') || lower.includes('looking for')) {
    return {
      type: 'property_search',
      searchPreferences,
      searchTerm: Object.values(searchPreferences).join(', '),
      conversationStage: 'property_search'
    };
  }
  
  // Check for greeting
  if (lower.includes('hi') || lower.includes('hello') || 
      lower.includes('hey') || lower.includes('greetings')) {
    return {
      type: 'greeting',
      conversationStage: 'greeting'
    };
  }
  
  // Default to general query
  return {
    type: 'general_query',
    query: text,
    conversationStage: context.conversationStage
  };
};

// Generate response based on intent
export const generateResponse = (intent, context) => {
  switch (intent.type) {
    case 'greeting':
      return {
        messages: [{
          type: 'text',
          content: "Hello! I'm your NES Properties assistant. How can I help you find the perfect rental property today?",
          suggestions: ["Show all properties", "Student accommodations", "Properties for women only"]
        }]
      };
      
    case 'help':
      return {
        messages: [{
          type: 'text',
          content: "I'm here to help you find rental properties in Kuala Kangsar. Here's what I can do:",
          list: [
            "🏠 Search for properties based on your preferences",
            "📍 Show properties in specific locations",
            "👨‍🎓 Find accommodations for students",
            "👩 Find gender-specific accommodations",
            "💰 Filter by price range",
            "📅 Help schedule property viewings",
            "👨‍💼 Connect you with an agent"
          ],
          suggestions: ["Show all properties", "Contact agent", "Student accommodations"]
        }]
      };
      
    case 'contact_agent':
      return {
        messages: [{
          type: 'text',
          content: "You can get in touch with our agents through the following methods:",
          list: [
            "📞 Call our hotline: +60 3-1234 5678",
            "📧 Email: agents@nesproperties.com",
            "🏢 Visit our office at: 123 Jalan Sultan, Kuala Kangsar"
          ],
          actions: [
            { text: "Call Agent Now", url: "tel:+60312345678" },
            { text: "Email Agent", url: "mailto:agents@nesproperties.com" }
          ]
        }]
      };
      
    case 'schedule_viewing':
      return {
        messages: [{
          type: 'text',
          content: "I'd be happy to help you schedule a property viewing. Please provide the following details:",
          list: [
            "1️⃣ Which property you're interested in (ID number)",
            "2️⃣ Your preferred date and time",
            "3️⃣ Your contact information"
          ],
          suggestions: ["View all available properties", "Contact agent directly"]
        }]
      };
      
    case 'general_query':
      // If we're in the property search stage, give contextual response
      if (context.conversationStage === 'property_search') {
        return {
          messages: [{
            type: 'text',
            content: "Would you like to refine your property search? You can specify:",
            suggestions: ["Location", "Price range", "For students", "Gender preference", "Show all properties"]
          }]
        };
      }
      
      // Default general response
      return {
        messages: [{
          type: 'text',
          content: "I'm here to help you find properties in Kuala Kangsar. What kind of property are you looking for?",
          suggestions: ["Show all properties", "Student accommodations", "Affordable options", "Premium properties"]
        }]
      };
      
    default:
      return {
        messages: [{
          type: 'text',
          content: "I'm not sure I understood that. How can I help you with finding a rental property?",
          suggestions: ["Show all properties", "Help", "Contact agent"]
        }]
      };
  }
};