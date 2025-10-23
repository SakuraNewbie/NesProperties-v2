import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { allProperties } from '../data/properties';

// Move formatPrice to the top of the file so it's defined before use
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(price);
};

const initialPrompt = "Hi! 👋 I'm your NES Properties assistant. How can I help you today?";

const quickQuestions = [
  "Show me houses for rent",
  "Properties for USAS students",
  "Houses for girls only",
  "Houses under RM300",
  "Do you have properties in Bukit Chandan?"
];

// Keep property types with your actual property types
const propertyTypes = [
  "terrace", "1-storey terrace", "2-storey terrace", 
  "semi-d", "house"
];

// Keep the actual Malaysian locations
const locations = [
  "bukit chandan", "taman sentosa", "chandan puteri", 
  "taman sultan yusuf", "taman kopeka", "taman jati"
];

// Updated price ranges to match rental prices, not sale prices
const priceRanges = [
  "under 150", "under 200", "under 300", "over 200", 
  "affordable", "luxury", "budget"
];

// Updated smart replies to remove irrelevant mortgage content & fix location suggestions
const smartReplies = [
  {
    keywords: ["house", "houses", "apartment", "condo", "property", "properties", "rent", "listing", "available"],
    answer: "I can help you find the perfect rental property! Please tell me about your preferences:",
    suggestions: ["Location preferences?", "Price range?", "Number of bedrooms?", "Any specific amenities?"]
  },
  {
    keywords: ["agent", "contact", "representative", "realtor", "speak to agent", "talk to agent", "call"],
    answer: "You can contact an agent through any of these methods:",
    list: [
      "📞 Call our hotline: +60 3-1234 5678",
      "📧 Email: agents@nesproperties.com",
      "👨‍💼 Visit our Agents page to contact specific agents",
      "💬 Request agent contact through this chat"
    ]
  },
  {
    keywords: ["visit", "schedule", "tour", "book", "appointment", "see property", "showing", "viewing"],
    answer: "I can help schedule a property viewing! Please provide:",
    list: [
      "1️⃣ The property ID or name you're interested in",
      "2️⃣ Your preferred date and time",
      "3️⃣ Your contact information"
    ],
    actionButton: {
      text: "Schedule Viewing",
      url: "/schedule-viewing"
    }
  },
  {
    keywords: ["office hours", "open", "close", "working hours", "business hours", "when are you open", "operation"],
    answer: "Our offices are open as follows:",
    table: [
      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
      { day: "Sunday & Holidays", hours: "Closed" }
    ],
    note: "Our online chat support is available 24/7!"
  },
  {
    keywords: ["virtual", "online tour", "video tour", "remote viewing", "360", "vr"],
    answer: "Yes, we offer several virtual tour options:",
    list: [
      "🔄 360° interactive property tours",
      "🎥 Video walkthroughs with agents",
      "📱 Live video calls for remote viewings"
    ],
    actionButton: {
      text: "Browse Virtual Tours",
      url: "/virtual-tours"
    }
  },
  {
    keywords: ["price", "cost", "how much", "expensive", "affordable", "budget", "cheap", "luxury", "premium"],
    answer: "I can help you find properties within your budget! Our rental listings range from RM120 to RM500 per month.",
    suggestions: ["Under RM200", "RM200-300", "Over RM300"]
  },
  {
    keywords: ["location", "area", "neighborhood", "nearby", "school", "transport", "amenities", "facilities"],
    answer: "Location is key! We have properties across various prime areas with different amenities nearby.",
    suggestions: ["Bukit Chandan", "Taman Sentosa", "Chandan Puteri", "Taman Sultan Yusuf"]
  },
  {
    keywords: propertyTypes,
    answer: "Let me find some listings for you...",
    isPropertyType: true,
  },
  {
    keywords: ["usas", "university", "student", "college"],
    answer: "We have several properties specifically for USAS students. Would you prefer options for male or female students?",
    suggestions: ["Properties for female students", "Properties for male students", "All student accommodations"]
  },
  {
    keywords: ["kuala kangsar", "perak"],
    answer: "Our properties are located in and around Kuala Kangsar. Which area are you interested in?",
    suggestions: ["Bukit Chandan", "Taman Sentosa", "Chandan Puteri", "Taman Sultan Yusuf"]
  }
];

