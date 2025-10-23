import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
      <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
        Let our experts guide you through the process and find the perfect property for your needs.
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/properties" 
          className="px-6 py-3 bg-white text-red-600 font-bold rounded-md hover:bg-black transition-colors"
        >
          Explore Properties
        </Link>
        <Link 
          to="/contact" 
          className="px-6 py-3 bg-white text-red-600 font-bold rounded-md hover:bg-black transition-colors"
        >
          Contact Us Today
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;