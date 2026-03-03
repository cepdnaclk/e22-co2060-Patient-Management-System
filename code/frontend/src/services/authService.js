// src/services/authService.js
// All auth-related API calls live here.
// Components call these functions — they do not talk to axios directly.

import api from "./axiosClient";

export const authService = {
  signup: async (firstName, lastName, email, password, mobileNumber) => {
    const { data } = await api.post("/api/auth/signup", {
      firstName,
      lastName,
      email,
      password,
      mobileNumber, // <-- Now this gets sent to Spring Boot!
    });
    return data; // { token, user }
  },
  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", {
      email,
      password,
    });
    return data; // { token, user }
  },

  // Save to localStorage after successful login/signup
  saveSession: (token, user) => {
    localStorage.setItem("pms_token", token);
    localStorage.setItem("pms_user", JSON.stringify(user));
  },

  // Remove everything on logout
  clearSession: () => {
    localStorage.removeItem("pms_token");
    localStorage.removeItem("pms_user");
  },

  // Get current user from localStorage (survives page refresh)
  getCurrentUser: () => {
    const raw = localStorage.getItem("pms_user");
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn: () => !!localStorage.getItem("pms_token"),
};
