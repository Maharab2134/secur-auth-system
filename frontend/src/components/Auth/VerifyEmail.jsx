/**
 * Email Verification Component
 * Verifies email token from query params and shows status
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Please use the link from your email.",
        );
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(response.data?.message || "Email verified successfully.");
        toast.success("Email verified successfully. You can now log in.");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { message: "Email verified successfully! Please log in." },
          });
        }, 2000);
      } catch (error) {
        const serverMessage =
          error.response?.data?.message ||
          "Verification failed. The link may be invalid or expired.";

        setStatus("error");
        setMessage(serverMessage);
        toast.error(serverMessage);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 anim-page">
      <div className="max-w-md w-full">
        <div className="card text-center animate-fade-in anim-hover-lift">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="spinner" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">✓</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="btn btn-primary w-full inline-flex justify-center"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">!</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn btn-secondary w-full inline-flex justify-center"
                >
                  Back to Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-full inline-flex justify-center"
                >
                  Create Account Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
