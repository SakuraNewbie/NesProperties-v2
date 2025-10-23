import React, { useRef, useState, useEffect, useCallback } from "react";
import { allProperties } from "../../data/properties";
import PanoramaViewer from "./PanoramaViewer";
import Compass from "./Compass";
import InfoWindow from "./InfoWindow";
import { api } from '../../api';

// Utility to detect iOS devices that we'll actually use
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !window.MSStream  // Excludes IE11
  );
}

const VirtualTour = ({ propertyId }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOSFullscreen, setIsIOSFullscreen] = useState(false); // iOS-specific fullscreen state
  const [lonState, setLonState] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  
  // NEW: Track all panorama images and current index
  const [panoramaImages, setPanoramaImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Store fake property data that matches our component's expected format
  const [apiProperty, setApiProperty] = useState(null);

  // Try to find property in static data first (for backward compatibility)
  const staticProperty = allProperties.find((p) => p.id === propertyId);
  
  // Use useCallback to memoize the updatePropertyWithImage function
  const updatePropertyWithImage = useCallback((images, index) => {
    if (images && images.length > index) {
      const baseUrl = api.baseUrl.replace(/\/api$/, '');
      
      const mockProperty = {
        id: propertyId,
        title: "Virtual Tour",
        // Use the specified panorama image URL
        imageUrl: images[index].imagePath.startsWith('http') 
            ? images[index].imagePath 
            : `${baseUrl}${images[index].imagePath}`,
        // Ensure hotspots is always an array, even if empty
        hotspots: Array.isArray(images[index].hotspots) ? images[index].hotspots : [],
        // Add other required fields
        image: images[index].imagePath
      };
      
      setApiProperty(mockProperty);
    }
  }, [propertyId]);
  
  // If no static property, convert API data to compatible format
  useEffect(() => {
    // Only fetch from API if propertyId doesn't match static data
    if (!staticProperty) {
      const fetchProperty = async () => {
        try {
          console.log("Fetching property data for:", propertyId);
          // First, try to get the virtual tour data
          const vtResponse = await fetch(`${api.baseUrl}/properties/${propertyId}/virtual-tour`);
          
          if (vtResponse.ok) {
            const vtData = await vtResponse.json();
            
            // NEW: Store all panorama images
            if (vtData && vtData.length > 0) {
              setPanoramaImages(vtData);
              
              // Create initial property with first image
              updatePropertyWithImage(vtData, 0);
            }
          }
          setLoading(false);
        } catch (err) {
          console.error("Error fetching virtual tour:", err);
          setLoading(false);
        }
      };
      
      fetchProperty();
    }
  }, [propertyId, staticProperty, updatePropertyWithImage]);
  
  // NEW: Navigate to next panorama image
  const nextPanorama = () => {
    if (panoramaImages.length <= 1) return;
    
    const newIndex = (currentIndex + 1) % panoramaImages.length;
    setCurrentIndex(newIndex);
    updatePropertyWithImage(panoramaImages, newIndex);
    setLoading(true); // Show loading indicator while changing image
  };
  
  // NEW: Navigate to previous panorama image
  const prevPanorama = () => {
    if (panoramaImages.length <= 1) return;
    
    const newIndex = (currentIndex - 1 + panoramaImages.length) % panoramaImages.length;
    setCurrentIndex(newIndex);
    updatePropertyWithImage(panoramaImages, newIndex);
    setLoading(true); // Show loading indicator while changing image
  };
  
  // Use static property if available, otherwise use our API-based property
  const property = staticProperty || apiProperty;

  // RESTORE ORIGINAL EVENT HANDLERS

  // Gyro permission handler for iOS/Android
  const handleGyroToggle = async () => {
    if (!gyroEnabled) {
      if (
        typeof window.DeviceOrientationEvent !== "undefined" &&
        typeof window.DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const response = await window.DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            setGyroEnabled(true);
          } else {
            alert(
              "Gyroscope permission denied. Please enable 'Motion & Orientation Access' in iOS Settings > Safari > Privacy & Security."
            );
          }
        } catch {  // Remove the unused parameter completely
          alert("Gyroscope permission error.");
        }
      } else {
        setGyroEnabled(true);
      }
    } else {
      setGyroEnabled(false);
    }
  };

  // Handle fullscreen toggling (with iOS workaround)
  const handleFullscreen = () => {
    // iOS special handling - use custom fullscreen
    if (isIOS()) {
      setIsIOSFullscreen(true);
      if (window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock("landscape").catch(() => {});
      }
      return;
    }
    
    // Standard fullscreen API for other browsers
    const el = mountRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    
    // Try to lock orientation on mobile (optional)
    if (window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock("landscape").catch(() => {});
    }
  };

  // Exit fullscreen handler
  const handleExitFullscreen = () => {
    // iOS special handling
    if (isIOS()) {
      setIsIOSFullscreen(false);
      return;
    }
    
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  // Listen for fullscreen changes on the element
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle iOS back button/swipe to exit iOS fullscreen
  useEffect(() => {
    if (!isIOSFullscreen) return;

    const handleBackButton = (event) => {
      if (event.key === "ArrowLeft" || event.key === "Backspace") {
        event.preventDefault();
        setIsIOSFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleBackButton);
    window.addEventListener("touchstart", handleBackButton);

    return () => {
      window.removeEventListener("keydown", handleBackButton);
      window.removeEventListener("touchstart", handleBackButton);
    };
  }, [isIOSFullscreen]);
  
  // Don't show error if we're still loading
  if (!property && loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p>Loading virtual tour...</p>
      </div>
    );
  }

  // Show error if no property data is available after loading
  if (!property && !loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        No virtual tour available for this property.
      </div>
    );
  }

  // Display fully-immersive iOS "fullscreen"
  if (isIOSFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black w-screen h-screen max-w-none">
        <div
          ref={mountRef}
          className="w-full h-full"
          style={{ overflow: "hidden" }}
        >
          {/* NEW: Navigation buttons for multiple panoramas */}
          {panoramaImages.length > 1 && (
            <>
              <button
                onClick={prevPanorama}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-40 shadow-lg transition-colors"
                aria-label="Previous panorama"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPanorama}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-40 shadow-lg transition-colors"
                aria-label="Next panorama"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* NEW: Panorama navigation indicator dots */}
          {panoramaImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
              {panoramaImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    updatePropertyWithImage(panoramaImages, idx);
                    setLoading(true);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`View panorama ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Exit fullscreen button */}
          <button
            onClick={handleExitFullscreen}
            className="absolute top-4 right-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full p-3 z-50 shadow-lg transition"
            title="Exit fullscreen"
            aria-label="Exit fullscreen"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 7v4H3M7 7h-4M17 7v4h4M17 7h4M7 17v-4H3M7 17h-4M17 17v-4h4M17 17h4" />
            </svg>
          </button>
          
          {/* Gyro toggle button */}
          <button
            onClick={handleGyroToggle}
            className={`absolute bottom-4 right-4 z-40 rounded-full px-5 py-2 text-sm font-semibold shadow-lg transition
              ${gyroEnabled ? "bg-emerald-600 text-white" : "bg-white/80 text-emerald-700 border border-emerald-600"}
              hover:bg-emerald-700 hover:text-white`}
            aria-pressed={gyroEnabled}
          >
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="9" r="7" />
                <path d="M9 2v2M9 14v2M2 9h2M14 9h2" />
              </svg>
              {gyroEnabled ? "Gyro: On" : "Gyro: Off"}
            </span>
          </button>
          
          {/* Compass */}
          <div className="absolute bottom-4 left-4 z-40">
            <Compass lon={lonState} />
          </div>
          
          {/* Panorama Viewer */}
          <PanoramaViewer
            mountRef={mountRef}
            property={property}
            gyroEnabled={gyroEnabled}
            setLonState={setLonState}
            setShowInfo={setShowInfo}
            setLoading={setLoading}
          />
          
          <InfoWindow show={showInfo} />
          
          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular view
  return (
    <div className="w-full flex justify-center">
      <div
        ref={mountRef}
        className={`w-full max-w-5xl rounded-2xl shadow-2xl bg-black/90 relative transition-all duration-300 ${
          isFullscreen ? "fixed inset-0 z-50 w-screen h-screen max-w-none rounded-none" : "my-8"
        }`}
        style={{
          aspectRatio: "16/9",
          minHeight: 220,
          maxHeight: isFullscreen ? "100vh" : 540,
          overflow: "hidden",
        }}
      >
        {/* NEW: Navigation buttons for multiple panoramas */}
        {panoramaImages.length > 1 && (
          <>
            <button
              onClick={prevPanorama}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-40 shadow-lg transition-colors"
              aria-label="Previous panorama"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextPanorama}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-40 shadow-lg transition-colors"
              aria-label="Next panorama"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* NEW: Panorama navigation indicator dots */}
        {panoramaImages.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
            {panoramaImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  updatePropertyWithImage(panoramaImages, idx);
                  setLoading(true);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`View panorama ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Overlay hint */}
        {!isFullscreen && (
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-4 py-2 rounded-lg z-20 pointer-events-none select-none shadow">
            <span className="hidden sm:inline">Drag to look around, pinch to zoom, double-tap to reset.</span>
            <span className="sm:hidden">Touch & drag to look, pinch to zoom.</span>
          </div>
        )}
        {/* Fullscreen button */}
        {!isFullscreen && (
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 bg-emerald-600/90 hover:bg-emerald-700 text-white rounded-full p-3 z-30 shadow-lg transition"
            title="Fullscreen"
            aria-label="Enter fullscreen"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h6M3 3v6M19 3h-6M19 3v6M3 19h6M3 19v-6M19 19h-6M19 19v-6" />
            </svg>
          </button>
        )}
        {/* Exit fullscreen button */}
        {isFullscreen && (
          <button
            onClick={handleExitFullscreen}
            className="absolute top-4 right-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full p-3 z-50 shadow-lg transition"
            title="Exit fullscreen"
            aria-label="Exit fullscreen"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 7v4H3M7 7h-4M17 7v4h4M17 7h4M7 17v-4H3M7 17h-4M17 17v-4h4M17 17h4" />
            </svg>
          </button>
        )}
        {/* Gyro toggle button */}
        <button
          onClick={handleGyroToggle}
          className={`absolute bottom-4 right-4 z-40 rounded-full px-5 py-2 text-sm font-semibold shadow-lg transition
            ${gyroEnabled ? "bg-emerald-600 text-white" : "bg-white/80 text-emerald-700 border border-emerald-600"}
            hover:bg-emerald-700 hover:text-white`}
          aria-pressed={gyroEnabled}
        >
          <span className="inline-flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2" />
            </svg>
            {gyroEnabled ? "Gyro: On" : "Gyro: Off"}
          </span>
        </button>
        {/* Compass/minimap overlay */}
        <div className="absolute bottom-4 left-4 z-40">
          <Compass lon={lonState} />
        </div>
        {/* Panorama Viewer */}
        <PanoramaViewer
          mountRef={mountRef}
          property={property}
          gyroEnabled={gyroEnabled}
          setLonState={setLonState}
          setShowInfo={setShowInfo}
          setLoading={setLoading}
        />
        {/* Info window for hotspot */}
        <InfoWindow show={showInfo} />
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTour;