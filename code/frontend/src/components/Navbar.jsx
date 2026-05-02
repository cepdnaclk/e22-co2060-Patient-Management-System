import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";

const Navbar = () => {
  // --- FIX 1: Destructure isAdmin and isNurse ---
  const { isLoggedIn, user, logout, isDoctor, isPatient, isAdmin, isNurse } =
    useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  // --- FIX 2: Update logic to handle Admin and Nurse ---
  const getHomeLink = () => {
    if (isLoggedIn) {
      if (isAdmin) return "/dashboard/admin";
      if (isNurse) return "/dashboard/nurse";
      if (isDoctor) return "/dashboard/doctor";
      if (isPatient) return "/dashboard/patient";
    }
    return "/";
  };

  return (
    <header className="flex shadow-md py-4 px-4 sm:px-10 bg-white min-h-17.5 tracking-wide relative z-50">
      <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        {/* Logo now points to /dashboard/admin for Super Admins */}
        <NavLink to={getHomeLink()} className="flex items-center gap-2">
          <img src="/navbarlogo.png" alt="logo" className="w-10 h-10" />
          <span className="text-sm font-semibold text-slate-800 sm:hidden">
            PMS
          </span>
        </NavLink>

        <nav
          className={`fixed top-0 left-0 z-50 h-full w-72 bg-white p-6 shadow-lg transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:w-auto lg:bg-transparent lg:p-0 lg:shadow-none ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          <ul className="lg:flex lg:items-center gap-x-4 space-y-3 lg:space-y-0">
            {!isLoggedIn && (
              <li>
                <NavLink
                  to="/"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-blue-700 block font-medium text-[15px]"
                >
                  Home
                </NavLink>
              </li>
            )}
            {isLoggedIn && isAdmin && (
              <li>
                <NavLink
                  to="/dashboard/admin"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  Admin Panel
                </NavLink>
              </li>
            )}
            {isLoggedIn && isDoctor && (
              <li>
                <NavLink
                  to="/dashboard/doctor"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            {isLoggedIn && isPatient && (
              <li>
                <NavLink
                  to="/dashboard/patient"
                  onClick={closeMenu}
                  className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
                >
                  My Profile
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                Contact
              </NavLink>
            </li>
            <li>
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
            <NavLink
              to="/login"
              className="px-4 py-2 text-sm rounded-full font-medium text-slate-900 border border-gray-400 bg-transparent hover:bg-gray-50 transition-all"
            >
              Login
            </NavLink>
          ) : (
            <>
              <div className="px-0.5 py-2 hidden sm:block text-sm font-medium text-slate-600">
                Welcome, {user?.firstName}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-full font-medium text-white bg-purple-600 hover:bg-blue-700 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
