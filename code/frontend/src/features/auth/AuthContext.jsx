// src/features/auth/AuthContext.jsx
// React Context provides user session data to every component without prop-drilling.

import { createContext, useContext, useState } from "react";
import { authService } from "../../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so user stays logged in on page refresh.
  const [user, setUser] = useState(() => {
    if (authService.isTokenExpired()) {
      // Access token expired — clear old session (refresh will happen automatically on next API call)
      if (!localStorage.getItem("pms_refresh_token")) {
        authService.clearSession();
        return null;
      }
    }
    return authService.getCurrentUser();
  });

  /**
   * Called after successful login or signup.
   * Saves both access token, refresh token, and user profile.
   */
  const saveLogin = (accessToken, refreshToken, userData) => {
    authService.saveSession(accessToken, refreshToken, userData);
    setUser(userData);
  };

  /**
   * Calls the server logout endpoint to invalidate the refresh token,
   * then clears local session.
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Role helpers — use in components to conditionally show UI elements
  const isAdmin       = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isSuperAdmin  = user?.role === "SUPER_ADMIN";
  const isManagement  = user?.role === "MANAGEMENT";
  const isDoctor      = user?.role === "DOCTOR";
  const isNurse       = user?.role === "NURSE";
  const isPatient     = user?.role === "PATIENT";
  const isReceptionist = user?.role === "RECEPTIONIST";
  const isBillingStaff = user?.role === "BILLING_STAFF";
  const isPharmacist   = user?.role === "PHARMACIST";
  const isLabTech      = user?.role === "LAB_TECHNICIAN";

  return (
    <AuthContext.Provider
      value={{
        user,          // { id, firstName, lastName, email, role }
        saveLogin,     // call after login/signup
        logout,        // call on logout button click
        isLoggedIn: !!user,
        isAdmin,
        isSuperAdmin,
        isManagement,
        isDoctor,
        isNurse,
        isPatient,
        isReceptionist,
        isBillingStaff,
        isPharmacist,
        isLabTech,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — import this in any component
// const { user, isDoctor, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
