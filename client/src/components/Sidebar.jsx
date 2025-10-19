import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard", active: true, destination: "/doctor/dashboard" },
  { icon: Calendar, label: "Appointments", destination: "/doctor/appointments" },
  { icon: Users, label: "Patients", destination: "/doctor/patients" },
  { icon: MessageSquare, label: "Messages", destination: "/doctor/messages" },
  { icon: FileText, label: "Report", destination: "/doctor/report" },
  { icon: Settings, label: "Settings", destination: "/doctor/settings" },
];

export default function Sidebar({ isOpen, onClose }) {

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden h-screen md:flex w-64 bg-white shadow-lg flex-col p-4">
        <Link to="/" className="text-slate-400 text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition mb-3">
          <img src="/logo.jpg" alt="MediCose Logo" className="h-10 w-10 rounded-full" />
          MediCose
        </Link>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.destination}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 w-full rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                  isActive ? "bg-indigo-50 text-indigo-600" : ""
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
      </div>

      {/* Mobile sliding drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 md:hidden`}
           onClick={onClose}
      >
        <div 
        className="lg:w-64 bg-white h-full shadow-lg flex flex-col p-4 relative" onClick={(e) => e.stopPropagation()}
          >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="text-slate-400 text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition"
            onClick={onClose}
            >
          <img src="/logo.jpg" alt="MediCose Logo" className="h-10 w-10 rounded-full" />
          MediCose
        </Link>

          {/* Menu items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.destination}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 p-3 w-full rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${isActive ? "bg-indigo-50 text-indigo-600" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
