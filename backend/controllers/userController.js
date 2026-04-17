/**
 * User Controller
 * Handles user profile and 2FA management
 */

const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory").default;
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/user/login-history
 * @desc    Get user login history
 * @access  Private
 */
const getLoginHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await LoginHistory.find({ userId: req.user._id })
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .select("-userId");

    const total = await LoginHistory.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/user/setup-2fa
 * @desc    Setup 2FA - Generate QR code
 * @access  Private
 */
const setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is already enabled",
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SecureAuth (${user.email})`,
      issuer: "SecureAuth",
    });

    // Store temporary secret
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: "Scan this QR code with your authenticator app",
      data: {
        qrCode: qrCodeUrl,
        secret: secret.base32,
        manualEntry: secret.base32,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/user/verify-2fa-setup
 * @desc    Verify and enable 2FA
 * @access  Private
 */
const verify2FASetup = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+twoFactorTempSecret",
    );

    if (!user.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        message: "No 2FA setup in progress. Please start setup first.",
      });
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please try again.",
      });
    }

    // Enable 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorEnabled = true;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/user/disable-2fa
 * @desc    Disable 2FA
 * @access  Private
 */
const disable2FA = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to disable 2FA",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+password +twoFactorSecret",
    );

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/user/change-password
 * @desc    Change password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();

    // Clear all refresh tokens (force re-login on all devices)
    user.refreshTokens = [];

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getLoginHistory,
  setup2FA,
  verify2FASetup,
  disable2FA,
  changePassword,
};
