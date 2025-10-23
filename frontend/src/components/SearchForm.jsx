import React, { useState } from 'react';

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    type: 'all',
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic (would connect to backend)
    console.log('Search params:', searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-6">
      {/* Quick Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          id="location"
          name="location"
          value={searchParams.location}
          onChange={handleChange}
          placeholder="Search by city, ZIP, or address"
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          type="button"
          className="text-emerald-600 hover:underline text-sm font-medium"
          onClick={() => setShowFilters(f => !f)}
        >
          {showFilters ? 'Hide Filters ▲' : 'More Filters ▼'}
        </button>
        <button
          type="submit"
          className="bg-emerald-600 text-white py-2 px-6 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
      </div>
      {/* Expandable Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="type">
              Property Type
            </label>
            <select
              id="type"
              name="type"
              value={searchParams.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="minPrice">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={searchParams.minPrice}
                onChange={handleChange}
                placeholder="Min"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={searchParams.maxPrice}
                onChange={handleChange}
                placeholder="Max"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bedrooms">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={searchParams.bedrooms}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          {/* You can add more filters here */}
        </div>
      )}
    </form>
    
  );
};

export default SearchForm;