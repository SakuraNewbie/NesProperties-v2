import React from 'react';
import { PROPERTY_TYPES, GENDER_RESTRICTIONS } from '../components/config/constant';

const PropertyFilters = ({ filters, onFilterChange, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filter Properties</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="flex space-x-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
        <select
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender Restriction</label>
        <select
          name="genderRestriction"
          value={filters.genderRestriction}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Any</option>
          {GENDER_RESTRICTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="distance">Distance to USAS</option>
        </select>
      </div>
      
      <button
        onClick={resetFilters}
        className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default PropertyFilters;