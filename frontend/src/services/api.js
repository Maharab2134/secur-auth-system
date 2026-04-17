/**
 * API Service
 * Centralized API calls with Axios
 */

import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const isSecureContext =
  typeof window !== "undefined" && window.location.protocol === "https:";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
            {
              withCredentials: true,
            },
          );

          const { accessToken } = response.data.data;

          // Update token in cookies
          Cookies.set("accessToken", accessToken, {
            expires: 1 / 96, // 15 minutes
            secure: isSecureContext,
            sameSite: "strict",
          });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  login: (data) => api.post("/auth/login", data),
  verify2FA: (data) => api.post("/auth/verify-2fa", data),
  resend2FA: (tempToken) => api.post("/auth/resend-2fa", { tempToken }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  getLoginHistory: (page = 1, limit = 10) =>
    api.get(`/user/login-history?page=${page}&limit=${limit}`),
  setup2FA: () => api.post("/user/setup-2fa"),
  verify2FASetup: (token) => api.post("/user/verify-2fa-setup", { token }),
  disable2FA: (password) => api.post("/user/disable-2fa", { password }),
  changePassword: (data) => api.put("/user/change-password", data),
};

export default api;