const fallbackReply = {
  text: "I'm here to help! Please provide more details or try one of these options:",
  suggestions: [
    "Find properties", 
    "Contact an agent", 
    "Virtual tours", 
    "Office hours",
    "Help"
  ]
};

// Fixed function to fetch properties from your data
const fetchProperties = (type, location, priceRange, bedrooms, preferences) => {
  try {
    // Filter properties based on criteria
    let results = [...allProperties];
    
    if (type) {
      const typePattern = new RegExp(type, 'i');
      results = results.filter(p => typePattern.test(p.type));
    }
    
    if (location) {
      const locationPattern = new RegExp(location, 'i');
      results = results.filter(p => locationPattern.test(p.location));
    }
    
    // Fixed the price range filtering logic
    if (priceRange) {
      if (priceRange.includes("under")) {
        const match = priceRange.match(/under\s*(?:rm)?\s*(\d+)/i);
        if (match) {
          let maxPrice = parseFloat(match[1]);
          results = results.filter(p => p.price <= maxPrice);
        }
      } else if (priceRange.includes("over")) {
        const match = priceRange.match(/over\s*(?:rm)?\s*(\d+)/i);
        if (match) {
          let minPrice = parseFloat(match[1]);
          results = results.filter(p => p.price >= minPrice);
        }
      } else if (priceRange.includes("-")) {
        const [minStr, maxStr] = priceRange.split("-").map(s => s.trim());
        let minPrice = parseFloat(minStr.replace(/[^0-9.]/g, ''));
        let maxPrice = parseFloat(maxStr.replace(/[^0-9.]/g, ''));
        results = results.filter(p => p.price >= minPrice && p.price <= maxPrice);
      }
    }
    
    if (bedrooms) {
      const bedroomsNum = parseInt(bedrooms);
      if (!isNaN(bedroomsNum)) {
        results = results.filter(p => p.bedrooms >= bedroomsNum);
      }
    }
    
    // Filter by tenant preferences
    if (preferences && preferences.gender) {
      if (preferences.gender === 'female') {
        results = results.filter(p => 
          p.gender === 'female' ||
          p.title.toLowerCase().includes('girl') || 
          p.title.toLowerCase().includes('female')
        );
      } else if (preferences.gender === 'male') {
        results = results.filter(p => 
          p.gender === 'male' ||
          p.title.toLowerCase().includes('men') || 
          p.title.toLowerCase().includes('male')
        );
      }
    }

    if (preferences && preferences.student) {
      results = results.filter(p => 
        p.title.toLowerCase().includes('student') || 
        p.title.toLowerCase().includes('usas')
      );
    }
    
    // Format results for display
    return results.map(property => ({
      id: property.id,
      title: property.title,
      price: formatPrice(property.price),
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      image: property.image
    }));
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
};

const fetchPropertyDetails = (id) => {
  try {
    const property = allProperties.find(p => p.id === parseInt(id));
    
    if (property) {
      return {
        id: property.id,
        title: property.title,
        description: property.description || `Beautiful ${property.bedrooms}-bedroom ${property.type.toLowerCase()} located in ${property.location}.`,
        price: formatPrice(property.price),
        location: property.location,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: `${property.area} sq ft`,
        furnishing: "Partially Furnished",
        features: ["Modern Design", "Great Location", "Recently Renovated"],
        images: property.images || [property.image], // Fallback to single image if images array is empty
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching property details:", error);
    return null;
  }
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: initialPrompt, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState({
    propertyType: null,
    location: null,
    priceRange: null,
    bedrooms: null,
    lastQuery: null,
    conversationStage: 'initial'
  });
  const messagesEndRef = useRef(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isBotTyping]);

  // Function to detect entities in user message
  const detectEntities = (text) => {
    const lower = text.toLowerCase();
    const entities = {};
    
    // Detect property type
    const typeMatch = propertyTypes.find(type => lower.includes(type));
    if (typeMatch) entities.propertyType = typeMatch;
    
    // Detect location
    const locationMatch = locations.find(loc => lower.includes(loc));
    if (locationMatch) entities.location = locationMatch;
    
    // Detect price range
    const priceMatch = priceRanges.find(price => lower.includes(price));
    if (priceMatch) entities.priceRange = priceMatch;
    
    // Detect bedrooms
    const bedroomMatch = lower.match(/(\d+)\s*(?:bedroom|bed|br)/i);
    if (bedroomMatch) entities.bedrooms = bedroomMatch[1];
    
    // Detect tenant preferences
    const preferences = {};
    if (lower.includes('girl') || lower.includes('female') || lower.includes('women')) {
      preferences.gender = 'female';
      entities.preferences = preferences;
    } else if (lower.includes('men') || lower.includes('male') || lower.includes('boy')) {
      preferences.gender = 'male';
      entities.preferences = preferences;
    }
    
    if (lower.includes('student') || lower.includes('usas')) {
      preferences.student = true;
      entities.preferences = preferences;
    }
    
    return entities;
  };

  const handleBotResponse = async (userText, entities = {}) => {
    setIsBotTyping(true);
    const lower = userText.toLowerCase();
    
    // Update context with any detected entities
    const updatedContext = {
      ...userContext,
      ...entities,
      lastQuery: userText
    };
    setUserContext(updatedContext);

    // Look for property ID patterns
    const idMatch = userText.match(/id[:\s]*([a-zA-Z0-9]+)/i) || userText.match(/property[:\s]*([0-9]+)/i);
    if (idMatch) {
      const propertyId = idMatch[1];
      
      // Add typing effect
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Fetching details for property ID: ${propertyId}...`, timestamp: new Date() }
      ]);
      
      const details = fetchPropertyDetails(propertyId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (details) {
        setMessages(msgs => [
          ...msgs,
          {
            from: 'bot',
            type: 'property-card',
            property: details,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { 
            from: 'bot', 
            text: `Sorry, I couldn't find details for property ID: ${propertyId}.`,
            suggestions: ["Search for properties", "Contact an agent", "View recent listings"],
            timestamp: new Date()
          }
        ]);
      }
      
      setIsBotTyping(false);
      return;
    }

    // Check for help command
    if (lower === 'help' || lower.includes('what can you do')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessages(msgs => [
        ...msgs,
        { 
          from: 'bot', 
          text: "I'm your NES Properties assistant! Here's what I can help you with:",
          list: [
            "🏠 Find rental properties based on your criteria",
            "📍 Provide information about locations",
            "💰 Explain pricing options",
            "📅 Help schedule property viewings",
            "👨‍💼 Connect you with agents"
          ],
          suggestions: ["Find properties", "Virtual tours", "Contact agent"],
          timestamp: new Date()
        }
      ]);
      setIsBotTyping(false);
      return;
    }

    // Check if we need to search for properties based on context
    const shouldSearchProperties = 
      (entities.propertyType || userContext.propertyType) && 
      (lower.includes('show') || lower.includes('find') || lower.includes('search') || lower.includes('looking for'));
    
    if (shouldSearchProperties || entities.propertyType || 
        (updatedContext.conversationStage === 'property_search' && 
        (entities.location || entities.priceRange || entities.bedrooms))) {
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let searchParams = {
        type: entities.propertyType || userContext.propertyType,
        location: entities.location || userContext.location,
        priceRange: entities.priceRange || userContext.priceRange,
        bedrooms: entities.bedrooms || userContext.bedrooms,
        preferences: entities.preferences || userContext.preferences
      };
      
      // Update conversation stage
      updatedContext.conversationStage = 'property_search';
      setUserContext(updatedContext);
      
      // Inform user we're searching
      let searchMessage = `Searching for`;
      if (searchParams.type) searchMessage += ` ${searchParams.type}`;
      if (searchParams.location) searchMessage += ` in ${searchParams.location}`;
      if (searchParams.priceRange) searchMessage += ` ${searchParams.priceRange}`;
      if (searchParams.bedrooms) searchMessage += ` with ${searchParams.bedrooms} bedrooms`;
      if (searchParams.preferences) {
        if (searchParams.preferences.gender) {
          searchMessage += ` for ${searchParams.preferences.gender} tenants`;
        }
        if (searchParams.preferences.student) {
          searchMessage += ` for students`;
        }
      }
      searchMessage += `...`;
      
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: searchMessage, timestamp: new Date() }
      ]);
      
      // Fetch properties with all parameters including preferences
      const results = fetchProperties(
        searchParams.type,
        searchParams.location,
        searchParams.priceRange,
        searchParams.bedrooms,
        searchParams.preferences
      );
      
      // Add some delay for natural feeling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (results && results.length) {
        setMessages(msgs => [
          ...msgs,
          {
            from: 'bot',
            text: `Found ${results.length} matching properties:`,
            type: 'property-list',
            properties: results,
            timestamp: new Date(),
            suggestions: ["Refine search", "Contact agent", "Schedule viewing"]
          }
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { 
            from: 'bot', 
            text: `Sorry, I couldn't find any matching properties with your criteria.`,
            suggestions: ["Try different criteria", "Expand search area", "Contact an agent for help"],
            timestamp: new Date()
          }
        ]);
      }
      
      setIsBotTyping(false);
      return;
    }

    // Handle normal keyword-based responses
    const found = smartReplies.find(r =>
      r.keywords.some(keyword => lower.includes(keyword))
    );
    
    // Add typing delay for natural conversation
    await new Promise(resolve => setTimeout(resolve, 900));
    
    if (found) {
      const response = { 
        from: 'bot',
        text: found.answer,
        timestamp: new Date()
      };
      
      // Add any additional elements to the response
      if (found.list) response.list = found.list;
      if (found.suggestions) response.suggestions = found.suggestions;
      if (found.actionButton) response.actionButton = found.actionButton;
      if (found.table) response.table = found.table;
      if (found.note) response.note = found.note;
      
      setMessages(msgs => [...msgs, response]);
    } else {
      // Use fallback response
      setMessages(msgs => [
        ...msgs, 
        { 
          from: 'bot', 
          text: fallbackReply.text, 
          suggestions: fallbackReply.suggestions,
          timestamp: new Date()
        }
      ]);
    }
    
    setIsBotTyping(false);
  };

  // Fixed handleSend function that properly checks for event objects
  const handleSend = (eventOrText, quickText = null) => {
    // If eventOrText is an event (form submission), prevent default behavior
    if (eventOrText && typeof eventOrText.preventDefault === 'function') {
      eventOrText.preventDefault();
    }
    
    // Determine the actual text to send
    const userText = quickText || (typeof eventOrText === 'string' ? eventOrText : input);
    
    if (!userText.trim()) return;
    
    // Add user message
    setMessages(msgs => [...msgs, { 
      from: 'user', 
      text: userText,
      timestamp: new Date()
    }]);
    
    setInput('');
    setLoading(true);
    
    // Detect entities in user message
    const entities = detectEntities(userText);
    
    // Process the user message and generate bot response
    handleBotResponse(userText, entities).finally(() => {
      setLoading(false);
    });
  };
  
  // Handle suggestion click
  const handleSuggestion = (suggestion) => {
    handleSend(suggestion, suggestion);
  };

  // Format time for messages
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Toggle Button */}
      <button
        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg p-4 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={() => setOpen(v => !v)}
        aria-label="Open chat"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="w-80 sm:w-96 max-w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden mt-2 border border-gray-200 transition-all duration-300 animate-slide-up">
          <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="font-semibold">NES Chat Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="ml-2 text-white hover:text-gray-200 transition">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex overflow-x-auto gap-2 hide-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs hover:bg-emerald-200 transition whitespace-nowrap"
                onClick={() => handleSend(q, q)}
              >
                {q}
              </button>
            ))}
          </div>
          
          {/* Messages */}
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto max-h-96 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                {msg.from === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
                
                <div className={`max-w-[75%] ${msg.from === 'user' ? 'order-1' : 'order-2'}`}>
                  {/* Standard text message */}
                  {!msg.type && (
                    <div className={`px-4 py-3 rounded-xl text-sm shadow
                      ${msg.from === 'user'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <div>{msg.text}</div>
                      
                      {/* Bulleted list */}
                      {msg.list && (
                        <ul className="mt-2 space-y-1">
                          {msg.list.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-1">•</span> 
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {/* Table */}
                      {msg.table && (
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <table className="w-full text-left">
                            <tbody>
                              {msg.table.map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                                  <td className="px-2 py-1 border-b border-r">{row.day}</td>
                                  <td className="px-2 py-1 border-b">{row.hours}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {/* Note */}
                      {msg.note && (
                        <div className="mt-2 text-xs italic">
                          {msg.note}
                        </div>
                      )}
                      
                      {/* Action button */}
                      {msg.actionButton && (
                        <div className="mt-3">
                          <Link 
                            to={msg.actionButton.url} 
                            className="inline-block bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-medium py-1 px-3 rounded transition"
                          >
                            {msg.actionButton.text} →
                          </Link>
                        </div>
                      )}
                      
                      {/* Suggestion chips */}
                      {msg.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestion(suggestion)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full px-3 py-1 transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Property list */}
                  {msg.type === 'property-list' && (
                    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-800">
                        {msg.text}
                      </div>
                      <div className="space-y-1 max-w-xs">
                        {msg.properties.map((property, i) => (
                          <div key={i} className="p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div className="flex space-x-2">
                              <img 
                                src={property.image} 
                                alt={property.title} 
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                  e.target.onerror = null;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{property.title}</div>
                                <div className="text-emerald-600 text-sm">{property.price}</div>
                                <div className="text-gray-500 text-xs">{property.location} • {property.bedrooms}BR/{property.bathrooms}BA</div>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-right">
                              <button 
                                onClick={() => handleSuggestion(`Tell me about property ${property.id}`)}
                                className="text-emerald-600 hover:underline"
                              >
                                View Details (ID: {property.id})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Suggestion chips */}
                      {msg.suggestions && (
                        <div className="p-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestion(suggestion)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full px-3 py-1 transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Property card detailed view with image error handling */}
                  {msg.type === 'property-card' && (
                    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden max-w-xs">
                      {msg.property.images && msg.property.images.length > 0 ? (
                        <img 
                          src={msg.property.images[0]} 
                          alt={msg.property.title}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image Available</span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="font-medium">{msg.property.title}</div>
                        <div className="text-emerald-600 font-medium">{msg.property.price}</div>
                        <div className="text-gray-700 text-sm mt-1">{msg.property.location}</div>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                          <span>{msg.property.bedrooms}BR</span>
                          <span>•</span>
                          <span>{msg.property.bathrooms}BA</span>
                          <span>•</span>
                          <span>{msg.property.size}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {msg.property.description}
                        </div>
                        
                        {/* Features */}
                        {msg.property.features && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.property.features.slice(0, 3).map((feature, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                {feature}
                              </span>
                            ))}
                            {msg.property.features.length > 3 && (
                              <span className="text-gray-500 text-xs">+{msg.property.features.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="mt-3 flex space-x-2">
                          <button 
                            onClick={() => handleSuggestion(`Schedule viewing for property ${msg.property.id}`)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1 px-3 rounded flex-1 transition"
                          >
                            Schedule Viewing
                          </button>
                          <button 
                            onClick={() => handleSuggestion(`Contact agent about property ${msg.property.id}`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs py-1 px-3 rounded flex-1 transition"
                          >
                            Contact Agent
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Message timestamp */}
                  <div className={`text-xs text-gray-400 mt-1 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                
                {msg.from === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ml-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {/* Bot typing indicator */}
            {isBotTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-xl text-sm shadow bg-white text-gray-700 border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form onSubmit={handleSend} className="flex border-t border-gray-200 bg-white">
            <input
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
              type="text"
              placeholder="Type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading || isBotTyping}
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 transition disabled:opacity-50 flex items-center justify-center"
              disabled={loading || isBotTyping || !input.trim()}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;