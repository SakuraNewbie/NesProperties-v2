/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PropertyFilters from '../components/PropertyFilters';
import PropertyGrid from '../components/PropertyGrid';
import NoResultsFound from '../components/NoResultsFound';
import { api } from '../api';
import ChatBotv2 from '../components/ChatBotv2';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    area: '',
    maxDistance: '',
    genderRestriction: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (query = '') => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.area) params.append('area', filters.area);
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
      if (filters.genderRestriction) params.append('genderRestriction', filters.genderRestriction);
      
      // Use search endpoint if query provided, otherwise use regular endpoint
      const endpoint = query ? `/properties/search?${params}` : `/properties?${params}`;
      const response = await fetch(`${api.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Automatically fetch properties when filters change
    fetchProperties(searchQuery);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      area: '',
      maxDistance: '',
      genderRestriction: '',
      sort: 'newest'
    });
    setSearchQuery('');
    fetchProperties();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchProperties(query);
  };

  // Sort properties based on the filter
  const sortedProperties = [...properties].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'distance':
        return (a.location?.distanceToUSAS || 999) - (b.location?.distanceToUSAS || 999);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  if (loading && properties.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div>
        {/* Page Header */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-black text-center">Browse Properties</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters */}
            <div className="w-full md:w-1/4">
              <PropertyFilters 
                filters={filters} 
                onFilterChange={handleFilterChange}
                resetFilters={resetFilters}
              />
            </div>
            
            {/* Properties Grid */}
            <div className="w-full md:w-3/4">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">{sortedProperties.length} Properties Found</h2>
              </div>
              
              {loading && (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              )}
              
              {!loading && sortedProperties.length > 0 ? (
                <PropertyGrid properties={sortedProperties} />
              ) : (
                !loading && <NoResultsFound resetFilters={resetFilters} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ChatBotv2 />
      <Footer />
    </>
  );
};

export default Properties;