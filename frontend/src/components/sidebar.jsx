import React from "react";
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Dashboard", icon: <HomeIcon className="h-6 w-6" />, href: "#" },
  { label: "Properties", icon: <BuildingOffice2Icon className="h-6 w-6" />, href: "#" },
  { label: "Owners", icon: <UserGroupIcon className="h-6 w-6" />, href: "#" },
  { label: "Users", icon: <UserIcon className="h-6 w-6" />, href: "#" },
  { label: "Settings", icon: <Cog6ToothIcon className="h-6 w-6" />, href: "#" },
];

const Sidebar = ({ open, setOpen }) => (
  <aside className={`transition-all duration-300 bg-black shadow-lg flex flex-col ${open ? "w-64" : "w-16"} h-screen`}>
    <div className="flex items-center justify-between h-20 border-b border-gray-800 px-4">
      <span className={`text-white font-bold text-xl transition-all duration-300 ${open ? "opacity-100" : "opacity-0 w-0"}`}>NES Admin</span>
      <button
        className="p-2 rounded hover:bg-gray-800"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6 text-red-600" />
      </button>
    </div>
    <nav className="flex-1 px-2 py-6 space-y-2">
      {navLinks.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-200 hover:bg-red-600 hover:text-white transition group
            ${idx === 0 ? "bg-gray-900 text-red-600 font-semibold" : ""}
          `}
        >
          {React.cloneElement(link.icon, { className: "h-6 w-6", color: idx === 0 ? "#dc2626" : "#fff" })}
          <span className={`transition-all duration-200 ${open ? "opacity-100 ml-2" : "opacity-0 ml-0 w-0 overflow-hidden"}`}>{link.label}</span>
        </a>
      ))}
    </nav>
    <div className="border-t border-gray-800 px-4 py-6">
      <button className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-600 font-semibold w-full rounded-lg px-2 py-2 transition">
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
        <span className={`transition-all duration-200 ${open ? "opacity-100 ml-2" : "opacity-0 ml-0 w-0 overflow-hidden"}`}>Logout</span>
      </button>
    </div>
  </aside>
);

export default Sidebar;