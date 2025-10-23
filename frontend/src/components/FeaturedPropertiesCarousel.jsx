import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { allProperties } from '../data/properties';

const AUTO_SLIDE_MS = 7000;

const FeaturedPropertiesCarousel = () => {
  const featuredProperties = allProperties
    .filter(property => property.featured === true)
    .slice(0, 6);

  const totalSlides = featuredProperties.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragDelta, setDragDelta] = useState(0);
  const autoSlideRef = useRef();
  const sliderRef = useRef();

  // Auto-slide effect
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(idx => (idx + 1) % totalSlides);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(autoSlideRef.current);
  }, [totalSlides]);

  // Reset auto-slide on manual navigation
  const resetAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(idx => (idx + 1) % totalSlides);
    }, AUTO_SLIDE_MS);
  };

  // Touch/drag handlers
  const handleTouchStart = (e) => {
    setDragStartX(e.touches ? e.touches[0].clientX : e.clientX);
    setDragDelta(0);
    clearInterval(autoSlideRef.current);
  };

  const handleTouchMove = (e) => {
    if (dragStartX !== null) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setDragDelta(clientX - dragStartX);
    }
  };

  const handleTouchEnd = () => {
    if (dragDelta < -60) {
      goToSlide((currentIndex + 1) % totalSlides);
    } else if (dragDelta > 60) {
      goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
    }
    setDragStartX(null);
    setDragDelta(0);
    resetAutoSlide();
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
    resetAutoSlide();
  };

  const nextSlide = () => goToSlide((currentIndex + 1) % totalSlides);
  const prevSlide = () => goToSlide((currentIndex - 1 + totalSlides) % totalSlides);

  // Responsive slide width
  useEffect(() => {
    const handleResize = () => {
      setDragDelta(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate translateX for smooth drag
  const slideWidth = sliderRef.current?.offsetWidth || 1;
  const translateX = -currentIndex * slideWidth + dragDelta;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-600 mt-2">Discover our handpicked selection of premium properties</p>
          </div>
          <Link 
            to="/properties" 
            className="mt-4 md:mt-0 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors duration-300 inline-flex items-center"
          >
            View All Properties
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {totalSlides > 0 ? (
          <div className="relative select-none">
            <div
              ref={sliderRef}
              className="overflow-hidden rounded-xl shadow-lg bg-white"
              style={{ touchAction: 'pan-y' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={e => dragStartX !== null && handleTouchMove(e)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  width: `${totalSlides * 100}%`,
                  transform: `translateX(${translateX}px)`
                }}
              >
                {featuredProperties.map((property, idx) => (
                  <div
                    key={property.id}
                    className="w-full flex-shrink-0"
                    style={{ width: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : '100%' }}
                  >
                    <div className="max-w-2xl mx-auto px-2 py-4">
                      <PropertyCard property={property} featured />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Navigation arrows */}
            <button
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 focus:outline-none transition-all hover:scale-110"
              onClick={prevSlide}
              aria-label="Previous slide"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 focus:outline-none transition-all hover:scale-110"
              onClick={nextSlide}
              aria-label="Next slide"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Pagination dots */}
            <div className="flex justify-center mt-6 space-x-3">
              {featuredProperties.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-3 h-3 rounded-full focus:outline-none transition-all ${
                    currentIndex === idx 
                      ? 'bg-red-600 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            {/* Slide indicator */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentIndex + 1} / {totalSlides}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No featured properties at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPropertiesCarousel;