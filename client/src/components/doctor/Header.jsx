import { useState } from "react";
import { Bell, Link, Menu } from "lucide-react";
import doctorAvatar from "../../../public/Profile.jpeg";
import NotificationDialog from "./NotificationDialog";
import { NavLink } from "react-router-dom";

const Header = ({ userInfo, appointments, handleUpdateStatus, onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () =>{
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  }

  const confirmedAppointments = appointments?.filter(
    (appt) => appt.status === "confirmed"
  ) || [];

  return (
    <header className="fixed top-0 right-0 h-16 w-full lg:w-[83%] bg-white border-b border-gray-200 flex flex-row-reverse items-center justify-between px-4 md:px-6 z-20 shadow-sm">
      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notification Button */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {confirmedAppointments.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                {confirmedAppointments.length}
              </span>
            )}
          </button>

          {/* Notification Dialog */}
          <NotificationDialog
            open={open}
            onClose={() => setOpen(false)}
            confirmedAppointments={confirmedAppointments}
            handleUpdateStatus={handleUpdateStatus}
          />
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={userInfo?.profilePhoto || doctorAvatar}
              alt="Doctor Avatar"
              className="h-full w-full object-cover cursor-pointer"
              onClick={() => setShowUserMenu((prev) => !prev)}
            />
          </div>

          {/* Doctor Info */}
          <div className="hidden sm:flex flex-col">
            <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px] md:max-w-none">
              {userInfo?.name || "Dr. Sarah Johnson"}
            </p>
            <p className="text-xs text-gray-500">
              {userInfo?.specialization || "Cardiologist"}
            </p>
          </div>
          {showUserMenu && (
              <div className="absolute right-4 mt-28 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <NavLink 
                    to={`/doctor/profile`}
                    className="text-sm font-medium text-gray-900 dark:text-white">Profile</NavLink>
                </div>
                
                
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                >
                  Sign Out
                </button>
              </div>
            )}
        </div>
      </div>


      {/* Left Section (Optional Mobile Menu Button) */}
      <div className="flex items-center gap-3 lg:hidden">
        <button 
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default Header;
