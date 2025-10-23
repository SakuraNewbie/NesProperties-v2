import { useRef, useState, useEffect } from "react";
import PanoramaViewer from "./PanoramaViewer";
import Compass from "./Compass";
import InfoWindow from "./InfoWindow";
import { api } from '../../api';

// Helper function to get full image URL from API path
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  } else {
    // Remove the /api suffix from the base URL to get the correct domain
    const baseUrl = api.baseUrl.replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
  }
};

// Utility to detect iOS devices
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
  const [isIOSFullscreen, setIsIOSFullscreen] = useState(false);
  const [lonState, setLonState] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [panoramaImages, setPanoramaImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  // Fetch panorama images from backend
  useEffect(() => {
    const fetchVirtualTourImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the correct API URL
        const response = await fetch(`${api.baseUrl}/properties/${propertyId}/virtual-tour`);
        
        if (!response.ok) {
          // If server returns 404, it means no virtual tour images
          if (response.status === 404) {
            setError('No virtual tour available for this property');
            setPanoramaImages([]);
            return;
          }
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the image paths to ensure they have full URLs
        const processedImages = data.map(img => ({
          ...img,
          imagePath: getFullImageUrl(img.imagePath)
        }));
        
        setPanoramaImages(processedImages);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error fetching virtual tour data:', err);
        setError('Failed to load virtual tour. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVirtualTourImages();
  }, [propertyId]);

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
        } catch (e) {
          alert("Gyroscope permission error.");
        }
      } else {
        setGyroEnabled(true);
      }
    } else {
      setGyroEnabled(false);
    }
  };

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

  // Navigate to previous panorama image
  const prevImage = () => {
    if (panoramaImages.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? panoramaImages.length - 1 : prev - 1
    );
    setLoading(true);
  };

  // Navigate to next panorama image
  const nextImage = () => {
    if (panoramaImages.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === panoramaImages.length - 1 ? 0 : prev + 1
    );
    setLoading(true);
  };

  // Listen for fullscreen changes on the element
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    function fullscreenChangeHandler() {
      const isFs =
        document.fullscreenElement === el ||
        document.webkitFullscreenElement === el ||
        document.mozFullScreenElement === el ||
        document.msFullscreenElement === el;
      setIsFullscreen(isFs);
    }

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);
    document.addEventListener("webkitfullscreenchange", fullscreenChangeHandler);
    document.addEventListener("mozfullscreenchange", fullscreenChangeHandler);
    document.addEventListener("MSFullscreenChange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
      document.removeEventListener("webkitfullscreenchange", fullscreenChangeHandler);
      document.removeEventListener("mozfullscreenchange", fullscreenChangeHandler);
      document.removeEventListener("MSFullscreenChange", fullscreenChangeHandler);
    };
  }, []);

  // Handle iOS back button/swipe to exit iOS fullscreen
  useEffect(() => {
    const handlePopState = () => {
      if (isIOSFullscreen) {
        setIsIOSFullscreen(false);
        // Push a new state to replace the one we just popped
        window.history.pushState(null, "");
      }
    };

    if (isIOSFullscreen) {
      // Add a history entry so back button can be used to exit fullscreen
      window.history.pushState(null, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isIOSFullscreen]);

  // Show error or empty state if no panorama images
  if (error || (panoramaImages.length === 0 && !loading)) {
    return (
      <div className="text-gray-400 text-center py-8 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-lg">{error || 'No virtual tour available for this property.'}</p>
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
          {/* Navigation buttons (only show if multiple images) */}
          {panoramaImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-40 shadow-lg transition"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-40 shadow-lg transition"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Exit fullscreen button */}
          <button
            onClick={handleExitFullscreen}
            className="absolute top-4 right-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full p-3 z-50 shadow-lg transition"
            title="Exit fullscreen"
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
          {panoramaImages.length > 0 && (
            <PanoramaViewer
              mountRef={mountRef}
              imageUrl={panoramaImages[currentImageIndex].imagePath}
              hotspots={panoramaImages[currentImageIndex].hotspots || []}
              gyroEnabled={gyroEnabled}
              setLonState={setLonState}
              setShowInfo={setShowInfo}
              setLoading={setLoading}
            />
          )}
          
          {/* Info window for hotspot interaction */}
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
        {/* Navigation buttons (only show if multiple images) */}
        {panoramaImages.length > 1 && !isFullscreen && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-40 shadow-lg transition"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-40 shadow-lg transition"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
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
        {panoramaImages.length > 0 && (
          <PanoramaViewer
            mountRef={mountRef}
            imageUrl={panoramaImages[currentImageIndex].imagePath}
            hotspots={panoramaImages[currentImageIndex].hotspots || []}
            gyroEnabled={gyroEnabled}
            setLonState={setLonState}
            setShowInfo={setShowInfo}
            setLoading={setLoading}
          />
        )}

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