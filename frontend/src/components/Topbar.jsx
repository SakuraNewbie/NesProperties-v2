import React from "react";
import { BellIcon, UserCircleIcon, Bars3Icon } from "@heroicons/react/24/outline";

const Topbar = ({ sidebarOpen, setSidebarOpen }) => (
  <div className="sticky top-0 z-20 w-full flex items-center justify-between gap-4 py-4 px-6 bg-gray-950 shadow">
    <button
      className="md:hidden p-2 rounded hover:bg-gray-800"
      onClick={() => setSidebarOpen((v) => !v)}
      aria-label="Toggle sidebar"
    >
      <Bars3Icon className="h-6 w-6 text-red-600" />
    </button>
    <div className="flex-1 flex items-center justify-end gap-4">
      <button className="relative">
        <BellIcon className="h-6 w-6 text-gray-300 hover:text-red-600" />
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">3</span>
      </button>
      <div className="flex items-center gap-2">
        <UserCircleIcon className="h-8 w-8 text-red-600" />
        <span className="font-medium text-gray-200 hidden md:inline">Admin</span>
      </div>
    </div>
  </div>
);

export default Topbar;