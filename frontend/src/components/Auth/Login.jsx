/**
 * Login Component
 * User login form with 2FA support
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Input from "../UI/Input";
import Button from "../UI/Button";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show success message if redirected from registration
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      // Check if 2FA is required
      if (response.data.requires2FA) {
        sessionStorage.setItem("twoFactorTempToken", response.data.tempToken);
        sessionStorage.setItem("twoFactorEmail", formData.email);
        toast.success(response.data.message);
        navigate("/verify-2fa", {
          state: {
            tempToken: response.data.tempToken,
            email: formData.email,
          },
        });
        return;
      }

      // Login successful
      toast.success(response.data.message);
      login(response.data.data.user, {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      });

      // Redirect to original destination or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach((err) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to AuthNova"
      subtitle="Continue to your security dashboard with identity checks enabled."
      sideTitle="Modern access control with enterprise-grade protection"
      sideCopy="Your login remains protected by rate limiting, JWT rotation, 2FA challenge flow, and device-level suspicious activity monitoring."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-rise">
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@company.com"
          error={errors.email}
        />

        <div className="relative">
          <Input
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[2.1rem] text-xs font-semibold uppercase tracking-wide text-slate-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm nova-link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>

        <p className="text-center text-sm text-slate-300">
          Need an account?{" "}
          <Link to="/register" className="nova-link font-semibold">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
