/**
 * OTP Verification Component
 * 2FA verification using OTP
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Button from "../UI/Button";
import Card from "../UI/Card";

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
    <AuthShell
      title="Two-factor verification"
      subtitle="Enter your one-time 6 digit code to complete login."
      sideTitle="Second-layer identity challenge"
      sideCopy="This step preserves your existing 2FA backend logic with OTP verification and resend cooldown protection."
    >
      <Card className="animate-rise">
        <div className="mb-5 text-center">
          <p className="text-sm text-slate-300">Code sent to {maskedEmail}</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
              style={{ width: `${(filledDigits / 6) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
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
                className={`h-14 w-11 rounded-xl border text-center text-2xl font-bold outline-none transition focus:ring-2 focus:ring-brand-primary/45 sm:w-12 ${
                  digit
                    ? "border-cyan-300 bg-cyan-950/45 text-cyan-200"
                    : "border-white/20 bg-black/30 text-slate-100"
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={otp.join("").length !== 6}
          >
            Verify Code
          </Button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-slate-300">
          <p>Code expires in 5 minutes.</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading || resendCooldown > 0}
            className="mt-2 nova-link disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {resendLoading
              ? "Resending code..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification code"}
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("twoFactorTempToken");
              sessionStorage.removeItem("twoFactorEmail");
              navigate("/login");
            }}
            className="mt-3 block w-full text-slate-400 hover:text-slate-200"
          >
            Back to login
          </button>
        </div>
      </Card>
    </AuthShell>
  );
};

export default OTPVerification;
