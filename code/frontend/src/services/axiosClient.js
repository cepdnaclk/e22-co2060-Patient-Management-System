// src/services/axiosClient.js
// Every API call in your app goes through this.
// Never use fetch() or plain axios directly — always import this.

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8082",
  headers: { "Content-Type": "application/json" },
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────
// Runs automatically before EVERY outgoing request.
// Reads the JWT from localStorage and adds it to the header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pms_token");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────
// Runs automatically after EVERY response.
// If 401 = token expired or invalid → clear storage + redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/api/auth/login")
    ) {
      localStorage.removeItem("pms_token");
      localStorage.removeItem("pms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
