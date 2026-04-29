/**
 * Email Verification Component
 * Verifies email token from query params and shows status
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Button from "../UI/Button";
import Card from "../UI/Card";

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
    <AuthShell
      title="Verify your email"
      subtitle="We are confirming your activation token before granting access."
      sideTitle="One-click email verification"
      sideCopy="Email verification remains the same backend flow, now wrapped in AuthNova visual language."
    >
      <Card className="text-center animate-rise">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-cyan-100/15 border-t-cyan-300 animate-spin" />
            <h2 className="font-heading text-2xl text-white">
              Verifying email
            </h2>
            <p className="mt-2 text-slate-300">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl text-emerald-300">
              ✓
            </div>
            <h2 className="font-heading text-2xl text-white">Email verified</h2>
            <p className="mt-2 text-slate-300">{message}</p>
            <div className="mt-6">
              <Link to="/login">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl text-rose-300">
              !
            </div>
            <h2 className="font-heading text-2xl text-white">
              Verification failed
            </h2>
            <p className="mt-2 text-slate-300">{message}</p>
            <div className="mt-6 space-y-3">
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Register Again</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </AuthShell>
  );
};

export default VerifyEmail;
