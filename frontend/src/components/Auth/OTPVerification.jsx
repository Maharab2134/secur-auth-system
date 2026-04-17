/**
 * OTP Verification Component
 * 2FA verification using OTP
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef([]);

  const tempToken =
    location.state?.tempToken || sessionStorage.getItem("twoFactorTempToken");
  const email =
    location.state?.email || sessionStorage.getItem("twoFactorEmail");

  const filledDigits = otp.filter(Boolean).length;
  const maskedEmail = email
    ? email.replace(/(^.).*(@.*$)/, "$1***$2")
    : "your email";

  useEffect(() => {
    if (!tempToken) {
      toast.error("Invalid access. Please login again.");
      navigate("/login");
    }
  }, [tempToken, navigate]);

  useEffect(() => {
    if (location.state?.tempToken) {
      sessionStorage.setItem("twoFactorTempToken", location.state.tempToken);
    }
    if (location.state?.email) {
      sessionStorage.setItem("twoFactorEmail", location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verify2FA({
        otp: otpCode,
        tempToken,
      });

      toast.success(response.data.message);
      login(response.data.data.user, {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      });

      sessionStorage.removeItem("twoFactorTempToken");
      sessionStorage.removeItem("twoFactorEmail");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("2FA verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please try again.";
      toast.error(errorMessage);

      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!tempToken || resendCooldown > 0) return;

    setResendLoading(true);
    try {
      const response = await authAPI.resend2FA(tempToken);
      toast.success(
        response.data?.message || "A new verification code has been sent",
      );
      setResendCooldown(30);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend verification code. Please try again.";
      toast.error(errorMessage);

      if (error.response?.status === 401) {
        sessionStorage.removeItem("twoFactorTempToken");
        sessionStorage.removeItem("twoFactorEmail");
        navigate("/login", { replace: true });
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 anim-page">
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-primary-200/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-16 w-64 h-64 bg-secondary-200/40 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="card animate-slide-up border border-white/70 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-7 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white text-3xl">🔐</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Verify It's You
            </h2>
            <p className="mt-2 text-gray-600">Enter the 6-digit code sent to</p>
            <p className="font-semibold text-gray-900">{maskedEmail}</p>

            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                  style={{ width: `${(filledDigits / 6) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filledDigits}/6 digits entered
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="label text-center">Verification Code</label>
              <div className="flex justify-center gap-2 sm:gap-3 mt-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      digit
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 bg-white text-gray-900"
                    } focus:border-primary-500 focus:ring-4 focus:ring-primary-200`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Tip: You can paste the full 6-digit code directly.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="btn btn-primary w-full disabled:opacity-60"
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
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center space-y-2 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-600">Code expires in 5 minutes</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? "Resending code..."
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend Verification Code"}
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("twoFactorTempToken");
                sessionStorage.removeItem("twoFactorEmail");
                navigate("/login");
              }}
              className="block mx-auto text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
