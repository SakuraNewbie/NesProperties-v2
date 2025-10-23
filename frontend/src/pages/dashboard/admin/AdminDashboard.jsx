import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/UI/admin/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUserCircle, faBell } from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - responsive */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block md:w-64 bg-white shadow-lg overflow-y-auto h-full`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none md:hidden"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>

            <div className="text-xl font-bold text-red-600 md:hidden">
              NES Properties
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="h-8 w-8 text-gray-400"
                />
                <span className="ml-2 text-gray-700 font-medium hidden md:inline">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;