import { useState, useEffect, useRef } from 'react';
import ChatHeader from './UI/chatbot/ChatHeader';
import ChatBubble from './UI/chatbot/ChatBubble';
import ChatInput from './UI/chatbot/ChatInput';
import PropertyList from './UI/chatbot/PropertyList';
import PropertyCard from './UI/chatbot/PropertyCard';
import PropertyComparison from './UI/chatbot/PropertyComparison';
import QuickReplies from './UI/chatbot/QuickReplies';
import TypingIndicator from './UI/chatbot/TypingIndicator';

function ErrorBoundary({ children }) {
  try {
    return children;
  } catch (e) {
    return <div style={{ color: 'red' }}>Chatbot error: {e.message}</div>;
  }
}

const ChatBotv2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'text',
        content: "👋 Hi! I'm your NES Properties assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ["Show all properties", "Student accommodations", "Properties for women only"]
      }]);
    }
  }, [messages.length]);

  // Detect dark mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mq.matches);
    const handler = (e) => setDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSendMessage = async (text = null) => {
    const messageContent = text || inputValue;
    if (!messageContent.trim()) return;

    // If messageContent looks like a MongoDB ObjectId, treat as propertyId
    const isPropertyId = /^[a-f\d]{24}$/i.test(messageContent);

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'text',
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isPropertyId
            ? { propertyId: messageContent }
            : { message: messageContent }
        )
      }).then(r => r.json());

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: response.type,
        content: response.content,
        properties: response.properties,
        property: response.property,
        suggestions: response.suggestions || [],
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'text',
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
    setIsTyping(false);
  };

  const handleQuickReply = (text) => handleSendMessage(text);

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end">
      {/* Chat toggle button with badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 animate-bounce"
          aria-label="Open chat assistant"
          tabIndex={0}
        >
          💬
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <ErrorBoundary>
          <div className={`w-full max-w-xs sm:max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-t-xl shadow-xl flex flex-col h-[70vh] max-h-[80vh]'`}>
            <ChatHeader onClose={() => setIsOpen(false)} darkMode={darkMode} />
            <QuickReplies onSelect={handleQuickReply} />
            <div className={`flex-1 px-4 py-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.map((msg) => {
                if (msg.type === 'property-list') {
                  return (
                    <PropertyList
                      key={msg.id}
                      message={msg}
                      onPropertyClick={handleSendMessage}
                      onSuggestionClick={handleQuickReply}
                      darkMode={darkMode}
                    />
                  );
                }
                if (msg.type === 'property-card') {
                  return (
                    <PropertyCard
                      key={msg.id}
                      message={msg}
                      onActionClick={handleQuickReply}
                      darkMode={darkMode}
                    />
                  );
                }
                if (msg.type === 'property-comparison') {
                  return (
                    <PropertyComparison
                      key={msg.id}
                      properties={msg.comparison}
                      darkMode={darkMode}
                    />
                  );
                }
                // Default: text
                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    onSuggestionClick={handleQuickReply}
                    darkMode={darkMode}
                  />
                );
              })}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onSend={handleSendMessage}
              isTyping={isTyping}
              darkMode={darkMode}
            />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default ChatBotv2;