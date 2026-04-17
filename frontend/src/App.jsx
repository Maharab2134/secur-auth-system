/**
 * Main App Component
 * Routing and layout
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Common/Navbar";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import VerifyEmail from "./components/Auth/VerifyEmail";
import OTPVerification from "./components/Auth/OTPVerification";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";

// Home/Landing Page
const Home = () => (
  <div className="min-h-screen flex items-center justify-center px-4 anim-page">
    <div className="text-center max-w-4xl anim-stagger">
      <div className="flex justify-center mb-8 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl anim-float anim-glow-soft">
          <span className="text-white text-5xl">🔐</span>
        </div>
      </div>

      <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6 animate-slide-up">
        Secure Authentication System
      </h1>

      <p
        className="text-xl text-gray-600 mb-8 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Enterprise-grade security for your applications with advanced
        authentication, two-factor verification, and comprehensive security
        monitoring.
      </p>

      <div
        className="flex justify-center space-x-4 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <a href="/register" className="btn btn-primary text-lg px-8 py-4">
          Get Started
        </a>
        <a href="/login" className="btn btn-secondary text-lg px-8 py-4">
          Sign In
        </a>
      </div>

      <div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in anim-stagger"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="card text-center anim-hover-lift">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
          <p className="text-gray-600">
            Industry-standard JWT tokens with refresh token rotation
          </p>
        </div>

        <div className="card text-center anim-hover-lift">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2">Two-Factor Auth</h3>
          <p className="text-gray-600">
            Email OTP and Google Authenticator support
          </p>
        </div>

        <div className="card text-center anim-hover-lift">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold mb-2">Advanced Security</h3>
          <p className="text-gray-600">
            Account lockout, suspicious login detection, and more
          </p>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-2fa" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
