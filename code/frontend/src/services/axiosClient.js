// src/services/axiosClient.js
// Central Axios instance — every API call in the app goes through this.
// Handles JWT injection, silent token refresh, and redirect on auth failure.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Automatically attaches the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pms_token");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// When we receive a 401 (access token expired), silently:
// 1. Request a new access token using the refresh token
// 2. Retry the original failed request with the new token
// 3. If the refresh also fails → log the user out

let isRefreshing = false;
let failedQueue  = [];  // Hold requests while token is being refreshed

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not on the auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/auth/")
    ) {
      const refreshToken = localStorage.getItem("pms_refresh_token");

      if (!refreshToken) {
        // No refresh token — must log in
        clearAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch(reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem("pms_token",         data.accessToken);
        localStorage.setItem("pms_refresh_token", data.refreshToken);

        // Notify queued requests
        processQueue(null, data.accessToken);

        // Retry original request
        originalRequest.headers["Authorization"] = "Bearer " + data.accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid or expired — force logout
        processQueue(refreshError, null);
        clearAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAndRedirect() {
  localStorage.removeItem("pms_token");
  localStorage.removeItem("pms_refresh_token");
  localStorage.removeItem("pms_user");
  window.location.href = "/login";
}

export default api;
