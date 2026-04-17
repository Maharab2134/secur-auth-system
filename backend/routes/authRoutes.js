/**
 * Authentication Routes
 */

const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  verify2FA,
  resend2FA,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordResetValidation,
  otpValidation,
} = require("../middleware/validation");
const {
  registrationLimiter,
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", registrationLimiter, registerValidation, register);
router.post("/verify-email", verifyEmail);
router.post("/login", authLimiter, loginValidation, login);
router.post("/verify-2fa", otpValidation, verify2FA);
router.post("/resend-2fa", resend2FA);
router.post("/refresh-token", refreshToken);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  emailValidation,
  forgotPassword,
);
router.post("/reset-password", passwordResetValidation, resetPassword);

// Protected routes
router.post("/logout", protect, logout);

module.exports = router;
