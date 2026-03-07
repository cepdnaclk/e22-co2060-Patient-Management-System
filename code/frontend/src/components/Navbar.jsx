import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";

const Navbar = () => {
  //  Destructure the auth states and logout function
  const { isLoggedIn, user, logout, isDoctor, isPatient } = useAuth();
  const navigate = useNavigate();

  // Handle the logout button click
  const handleLogout = () => {
    logout(); // Clears session and user state
    navigate("/login"); // Redirects to login page
  };
  return (
    <header className="flex shadow-md py-4 px-4 sm:px-10 bg-white min-h-17.5 tracking-wide relative z-50">
      <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        <NavLink to="/" className="max-sm:hidden">
          <img src="/navbarlogo.png" alt="logo" className="w-10 h-10" />
        </NavLink>

        <div
          id="collapseMenu"
          className="max-lg:hidden lg:block! max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50"
        >
          <ul className="lg:flex gap-x-4 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-75 max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50">
            {!isLoggedIn && (
              <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
                <NavLink
                  to="/"
                  className="hover:text-blue-700 text-blue-700 block font-medium text-[15px]"
                >
                  Home
                </NavLink>
              </li>
            )}
            {isLoggedIn && isPatient && (
              <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
                <NavLink
                  to="/dashboard/patient"
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  My Profile
                </NavLink>
              </li>
            )}
            {isLoggedIn && isDoctor && (
              <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
                <NavLink
                  to="/dashboard/doctor"
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <NavLink
                to="/about"
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                About
              </NavLink>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <NavLink
                to="/contact"
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                Contact
              </NavLink>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <NavLink
                to="/faq"
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                FAQ
              </NavLink>
            </li>
          </ul>
        </div>

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
                className="px-4 py-2 text-sm rounded-full font-medium cursor-pointer tracking-wide text-white border border-purple-600 bg-purple-600 hover:bg-blue-700 transition-all"
              >
                Logout
              </button>
            </>
          )}
          <button id="toggleOpen" className="lg:hidden cursor-pointer">
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
