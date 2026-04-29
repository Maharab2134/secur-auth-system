/**
 * Main App Component
 * Routing and layout
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import BrandMark from "./components/UI/BrandMark";
import Button from "./components/UI/Button";
import Card from "./components/UI/Card";

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
import SecurityCenter from "./components/Security/SecurityCenter";
import About from "./components/About/About";

// Home/Landing Page
const Home = () => (
  <div className="relative min-h-screen px-4 py-20 overflow-hidden sm:px-8">
    <div className="absolute inset-0 nova-grid-bg" />
    <div className="absolute w-64 h-64 rounded-full pointer-events-none -left-24 top-10 bg-cyan-300/20 blur-3xl" />
    <div className="absolute rounded-full pointer-events-none -right-16 bottom-14 h-72 w-72 bg-emerald-300/20 blur-3xl" />

    <div className="relative max-w-6xl mx-auto animate-rise">
      <div className="flex justify-center mb-10">
        <BrandMark />
      </div>

      <Card className="p-8 border-cyan-200/20 bg-slate-950/45 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.26em] text-cyan-200/80">
              AuthNova Security Platform
            </p>
            <h1 className="text-4xl text-white font-heading sm:text-5xl">
              Secure access designed for modern digital products.
            </h1>
            <p className="max-w-lg mt-5 text-slate-300">
              AuthNova keeps your authentication flow hardened with JWT
              sessions, 2FA verification, account lockout controls, and login
              anomaly tracking.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="/register">
                <Button size="lg">Create Account</Button>
              </a>
              <a href="/login">
                <Button variant="ghost" size="lg">
                  Sign In
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "JWT + refresh rotation",
              "Email and authenticator 2FA",
              "Rate limit and CSRF defense",
              "Suspicious login alerts",
            ].map((item) => (
              <div
                key={item}
                className="px-4 py-5 text-sm border rounded-2xl border-white/10 bg-black/35 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-midnight">
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

            <Route
              path="/security-center"
              element={
                <ProtectedRoute>
                  <SecurityCenter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
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
                background: "#09141e",
                color: "#e2e8f0",
                border: "1px solid rgba(34,211,238,0.35)",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ecfeff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#fb7185",
                  secondary: "#fff1f2",
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
