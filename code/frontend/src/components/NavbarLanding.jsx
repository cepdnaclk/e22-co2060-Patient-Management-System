import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useTheme } from "../features/theme/ThemeContext.jsx";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";

const NavbarLanding = () => {
  const { isLoggedIn, user, logout, isDoctor, isPatient, isAdmin, isNurse } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const getDashboardLink = () => {
    if (!user || !user.role) return "/";
    const map = {
      SUPER_ADMIN: "/dashboard/admin",
      ADMIN: "/dashboard/admin",
      DOCTOR: "/dashboard/doctor",
      NURSE: "/dashboard/doctor",
      PATIENT: "/dashboard/patient",
      RECEPTIONIST: "/dashboard/receptionist",
      PHARMACIST: "/dashboard/pharmacist",
    };
    return map[user.role] || "/";
  };

  const navLinkStyles = ({ isActive }) => 
    `text-sm font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
    }`;

  const mobileNavLinkStyles = ({ isActive }) =>
    `block py-3 px-4 rounded-xl text-base font-semibold transition-all ${
      isActive
        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? "py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm" : "py-5 bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <img src="/navbarlogo.png" alt="logo" className="w-6 h-6 brightness-0 invert" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            PATIENT<span className="text-blue-600">MS</span>
          </span>
        </NavLink>

        {/* Nav links (Center) */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink to="/" className={navLinkStyles}>Home</NavLink>
          {isLoggedIn && (
            <NavLink to={getDashboardLink()} className={navLinkStyles}>Dashboard</NavLink>
          )}
          <NavLink to="/about" className={navLinkStyles}>About</NavLink>
          <NavLink to="/contact" className={navLinkStyles}>Contact</NavLink>
          <NavLink to="/faq" className={navLinkStyles}>FAQ</NavLink>
        </nav>

        {/* Actions (Right) */}
        <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <NavLink to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Log in
                </NavLink>
                <NavLink to="/signup" className="px-5 py-2 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-blue-600 dark:hover:bg-blue-500 transition-all">
                  Sign Up
                </NavLink>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Hi, {user?.firstName}
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-slate-900 dark:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
      </div>

      {/* Mobile Drawer (Menu Overlay) */}
      <div
        className={`fixed inset-0 top-[70px] z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-all duration-300 lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        }`}
      >
        <div className="flex flex-col h-full p-6 justify-between pb-24">
          <nav className="space-y-2">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkStyles}>
              Home
            </NavLink>
            {isLoggedIn && (
              <NavLink to={getDashboardLink()} onClick={() => setIsMenuOpen(false)} className={mobileNavLinkStyles}>
                Dashboard
              </NavLink>
            )}
            <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkStyles}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkStyles}>
              Contact
            </NavLink>
            <NavLink to="/faq" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkStyles}>
              FAQ
            </NavLink>
          </nav>

          <div className="space-y-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-3">
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                  Log in
                </NavLink>
                <NavLink to="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 text-sm font-bold rounded-xl text-white bg-slate-900 dark:bg-blue-600 hover:bg-blue-600">
                  Sign up
                </NavLink>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarLanding;