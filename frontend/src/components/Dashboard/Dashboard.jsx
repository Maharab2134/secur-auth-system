/**
 * Dashboard Component
 * Main user dashboard with profile, 2FA management, and login history
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: true,
  });
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const faqItems = [
    {
      question: "User Registration এবং Login feature কী?",
      answer:
        "নতুন user account create করা যায় এবং secure email/password দিয়ে login করা যায়।",
    },
    {
      question: "Email Verification feature কী?",
      answer:
        "Register করার পর verification mail পাঠানো হয় এবং token verify করে account activate করা যায়।",
    },
    {
      question: "Forgot Password এবং Reset Password feature আছে?",
      answer:
        "হ্যাঁ, reset link email থেকে token ব্যবহার করে নতুন password set করা যায়।",
    },
    {
      question: "JWT Access Token + Refresh Token support আছে?",
      answer:
        "হ্যাঁ, secure authentication এর জন্য access token এবং refresh token flow implement করা আছে।",
    },
    {
      question: "Protected Route feature কী?",
      answer:
        "Unauthenticated user protected page এ ঢুকতে পারে না; login page এ redirect হয়।",
    },
    {
      question: "Two-Factor Authentication (2FA) feature আছে?",
      answer: "হ্যাঁ, 2FA setup, verification এবং disable করার option আছে।",
    },
    {
      question: "Account Lockout feature কী?",
      answer:
        "Repeated failed login attempt হলে account সাময়িকভাবে lock হতে পারে।",
    },
    {
      question: "Rate Limiting feature কী?",
      answer:
        "API abuse এবং brute-force attempt কমাতে auth ও API endpoint-এ rate limit apply করা আছে।",
    },
    {
      question: "Login History Tracking feature কী?",
      answer:
        "Successful/failed login, IP, device, location, এবং time track করে history দেখানো হয়।",
    },
    {
      question: "Suspicious Login Alert Email feature কী?",
      answer:
        "Suspicious login detect হলে user email-এ security alert পাঠানো হয়।",
    },
    {
      question: "Dashboard Profile Management feature কী?",
      answer:
        "Dashboard থেকে user profile information দেখা এবং account status monitor করা যায়।",
    },
    {
      question: "Dashboard Security Settings feature কী?",
      answer:
        "2FA enable/disable, password update, এবং account security options manage করা যায়।",
    },
    {
      question: "Password Change from Dashboard feature আছে?",
      answer:
        "হ্যাঁ, dashboard থেকেই current password দিয়ে নতুন password update করা যায়।",
    },
    {
      question: "Session Persistence on Refresh feature কী?",
      answer:
        "Page refresh দিলেও valid session থাকলে user logged-in state preserve থাকে।",
    },
    {
      question: "Token-based Verify Email Page feature কী?",
      answer:
        "Email verify link এর token frontend page থেকে backend verify endpoint-এ submit করে account verify করা হয়।",
    },
  ];

  // 2FA Setup State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(documentHeight - viewportHeight, 0);

      setScrollState({
        canScrollUp: scrollTop > 16,
        canScrollDown: scrollTop < maxScroll - 16,
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const fetchLoginHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await userAPI.getLoginHistory(1, 10);
      setLoginHistory(response.data.data.history);
    } catch (error) {
      console.error("Failed to fetch login history:", error);
      toast.error("Failed to load login history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await userAPI.setup2FA();
      setQrCode(response.data.data.qrCode);
      setManualSecret(response.data.data.manualEntry);
      setShow2FASetup(true);
      toast.success(response.data.message);
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error(error.response?.data?.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FASetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.verify2FASetup(verificationCode);
      toast.success(response.data.message);
      updateUser({ twoFactorEnabled: true });
      setShow2FASetup(false);
      setQrCode("");
      setManualSecret("");
      setVerificationCode("");
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt("Enter your password to disable 2FA:");
    if (!password) return;

    setLoading(true);
    try {
      const response = await userAPI.disable2FA(password);
      toast.success(response.data.message);
      updateUser({ twoFactorEnabled: false });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(response.data.message);
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollByViewport = (direction) => {
    const amount = Math.round(window.innerHeight * 0.8) * direction;
    window.scrollBy({ top: amount, behavior: "smooth" });
  };

  const floatingFab = (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
      <div className="flex flex-col gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl p-2">
        <button
          type="button"
          onClick={() => handleScrollByViewport(-1)}
          disabled={!scrollState.canScrollUp}
          className="group w-11 h-11 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none"
          aria-label="Scroll up"
          title="Scroll up"
        >
          <svg
            className="w-5 h-5 mx-auto transition-transform duration-300 group-hover:-translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 14l6-6 6 6"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => handleScrollByViewport(1)}
          disabled={!scrollState.canScrollDown}
          className="group w-11 h-11 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-md transition-all duration-300 hover:translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none"
          aria-label="Scroll down"
          title="Scroll down"
        >
          <svg
            className="w-5 h-5 mx-auto transition-transform duration-300 group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 10l-6 6-6-6"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 anim-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account and security settings
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fade-in anim-stagger">
          <button
            onClick={() => scrollToSection("profile-section")}
            className="btn btn-secondary justify-center anim-hover-lift"
          >
            Profile
          </button>
          <button
            onClick={() => scrollToSection("security-section")}
            className="btn btn-secondary justify-center anim-hover-lift"
          >
            Security
          </button>
          <button
            onClick={() => scrollToSection("history-section")}
            className="btn btn-secondary justify-center anim-hover-lift"
          >
            Login History
          </button>
          <button
            onClick={() => scrollToSection("faq-section")}
            className="btn btn-secondary justify-center anim-hover-lift"
          >
            FAQ
          </button>
        </div>

        {/* Profile Section */}
        <section
          id="profile-section"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in scroll-mt-24"
        >
          {/* Profile Information */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <p className="text-lg font-medium text-gray-900">
                  {user?.name}
                </p>
              </div>
              <div>
                <label className="label">Email Address</label>
                <p className="text-lg font-medium text-gray-900">
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="label">Account Status</label>
                <div className="flex items-center space-x-2">
                  {user?.isVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Not Verified
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Member Since</label>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Account Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      2FA Status
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">
                      {user?.twoFactorEnabled ? "🔒" : "🔓"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Last Login
                    </p>
                    <p className="text-xs font-medium text-green-900 mt-1">
                      {user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Security Score
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {user?.twoFactorEnabled && user?.isVerified
                      ? "Excellent"
                      : "Good"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security-section"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in mt-8 scroll-mt-24"
        >
          {/* Two-Factor Authentication */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Two-Factor Authentication
                </h2>
                <p className="text-gray-600 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>

            {user?.twoFactorEnabled ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Two-factor authentication is enabled
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Your account is protected with two-factor authentication.
                    </p>
                    <button
                      onClick={handleDisable2FA}
                      disabled={loading}
                      className="mt-4 btn btn-danger"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!show2FASetup ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Protect your account with two-factor authentication using
                      an authenticator app.
                    </p>
                    <button
                      onClick={handleSetup2FA}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? "Setting up..." : "Enable 2FA"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Step 1: Scan QR Code
                      </h3>
                      <p className="text-sm text-blue-700 mb-4">
                        Scan this QR code with your authenticator app (Google
                        Authenticator, Authy, etc.)
                      </p>
                      <div className="flex justify-center bg-white p-4 rounded-lg">
                        {qrCode && (
                          <img
                            src={qrCode}
                            alt="QR Code"
                            className="w-48 h-48"
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Manual Entry
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Can't scan? Enter this code manually:
                      </p>
                      <code className="block bg-white px-4 py-2 rounded border border-gray-300 text-sm font-mono">
                        {manualSecret}
                      </code>
                    </div>

                    <form onSubmit={handleVerify2FASetup} className="space-y-4">
                      <div>
                        <label className="label">
                          Step 2: Enter Verification Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className="input"
                          placeholder="000000"
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading || verificationCode.length !== 6}
                          className="btn btn-primary"
                        >
                          {loading ? "Verifying..." : "Verify & Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShow2FASetup(false);
                            setQrCode("");
                            setManualSecret("");
                            setVerificationCode("");
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Password Change */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>
                <p className="text-gray-600 mt-1">
                  Update your password regularly to keep your account secure
                </p>
              </div>
              <div className="text-4xl">🔑</div>
            </div>

            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="btn btn-primary"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="input"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Login History Section */}
        <section
          id="history-section"
          className="card animate-fade-in mt-8 scroll-mt-24"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Login History
          </h2>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No login history available</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
              {loginHistory.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    item.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">
                          {item.success ? "✅" : "❌"}
                        </span>
                        <span
                          className={`font-medium ${
                            item.success ? "text-green-900" : "text-red-900"
                          }`}
                        >
                          {item.success ? "Successful Login" : "Failed Login"}
                        </span>
                        {item.suspiciousActivity && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠️ Suspicious
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">IP Address:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {item.ipAddress}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Device:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {item.device?.browser} on {item.device?.os}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {item.location?.city}, {item.location?.country}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(item.loginTime)}
                          </span>
                        </div>
                      </div>

                      {!item.success && item.failureReason && (
                        <div className="mt-2">
                          <span className="text-sm text-red-700">
                            Reason: {item.failureReason.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section
          id="faq-section"
          className="card animate-fade-in mt-8 scroll-mt-24"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard FAQ
          </h2>
          <p className="text-gray-600 mb-6">
            এই SecureAuth website এ কী কী feature করা হয়েছে তার সংক্ষিপ্ত
            তালিকা।
          </p>

          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === index ? -1 : index))
                    }
                    className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <span className="text-lg text-gray-500">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {typeof document !== "undefined" &&
        createPortal(floatingFab, document.body)}
    </div>
  );
};

export default Dashboard;
