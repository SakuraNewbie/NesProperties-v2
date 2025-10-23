import React, { useRef, useEffect, useState } from 'react';

const QuickReplies = ({ onSelect }) => {
  const quickReplies = [
    "Show all properties",
    "Properties for students",
    "Houses for women only",
    "Places under RM300",
    "Taman Sentosa properties"
  ];

  const scrollContainerRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Check if content is scrollable
  useEffect(() => {
    if (scrollContainerRef.current) {
      const checkForOverflow = () => {
        const container = scrollContainerRef.current;
        setShowScrollIndicator(
          container.scrollWidth > container.clientWidth
        );
      };
      
      checkForOverflow();
      window.addEventListener('resize', checkForOverflow);
      return () => window.removeEventListener('resize', checkForOverflow);
    }
  }, []);

  return (
    <div className="relative">
      <div 
        ref={scrollContainerRef}
        className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex overflow-x-auto gap-2 scrollbar-hide"
      >
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => onSelect(reply)}
            className="bg-emerald-100 text-emerald-700 px-3 py-2 sm:py-1 rounded-full text-sm sm:text-xs hover:bg-emerald-200 transition whitespace-nowrap flex-shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>
      
      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default QuickReplies;