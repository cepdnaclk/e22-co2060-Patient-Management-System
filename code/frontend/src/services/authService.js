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
      mobileNumber,
    });
    return data; // { accessToken, refreshToken, user }
  },

  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data; // { accessToken, refreshToken, user }
  },

  googleLogin: async (idToken) => {
    const { data } = await api.post("/api/auth/google", { idToken });
    return data; // { accessToken, refreshToken, user }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("pms_refresh_token");
    if (refreshToken) {
      try {
        await api.post("/api/auth/logout", { refreshToken });
      } catch {
        // Silently ignore — we always clear local storage on logout
      }
    }
    authService.clearSession();
  },

  // Save both tokens + user profile to localStorage after login/signup
  saveSession: (accessToken, refreshToken, user) => {
    localStorage.setItem("pms_token",         accessToken);
    localStorage.setItem("pms_refresh_token", refreshToken);
    localStorage.setItem("pms_user",          JSON.stringify(user));
  },

  // Remove everything on logout
  clearSession: () => {
    localStorage.removeItem("pms_token");
    localStorage.removeItem("pms_refresh_token");
    localStorage.removeItem("pms_user");
  },

  // Get current user from localStorage (survives page refresh)
  getCurrentUser: () => {
    const raw = localStorage.getItem("pms_user");
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn: () => !!localStorage.getItem("pms_token"),

  // ── Pending Signup Management ──
  fetchPendingSignups: async () => {
    const { data } = await api.get("/api/auth/signup/pending");
    return data;
  },

  approveSignup: async (userId) => {
    const { data } = await api.put(`/api/auth/signup/${userId}/approve`);
    return data;
  },

  rejectSignup: async (userId) => {
    await api.put(`/api/auth/signup/${userId}/reject`);
  },

  // Check if access token is expired by reading its payload
  isTokenExpired: () => {
    const token = localStorage.getItem("pms_token");
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp < nowInSeconds;
    } catch {
      return true; // Malformed token → treat as expired
    }
  },
};
