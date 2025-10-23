import React, { useState, useEffect } from "react";
import { api } from "../../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUsers, faUserTie} from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ title, value, icon, color, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            {loading ? (
              <div className="animate-pulse h-7 w-16 bg-gray-200 rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="text-white text-xl" />
          </div>
        </div>
      </div>
      <div className={`h-1 ${color.replace('bg-', 'bg-')}`}></div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    owners: 0,
    featured: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats data
        const [propertiesRes, usersRes, ownersRes, featuredRes] = await Promise.all([
          fetch(`${api.baseUrl}/properties`),
          fetch(`${api.baseUrl}/users?role=user`),
          fetch(`${api.baseUrl}/users?role=owner`),
          fetch(`${api.baseUrl}/properties/featured`)
        ]);
        
        const properties = await propertiesRes.json();
        const users = await usersRes.json();
        const owners = await ownersRes.json();
        const featured = await featuredRes.json();
        
        setStats({
          properties: properties.length,
          users: users.length,
          owners: owners.length,
          featured: featured.length
        });
        
        // Set recent properties
        setRecentProperties(properties.slice(0, 5));
        
        // Set recent users
        setRecentUsers(users.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the NES Properties admin panel</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Properties" 
          value={stats.properties} 
          icon={faHome} 
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard 
          title="Registered Users" 
          value={stats.users} 
          icon={faUsers} 
          color="bg-green-500"
          loading={loading}
        />
        <StatCard 
          title="Property Owners" 
          value={stats.owners} 
          icon={faUserTie} 
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard 
          title="Featured Properties" 
          value={stats.featured} 
          icon={faHome} 
          color="bg-red-500"
          loading={loading}
        />
      </div>
      
      {/* Recent content section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-800">Recent Properties</h2>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex p-2">
                    <div className="h-10 w-10 bg-gray-200 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentProperties.map(property => (
                  <li key={property._id} className="py-3 flex items-center">
                    <div className="h-10 w-10 bg-red-100 rounded-md flex items-center justify-center text-red-500 mr-3">
                      <FontAwesomeIcon icon={faHome} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.location?.area || 'No location'} • RM{property.price || 0}</p>
                    </div>
                  </li>
                ))}
                {recentProperties.length === 0 && (
                  <li className="py-3 text-center text-gray-500">No properties found</li>
                )}
              </ul>
            )}
          </div>
        </div>
        
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-800">Recent Users</h2>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex p-2">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentUsers.map(user => (
                  <li key={user._id} className="py-3 flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </li>
                ))}
                {recentUsers.length === 0 && (
                  <li className="py-3 text-center text-gray-500">No users found</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;