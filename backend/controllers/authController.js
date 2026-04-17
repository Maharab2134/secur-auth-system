/**
 * Authentication Controller
 * Handles all authentication-related operations
 */

const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory").default;
const {
  generateAccessToken,
  generateTwoFactorTempToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyTwoFactorTempToken,
  generateSecureToken,
  hashToken,
} = require("../utils/tokenService");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FAEmail,
  sendSuspiciousLoginAlert,
} = require("../utils/emailService");
const {
  parseUserAgent,
  getLocationFromIP,
  getClientIP,
  isNewLocation,
} = require("../utils/deviceDetection");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const hashedToken = hashToken(verificationToken);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const user = await User.findOne({ email }).select(
      "+password +twoFactorSecret",
    );

    // Get client info
    const ipAddress = getClientIP(req);
    const userAgent = req.headers["user-agent"];
    const device = parseUserAgent(userAgent);
    const location = getLocationFromIP(ipAddress);

    // Helper function to log failed attempt
    const logFailedAttempt = async (reason) => {
      await LoginHistory.create({
        userId: user?._id,
        email,
        success: false,
        failureReason: reason,
        ipAddress,
        userAgent,
        device,
        location,
      });
    };

    // Check if user exists
    if (!user) {
      await logFailedAttempt("invalid_credentials");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil(
        (user.accountLockedUntil - Date.now()) / 60000,
      );
      await logFailedAttempt("account_locked");

      return res.status(403).json({
        success: false,
        message: `Account is locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      await logFailedAttempt("invalid_credentials");

      const remainingAttempts =
        (parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5) -
        (user.failedLoginAttempts + 1);

      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remainingAttempts} attempts remaining.`,
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      await logFailedAttempt("account_not_verified");

      // Re-issue verification token on login attempt so users can recover
      const verificationToken = generateSecureToken();
      user.emailVerificationToken = hashToken(verificationToken);
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      let verificationMessage =
        "Please verify your email address before logging in.";

      try {
        await sendVerificationEmail(user.email, user.name, verificationToken);
        verificationMessage =
          "Please verify your email address before logging in. A new verification email has been sent.";
      } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
      }

      return res.status(403).json({
        success: false,
        message: verificationMessage,
        requiresEmailVerification: true,
      });
    }

    // Check if account is active
    if (!user.isActive) {
      await logFailedAttempt("account_not_verified");
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Check for suspicious activity
    const newLocation = isNewLocation(user, location);
    const suspiciousActivity = newLocation;

    // If 2FA is enabled, send OTP
    if (user.twoFactorEnabled) {
      // Generate OTP
      const secret = user.twoFactorSecret;
      const otp = speakeasy.totp({
        secret,
        encoding: "base32",
        step: 300, // 5 minutes
      });

      // Send OTP via email
      try {
        await send2FAEmail(email, user.name, otp);
      } catch (emailError) {
        console.error("Failed to send 2FA email:", emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification code. Please try again.",
        });
      }

      return res.json({
        success: true,
        requires2FA: true,
        message: "Verification code sent to your email",
        tempToken: generateTwoFactorTempToken(user._id),
      });
    }

    // Reset failed attempts
    await user.resetFailedAttempts();

    // Update last login info
    user.lastLogin = Date.now();
    user.lastLoginIP = ipAddress;
    user.lastLoginDevice = `${device.browser} on ${device.os}`;

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: Date.now(),
    });

    await user.save();

    // Log successful login
    await LoginHistory.create({
      userId: user._id,
      email,
      success: true,
      ipAddress,
      userAgent,
      device,
      location,
      suspiciousActivity,
      newDevice: false,
      newLocation,
    });

    // Send alert if suspicious
    if (suspiciousActivity) {
      try {
        await sendSuspiciousLoginAlert(email, user.name, {
          ipAddress,
          device,
          location,
          timestamp: Date.now(),
        });
      } catch (emailError) {
        console.error("Failed to send suspicious login alert:", emailError);
      }
    }

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Verify 2FA OTP
 * @access  Public (with temp token)
 */
const verify2FA = async (req, res, next) => {
  try {
    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "OTP and temporary token are required",
      });
    }

    // Verify temp token
    let userId;
    try {
      const decoded = verifyTwoFactorTempToken(tempToken);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired temporary token",
      });
    }

    // Get user with 2FA secret
    const user = await User.findById(userId).select("+twoFactorSecret");

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      step: 300, // 5 minutes
      window: 1, // Allow 1 step before/after for clock skew
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Get client info for logging
    const ipAddress = getClientIP(req);
    const userAgent = req.headers["user-agent"];
    const device = parseUserAgent(userAgent);
    const location = getLocationFromIP(ipAddress);

    // Reset failed attempts
    await user.resetFailedAttempts();

    // Update last login info
    user.lastLogin = Date.now();
    user.lastLoginIP = ipAddress;
    user.lastLoginDevice = `${device.browser} on ${device.os}`;

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: Date.now(),
    });

    await user.save();

    // Log successful login
    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      success: true,
      ipAddress,
      userAgent,
      device,
      location,
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Two-factor authentication successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/resend-2fa
 * @desc    Resend 2FA OTP using temporary token
 * @access  Public (with temp token)
 */
const resend2FA = async (req, res, next) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Temporary token is required",
      });
    }

    let userId;
    try {
      const decoded = verifyTwoFactorTempToken(tempToken);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired temporary token",
      });
    }

    const user = await User.findById(userId).select("+twoFactorSecret");

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled for this account",
      });
    }

    const otp = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: "base32",
      step: 300,
    });

    try {
      await send2FAEmail(user.email, user.name, otp);
    } catch (emailError) {
      console.error("Failed to resend 2FA email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to resend verification code. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const tokenExists = user.refreshTokens.some((rt) => rt.token === token);

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found. Please log in again.",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Set cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal if user exists
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const hashedToken = hashToken(resetToken);

    const expiryMinutes = parseInt(process.env.PASSWORD_RESET_EXPIRY) || 15;

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + expiryMinutes * 60 * 1000;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordChange = Date.now();

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];

    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token && req.user) {
      // Remove refresh token from database
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token } },
      });
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  verify2FA,
  resend2FA,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
};
