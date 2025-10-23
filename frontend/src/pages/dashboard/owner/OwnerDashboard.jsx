import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, faUser, faSignOutAlt, 
  faTachometerAlt, faBars, faTimes, faBuilding
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "../../../utils/apiClient";

// Import owner subpages
import Properties from "./Properties";
import Profile from "./Profile";
import ImageUpload from "../../../components/UI/owner/ImageUpload";
import VirtualTourUpload from "../../../components/UI/owner/VirtualTourUpload";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVirtualTourUpload, setShowVirtualTourUpload] = useState(false);
  
  // Fetch owner data using React Query
  const { data: ownerData, error, isLoading } = useQuery({
    queryKey: ['owner', user?.id],
    queryFn: () => ownerApi.getOwnerByUserId(user?.id),
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load owner profile");
      console.error("Error loading owner profile:", error);
    }
  }, [error]);

  const handleLogout = () => {
    logout();
  };

  const handleImageUpload = (property) => {
    setSelectedProperty(property);
    setShowImageUpload(true);
  };
  
  const handleVirtualTourUpload = (property) => {
    setSelectedProperty(property);
    setShowVirtualTourUpload(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 md:hidden text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Owner Dashboard
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">
              {user?.fullName || 'Owner'}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span className="ml-1 hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-wrap">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white shadow-md rounded-lg p-4 md:block ${
            sidebarOpen ? 'block fixed inset-0 z-50 bg-white' : 'hidden'
          }`}
        >
          <div className="md:hidden flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-700">
                {ownerData?.fullName || user?.fullName || 'Owner'}
              </h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard/owner"
                  className={`flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-600 ${
                    location.pathname === '/dashboard/owner' ? 'bg-emerald-50 text-emerald-600' : ''
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/owner/properties"
                  className={`flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-600 ${
                    location.pathname === '/dashboard/owner/properties' ? 'bg-emerald-50 text-emerald-600' : ''
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                  My Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/owner/profile"
                  className={`flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-600 ${
                    location.pathname === '/dashboard/owner/profile' ? 'bg-emerald-50 text-emerald-600' : ''
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-3" />
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-600"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon icon={faHome} className="mr-3" />
                  Go to Website
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-full md:flex-1 md:ml-6 mt-6 md:mt-0">
          <Routes>
            <Route index element={<Properties onImageUpload={handleImageUpload} onVirtualTourUpload={handleVirtualTourUpload} />} />
            <Route path="properties" element={<Properties onImageUpload={handleImageUpload} onVirtualTourUpload={handleVirtualTourUpload} />} />
            <Route path="profile" element={<Profile ownerData={ownerData} isLoading={isLoading} />} />
            <Route path="*" element={<Navigate to="/dashboard/owner" replace />} />
          </Routes>
        </main>
      </div>
      
      {/* Image Upload Modal */}
      {showImageUpload && selectedProperty && (
        <ImageUpload
          property={selectedProperty}
          onClose={() => setShowImageUpload(false)}
        />
      )}
      
      {/* Virtual Tour Upload Modal */}
      {showVirtualTourUpload && selectedProperty && (
        <VirtualTourUpload
          property={selectedProperty}
          onClose={() => setShowVirtualTourUpload(false)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
