/**
 * Forgot Password Component
 * Request password reset link
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Card from "../UI/Card";

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
      <AuthShell
        title="Reset link sent"
        subtitle="If your account exists, a password reset email is on the way."
        sideTitle="Recovery flow remains secure"
        sideCopy="Reset tokens still expire quickly and follow your existing secure backend implementation."
      >
        <Card className="space-y-4 text-center animate-rise">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl text-emerald-300">
            ✓
          </div>
          <p className="text-slate-300">
            A reset link has been sent to{" "}
            <span className="font-semibold text-white">{email}</span>
          </p>
          <p className="rounded-xl border border-cyan-300/20 bg-cyan-900/20 px-3 py-2 text-sm text-cyan-100">
            The reset link will expire in 15 minutes.
          </p>
          <button onClick={() => setSubmitted(false)} className="nova-link">
            Try another email address
          </button>
          <Link
            to="/login"
            className="block text-sm text-slate-400 hover:text-slate-200"
          >
            Back to Login
          </Link>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password"
      subtitle="Enter your email and we will send a time-limited recovery link."
      sideTitle="Account recovery that keeps risk low"
      sideCopy="Token expiration and backend validation remain unchanged from your existing secure implementation."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-rise">
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          hint="Use the address associated with your account"
          autoFocus
        />

        <Button type="submit" className="w-full" loading={loading}>
          Send Reset Link
        </Button>

        <p className="text-center text-sm text-slate-300">
          <Link to="/login" className="nova-link">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
