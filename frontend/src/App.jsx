import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/virtualTour.css';  // Add this import
import { SpeedInsights } from '@vercel/speed-insights/react';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Favourites from './pages/Favourites';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AdminProperties from './pages/dashboard/admin/Properties';
import AdminUsers from './pages/dashboard/admin/Users';
import AdminOwners from './pages/dashboard/admin/Owners';
import AdminAdmins from './pages/dashboard/admin/Admins';
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import { USER_ROLES } from './components/config/constant';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryProvider } from './providers/QueryProvider';

// Import your environment configuration
import './utils/envConfig';

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Redirect to home if role doesn't match
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/favourites" element={<Favourites />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      {/* Admin Dashboard Nested Routes */}
      <Route
        path="/dashboard/admin/*"
        element={
          <RequireAuth role={USER_ROLES.ADMIN}>
            <AdminDashboard />
          </RequireAuth>
        }
      >
        <Route path="properties" element={<AdminProperties />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route index element={<Navigate to="/dashboard/admin/properties" replace />} />
      </Route>
      {/* Owner Dashboard */}
      <Route
        path="/dashboard/owner/*"
        element={
          <RequireAuth role={USER_ROLES.OWNER}>
            <OwnerDashboard />
          </RequireAuth>
        }
      />
      {/* User Dashboard */}
      <Route
        path="/user-dashboard"
        element={
          <RequireAuth role={USER_ROLES.USER}>
            <UserDashboard />
          </RequireAuth>
        }
      />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <AppRoutes />
              <SpeedInsights />
            </div>
          </div>
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;