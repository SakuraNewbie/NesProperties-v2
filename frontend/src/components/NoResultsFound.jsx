import React from 'react';

const NoResultsFound = ({ resetFilters }) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 text-lg">No properties match your search criteria.</p>
      <button
        onClick={resetFilters}
        className="mt-4 py-2 px-6 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default NoResultsFound;