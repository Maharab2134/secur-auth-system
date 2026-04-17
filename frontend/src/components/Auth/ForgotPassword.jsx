/**
 * Forgot Password Component
 * Request password reset link
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      toast.success(response.data.message);
      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 anim-page">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-4 text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-gray-900 mt-1">{email}</p>
          </div>

          <div className="card animate-slide-up anim-hover-lift">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📧 Check your inbox</strong>
                  <br />
                  The reset link will expire in 15 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Try another email address
                </button>
              </div>

              <div className="pt-4 border-t">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 anim-page">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">🔑</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="card animate-slide-up anim-hover-lift">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="john@example.com"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the email address associated with your account
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
