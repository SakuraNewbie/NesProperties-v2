import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './assets/logo.svg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    
      <nav 
        className={`fixed w-full top-0 z-30 transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-md py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              aria-label="NES Properties - Home"
            >
              {/* Increased size for desktop */}
              <img 
                src={Logo} 
                alt="NES Properties Logo" 
                className="hidden md:block h-20 w-auto" 
              />
              {/* Increased size for mobile */}
              <img 
                src={Logo} 
                alt="NES Properties" 
                className="block md:hidden h-16 w-auto" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Home', path: '/' },
                { name: 'Properties', path: '/properties' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                    isActive(item.path) 
                      ? `${scrolled ? 'text-red-600' : 'text-red-500'} font-semibold` 
                      : `${scrolled ? 'text-gray-700 hover:text-red-600' : 'text-black/90 hover:text-black'}`
                  }`}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Sign In / Sign Up */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className={`px-5 py-2 rounded-full transition-all duration-300 ${
                  scrolled 
                    ? 'bg-red-600 text-white hover:bg-black' 
                    : 'bg-red-600/90 text-white hover:bg-black'
                } font-medium`}
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  scrolled 
                    ? 'text-gray-700 focus:ring-red-600' 
                    : 'text-black focus:ring-white'
                }`}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden fixed right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <Link to="/" className="flex items-center space-x-2">
                  <img 
                    src={Logo} 
                    alt="NES Properties Logo"
                    className="h-20 w-auto" 
                  />
                </Link>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Properties', path: '/properties' },
                  { name: 'About', path: '/about' },
                  { name: 'Contact', path: '/contact' }
                ].map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path} 
                    className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                      isActive(item.path) 
                        ? 'bg-red-50 text-red-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <Link 
                  to="/login" 
                  className="block w-full px-5 py-3 text-center rounded-lg bg-red-600 hover:bg-black text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Additional links or info */}
              <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                <p className="mb-4">Connect with us</p>
                <div className="flex space-x-4">
                  {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                    <a 
                      key={social}
                      href="#" 
                      className="p-2 bg-gray-100 hover:bg-red-50 rounded-full text-gray-600 hover:text-red-600 transition-colors"
                      aria-label={social}
                    >
                      {social === 'Facebook' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      )}
                      {social === 'Instagram' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.66.598-1.216 1.153-1.772.554-.554 1.113-.902 1.772-1.153.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.8c-2.67 0-2.986.01-4.04.06-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.055-.06 1.37-.06 4.04 0 2.67.01 2.987.06 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.047 1.37.06 4.04.06 2.67 0 2.987-.01 4.04-.06.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.055.06-1.37.06-4.04 0-2.67-.01-2.987-.06-4.04-.044-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15c-.35-.35-.683-.566-1.15-.748-.353-.137-.882-.3-1.857-.344-1.055-.047-1.37-.06-4.04-.06zm0 3.064a5.139 5.139 0 015.136 5.136A5.139 5.139 0 0112 17.136 5.139 5.139 0 016.864 12 5.139 5.139 0 0112 6.864zM12 15.338c1.83 0 3.338-1.507 3.338-3.338 0-1.83-1.508-3.338-3.338-3.338-1.83 0-3.338 1.507-3.338 3.338 0 1.83 1.508 3.338 3.338 3.338zm6.538-8.578a1.2 1.2 0 01-2.4 0 1.2 1.2 0 012.4 0z" />
                        </svg>
                      )}
                      {social === 'Twitter' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      )}
                      {social === 'LinkedIn' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className={scrolled ? 'h-16' : 'h-20'} />
    </>
  );
};

export default Navbar;