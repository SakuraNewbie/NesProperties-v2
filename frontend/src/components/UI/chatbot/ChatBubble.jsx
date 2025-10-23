import React from 'react';

const ChatBubble = ({ message, onSuggestionClick, darkMode }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.sender === 'bot' && (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
        <div 
          className={`px-4 py-3 rounded-xl text-sm shadow
            ${message.sender === 'user' 
              ? 'bg-emerald-500 text-white' 
              : darkMode 
                ? 'bg-gray-700 text-gray-100 border border-gray-600' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
        >
          {/* Add a safeguard for empty content */}
          <div>{message.content || "No message content"}</div>
          
          {/* Lists for bullet points */}
          {message.list && (
            <ul className="mt-2 space-y-1">
              {message.list.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {/* Tables for structured data */}
          {message.table && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  {message.table.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1 border-b border-r">{row.label}</td>
                      <td className="px-2 py-1 border-b">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Action buttons */}
          {message.actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(action.text)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-medium py-1 px-3 rounded transition"
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}
          
          {/* Suggestion chips */}
          {message.suggestions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full px-3 py-1 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {message.sender === 'user' && (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ml-2 flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;