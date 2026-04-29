/**
 * Navbar Component
 * Navigation bar with user menu
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import BrandMark from "../UI/BrandMark";
import Button from "../UI/Button";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("authnova-theme") || "dark";
  });

  useEffect(() => {
    const html = document.documentElement;
    const nextTheme = theme === "light" ? "theme-light" : "theme-dark";

    html.classList.remove("theme-light", "theme-dark");
    html.classList.add(nextTheme);
    window.localStorage.setItem("authnova-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      await authAPI.logout(refreshToken);
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="theme-nav sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl animate-appear">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <BrandMark compact={isAuthenticated} />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleThemeToggle}
              className="theme-toggle rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wide text-slate-200 transition-colors hover:bg-white/10"
              title="Toggle dark/light mode"
              aria-label="Toggle dark and light mode"
            >
              {theme === "dark" ? "White Mode" : "Dark Mode"}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/about"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-cyan-200"
                >
                  About Me
                </Link>

                <Link
                  to="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-cyan-200"
                >
                  Dashboard
                </Link>

                <Link
                  to="/security-center"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-cyan-200"
                >
                  Security
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-cyan-200 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="theme-dropdown absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-slate-950/95 py-2 shadow-xl z-50 animate-appear">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-medium text-slate-100">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/security-center"
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Security Center
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/#about-me"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-cyan-200"
                >
                  About Me
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-cyan-200"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button size="md">Start Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
