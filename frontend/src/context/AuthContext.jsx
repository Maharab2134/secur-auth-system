/**
 * Authentication Context
 * Manages global authentication state
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import Cookies from "js-cookie";
import { userAPI } from "../services/api";

const AuthContext = createContext(null);
const isSecureContext =
  typeof window !== "undefined" && window.location.protocol === "https:";

const accessTokenCookieOptions = {
  expires: 1 / 96, // 15 minutes
  secure: isSecureContext,
  sameSite: "strict",
};

const refreshTokenCookieOptions = {
  expires: 7, // 7 days
  secure: isSecureContext,
  sameSite: "strict",
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  // Check authentication status on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const hasAccessToken = Boolean(Cookies.get("accessToken"));
    const hasRefreshToken = Boolean(Cookies.get("refreshToken"));
    const isProtectedPath =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/dashboard");

    // For non-protected pages, skip profile request to avoid expected 401 noise.
    // On protected pages we must always verify with backend cookies/session.
    if (!hasAccessToken && !hasRefreshToken && !isProtectedPath) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Always validate session from API. This also works with httpOnly backend cookies.
      const response = await userAPI.getProfile();
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      const statusCode = error?.response?.status;

      // 401 here is expected for guests who are not logged in.
      if (statusCode !== 401) {
        console.error("Auth check failed:", error);
      }

      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Store tokens in cookies
    Cookies.set("accessToken", tokens.accessToken, accessTokenCookieOptions);

    Cookies.set("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
