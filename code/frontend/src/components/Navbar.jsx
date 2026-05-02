import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";

const Navbar = () => {
  //  Destructure the auth states and logout function
  const { isLoggedIn, user, logout, isDoctor, isPatient } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle the logout button click
  const handleLogout = () => {
    logout(); // Clears session and user state
    navigate("/login"); // Redirects to login page
  };

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <header className="flex py-4 px-4 sm:px-10 bg-white/70 backdrop-blur border-b border-white/60 min-h-17.5 tracking-wide relative z-50">
      <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/navbarlogo.png" alt="logo" className="w-10 h-10" />
          <span className="text-sm font-semibold text-slate-800 sm:hidden">
            PMS
          </span>
        </NavLink>

        {isMenuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}

        <nav
          className={`fixed top-0 left-0 z-50 h-full w-72 bg-white p-6 shadow-lg transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:w-auto lg:bg-transparent lg:p-0 lg:shadow-none ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="flex items-center justify-between pb-4 lg:hidden">
            <span className="text-sm font-semibold text-slate-800">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-full border border-gray-200 p-2 text-slate-600"
              aria-label="Close menu"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className="lg:flex lg:items-center gap-x-4 space-y-3 lg:space-y-0">
            {!isLoggedIn && (
              <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
                <NavLink
                  to="/"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-blue-700 block font-medium text-[15px]"
                >
                  Home
                </NavLink>
              </li>
            )}
            {isLoggedIn && isPatient && (
              <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
                <NavLink
                  to="/dashboard/patient"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  My Profile
                </NavLink>
              </li>
            )}
            {isLoggedIn && isDoctor && (
              <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
                <NavLink
                  to="/dashboard/doctor"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
              <NavLink
                to="/about"
                onClick={closeMenu}
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                About
              </NavLink>
            </li>
            <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                Contact
              </NavLink>
            </li>
            <li className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
              <NavLink
                to="/faq"
                onClick={closeMenu}
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                FAQ
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="flex max-lg:ml-auto space-x-4">
          {!isLoggedIn ? (
            <>
              {/* Show if logged out  */}
              <NavLink
                to="/login"
                className="px-4 py-2 text-sm rounded-full font-medium cursor-pointer tracking-wide text-slate-900 border border-gray-400 bg-transparent hover:bg-gray-50 transition-all"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 text-sm rounded-full font-medium cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Sign up
              </NavLink>
            </>
          ) : (
            <>
              {/* Show if logged in  */}
              <div className="px-0.5 py-2 hidden sm:block text-sm font-medium text-slate-600">
                Welcome, {user?.firstName}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-full font-medium cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Logout
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
            className="lg:hidden cursor-pointer"
          >
            <svg
              className="w-7 h-7"
              fill="#000"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
