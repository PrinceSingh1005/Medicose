import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import {
  HiBars3 as Bars3Icon,
  HiXMark as XMarkIcon,
  HiUserCircle as UserCircleIcon,
  HiHome as HomeIcon,
  HiMagnifyingGlass as MagnifyingGlassIcon,
  HiCalendarDays as CalendarDaysIcon,
  HiShieldCheck as ShieldCheckIcon,
} from 'react-icons/hi2';
import { BsRobot } from "react-icons/bs";

function Navbar() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-md transition-all duration-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition">
            <img src="/logo.jpg" alt="MediCose Logo" className="h-10 w-10 rounded-full" />
            MediCose
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" icon={<HomeIcon />} label="Home" />
            <NavLink to="/doctors" icon={<MagnifyingGlassIcon />} label="Find Doctors" />

            {userInfo ? (
              <>
                {(userInfo.role === 'patient' || userInfo.role === 'doctor') && (
                  <NavLink
                    to={`/${userInfo.role}/dashboard`}
                    icon={<CalendarDaysIcon />}
                    label="My Appointments"
                  />
                )}
                {userInfo.role === 'admin' && (
                  <NavLink
                    to="/admin/dashboard"
                    icon={<ShieldCheckIcon />}
                    label="Admin"
                  />
                )}
                <NavLink
                  to={`/${userInfo.role}/profile`}
                  icon={<UserCircleIcon />}
                  label="Profile"
                />
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-lg text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition duration-200"
              >
                Login / Signup
              </Link>
            )}
            <Link
              to="/ai-chat"
              className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition duration-200"
            >
              <BsRobot size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none transition transform hover:scale-105"
            >
              {isOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-primary transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] py-4' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col items-center gap-4 px-6">
          <NavLink to="/" icon={<HomeIcon />} label="Home" onClick={() => setIsOpen(false)} />
          <NavLink to="/doctors" icon={<MagnifyingGlassIcon />} label="Find Doctors" onClick={() => setIsOpen(false)} />
          {userInfo ? (
            <>
              {(userInfo.role === 'patient' || userInfo.role === 'doctor') && (
                <NavLink
                  to={`/${userInfo.role}/dashboard`}
                  icon={<CalendarDaysIcon />}
                  label="My Appointments"
                  onClick={() => setIsOpen(false)}
                />
              )}
              {userInfo.role === 'admin' && (
                <NavLink
                  to="/admin/dashboard"
                  icon={<ShieldCheckIcon />}
                  label="Admin"
                  onClick={() => setIsOpen(false)}
                />
              )}
              <NavLink
                to={`/${userInfo.role}/profile`}
                icon={<UserCircleIcon />}
                label="Profile"
                onClick={() => setIsOpen(false)}
              />
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-max px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-md text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-max text-white hover:text-accent transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-max px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-md text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Custom NavLink with icon & label
const NavLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 hover:text-accent transition duration-200"
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span>{label}</span>
  </Link>
);

export default Navbar;
