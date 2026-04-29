import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Input from "../UI/Input";

const SecurityCenter = () => {
  const { user, updateUser } = useAuth();
  const [loginHistory, setLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const securityScore = useMemo(() => {
    if (user?.twoFactorEnabled && user?.isVerified) return "Excellent";
    if (user?.twoFactorEnabled || user?.isVerified) return "Strong";
    return "Moderate";
  }, [user]);

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

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="absolute inset-0 nova-grid-bg" />
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-rise">
        <header className="mb-7 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-900/40 via-slate-900/40 to-emerald-900/30 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">
            AuthNova Security Center
          </p>
          <h1 className="font-heading mt-3 text-3xl text-white sm:text-4xl">
            Security center for {user?.name}
          </h1>
          <p className="mt-2 text-slate-300">
            Manage 2FA, credentials, and suspicious login activity from one
            secured panel.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Identity
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              {user?.email}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Member since {formatDate(user?.createdAt)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              2FA
            </p>
            <p className="mt-2 text-2xl font-bold text-cyan-200">
              {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Security Score
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {securityScore}
            </p>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-5">
          <div className="space-y-6 xl:col-span-3">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl text-white">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    OTP setup and verification are powered by your existing
                    backend flow.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user?.twoFactorEnabled
                      ? "border border-emerald-300/40 bg-emerald-500/20 text-emerald-200"
                      : "border border-amber-300/40 bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Protected" : "Needs setup"}
                </span>
              </div>

              {user?.twoFactorEnabled ? (
                <div className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-700/10 p-4">
                  <p className="text-sm text-emerald-200">
                    Two-factor authentication is currently active for your
                    account.
                  </p>
                  <Button
                    variant="danger"
                    className="mt-4"
                    onClick={handleDisable2FA}
                    disabled={loading}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : !show2FASetup ? (
                <div className="mt-5">
                  <Button onClick={handleSetup2FA} loading={loading}>
                    Enable 2FA
                  </Button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-900/10 p-4">
                    <p className="mb-3 text-sm text-cyan-100">
                      1. Scan this QR code in your authenticator app.
                    </p>
                    <div className="rounded-xl bg-white p-4 inline-flex">
                      {qrCode ? (
                        <img src={qrCode} alt="QR Code" className="h-44 w-44" />
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/20 p-4">
                    <p className="text-sm text-slate-300">
                      Manual secret (if scan is unavailable):
                    </p>
                    <code className="mt-2 block overflow-x-auto rounded-lg bg-black/30 px-3 py-2 text-xs text-cyan-100">
                      {manualSecret}
                    </code>
                  </div>

                  <form onSubmit={handleVerify2FASetup} className="space-y-3">
                    <Input
                      id="verificationCode"
                      label="2. Enter 6-digit verification code"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={verificationCode.length !== 6}
                      >
                        Verify and Enable
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShow2FASetup(false);
                          setQrCode("");
                          setManualSecret("");
                          setVerificationCode("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl text-white">
                    Password Management
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Use a fresh strong password to reduce account risk.
                  </p>
                </div>
                {!showPasswordChange ? (
                  <Button onClick={() => setShowPasswordChange(true)}>
                    Change Password
                  </Button>
                ) : null}
              </div>

              {showPasswordChange ? (
                <form
                  onSubmit={handlePasswordChange}
                  className="mt-5 space-y-4"
                >
                  <Input
                    id="currentPassword"
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                  <Input
                    id="newPassword"
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                  <Input
                    id="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={loading}>
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}
            </Card>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <Card>
              <h3 className="font-heading text-2xl text-white">
                Profile Snapshot
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  <span className="text-slate-400">Name:</span> {user?.name}
                </p>
                <p>
                  <span className="text-slate-400">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="text-slate-400">Verified:</span>{" "}
                  {user?.isVerified ? "Yes" : "No"}
                </p>
                <p>
                  <span className="text-slate-400">Last login:</span>{" "}
                  {user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                </p>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-2xl text-white">
                Platform Coverage
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>JWT access and refresh tokens</li>
                <li>Bcrypt password hashing</li>
                <li>Rate limiting and CSRF controls</li>
                <li>Device and IP login tracking</li>
                <li>Suspicious login email notifications</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="mt-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white">
                Login History
              </h3>
              <Button
                variant="ghost"
                onClick={fetchLoginHistory}
                loading={historyLoading}
              >
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="py-10 text-center text-slate-300">
                Loading history...
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="py-10 text-center text-slate-300">
                No login history available
              </div>
            ) : (
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                {loginHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 ${
                      item.success
                        ? "border-emerald-300/25 bg-emerald-700/10"
                        : "border-rose-300/25 bg-rose-700/10"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-white">
                        {item.success ? "Successful Login" : "Failed Login"}
                      </span>
                      {item.suspiciousActivity ? (
                        <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-100">
                          Suspicious
                        </span>
                      ) : null}
                    </div>

                    <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <p>
                        <span className="text-slate-400">IP:</span>{" "}
                        {item.ipAddress}
                      </p>
                      <p>
                        <span className="text-slate-400">Device:</span>{" "}
                        {item.device?.browser} on {item.device?.os}
                      </p>
                      <p>
                        <span className="text-slate-400">Location:</span>{" "}
                        {item.location?.city &&
                        item.location?.city !== "Unknown"
                          ? `${item.location.city}, ${item.location?.country || "Unknown"}`
                          : item.location?.country || "Unknown"}
                      </p>
                      <p>
                        <span className="text-slate-400">Time:</span>{" "}
                        {formatDate(item.loginTime)}
                      </p>
                    </div>

                    {!item.success && item.failureReason ? (
                      <p className="mt-2 text-sm text-rose-200">
                        Reason: {item.failureReason.replace(/_/g, " ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SecurityCenter;
