/**
 * Reset Password Component
 * Set new password using reset token
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import AuthShell from "../UI/AuthShell";
import Input from "../UI/Input";
import Button from "../UI/Button";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

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
      const response = await authAPI.resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(response.data.message);
      navigate("/login", {
        state: {
          message:
            "Password reset successful! You can now login with your new password.",
        },
      });
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
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
      title="Create a new password"
      subtitle="Your token is validated before this password update is accepted."
      sideTitle="Reset credentials safely"
      sideCopy="Backend token expiry and password policy checks are unchanged. Only UI and branding were redesigned for AuthNova."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-rise">
        <div className="relative">
          <Input
            id="password"
            name="password"
            label="New Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
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
          <div className="grid grid-cols-1 gap-1 text-xs text-slate-300 sm:grid-cols-2">
            <p>{passwordStrength.minLength ? "✓" : "○"} 8+ characters</p>
            <p>{passwordStrength.hasUpperCase ? "✓" : "○"} uppercase</p>
            <p>{passwordStrength.hasLowerCase ? "✓" : "○"} lowercase</p>
            <p>{passwordStrength.hasNumber ? "✓" : "○"} number</p>
            <p>{passwordStrength.hasSpecialChar ? "✓" : "○"} symbol</p>
          </div>
        ) : null}

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          error={errors.confirmPassword}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Reset Password
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

export default ResetPassword;
