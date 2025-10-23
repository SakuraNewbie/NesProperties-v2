import React from 'react';

const TypingIndicator = () => (
  <div className="flex items-center space-x-2">
    <span className="text-emerald-600 font-bold">NES Assistant</span>
    <span className="flex space-x-1">
      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></span>
    </span>
  </div>
);

export default TypingIndicator;