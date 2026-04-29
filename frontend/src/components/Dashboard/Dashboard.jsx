import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../UI/Card";
import Button from "../UI/Button";

const Dashboard = () => {
  const { user } = useAuth();
  const [historyLoading, setHistoryLoading] = useState(false);
  const [recentLogins, setRecentLogins] = useState([]);

  useEffect(() => {
    fetchRecentLogins();
  }, []);

  const securityScore = useMemo(() => {
    if (user?.twoFactorEnabled && user?.isVerified) return 94;
    if (user?.twoFactorEnabled || user?.isVerified) return 78;
    return 62;
  }, [user]);

  const scoreLabel = useMemo(() => {
    if (securityScore >= 90) return "Excellent";
    if (securityScore >= 75) return "Strong";
    return "Moderate";
  }, [securityScore]);

  const fetchRecentLogins = async () => {
    setHistoryLoading(true);
    try {
      const response = await userAPI.getLoginHistory(1, 5);
      setRecentLogins(response.data.data.history || []);
    } catch (error) {
      console.error("Failed to load recent logins", error);
      toast.error("Failed to load recent activity");
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative min-h-screen px-4 py-8 overflow-hidden sm:px-8">
      <div className="absolute inset-0 nova-grid-bg" />
      <div className="absolute left-0 rounded-full pointer-events-none top-16 h-72 w-72 bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-0 rounded-full pointer-events-none top-28 h-72 w-72 bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-rise">
        <header className="mb-7 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-2xl lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">AuthNova Dashboard</p>
            <h1 className="mt-3 text-3xl text-white font-heading sm:text-4xl">Hi {user?.name}, your security pulse is stable.</h1>
            <p className="max-w-2xl mt-2 text-slate-300">
              This overview focuses on account status and recent activity. For full controls, open Security Center.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-cyan-900/35 to-emerald-900/30">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Security Score</p>
            <p className="mt-3 text-4xl font-bold text-cyan-200">{securityScore}%</p>
            <p className="mt-1 text-sm text-slate-300">{scoreLabel}</p>
            <Link to="/security-center" className="inline-block mt-4">
              <Button size="md">Open Security Center</Button>
            </Link>
          </Card>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email Verification</p>
            <p className={`mt-2 text-lg font-semibold ${user?.isVerified ? "text-emerald-300" : "text-amber-300"}`}>
              {user?.isVerified ? "Verified" : "Pending"}
            </p>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">2FA Protection</p>
            <p className={`mt-2 text-lg font-semibold ${user?.twoFactorEnabled ? "text-emerald-300" : "text-rose-300"}`}>
              {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </p>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Account Email</p>
            <p className="mt-2 text-sm font-semibold truncate text-slate-200">{user?.email}</p>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last Login</p>
            <p className="mt-2 text-sm font-semibold text-slate-200">{user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}</p>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white font-heading">Recent Activity</h2>
              <Button variant="ghost" onClick={fetchRecentLogins} loading={historyLoading}>
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-slate-300">Loading recent activity...</div>
            ) : recentLogins.length === 0 ? (
              <div className="py-12 text-center text-slate-300">No recent activity found.</div>
            ) : (
              <div className="space-y-3">
                {recentLogins.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 ${
                      item.success
                        ? "border-emerald-300/25 bg-emerald-700/10"
                        : "border-rose-300/25 bg-rose-700/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {item.success ? "Successful Login" : "Failed Login"}
                      </p>
                      <p className="text-xs text-slate-300">{formatDate(item.loginTime)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {item.device?.browser} on {item.device?.os} • {item.ipAddress}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl text-white font-heading">Quick Actions</h2>
            <p className="mt-2 text-sm text-slate-300">Go to the security tools you use most.</p>

            <div className="mt-5 space-y-3">
              <Link to="/security-center" className="block">
                <Button className="justify-start w-full">Manage 2FA Settings</Button>
              </Link>

              <Link to="/security-center" className="block">
                <Button variant="ghost" className="justify-start w-full">
                  Change Password
                </Button>
              </Link>

              <Link to="/security-center" className="block">
                <Button variant="ghost" className="justify-start w-full">
                  View Full Login History
                </Button>
              </Link>
            </div>

            <div className="p-4 mt-6 text-sm border rounded-xl border-cyan-300/20 bg-cyan-900/10 text-cyan-100">
              Pro tip: Enable 2FA to maximize your security score and reduce account takeover risk.
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
