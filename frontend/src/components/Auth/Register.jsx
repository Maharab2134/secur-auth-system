/**
 * Registration Component
 * User registration form with validation
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Input from "../UI/Input";
import Button from "../UI/Button";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
    };
  };

  const passwordStrength = validatePassword(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordStrength.isValid) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(response.data.message);
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please check your email to verify your account.",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
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
      title="Create your AuthNova account"
      subtitle="Set up your secure identity with strong credentials and instant verification."
      sideTitle="A new identity with the same hardened security core"
      sideCopy="JWT sessions, email verification, 2FA, account lockout, and suspicious login detection remain intact while the experience is fully redesigned."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-rise">
        <Input
          id="name"
          name="name"
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Avery Morgan"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          id="email"
          name="email"
          label="Work Email"
          type="email"
          autoComplete="email"
          placeholder="avery@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
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

          {formData.password ? (
            <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-300 sm:grid-cols-2">
              <p>{passwordStrength.minLength ? "✓" : "○"} 8+ characters</p>
              <p>{passwordStrength.hasUpperCase ? "✓" : "○"} uppercase</p>
              <p>{passwordStrength.hasLowerCase ? "✓" : "○"} lowercase</p>
              <p>{passwordStrength.hasNumber ? "✓" : "○"} number</p>
              <p>{passwordStrength.hasSpecialChar ? "✓" : "○"} symbol</p>
            </div>
          ) : null}
        </div>

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>

        <p className="text-center text-sm text-slate-300">
          Already registered?{" "}
          <Link to="/login" className="nova-link font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
