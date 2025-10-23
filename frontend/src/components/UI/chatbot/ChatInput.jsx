// filepath: /home/sakura/Documents/fyp/web/nes-properties-backup-2/nes-properties/frontend/src/components/UI/chatbot/ChatInput.jsx
import React, { useState, useEffect, forwardRef } from 'react';

const ChatInput = forwardRef(({ value, onChange, onSend, isTyping, darkMode }, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          // Process common speech patterns for better results
          let processed = finalTranscript
            .replace(/looking for/i, "show me")
            .replace(/i want to see/i, "show me")
            .replace(/i need a/i, "show me")
            .replace(/are there any/i, "show me");
            
          // Malaysia-specific terms
          processed = processed
            .replace(/ringget/i, "RM")
            .replace(/ringgit/i, "RM");
            
          onChange({ target: { value: processed } });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimTranscript);
        }
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange]);
  
  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <form
      className="flex items-center border-t px-2 py-2 bg-transparent"
      onSubmit={e => {
        e.preventDefault();
        if (!isTyping) onSend();
      }}
    >
      {recognition && (
        <button
          type="button"
          onClick={toggleListening}
          className={`px-4 ${isListening ? 'text-red-500' : 'text-gray-500'} hover:text-gray-700 transition`}
          disabled={isTyping}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          <svg className="h-6 w-6 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
      <div className="relative flex-1">
        <input
          ref={ref}
          className={`flex-1 rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-800 text-white focus:ring-emerald-400' : 'bg-white text-gray-900 focus:ring-emerald-600'}`}
          type="text"
          placeholder={isListening ? "Listening..." : "Type your message…"}
          value={isListening ? interimTranscript || value : value}
          onChange={onChange}
          disabled={isTyping || isListening}
          autoComplete="off"
          aria-label="Type a message"
        />
        {isListening && interimTranscript && (
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-700 shadow-lg rounded px-3 py-2 text-sm max-w-full overflow-hidden">
            <p className="text-gray-600 dark:text-gray-300 italic">{interimTranscript}</p>
          </div>
        )}
      </div>
      <button
        type="submit"
        className={`p-2 rounded-full ${isTyping ? 'bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-700'} text-white focus:outline-none focus:ring-2 focus:ring-emerald-400`}
        aria-label="Send message"
        disabled={isTyping}
      >
        <span className="text-xl">{isTyping ? '...' : '➔'}</span>
      </button>
    </form>
  );
});

export default ChatInput;